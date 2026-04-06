"""
Claude AI integration for CareerFit.
Handles job fit scoring, resume suggestions, and networking outreach generation.
"""
import os
import json
import anthropic

_client = None


def _get_client():
    global _client
    if _client is None:
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY not set. Create a .env file with your key.")
        _client = anthropic.Anthropic(api_key=api_key)
    return _client


def analyze_job_fit(resume_profile: dict, job: dict) -> dict:
    """
    Use Claude to compute a Job Fit Score, explain the match, identify gaps,
    and generate resume improvement suggestions.
    Returns a structured dict.
    """
    prompt = _build_fit_prompt(resume_profile, job)

    message = _get_client().messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = message.content[0].text
    return _parse_json_response(raw, _default_fit_result(job))


def generate_outreach(resume_profile: dict, job: dict) -> dict:
    """
    Generate a LinkedIn outreach template and personalization tips
    for a specific job and user profile.
    """
    prompt = _build_outreach_prompt(resume_profile, job)

    message = _get_client().messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = message.content[0].text
    return _parse_json_response(raw, _default_outreach_result(job))


# ── Prompt builders ──────────────────────────────────────────────────────────

def _build_fit_prompt(profile: dict, job: dict) -> str:
    skills = ", ".join(profile.get("skills", []))
    experience = profile.get("experience", "Not provided")
    education = profile.get("education", "Not provided")
    projects = profile.get("projects", "Not provided")
    summary = profile.get("summary", "")

    requirements = "\n".join(f"- {r}" for r in job.get("requirements", []))
    preferred = "\n".join(f"- {p}" for p in job.get("preferred", []))
    responsibilities = "\n".join(f"- {r}" for r in job.get("responsibilities", []))

    return f"""You are a career coach helping a job seeker understand how well their resume matches a job posting.

## Job Posting
Title: {job['title']}
Company: {job['company']}
Description: {job['description']}

Required qualifications:
{requirements}

Preferred qualifications:
{preferred}

Responsibilities:
{responsibilities}

## Candidate Resume

Skills: {skills}

Experience:
{experience}

Education:
{education}

Projects:
{projects}

Summary: {summary}

## Your Task
Analyze how well the candidate's background matches this job. Return a JSON object with EXACTLY this structure:

{{
  "fit_score": <integer 0-100>,
  "confidence": "<strong match | moderate match | stretch>",
  "summary": "<2-3 sentence summary of the overall fit>",
  "strengths": [
    {{"skill": "<skill or experience>", "evidence": "<specific evidence from resume>"}}
  ],
  "gaps": [
    {{"requirement": "<missing requirement>", "suggestion": "<how to address it>"}}
  ],
  "resume_bullets": [
    {{"original": "<existing bullet or null>", "improved": "<rewritten or new bullet>", "reason": "<why this change helps>"}}
  ],
  "quick_wins": ["<actionable tip 1>", "<actionable tip 2>", "<actionable tip 3>"]
}}

Rules:
- fit_score: 0–100 integer. 80+ = strong, 60–79 = moderate, <60 = stretch.
- strengths: 3–5 items matching requirements to resume evidence.
- gaps: 2–4 items for missing or weak requirements.
- resume_bullets: 2–3 specific bullet rewrites targeting this job's language.
- quick_wins: 3 concrete things the candidate can do immediately.
- Return ONLY the JSON object, no markdown, no explanation.
"""


def _build_outreach_prompt(profile: dict, job: dict) -> str:
    name = profile.get("name", "the candidate")
    skills = ", ".join(profile.get("skills", [])[:10])
    experience = profile.get("experience", "Not provided")[:600]

    return f"""You are a career coach helping a job seeker craft a LinkedIn outreach message to someone at a company they're applying to.

## Job
Title: {job['title']}
Company: {job['company']}
Industry: {job['industry']}

## Candidate
Name: {name}
Skills: {skills}
Experience (excerpt): {experience}

## Your Task
Generate a LinkedIn outreach message and networking guidance. Return a JSON object with EXACTLY this structure:

{{
  "subject": "<Short connection request subject or note title>",
  "message": "<The full LinkedIn outreach message, 80-120 words, personalized and specific>",
  "who_to_target": ["<type of person 1 to find on LinkedIn>", "<type of person 2>", "<type of person 3>"],
  "personalization_prompts": [
    "<Question to help the user personalize this message>",
    "<Question 2>",
    "<Question 3>"
  ],
  "dos": ["<do 1>", "<do 2>", "<do 3>"],
  "donts": ["<don't 1>", "<don't 2>"]
}}

Rules:
- Message should reference the specific role and company.
- Message should mention 1-2 of the candidate's relevant strengths.
- End with a clear, low-ask call-to-action (e.g., "15-minute chat").
- who_to_target: 3 types of people to search for (e.g., "Data Analysts at Spotify", "Spotify alumni on LinkedIn").
- personalization_prompts: 3 questions the user should answer to make the message authentic.
- Return ONLY the JSON object, no markdown, no explanation.
"""


# ── Helpers ──────────────────────────────────────────────────────────────────

def _parse_json_response(raw: str, default: dict) -> dict:
    """Safely parse a JSON response from Claude."""
    try:
        # Strip markdown code fences if present
        text = raw.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text.strip())
    except (json.JSONDecodeError, IndexError):
        return default


def _default_fit_result(job: dict) -> dict:
    return {
        "fit_score": 50,
        "confidence": "moderate match",
        "summary": "Unable to generate analysis. Please check your API key.",
        "strengths": [],
        "gaps": [],
        "resume_bullets": [],
        "quick_wins": [],
    }


def _default_outreach_result(job: dict) -> dict:
    return {
        "subject": f"Interested in {job['title']} at {job['company']}",
        "message": "Unable to generate outreach template. Please check your API key.",
        "who_to_target": [],
        "personalization_prompts": [],
        "dos": [],
        "donts": [],
    }
