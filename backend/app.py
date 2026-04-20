from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

from resume_parser import parse_resume
from job_data import search_jobs, get_job_by_id, JOBS
from claude_ai import analyze_job_fit, generate_outreach
from job_fetcher import fetch_live_jobs

app = Flask(__name__)
CORS(app)  # Allow all origins — restrict to your Vercel URL after deploying

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


# ── Resume ────────────────────────────────────────────────────────────────────

@app.route("/api/resume/upload", methods=["POST"])
def upload_resume():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if not file.filename:
        return jsonify({"error": "Empty filename"}), 400

    allowed = {".pdf", ".docx", ".txt"}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed:
        return jsonify({"error": f"Unsupported file type: {ext}. Use PDF, DOCX, or TXT."}), 400

    file_bytes = file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        return jsonify({"error": "File too large (max 5 MB)"}), 400

    try:
        profile = parse_resume(file_bytes, file.filename)
        return jsonify({"success": True, "profile": profile})
    except Exception as e:
        return jsonify({"error": f"Failed to parse resume: {str(e)}"}), 500


# ── Jobs ──────────────────────────────────────────────────────────────────────

@app.route("/api/jobs/search", methods=["POST"])
def jobs_search():
    data = request.get_json(silent=True) or {}
    jobs = search_jobs(
        role_titles=data.get("role_titles"),
        industries=data.get("industries"),
        locations=data.get("locations"),
        job_type=data.get("job_type"),
        remote_only=data.get("remote_only", False),
    )
    # Return all jobs if no filters produce results, so the app always shows something
    if not jobs:
        jobs = JOBS
    return jsonify({"jobs": jobs, "total": len(jobs)})


@app.route("/api/jobs/live", methods=["POST"])
def jobs_live():
    """Fetch real jobs from The Muse API based on user preferences."""
    data = request.get_json(silent=True) or {}
    try:
        jobs = fetch_live_jobs(
            role_titles=data.get("role_titles"),
            locations=data.get("locations"),
            experience_level=data.get("experience_level"),
            job_type=data.get("job_type"),
        )
        # Fall back to local jobs if API returns nothing
        if not jobs:
            jobs = search_jobs(
                role_titles=data.get("role_titles"),
                industries=data.get("industries"),
                locations=data.get("locations"),
                job_type=data.get("job_type"),
                remote_only=data.get("remote_only", False),
            ) or JOBS
            return jsonify({"jobs": jobs, "total": len(jobs), "source": "local"})
        return jsonify({"jobs": jobs, "total": len(jobs), "source": "adzuna"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/jobs/all", methods=["GET"])
def jobs_all():
    return jsonify({"jobs": JOBS, "total": len(JOBS)})


@app.route("/api/jobs/<job_id>", methods=["GET"])
def job_detail(job_id):
    job = get_job_by_id(job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404
    return jsonify({"job": job})


# ── AI Analysis ───────────────────────────────────────────────────────────────

@app.route("/api/jobs/analyze", methods=["POST"])
def analyze():
    data = request.get_json(silent=True) or {}
    resume_profile = data.get("resume_profile")
    job_id = data.get("job_id")

    if not resume_profile:
        return jsonify({"error": "resume_profile is required"}), 400
    if not job_id:
        return jsonify({"error": "job_id is required"}), 400

    job = get_job_by_id(job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404

    try:
        result = analyze_job_fit(resume_profile, job)
        return jsonify({"success": True, "analysis": result, "job": job})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500


@app.route("/api/networking/generate", methods=["POST"])
def networking():
    data = request.get_json(silent=True) or {}
    resume_profile = data.get("resume_profile")
    job_id = data.get("job_id")

    if not resume_profile:
        return jsonify({"error": "resume_profile is required"}), 400
    if not job_id:
        return jsonify({"error": "job_id is required"}), 400

    job = get_job_by_id(job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404

    try:
        result = generate_outreach(resume_profile, job)
        return jsonify({"success": True, "outreach": result, "job": job})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Networking generation failed: {str(e)}"}), 500


# ── Health ────────────────────────────────────────────────────────────────────

@app.route("/api/health", methods=["GET"])
def health():
    api_key_set = bool(os.getenv("ANTHROPIC_API_KEY"))
    return jsonify({"status": "ok", "ai_enabled": api_key_set})


if __name__ == "__main__":
    app.run(debug=True, port=5001)
