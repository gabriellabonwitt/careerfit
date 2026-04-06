import * as pdfjsLib from 'pdfjs-dist'

// Use the bundled worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

const COMMON_SKILLS = [
  'Python', 'Java', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'PostgreSQL',
  'MySQL', 'MongoDB', 'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Git', 'Flask',
  'Django', 'FastAPI', 'Spring', 'C++', 'C#', 'Go', 'Rust', 'Swift', 'Kotlin',
  'R', 'MATLAB', 'Tableau', 'Power BI', 'Excel', 'Pandas', 'NumPy', 'TensorFlow',
  'PyTorch', 'scikit-learn', 'Machine Learning', 'Deep Learning', 'NLP', 'Data Analysis',
  'Agile', 'Scrum', 'REST API', 'GraphQL', 'CI/CD', 'Linux', 'Figma', 'Photoshop',
  'Snowflake', 'Spark', 'Hadoop', 'Kafka', 'Redis', 'Elasticsearch', 'Looker',
  'A/B Testing', 'Statistics', 'Stakeholder Management', 'Project Management',
  'Communication', 'Leadership', 'HTML', 'CSS', 'Vue.js', 'Angular', 'Bloomberg',
  'VBA', 'PowerPoint', 'Google Analytics', 'Salesforce', 'Jira', 'Confluence',
]

export async function parseResume(file) {
  let text = ''

  if (file.name.toLowerCase().endsWith('.pdf')) {
    text = await extractPdfText(file)
  } else if (file.name.toLowerCase().endsWith('.docx')) {
    // For DOCX, read as text fallback
    text = await file.text().catch(() => '')
  } else {
    text = await file.text()
  }

  return structureResume(text)
}

async function extractPdfText(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let text = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map(item => item.str).join(' ') + '\n'
  }
  return text
}

function structureResume(text) {
  return {
    raw_text: text,
    name: extractName(text),
    email: extractEmail(text),
    phone: extractPhone(text),
    skills: extractSkills(text),
    education: extractSection(text, ['education', 'academic']),
    experience: extractSection(text, ['experience', 'work history', 'employment']),
    projects: extractSection(text, ['projects', 'project experience']),
    summary: extractSection(text, ['summary', 'objective', 'profile', 'about']),
  }
}

function extractName(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  for (const line of lines.slice(0, 5)) {
    if (line.split(' ').length <= 5 && !line.includes('@') && !line.includes('http') && !line.includes('|')) {
      return line
    }
  }
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

function extractSkills(text) {
  const lower = text.toLowerCase()
  return COMMON_SKILLS.filter(s => lower.includes(s.toLowerCase()))
}

const SECTION_RE = /^(education|experience|skills|projects|summary|objective|profile|certifications|awards|publications|references|work|employment|academic|technical|languages|interests|activities|volunteer)s?\b/i

function extractSection(text, headers) {
  const lines = text.split('\n')
  const result = []
  let inSection = false

  for (const line of lines) {
    const stripped = line.trim().toLowerCase()
    if (headers.some(h => stripped.startsWith(h))) {
      inSection = true
      continue
    }
    if (inSection) {
      if (SECTION_RE.test(stripped) && !headers.some(h => stripped.startsWith(h))) break
      result.push(line)
    }
  }
  return result.join('\n').trim()
}
