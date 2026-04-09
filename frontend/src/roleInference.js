/**
 * Role Inference Engine
 * Analyzes a parsed resume and returns scored role suggestions.
 * Maps degrees, job titles, skills, and keywords → role categories.
 */

import { ROLE_CATEGORIES } from './jobData'

// Each entry: { role, signals: { degrees, titles, skills, keywords } }
// The more signals match, the higher the score for that role.
const ROLE_SIGNALS = [
  {
    role: "Software Engineering",
    degrees: ["computer science", "software engineering", "computer engineering", "information systems", "information technology", "computing", "electrical engineering"],
    titles: ["software engineer", "developer", "programmer", "swe", "full stack", "frontend", "backend", "web developer", "mobile developer", "devops", "site reliability", "sre", "it specialist", "systems engineer"],
    skills: ["python", "java", "javascript", "typescript", "react", "node.js", "c++", "c#", "go", "rust", "swift", "kotlin", "html", "css", "git", "docker", "kubernetes", "aws", "azure", "gcp", "linux", "sql", "rest api", "graphql", "ci/cd", "agile", "flask", "django", "spring", "vue.js", "angular"],
    keywords: ["coding", "programming", "debugging", "algorithms", "data structures", "web app", "mobile app", "api", "cloud", "deployment", "cybersecurity", "network", "database"],
  },
  {
    role: "Data & Analytics",
    degrees: ["statistics", "mathematics", "data science", "applied math", "quantitative", "economics", "physics", "computer science", "information systems", "analytics", "biostatistics"],
    titles: ["data analyst", "data scientist", "business analyst", "analytics", "business intelligence", "bi analyst", "research analyst", "quantitative analyst", "quant", "ml engineer", "machine learning"],
    skills: ["sql", "python", "r", "tableau", "power bi", "excel", "pandas", "numpy", "tensorflow", "pytorch", "scikit-learn", "machine learning", "deep learning", "nlp", "a/b testing", "statistics", "snowflake", "spark", "hadoop", "kafka", "looker", "bigquery", "matlab"],
    keywords: ["data", "analysis", "analytics", "insights", "dashboard", "visualization", "modeling", "forecasting", "regression", "clustering", "experiment", "hypothesis", "metrics", "kpi"],
  },
  {
    role: "Product Management",
    degrees: ["business", "computer science", "engineering", "mba", "economics", "information systems", "communication"],
    titles: ["product manager", "product owner", "pm", "apm", "associate product manager", "product lead", "program manager"],
    skills: ["product roadmap", "agile", "scrum", "jira", "user research", "a/b testing", "sql", "figma", "confluence", "stakeholder management", "go-to-market"],
    keywords: ["product strategy", "roadmap", "user stories", "backlog", "sprint", "feature", "launch", "market research", "customer", "retention", "engagement", "product-market fit"],
  },
  {
    role: "Design & UX",
    degrees: ["graphic design", "interaction design", "visual design", "fine arts", "human-computer interaction", "hci", "industrial design", "communication design", "art", "architecture", "media arts"],
    titles: ["designer", "ux designer", "ui designer", "visual designer", "graphic designer", "product designer", "art director", "creative director", "illustrator", "motion designer"],
    skills: ["figma", "sketch", "adobe xd", "photoshop", "illustrator", "indesign", "after effects", "invision", "zeplin", "user research", "wireframing", "prototyping", "typography", "branding"],
    keywords: ["design", "visual", "user experience", "usability", "prototype", "wireframe", "brand", "creative", "aesthetic", "layout", "color", "typography", "portfolio", "sketch", "mockup"],
  },
  {
    role: "Marketing & Communications",
    degrees: ["marketing", "communications", "journalism", "advertising", "public relations", "media", "english", "business", "digital marketing"],
    titles: ["marketing manager", "content creator", "social media", "communications specialist", "marketing analyst", "brand manager", "digital marketer", "seo specialist", "pr manager", "copywriter", "marketing coordinator", "growth manager"],
    skills: ["google analytics", "hubspot", "salesforce marketing", "mailchimp", "seo", "sem", "social media", "content marketing", "email marketing", "adobe analytics", "hootsuite", "sprout social", "copywriting", "a/b testing", "campaign management"],
    keywords: ["marketing", "campaign", "brand", "content", "social media", "engagement", "audience", "reach", "impressions", "conversion", "lead generation", "email", "newsletter", "pr", "press", "media", "storytelling", "messaging"],
  },
  {
    role: "Sales & Business Development",
    degrees: ["business", "marketing", "communications", "economics", "management", "psychology"],
    titles: ["sales", "account executive", "account manager", "business development", "bdr", "sdr", "sales representative", "sales manager", "relationship manager", "client success"],
    skills: ["salesforce", "hubspot crm", "outreach", "salesloft", "cold calling", "negotiation", "pipeline management", "crm", "prospecting", "account management"],
    keywords: ["sales", "quota", "pipeline", "prospecting", "closing", "leads", "clients", "revenue", "business development", "partnership", "negotiation", "customer success", "retention", "upsell", "contract"],
  },
  {
    role: "Finance & Accounting",
    degrees: ["finance", "accounting", "economics", "business administration", "mba", "mathematics", "statistics"],
    titles: ["financial analyst", "accountant", "investment banking", "analyst", "controller", "cfo", "treasurer", "bookkeeper", "tax analyst", "audit", "auditor", "budget analyst", "actuary"],
    skills: ["excel", "financial modeling", "bloomberg", "quickbooks", "sap", "oracle financials", "vba", "sql", "python", "tableau", "power bi", "dcf", "lbo", "valuation"],
    keywords: ["finance", "accounting", "revenue", "p&l", "budget", "forecast", "balance sheet", "income statement", "cash flow", "audit", "compliance", "tax", "investment", "portfolio", "risk", "financial statements", "gaap", "ifrs", "cpa", "cfa"],
  },
  {
    role: "Consulting & Strategy",
    degrees: ["business", "economics", "mba", "engineering", "mathematics", "public policy", "finance"],
    titles: ["consultant", "strategy", "analyst", "associate", "management consultant", "strategy analyst", "operations analyst", "business analyst"],
    skills: ["excel", "powerpoint", "financial modeling", "sql", "python", "project management", "data analysis", "presentation skills"],
    keywords: ["consulting", "strategy", "problem solving", "frameworks", "client", "deliverable", "recommendation", "analysis", "benchmarking", "process improvement", "transformation", "due diligence"],
  },
  {
    role: "Healthcare & Medicine",
    degrees: ["nursing", "pre-med", "medicine", "biology", "biochemistry", "public health", "health administration", "pharmacy", "physical therapy", "occupational therapy", "dental", "physician assistant", "health science", "kinesiology", "nutrition"],
    titles: ["nurse", "rn", "lpn", "medical assistant", "physician", "doctor", "pa", "np", "therapist", "pharmacist", "phlebotomist", "emt", "paramedic", "healthcare administrator", "clinical", "health coach"],
    skills: ["patient care", "epic", "cerner", "ehr", "hipaa", "bls", "acls", "cpr", "phlebotomy", "vital signs", "clinical documentation", "icd-10", "medical terminology"],
    keywords: ["patient", "clinical", "hospital", "healthcare", "medical", "health", "treatment", "diagnosis", "therapy", "medication", "care plan", "chronic", "acute", "rehabilitation", "wellness"],
  },
  {
    role: "Education & Teaching",
    degrees: ["education", "teaching", "curriculum", "instructional design", "early childhood", "special education", "english education", "math education", "science education", "counseling education", "higher education", "educational leadership"],
    titles: ["teacher", "educator", "instructor", "professor", "tutor", "coach", "academic advisor", "counselor", "principal", "curriculum developer", "instructional designer", "teaching assistant", "ta"],
    skills: ["classroom management", "curriculum design", "lesson planning", "google classroom", "canvas", "blackboard", "moodle", "articulate", "differentiated instruction", "iep", "assessment", "grading"],
    keywords: ["teaching", "learning", "students", "curriculum", "classroom", "education", "instruction", "lesson", "assessment", "grades", "school", "university", "training", "workshop", "coaching", "mentoring"],
  },
  {
    role: "Legal & Compliance",
    degrees: ["law", "pre-law", "political science", "criminal justice", "paralegal", "legal studies", "philosophy", "public policy", "business law", "compliance"],
    titles: ["attorney", "lawyer", "paralegal", "legal assistant", "compliance officer", "general counsel", "associate", "law clerk", "legal analyst", "contract manager"],
    skills: ["legal research", "westlaw", "lexisnexis", "contract drafting", "legal writing", "litigation", "compliance", "regulatory analysis", "case management", "discovery", "bluebook citation"],
    keywords: ["legal", "law", "regulation", "compliance", "contract", "litigation", "court", "statute", "policy", "regulatory", "attorney", "counsel", "brief", "memo", "case", "ethics"],
  },
  {
    role: "Human Resources",
    degrees: ["human resources", "hr management", "psychology", "business administration", "organizational behavior", "industrial psychology", "labor relations"],
    titles: ["hr coordinator", "human resources", "recruiter", "talent acquisition", "people operations", "hr generalist", "hr manager", "compensation analyst", "benefits administrator", "hrbp"],
    skills: ["workday", "bamboohr", "adp", "greenhouse", "lever", "linkedin recruiter", "hris", "onboarding", "employee relations", "performance management", "compensation", "benefits", "payroll"],
    keywords: ["recruiting", "hiring", "talent", "onboarding", "employee", "workforce", "culture", "engagement", "performance", "compensation", "benefits", "diversity", "equity", "inclusion", "dei", "payroll"],
  },
  {
    role: "Operations & Supply Chain",
    degrees: ["supply chain", "operations management", "industrial engineering", "logistics", "business administration", "management", "systems engineering"],
    titles: ["operations analyst", "supply chain analyst", "logistics coordinator", "operations manager", "inventory analyst", "procurement", "buyer", "vendor manager", "project manager"],
    skills: ["sap", "oracle", "excel", "sql", "lean", "six sigma", "project management", "vendor management", "inventory management", "erp", "jira", "tableau"],
    keywords: ["supply chain", "logistics", "operations", "inventory", "procurement", "vendor", "efficiency", "process improvement", "lean", "workflow", "fulfillment", "warehouse", "distribution"],
  },
  {
    role: "Engineering",
    degrees: ["civil engineering", "mechanical engineering", "electrical engineering", "chemical engineering", "aerospace engineering", "structural engineering", "environmental engineering", "industrial engineering", "biomedical engineering", "materials science"],
    titles: ["engineer", "civil engineer", "mechanical engineer", "electrical engineer", "chemical engineer", "structural engineer", "project engineer", "field engineer", "process engineer"],
    skills: ["autocad", "solidworks", "matlab", "catia", "ansys", "revit", "civil 3d", "eplan", "python", "plc", "labview", "fea", "cfd"],
    keywords: ["engineering", "design", "analysis", "cad", "simulation", "testing", "manufacturing", "construction", "infrastructure", "systems", "prototype", "blueprint", "specifications", "code"],
  },
  {
    role: "Science & Research",
    degrees: ["biology", "chemistry", "physics", "biochemistry", "neuroscience", "environmental science", "geology", "astronomy", "microbiology", "genetics", "molecular biology", "ecology"],
    titles: ["research scientist", "lab technician", "research associate", "scientist", "researcher", "postdoc", "lab manager", "environmental scientist", "chemist", "biologist"],
    skills: ["r", "python", "matlab", "spss", "sas", "pcr", "cell culture", "spectroscopy", "microscopy", "flow cytometry", "gel electrophoresis", "statistical analysis", "laboratory", "gis"],
    keywords: ["research", "laboratory", "experiment", "hypothesis", "data collection", "publication", "grant", "study", "clinical trial", "analysis", "findings", "scientific", "field work"],
  },
  {
    role: "Non-profit & Government",
    degrees: ["public administration", "public policy", "political science", "social work", "nonprofit management", "international relations", "urban planning", "economics", "communications"],
    titles: ["program manager", "policy analyst", "program coordinator", "grants manager", "community outreach", "government analyst", "public affairs", "advocacy", "program director"],
    skills: ["grant writing", "program evaluation", "budgeting", "community engagement", "salesforce", "data analysis", "policy research", "stakeholder management"],
    keywords: ["nonprofit", "government", "public sector", "community", "grant", "policy", "advocacy", "outreach", "mission", "social impact", "public service", "civic", "program", "volunteer", "fundraising"],
  },
  {
    role: "Creative & Media",
    degrees: ["film", "media", "journalism", "communications", "creative writing", "english", "broadcasting", "photography", "music", "theater", "animation", "game design"],
    titles: ["writer", "journalist", "editor", "content creator", "producer", "reporter", "photographer", "videographer", "copywriter", "creative director", "art director", "animator"],
    skills: ["adobe premiere", "final cut pro", "after effects", "photoshop", "lightroom", "capcut", "audacity", "wordpress", "seo writing", "ap style", "storyboarding"],
    keywords: ["writing", "editing", "storytelling", "content", "creative", "media", "journalism", "video", "photography", "podcast", "film", "production", "script", "narrative", "broadcast"],
  },
  {
    role: "Social Work & Counseling",
    degrees: ["social work", "psychology", "counseling", "marriage and family therapy", "sociology", "mental health", "human services", "rehabilitation"],
    titles: ["social worker", "counselor", "therapist", "case manager", "mental health", "crisis counselor", "behavioral health", "school counselor", "clinical social worker", "substance abuse counselor"],
    skills: ["motivational interviewing", "case management", "crisis intervention", "cbt", "dbt", "trauma-informed care", "ehr documentation", "community resources", "group therapy"],
    keywords: ["counseling", "therapy", "mental health", "case management", "client", "crisis", "trauma", "advocacy", "support", "behavioral", "emotional", "well-being", "substance", "recovery"],
  },
  {
    role: "Hospitality & Tourism",
    degrees: ["hospitality management", "hotel management", "tourism", "culinary arts", "restaurant management", "events management", "travel and tourism"],
    titles: ["hotel manager", "event coordinator", "restaurant manager", "concierge", "front desk", "food and beverage", "catering manager", "travel agent", "tour guide"],
    skills: ["opera pms", "micros", "event planning", "customer service", "revenue management", "food safety", "inventory management", "cvent", "hospitality crm"],
    keywords: ["hospitality", "hotel", "restaurant", "event", "guest", "customer service", "tourism", "travel", "food and beverage", "catering", "conference", "banquet", "front desk"],
  },
  {
    role: "Trades & Skilled Labor",
    degrees: ["trade school", "vocational", "technical", "apprenticeship", "hvac", "plumbing", "electrical technology", "welding", "automotive technology", "construction management"],
    titles: ["electrician", "plumber", "hvac technician", "welder", "carpenter", "mechanic", "technician", "maintenance", "construction worker", "apprentice"],
    skills: ["electrical systems", "plumbing", "hvac", "welding", "carpentry", "mechanical repair", "blueprint reading", "safety protocols", "hand tools", "power tools", "osha"],
    keywords: ["trade", "installation", "repair", "maintenance", "construction", "blueprint", "wiring", "plumbing", "hvac", "welding", "fabrication", "inspection", "apprentice", "journeyman"],
  },
]

/**
 * Infer likely roles from a parsed resume profile.
 * Returns top role categories sorted by relevance score (highest first).
 */
export function inferRoles(profile) {
  if (!profile) return []

  const text = [
    profile.raw_text || '',
    profile.experience || '',
    profile.education || '',
    profile.skills?.join(' ') || '',
    profile.summary || '',
    profile.projects || '',
  ].join(' ').toLowerCase()

  const scores = ROLE_SIGNALS.map(({ role, degrees, titles, skills, keywords }) => {
    let score = 0

    // Degree match — strongest signal (3 pts each)
    degrees.forEach(d => { if (text.includes(d)) score += 3 })

    // Job title match — strong signal (2 pts each)
    titles.forEach(t => { if (text.includes(t)) score += 2 })

    // Skill match — moderate signal (1.5 pts each)
    skills.forEach(s => { if (text.includes(s)) score += 1.5 })

    // General keyword match — weak signal (0.5 pts each)
    keywords.forEach(k => { if (text.includes(k)) score += 0.5 })

    return { role, score }
  })

  // Return roles sorted by score, filtering out zero-score roles
  const sorted = scores
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)

  // No signals found — return empty so the user picks manually
  if (sorted.length === 0) return []

  // Return top roles (those within 60% of the top score)
  const topScore = sorted[0].score
  const threshold = topScore * 0.4
  const topRoles = sorted.filter(s => s.score >= threshold).map(s => s.role)

  // Return between 2 and 6 roles
  return topRoles.slice(0, 6)
}

/**
 * Get a human-readable explanation of why these roles were suggested.
 */
export function getRoleExplanation(profile, suggestedRoles) {
  if (!profile || !suggestedRoles?.length) return null

  const signals = []
  if (profile.education) {
    const edu = profile.education.toLowerCase()
    const degreeWords = ['bachelor', 'master', 'phd', 'associate', 'degree', 'bs', 'ba', 'ms', 'mba']
    if (degreeWords.some(d => edu.includes(d))) {
      signals.push('your degree')
    }
  }
  if (profile.skills?.length > 0) signals.push('your skills')
  if (profile.experience) signals.push('your work experience')

  if (signals.length === 0) return null
  return `Based on ${signals.join(', ')}`
}
