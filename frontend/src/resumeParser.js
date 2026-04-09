import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

// ── 200+ skills across every domain ─────────────────────────────────────────
const ALL_SKILLS = [
  // Programming & Software
  'Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'C#', 'C', 'Go', 'Rust',
  'Swift', 'Kotlin', 'Ruby', 'PHP', 'Scala', 'MATLAB', 'R', 'Perl', 'Shell', 'Bash',
  'PowerShell', 'VBA', 'COBOL', 'Assembly', 'Dart', 'Lua',

  // Web & Frameworks
  'React', 'Vue.js', 'Angular', 'Next.js', 'Nuxt.js', 'Node.js', 'Express.js',
  'Django', 'Flask', 'FastAPI', 'Spring', 'Spring Boot', 'Rails', 'Laravel',
  'ASP.NET', 'Svelte', 'jQuery', 'Bootstrap', 'Tailwind CSS', 'HTML', 'CSS',
  'GraphQL', 'REST API', 'WebSockets', 'gRPC',

  // Data & Databases
  'SQL', 'PostgreSQL', 'MySQL', 'SQLite', 'Oracle', 'SQL Server', 'MongoDB',
  'Cassandra', 'Redis', 'Elasticsearch', 'DynamoDB', 'Snowflake', 'BigQuery',
  'Redshift', 'Databricks', 'dbt',

  // Cloud & DevOps
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'Ansible',
  'CI/CD', 'Jenkins', 'GitHub Actions', 'GitLab', 'Linux', 'Unix', 'Git',
  'Nginx', 'Apache', 'Serverless', 'Microservices',

  // Data Science & ML
  'Pandas', 'NumPy', 'TensorFlow', 'PyTorch', 'scikit-learn', 'Keras',
  'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'LLMs',
  'Spark', 'Hadoop', 'Kafka', 'Airflow', 'MLflow', 'Hugging Face',
  'A/B Testing', 'Statistics', 'Data Analysis', 'Data Visualization',

  // Analytics & BI
  'Tableau', 'Power BI', 'Looker', 'Mixpanel', 'Amplitude', 'Google Analytics',
  'Adobe Analytics', 'Excel', 'Google Sheets', 'SPSS', 'SAS',

  // Design
  'Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator', 'InDesign',
  'After Effects', 'Premiere Pro', 'Final Cut Pro', 'Canva', 'InVision',
  'Zeplin', 'Procreate', 'Lightroom', 'Blender', 'AutoCAD', 'CapCut',

  // Project & Product Management
  'Jira', 'Confluence', 'Asana', 'Trello', 'Monday.com', 'Notion',
  'Agile', 'Scrum', 'Kanban', 'Waterfall', 'Product Roadmap', 'OKRs',
  'Stakeholder Management', 'Project Management', 'PMP', 'Six Sigma', 'Lean',

  // Marketing & Sales
  'Salesforce', 'HubSpot', 'Marketo', 'Mailchimp', 'Klaviyo', 'Google Ads',
  'Meta Ads', 'SEO', 'SEM', 'Email Marketing', 'Content Marketing',
  'Social Media Marketing', 'Copywriting', 'Brand Management', 'Hootsuite',
  'Sprout Social', 'Google Tag Manager', 'CRM', 'Outreach', 'SalesLoft',

  // Finance & Accounting
  'Financial Modeling', 'Excel (Advanced)', 'Bloomberg', 'QuickBooks', 'Xero',
  'SAP', 'Oracle Financials', 'DCF', 'LBO', 'Valuation', 'Budgeting',
  'Forecasting', 'GAAP', 'IFRS', 'Audit', 'Tax Preparation', 'Payroll',
  'Accounts Payable', 'Accounts Receivable', 'Financial Reporting', 'CPA', 'CFA',

  // Healthcare & Medical
  'Patient Care', 'Epic', 'Cerner', 'Meditech', 'EHR', 'EMR', 'HIPAA',
  'BLS', 'ACLS', 'CPR', 'Phlebotomy', 'Vital Signs', 'Medical Terminology',
  'ICD-10', 'CPT Coding', 'Clinical Documentation', 'Nursing', 'Medication Administration',
  'Patient Assessment', 'Care Planning', 'FHIR', 'HL7',

  // Legal & Compliance
  'Legal Research', 'Westlaw', 'LexisNexis', 'Contract Drafting', 'Legal Writing',
  'Litigation', 'CAMS', 'AML', 'BSA', 'GDPR', 'Regulatory Compliance',
  'Document Review', 'Discovery', 'Bluebook', 'Case Management',

  // HR & People Ops
  'Workday', 'BambooHR', 'ADP', 'Greenhouse', 'Lever', 'Recruiting',
  'Talent Acquisition', 'Performance Management', 'Employee Relations',
  'Compensation & Benefits', 'HRIS', 'Onboarding', 'SHRM', 'PHR',

  // Education
  'Curriculum Design', 'Lesson Planning', 'Classroom Management', 'Google Classroom',
  'Canvas LMS', 'Blackboard', 'Moodle', 'Articulate 360', 'Lectora',
  'Differentiated Instruction', 'IEP', 'FERPA', 'Assessment Design',

  // Engineering (non-tech)
  'SolidWorks', 'CATIA', 'AutoCAD', 'Civil 3D', 'Revit', 'ANSYS', 'EPLAN',
  'PLC Programming', 'LabVIEW', 'FEA', 'CFD', 'HVAC', 'Electrical Systems',
  'Mechanical Design', 'Structural Analysis', 'GIS', 'ArcGIS',

  // Science & Research
  'PCR', 'Cell Culture', 'Western Blot', 'Flow Cytometry', 'Microscopy',
  'Gel Electrophoresis', 'Spectroscopy', 'HPLC', 'Mass Spectrometry',
  'Clinical Trials', 'Epidemiology', 'R (Statistical)', 'SPSS', 'SAS',
  'Grant Writing', 'Scientific Writing', 'Literature Review',

  // Supply Chain & Ops
  'SAP ERP', 'Oracle SCM', 'Inventory Management', 'Procurement', 'Vendor Management',
  'Demand Planning', 'Logistics', 'Supply Chain', 'APICS', 'CPIM',

  // Communication & Soft Skills
  'Public Speaking', 'Presentation Skills', 'Leadership', 'Communication',
  'Critical Thinking', 'Problem Solving', 'Team Collaboration', 'Time Management',
  'Adaptability', 'Mentoring', 'Coaching', 'Negotiation', 'Conflict Resolution',
  'Emotional Intelligence', 'Customer Service', 'Client Management',

  // Languages (spoken)
  'Spanish', 'French', 'Mandarin', 'Portuguese', 'German', 'Arabic',
  'Japanese', 'Korean', 'Italian', 'Bilingual',

  // Creative & Media
  'Video Production', 'Podcast Production', 'Storyboarding', 'Scriptwriting',
  'Photography', 'Journalism', 'AP Style', 'WordPress', 'Webflow',

  // Social Work
  'Motivational Interviewing', 'Case Management', 'Crisis Intervention',
  'CBT', 'DBT', 'Trauma-Informed Care', 'Group Therapy', 'Community Outreach',

  // Hospitality
  'Opera PMS', 'Micros', 'Event Planning', 'Revenue Management',
  'Food & Beverage', 'Customer Experience', 'Cvent',

  // Certifications & Credentials
  'PMP', 'CPA', 'CFA', 'CFP', 'SHRM-CP', 'PHR', 'RN', 'LCSW', 'CAMS',
  'CISSP', 'Security+', 'AWS Certified', 'Google Certified', 'Scrum Master',
  'OSHA 30', 'OSHA 10', 'Series 7', 'Series 66',
]

// ── Degree / field of study extractor ───────────────────────────────────────
const DEGREE_KEYWORDS = [
  'bachelor', 'master', 'phd', 'ph.d', 'associate', 'b.s.', 'b.a.', 'b.b.a',
  'm.s.', 'm.a.', 'mba', 'm.b.a.', 'j.d.', 'm.d.', 'b.s.n', 'b.s.w', 'msw',
  'mph', 'mpa', 'llb', 'llm',
]

// ── Main parse function ──────────────────────────────────────────────────────
export async function parseResume(file) {
  if (file.name.toLowerCase().endsWith('.pdf')) {
    const { text, largestText, metaName, fileName } = await extractPdfText(file)
    return structureResume(text, largestText, metaName, fileName)
  }

  // For .docx / .txt: also try the filename
  const fileName = nameFromFilename(file.name)
  const text = await file.text().catch(() => '')
  return structureResume(text, '', '', fileName)
}

// Extract a name candidate from the filename
// "Sophie Zmoira Resume.pdf" → "Sophie Zmoira"
// "resume_2024.pdf" → '' (not useful)
function nameFromFilename(filename) {
  const base = filename.replace(/\.[^.]+$/, '').replace(/[_\-]+/g, ' ').trim()
  // Strip common resume words
  const cleaned = base.replace(/\b(resume|cv|curriculum|vitae|application|\d{4})\b/gi, '').trim()
  const words = cleaned.split(/\s+/).filter(w => /^[A-Za-zÀ-ÖØ-öø-ÿ]+$/.test(w))
  if (words.length >= 2 && words.length <= 5) return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  return ''
}

async function extractPdfText(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf         = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let text          = ''
  let largestText   = ''
  let metaName      = ''
  const fileName    = nameFromFilename(file.name)

  // ── PDF metadata: Author and Title fields ───────────────────────────────
  try {
    const meta = await pdf.getMetadata()
    const info = meta?.info || {}

    // Author field is the most direct — often exactly the person's name
    const author = (info.Author || '').trim()
    if (author && /^[A-Za-zÀ-ÖØ-öø-ÿ\s\-'.]{2,40}$/.test(author) && author.includes(' ')) {
      metaName = author
    }

    // Title field — strip "Resume", "CV", year suffixes
    if (!metaName) {
      const title = (info.Title || '').trim()
      if (title) {
        const stripped = title
          .replace(/\b(resume|cv|curriculum vitae|application|\d{4})\b/gi, '')
          .replace(/[_\-|,]+/g, ' ')
          .trim()
        const words = stripped.split(/\s+/).filter(w => /^[A-Za-zÀ-ÖØ-öø-ÿ\-'.]+$/.test(w))
        if (words.length >= 2 && words.length <= 5) {
          metaName = words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        }
      }
    }
  } catch {
    // metadata unavailable — continue with other methods
  }

  for (let i = 1; i <= pdf.numPages; i++) {
    const page    = await pdf.getPage(i)
    const content = await page.getTextContent()

    // ── On page 1: find the name via largest font size ──────────────────────
    if (i === 1) {
      let maxSize = 0
      content.items.forEach(item => {
        const size = Math.max(Math.abs(item.transform[3]), item.height || 0)
        if (size > maxSize) maxSize = size
      })

      const nameItems = content.items
        .filter(item => {
          const size = Math.max(Math.abs(item.transform[3]), item.height || 0)
          return size >= maxSize - 2 && item.str.trim().length > 0
        })
        .sort((a, b) => b.transform[5] - a.transform[5] || a.transform[4] - b.transform[4])

      if (nameItems.length > 0) {
        const topY    = nameItems[0].transform[5]
        const cluster = nameItems
          .filter(item => Math.abs(item.transform[5] - topY) <= 10)
          .map(item => item.str.trim())
          .filter(Boolean)
        largestText = cluster.join(' ').trim()
      }
    }

    // ── Regular text extraction (all pages) ────────────────────────────────
    const lines = {}
    content.items.forEach(item => {
      const y = Math.round(item.transform[5])
      if (!lines[y]) lines[y] = []
      lines[y].push(item.str)
    })
    const sortedLines = Object.keys(lines)
      .sort((a, b) => b - a)
      .map(y => lines[y].join(' '))
    text += sortedLines.join('\n') + '\n'
  }

  return { text, largestText, metaName, fileName }
}

function structureResume(text, largestText = '', metaName = '', fileName = '') {
  const email = extractEmail(text)
  return {
    raw_text: text,
    name: extractName(metaName, fileName, largestText, text, email),
    email,
    phone: extractPhone(text),
    linkedin: extractLinkedIn(text),
    degree: extractDegree(text),
    skills: extractSkills(text),
    education: extractSection(text, ['education', 'academic background', 'academic history']),
    experience: extractSection(text, ['experience', 'work history', 'employment', 'work experience', 'professional experience', 'professional background']),
    projects: extractSection(text, ['projects', 'project experience', 'personal projects', 'academic projects']),
    summary: extractSection(text, ['summary', 'objective', 'profile', 'about me', 'professional summary', 'career summary']),
    certifications: extractSection(text, ['certifications', 'licenses', 'credentials', 'certificates']),
  }
}

function extractName(metaName, fileName, largestText, fullText, email) {
  const isNameWord = w => /^[A-Za-zÀ-ÖØ-öø-ÿ\-'.]+$/.test(w)

  const looksLikeName = (str) => {
    if (!str) return false
    str = str.replace(/^name\s*:\s*/i, '').trim()
    if (/[|•·]/.test(str)) str = str.split(/[|•·]/)[0].trim()
    if (str.includes(','))  str = str.split(',')[0].trim()
    if (!str || str.includes('@') || str.includes('http') || /\d/.test(str)) return false
    const words = str.split(/\s+/)
    return words.length >= 2 && words.length <= 5 && words.every(isNameWord)
  }

  const clean = str => str.split(/[|•·,]/)[0].trim()

  // Debug — remove after testing
  console.log('[Name parser] metaName:', JSON.stringify(metaName))
  console.log('[Name parser] fileName:', JSON.stringify(fileName))
  console.log('[Name parser] largestText:', JSON.stringify(largestText))
  const first5 = fullText.split('\n').map(l => l.trim()).filter(Boolean).slice(0, 5)
  console.log('[Name parser] first 5 text lines:', first5)
  console.log('[Name parser] email:', email)

  // ── 1. PDF Author / Title metadata (most reliable when set) ──────────────
  if (metaName && looksLikeName(metaName)) { console.log('[Name parser] ✓ from metadata:', metaName); return clean(metaName) }

  // ── 2. Filename  e.g. "Sophie Zmoira Resume.pdf" → "Sophie Zmoira" ───────
  if (fileName && looksLikeName(fileName)) { console.log('[Name parser] ✓ from filename:', fileName); return clean(fileName) }

  // ── 3. Largest-font text on page 1 ───────────────────────────────────────
  if (largestText && looksLikeName(largestText)) { console.log('[Name parser] ✓ from largest font:', largestText); return clean(largestText) }

  // ── 4. First 5 lines of extracted body text (expanded from 3) ────────────
  const lines = fullText.split('\n').map(l => l.trim()).filter(Boolean)
  for (const line of lines.slice(0, 5)) {
    if (looksLikeName(line)) { console.log('[Name parser] ✓ from text lines:', line); return clean(line) }
  }

  // ── 5. Email username  sophie.zmoira@emory.edu → Sophie Zmoira ───────────
  if (email) {
    const username = email.split('@')[0]
    if (!/\d/.test(username)) {
      const parts = username.split(/[._-]/).filter(p => p.length > 1)
      if (parts.length >= 2) {
        const derived = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')
        console.log('[Name parser] ✓ from email:', derived)
        return derived
      }
    }
  }

  console.log('[Name parser] ✗ could not detect name')
  return ''
}

function extractEmail(text) {
  const m = text.match(/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/)
  return m ? m[0] : ''
}

function extractPhone(text) {
  const m = text.match(/(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)
  return m ? m[0] : ''
}

function extractLinkedIn(text) {
  const m = text.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/)
  return m ? `https://www.${m[0]}` : ''
}

function extractDegree(text) {
  const lower = text.toLowerCase()
  const lines = lower.split('\n')
  for (const line of lines) {
    if (DEGREE_KEYWORDS.some(d => line.includes(d))) {
      return line.trim().slice(0, 120)
    }
  }
  return ''
}

function extractSkills(text) {
  const lower = text.toLowerCase()
  // Match skills (case-insensitive), dedupe preserving original casing
  const found = ALL_SKILLS.filter(skill => {
    // Use word boundary-aware matching for short skills to avoid false positives
    const s = skill.toLowerCase()
    if (s.length <= 3) {
      // Short skills: require word boundaries
      return new RegExp(`\\b${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(lower)
    }
    return lower.includes(s)
  })
  return [...new Set(found)]
}

const NEXT_SECTION_RE = /^(education|experience|skills|projects|summary|objective|profile|certifications|awards|publications|references|work|employment|academic|technical|languages|interests|activities|volunteer|licenses|credentials|certificates|leadership|research|honors|achievements|extracurricular|additional)s?\b/i

// Collapse multiple spaces/tabs to one space for header matching
function normalizeSpaces(str) {
  return str.replace(/\s+/g, ' ').trim()
}

function extractSection(text, headers) {
  const lines = text.split('\n')
  const result = []
  let inSection = false

  for (const line of lines) {
    const raw      = line.trim()
    const stripped = raw.toLowerCase()
    const norm     = normalizeSpaces(stripped) // handles double-spaced PDF text

    const isHeader = headers.some(h => norm === h || norm.startsWith(h + ' ') || norm.startsWith(h))

    if (isHeader) {
      inSection = true
      // If there's content on the same line after the header keyword, keep it
      const matchedHeader = headers.find(h => norm.startsWith(h))
      if (matchedHeader) {
        const rest = normalizeSpaces(raw).slice(matchedHeader.length).trim()
        if (rest.length > 3) result.push(rest)
      }
      continue
    }

    if (inSection) {
      const isNextSection =
        NEXT_SECTION_RE.test(norm) &&
        !headers.some(h => norm.startsWith(h))
      if (isNextSection) break
      // Normalize double spaces in captured lines too
      result.push(normalizeSpaces(raw))
    }
  }
  return result.join('\n').trim()
}
