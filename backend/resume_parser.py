import re
import io

def parse_resume(file_bytes: bytes, filename: str) -> dict:
    """Parse a resume from PDF or DOCX bytes and return structured sections."""
    text = _extract_text(file_bytes, filename)
    return _structure_resume(text)


def _extract_text(file_bytes: bytes, filename: str) -> str:
    name = filename.lower()
    if name.endswith(".pdf"):
        return _extract_pdf(file_bytes)
    elif name.endswith(".docx"):
        return _extract_docx(file_bytes)
    else:
        return file_bytes.decode("utf-8", errors="ignore")


def _extract_pdf(file_bytes: bytes) -> str:
    from pypdf import PdfReader
    reader = PdfReader(io.BytesIO(file_bytes))
    return "\n".join(page.extract_text() or "" for page in reader.pages)


def _extract_docx(file_bytes: bytes) -> str:
    from docx import Document
    doc = Document(io.BytesIO(file_bytes))
    return "\n".join(p.text for p in doc.paragraphs)


def _structure_resume(text: str) -> dict:
    """Heuristically extract sections from raw resume text."""
    sections = {
        "raw_text": text,
        "name": _extract_name(text),
        "email": _extract_email(text),
        "phone": _extract_phone(text),
        "skills": _extract_skills(text),
        "education": _extract_section(text, ["education", "academic"]),
        "experience": _extract_section(text, ["experience", "work history", "employment"]),
        "projects": _extract_section(text, ["projects", "project experience"]),
        "summary": _extract_section(text, ["summary", "objective", "profile", "about"]),
    }
    return sections


def _extract_name(text: str) -> str:
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    # The name is usually the first non-empty line that looks like a name
    for line in lines[:5]:
        if len(line.split()) <= 5 and not any(c in line for c in ["@", "http", "|", "•"]):
            return line
    return ""


def _extract_email(text: str) -> str:
    match = re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
    return match.group() if match else ""


def _extract_phone(text: str) -> str:
    match = re.search(r"(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}", text)
    return match.group() if match else ""


def _extract_skills(text: str) -> list[str]:
    """Extract skills from a skills section or infer from common tech keywords."""
    # Try to find a skills section first
    skills_section = _extract_section(text, ["skills", "technical skills", "core competencies", "technologies"])

    common_skills = [
        "Python", "Java", "JavaScript", "TypeScript", "React", "Node.js", "SQL", "PostgreSQL",
        "MySQL", "MongoDB", "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Git", "Flask",
        "Django", "FastAPI", "Spring", "C++", "C#", "Go", "Rust", "Swift", "Kotlin",
        "R", "MATLAB", "Tableau", "Power BI", "Excel", "Pandas", "NumPy", "TensorFlow",
        "PyTorch", "scikit-learn", "Machine Learning", "Deep Learning", "NLP", "Data Analysis",
        "Agile", "Scrum", "REST API", "GraphQL", "CI/CD", "Linux", "Figma", "Photoshop",
        "Snowflake", "Spark", "Hadoop", "Kafka", "Redis", "Elasticsearch", "Looker",
        "A/B Testing", "Statistics", "Stakeholder Management", "Project Management",
        "Communication", "Leadership", "Problem Solving", "HTML", "CSS", "Vue.js", "Angular",
    ]

    source = (skills_section + "\n" + text).lower()
    found = [s for s in common_skills if s.lower() in source]
    return list(dict.fromkeys(found))  # dedupe while preserving order


def _extract_section(text: str, headers: list[str]) -> str:
    """Extract text belonging to a section identified by one of the given headers."""
    lines = text.splitlines()
    section_lines = []
    in_section = False

    next_section_pattern = re.compile(
        r"^(education|experience|skills|projects|summary|objective|profile|"
        r"certifications|awards|publications|references|work|employment|"
        r"academic|technical|languages|interests|activities|volunteer)s?\b",
        re.IGNORECASE
    )

    for line in lines:
        stripped = line.strip().lower()
        if any(stripped.startswith(h) for h in headers):
            in_section = True
            continue
        if in_section:
            if next_section_pattern.match(stripped) and stripped not in headers:
                break
            section_lines.append(line)

    return "\n".join(section_lines).strip()
