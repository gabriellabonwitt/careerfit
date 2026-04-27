"""
Fetches live jobs from the Adzuna API (free tier — 250 calls/day).
Sign up at https://developer.adzuna.com/ (free, no credit card needed)
and add ADZUNA_APP_ID + ADZUNA_APP_KEY to your backend/.env file.

If the keys are not set, fetch_live_jobs() returns [] so the frontend
falls back to the local static job list automatically.
"""

import os
import requests
import re

ADZUNA_BASE = "https://api.adzuna.com/v1/api/jobs/us/search"
TIMEOUT     = 10

# ── Our category labels → Adzuna category tags ────────────────────────────────
# Full list: https://api.adzuna.com/v1/api/jobs/us/categories
CATEGORY_MAP = {
    "Software Engineering":         "it-jobs",
    "Data & Analytics":             "it-jobs",
    "Product Management":           "it-jobs",
    "Design & UX":                  "creative-design-jobs",
    "Marketing & Communications":   "pr-advertising-marketing-jobs",
    "Sales & Business Development": "sales-jobs",
    "Finance & Accounting":         "accounting-finance-jobs",
    "Consulting & Strategy":        "consultancy-jobs",
    "Healthcare & Medicine":        "healthcare-nursing-jobs",
    "Education & Teaching":         "education-jobs",
    "Legal & Compliance":           "legal-jobs",
    "Human Resources":              "human-resources-jobs",
    "Operations & Supply Chain":    "logistics-warehouse-jobs",
    "Engineering":                  "engineering-jobs",
    "Science & Research":           "scientific-qa-jobs",
    "Non-profit & Government":      "social-work-jobs",
    "Creative & Media":             "creative-design-jobs",
    "Social Work & Counseling":     "social-work-jobs",
    "Hospitality & Tourism":        "hospitality-catering-jobs",
    "Trades & Skilled Labor":       "trade-construction-jobs",
}

# ── Role → search keywords for better results ─────────────────────────────────
ROLE_KEYWORDS = {
    "Software Engineering":         "software engineer developer",
    "Data & Analytics":             "data analyst scientist",
    "Product Management":           "product manager",
    "Design & UX":                  "UX designer",
    "Marketing & Communications":   "marketing",
    "Sales & Business Development": "sales business development",
    "Finance & Accounting":         "finance analyst accounting",
    "Consulting & Strategy":        "consultant strategy",
    "Healthcare & Medicine":        "healthcare medical",
    "Education & Teaching":         "teacher educator",
    "Legal & Compliance":           "legal attorney compliance",
    "Human Resources":              "human resources HR recruiter",
    "Operations & Supply Chain":    "operations supply chain",
    "Engineering":                  "engineer",
    "Science & Research":           "research scientist",
    "Non-profit & Government":      "nonprofit government",
    "Creative & Media":             "creative media designer",
    "Social Work & Counseling":     "social worker counselor",
    "Hospitality & Tourism":        "hospitality hotel tourism",
    "Trades & Skilled Labor":       "technician trades",
}


def _get_creds(override_id=None, override_key=None):
    """Return Adzuna credentials. User-supplied keys take priority over .env."""
    app_id  = (override_id  or os.getenv("ADZUNA_APP_ID",  "")).strip()
    app_key = (override_key or os.getenv("ADZUNA_APP_KEY", "")).strip()
    return app_id, app_key


def _build_what(role_titles, job_type):
    """Build the 'what' (keyword) query from role titles."""
    keywords = set()
    for role in (role_titles or []):
        kw = ROLE_KEYWORDS.get(role)
        if kw:
            keywords.update(kw.split())
        else:
            keywords.update(role.lower().split())

    if job_type == "Internship":
        keywords.update(["intern", "internship"])

    if not keywords:
        keywords = {"professional"}

    return " ".join(list(keywords)[:6])   # Adzuna works best with ≤6 keywords


def _build_where(locations):
    """Return the first meaningful location, or empty (searches all)."""
    if not locations:
        return ""
    # Strip 'Remote' since Adzuna has its own remote flag
    non_remote = [l for l in locations if "remote" not in l.lower()]
    return non_remote[0] if non_remote else ""


def _map_job(item: dict, idx: int) -> dict:
    """Map an Adzuna API result to our internal job format."""
    company   = (item.get("company") or {}).get("display_name", "Unknown")
    location  = (item.get("location") or {}).get("display_name", "Remote")
    category  = (item.get("category") or {}).get("label", "Other")
    contract  = item.get("contract_time", "")
    is_remote = "remote" in (item.get("description", "") + location).lower()

    sal_min = item.get("salary_min")
    sal_max = item.get("salary_max")
    if sal_min and sal_max:
        salary = f"${int(sal_min):,} – ${int(sal_max):,}"
    elif sal_min:
        salary = f"From ${int(sal_min):,}"
    else:
        salary = "See job posting"

    # Clean description — strip HTML entities and excess whitespace
    desc = item.get("description", "")
    desc = re.sub(r"<[^>]+>", "", desc)
    desc = re.sub(r"&[a-z]+;", " ", desc)
    desc = re.sub(r"\s+", " ", desc).strip()[:600]

    # Extract bullet-like requirements from description
    sentences = [s.strip() for s in re.split(r"[.•·●\n]", desc) if 20 < len(s.strip()) < 120]
    requirements = sentences[:4]

    posted_raw = item.get("created", "")
    posted = posted_raw[:10] if posted_raw else "Recently"

    seniority = "Internship" if contract == "internship" else (
        "Entry-level" if any(w in desc.lower() for w in ["entry level", "entry-level", "junior", "0-2 years"])
        else "Not specified"
    )

    return {
        "id":              f"adzuna_{item.get('id', idx)}",
        "title":           item.get("title", "Untitled"),
        "company":         company,
        "location":        location,
        "remote":          is_remote,
        "industry":        category,
        "type":            "Internship" if seniority == "Internship" else (
                               "Full-time" if contract == "permanent" else "Full-time"
                           ),
        "seniority":       seniority,
        "category":        category,
        "description":     desc,
        "requirements":    requirements,
        "preferred":       [],
        "responsibilities":[],
        "salary":          salary,
        "posted":          posted,
        "source":          "Adzuna",
        "logo_color":      "#2563EB",
        "apply_url":       item.get("redirect_url", ""),
    }


def _fetch_one_query(app_id, app_key, what, where, adzuna_cat, job_type, results_per_page, page_offset=0):
    """Run a single Adzuna query (1 page) and return mapped job dicts."""
    params = {
        "app_id":           app_id,
        "app_key":          app_key,
        "what":             what,
        "results_per_page": results_per_page,
        "sort_by":          "date",
    }
    if where:
        params["where"] = where
    if adzuna_cat:
        params["category"] = adzuna_cat
    if job_type == "Full-time":
        params["full_time"] = 1
    elif job_type == "Internship":
        params["permanent"] = 0   # Adzuna: exclude permanent to surface contract/intern roles

    jobs = []
    try:
        resp = requests.get(f"{ADZUNA_BASE}/1", params=params, timeout=TIMEOUT)
        resp.raise_for_status()
        results = resp.json().get("results", [])
        for idx, item in enumerate(results):
            jobs.append(_map_job(item, idx + page_offset))
    except Exception as e:
        print(f"[job_fetcher] Adzuna error: {e}")
    return jobs


def fetch_live_jobs(
    role_titles=None,
    locations=None,
    experience_level=None,
    job_type=None,
    results_per_page=50,
    adzuna_app_id=None,
    adzuna_app_key=None,
):
    """
    Fetch jobs from Adzuna. Returns [] if API credentials are not configured.
    Accepts user-supplied keys (adzuna_app_id / adzuna_app_key) which take
    priority over keys set in .env so users can add their own free-tier key.
    Makes one query per selected role (up to 3) to ensure broad coverage,
    then deduplicates by job ID.
    """
    app_id, app_key = _get_creds(adzuna_app_id, adzuna_app_key)
    if not app_id or not app_key:
        print("[job_fetcher] ADZUNA_APP_ID / ADZUNA_APP_KEY not set — skipping live fetch")
        return []

    where = _build_where(locations)
    roles = role_titles or []

    # If no roles selected, do a broad general search
    if not roles:
        roles = [""]   # empty role = general search

    seen_ids = set()
    all_jobs = []

    # Query up to 3 roles separately so each category gets representation
    for i, role in enumerate(roles[:3]):
        what = _build_what([role] if role else [], job_type)
        # Only apply category filter when searching a single specific role
        adzuna_cat = CATEGORY_MAP.get(role) if role else None

        batch = _fetch_one_query(
            app_id, app_key, what, where, adzuna_cat,
            job_type, results_per_page, page_offset=i * results_per_page
        )
        for job in batch:
            if job["id"] not in seen_ids:
                seen_ids.add(job["id"])
                all_jobs.append(job)

        print(f"[job_fetcher] role='{role}' → {len(batch)} jobs (total so far: {len(all_jobs)})")

    return all_jobs
