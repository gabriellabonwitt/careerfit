// ── CareerFit AI — Resume Scoring Engine ────────────────────────────────────
// Framework: Job Match (25) + Impact (25) + Completeness (20) +
//            Formatting (15) + Writing Quality (15) = 100 pts total

// ── Word lists ───────────────────────────────────────────────────────────────
const ACTION_VERBS = [
  'led','built','created','developed','designed','implemented','launched',
  'increased','decreased','reduced','improved','optimized','streamlined',
  'managed','directed','coordinated','delivered','achieved','generated',
  'drove','spearheaded','established','transformed','accelerated','grew',
  'negotiated','secured','authored','engineered','automated','scaled',
  'trained','mentored','recruited','deployed','migrated','refactored',
  'analyzed','researched','presented','oversaw','supervised','founded',
  'pioneered','orchestrated','revamped','expanded','won','earned',
  'collaborated','facilitated','guided','advocated','executed','produced',
  'shipped','resolved','upgraded','integrated','architected','contributed',
]

const WEAK_PHRASES = [
  'responsible for','helped with','assisted in','worked on',
  'participated in','was involved in','duties included','tasks included',
  'helped to','assisted with','involved in','work with',
]

const CLICHES = [
  'team player','self-starter','hard worker','detail-oriented','go-getter',
  'think outside the box','results-driven','synergy','proactive',
  'dynamic','motivated individual','excellent communication',
  'fast learner','quick learner','multitask','deadline-driven',
  'passionate','out-of-the-box','hit the ground running',
  'move the needle','low-hanging fruit','circle back','deep dive',
]

const STOP_WORDS = new Set([
  'and','the','for','with','from','have','that','this','are','will',
  'you','our','your','their','they','has','been','not','but','can',
  'all','any','new','may','such','each','more','than','into','its',
  'also','both','well','over','able','good','must','work','use',
])

// ── 1. Job Match (25 pts) ─────────────────────────────────────────────────────
function scoreJobMatch(userProfile, job) {
  const resumeText = (userProfile?.raw_text || '').toLowerCase()
  const skills     = (userProfile?.skills  || []).map(s => s.toLowerCase())

  const jobText = [
    ...(job?.requirements || []),
    ...(job?.preferred   || []),
    job?.description || '',
    job?.title       || '',
    job?.category    || '',
  ].join(' ').toLowerCase()

  // Extract unique meaningful keywords from the job description
  const keywords = [...new Set(
    (jobText.match(/\b[a-z][a-z+#./]{2,}\b/g) || [])
      .filter(w => !STOP_WORDS.has(w))
  )].slice(0, 40)

  const matched   = keywords.filter(kw => resumeText.includes(kw) || skills.includes(kw))
  const matchRate = keywords.length > 0 ? matched.length / keywords.length : 0
  const score     = Math.min(25, Math.round(matchRate * 35)) // scale so ~70% match = full score

  // Unmatched requirements → fixes
  const unmatchedReqs = (job?.requirements || []).filter(req => {
    const words = (req.toLowerCase().match(/\b[a-z]{3,}\b/g) || []).filter(w => !STOP_WORDS.has(w))
    return words.length > 0 && words.every(w => !resumeText.includes(w))
  }).slice(0, 3)

  const fixes = [
    ...(score < 18 ? ['Mirror keywords directly from the job description to pass ATS scans'] : []),
    ...unmatchedReqs.map(r => `Add keywords from: "${r.slice(0, 60)}"`),
  ].slice(0, 3)

  const positives = [
    matched.length > 0 ? `${matched.length} of ${keywords.length} job keywords matched in your resume` : null,
    matchRate >= 0.5 ? 'Strong keyword alignment with the job description' : null,
  ].filter(Boolean)

  return { score, max: 25, pct: Math.round((score / 25) * 100), fixes, positives }
}

// ── 2. Impact (25 pts) ───────────────────────────────────────────────────────
function scoreImpact(userProfile) {
  const rawText = userProfile?.raw_text || ''
  const lower   = rawText.toLowerCase()

  // Quantified results: numbers + context (0–12 pts)
  const quantMatches = (rawText.match(
    /\d+\s*[%$+x]|\$[\d,]+|\d+[\s-]*(percent|million|billion|users|customers|clients|projects|employees|accounts)/gi
  ) || []).length
  const quantScore = Math.min(12, quantMatches * 2.5)

  // Strong action verbs (0–8 pts)
  const verbMatches = ACTION_VERBS.filter(v => {
    return new RegExp(`\\b${v}[a-z]*\\b`).test(lower)
  }).length
  const verbScore = Math.min(8, verbMatches * 0.8)

  // Penalize weak phrases (0–5 pts)
  const weakCount = WEAK_PHRASES.filter(p => lower.includes(p)).length
  const weakScore = Math.max(0, 5 - weakCount * 1.5)

  const score = Math.min(25, Math.round(quantScore + verbScore + weakScore))

  const fixes = []
  if (quantScore < 6)  fixes.push('Quantify achievements with numbers (e.g., "increased revenue by 30%", "managed team of 8")')
  if (verbScore < 4)   fixes.push('Start each bullet with a strong action verb: led, built, increased, reduced, launched...')
  if (weakScore < 3.5) fixes.push('Replace "responsible for / helped with" with direct action verbs')

  const positives = [
    quantMatches > 0 ? `${quantMatches} quantified result${quantMatches > 1 ? 's' : ''} found` : null,
    verbMatches > 0  ? `${verbMatches} strong action verb${verbMatches > 1 ? 's' : ''} detected` : null,
    weakCount === 0  ? 'No weak/passive phrases found' : null,
  ].filter(Boolean)

  return { score, max: 25, pct: Math.round((score / 25) * 100), fixes, positives }
}

// ── 3. Completeness (20 pts) ─────────────────────────────────────────────────
function scoreCompleteness(userProfile) {
  const p = userProfile || {}
  let score = 0
  const fixes = []
  const positives = []

  // Contact info: email + phone (4 pts)
  if (p.email && p.phone) { score += 4; positives.push('Contact info complete (email + phone)') }
  else if (p.email || p.phone) { score += 2; fixes.push('Add both email and phone number to header') }
  else { fixes.push('Add contact info: email, phone number') }

  // Summary / objective (3 pts)
  if ((p.summary || '').length > 50) { score += 3; positives.push('Professional summary present') }
  else { fixes.push('Add a 2–3 sentence professional summary at the top') }

  // Work experience (5 pts)
  const expLen = (p.experience || '').length
  if (expLen > 150) { score += 5; positives.push('Work experience section found') }
  else if (expLen > 30) { score += 3; fixes.push('Expand experience bullets with more detail and impact') }
  else { fixes.push('Add work experience with job title, company, dates, and bullet points') }

  // Education (4 pts)
  if ((p.education || '').length > 20 || p.degree) { score += 4; positives.push('Education section found') }
  else { fixes.push('Add education: degree, institution, graduation year') }

  // Skills section (4 pts)
  const skillCount = (p.skills || []).length
  if (skillCount >= 6)  { score += 4; positives.push(`${skillCount} skills listed`) }
  else if (skillCount > 0) { score += 2; fixes.push(`Add more skills — currently ${skillCount}, aim for 8–12`) }
  else { fixes.push('Add a dedicated Skills section with 8–12 relevant skills') }

  return { score: Math.min(20, score), max: 20, pct: Math.round((Math.min(20, score) / 20) * 100), fixes: fixes.slice(0, 3), positives }
}

// ── 4. Formatting (15 pts) ───────────────────────────────────────────────────
function scoreFormatting(userProfile) {
  const raw   = userProfile?.raw_text || ''
  const lines = raw.split('\n').filter(l => l.trim().length > 0)
  let score   = 0
  const fixes = []
  const positives = []

  // Page length (5 pts) — 1 page ≈ 35–65 non-blank lines
  if (lines.length >= 35 && lines.length <= 65) {
    score += 5; positives.push('Ideal resume length (≈1 page)')
  } else if (lines.length < 20) {
    score += 1; fixes.push('Resume is too short — flesh out experience and skills sections')
  } else if (lines.length > 80) {
    score += 3; fixes.push('Resume may be too long — trim to 1 page if under 10 years of experience')
  } else {
    score += 4
  }

  // Dates present (3 pts)
  const dateRE = /\b(20\d{2}|19\d{2}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i
  if (dateRE.test(raw)) {
    score += 3; positives.push('Dates detected in experience / education')
  } else {
    fixes.push('Add dates to all work experience and education entries')
  }

  // Section headers (4 pts)
  const HEADERS = ['experience','education','skills','projects','summary','objective','certifications','work']
  const found = HEADERS.filter(h => raw.toLowerCase().includes(h))
  if (found.length >= 4) { score += 4; positives.push(`${found.length} section headers detected`) }
  else { score += found.length; fixes.push('Add clear section headers: Experience, Education, Skills, etc.') }

  // ATS readability heuristic (3 pts)
  if (raw.length > 300 && lines.length > 10) {
    score += 3; positives.push('Resume appears ATS-readable (no complex tables detected)')
  } else {
    fixes.push('Avoid tables and multi-column layouts — they break ATS parsers')
  }

  return { score: Math.min(15, score), max: 15, pct: Math.round((Math.min(15, score) / 15) * 100), fixes: fixes.slice(0, 3), positives }
}

// ── 5. Writing Quality (15 pts) ──────────────────────────────────────────────
function scoreWritingQuality(userProfile) {
  const lower = (userProfile?.raw_text || '').toLowerCase()
  let score   = 15
  const fixes = []
  const positives = []

  // Clichés (up to –8 pts)
  const foundCliches = CLICHES.filter(c => lower.includes(c))
  if (foundCliches.length === 0) {
    positives.push('No overused buzzwords or clichés found')
  } else {
    score -= Math.min(8, foundCliches.length * 2)
    fixes.push(`Remove clichés: ${foundCliches.slice(0, 3).map(c => `"${c}"`).join(', ')}`)
  }

  // Weak / passive language (up to –4 pts)
  const weakCount = WEAK_PHRASES.filter(p => lower.includes(p)).length
  if (weakCount === 0) {
    positives.push('Active, direct language used throughout')
  } else {
    score -= Math.min(4, weakCount * 1.5)
    fixes.push('Replace passive phrases ("responsible for", "helped with") with strong verbs')
  }

  // Overly dense lines (up to –3 pts)
  const denseLines = lower.split('\n').filter(l => l.trim().length > 220).length
  if (denseLines > 2) {
    score -= Math.min(3, denseLines)
    fixes.push('Break dense paragraphs into concise, scannable bullet points')
  } else {
    positives.push('Bullet points are concise and scannable')
  }

  const finalScore = Math.max(0, Math.min(15, Math.round(score)))
  return { score: finalScore, max: 15, pct: Math.round((finalScore / 15) * 100), fixes: fixes.slice(0, 3), positives }
}

// ── Verb upgrades map ─────────────────────────────────────────────────────────
const VERB_UPGRADES = {
  'responsible for':  'Led',
  'helped with':      'Contributed to',
  'assisted in':      'Supported',
  'assisted with':    'Supported',
  'worked on':        'Developed',
  'participated in':  'Collaborated on',
  'was involved in':  'Played a key role in',
  'involved in':      'Drove',
  'duties included':  'Delivered',
  'tasks included':   'Executed',
  'helped to':        'Partnered to',
  'work with':        'Worked alongside',
}

// ── Extract bullet points from free-text sections ─────────────────────────────
function extractBullets(text = '') {
  if (!text) return []
  const lines = text.split(/\n/).map(l => l.trim()).filter(Boolean)
  const bullets = []
  for (const line of lines) {
    // Remove leading bullet symbols then check length
    const cleaned = line.replace(/^[●•◦▸▹▶‣–\-*]\s*/, '').trim()
    if (cleaned.length > 25 && cleaned.length < 400) bullets.push(cleaned)
  }
  return bullets
}

// ── Extract bullets from raw_text as a fallback ───────────────────────────────
function extractBulletsFromRawText(rawText = '') {
  if (!rawText) return []

  // Pre-split lines on embedded bullet chars so two bullets on one PDF line separate cleanly
  const rawLines = rawText.split(/\n/).map(l => l.trim()).filter(Boolean)
  const lines = []
  for (const line of rawLines) {
    const segments = line.split(/(?=[●•◦▸▹▶‣])/)
    segments.forEach(s => { const t = s.trim(); if (t) lines.push(t) })
  }

  const bullets = []
  let pending = null // accumulates word-fragments after a bullet line

  for (const line of lines) {
    // Normalize double/triple spaces produced by PDF extraction
    const norm = line.replace(/\s{2,}/g, ' ').trim()
    if (!norm) continue

    const startsWithBullet = /^[●•◦▸▹▶‣–]/.test(norm)

    if (startsWithBullet) {
      if (pending) bullets.push(pending.trim())
      pending = norm.replace(/^[●•◦▸▹▶‣–]\s*/, '').trim()
    } else if (pending !== null) {
      const isShortFragment = norm.length <= 30 && !/^\d{4}/.test(norm)
      const isNewSection    = /^[A-Z][A-Z\s]{4,}$/.test(norm)
      if (isNewSection) {
        if (pending) bullets.push(pending.trim())
        pending = null
      } else if (isShortFragment) {
        pending += ' ' + norm
      } else {
        if (pending) bullets.push(pending.trim())
        pending = null
      }
    }
  }
  if (pending) bullets.push(pending.trim())

  // Filter: must be long enough and not pure contact/date info
  return bullets
    .filter(b => b.length > 30 && !/^[\d(+]/.test(b))
    .slice(0, 15)
}

// ── Pull top job keywords for tailoring ──────────────────────────────────────
function topJobKeywords(job, n = 8) {
  const jobText = [
    ...(job?.requirements || []),
    ...(job?.preferred   || []),
    job?.description || '',
    job?.title       || '',
  ].join(' ').toLowerCase()

  const freq = {}
  ;(jobText.match(/\b[a-z][a-z+#./]{2,}\b/g) || [])
    .filter(w => !STOP_WORDS.has(w))
    .forEach(w => { freq[w] = (freq[w] || 0) + 1 })

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([w]) => w)
}

// ── Generate resume bullet suggestions ───────────────────────────────────────
export function generateResumeSuggestions(userProfile, job) {
  const parsed = [
    ...extractBullets(userProfile?.experience || ''),
    ...extractBullets(userProfile?.projects   || ''),
  ]

  // Fall back to raw_text extraction when section parser didn't populate fields
  const bullets = parsed.length > 0
    ? parsed
    : extractBulletsFromRawText(userProfile?.raw_text || '')

  if (bullets.length === 0) return []

  const keywords = topJobKeywords(job)
  const suggestions = []

  for (const original of bullets) {
    if (suggestions.length >= 5) break
    const lower = original.toLowerCase()

    // 1. Weak phrase opener
    const weakMatch = Object.keys(VERB_UPGRADES).find(p => lower.startsWith(p))
    if (weakMatch) {
      const rest = original.slice(weakMatch.length).trimStart()
      const verb = VERB_UPGRADES[weakMatch]
      // Lowercase first char of rest since we're prepending a new verb
      const restLower = rest.charAt(0).toLowerCase() + rest.slice(1)
      const improved = `${verb} ${restLower}`
      suggestions.push({
        original,
        improved,
        reason: `Replaced passive opener "${weakMatch}" with strong action verb "${verb}" to show ownership and impact.`,
      })
      continue
    }

    // 2. No quantified metric
    const hasMetric = /\d+\s*[%$+x]|\$[\d,]+|\d+[\s-]*(percent|million|billion|users|customers|clients|projects|employees|team)/i.test(original)
    if (!hasMetric) {
      // Find a keyword from the job that's already in the bullet
      const sharedKw = keywords.find(kw => lower.includes(kw))
      const improved = original.replace(/\.\s*$/, '')
        + (sharedKw
          ? `, resulting in measurable improvement in ${sharedKw}`
          : ', resulting in measurable efficiency gains')
      suggestions.push({
        original,
        improved,
        reason: 'Added a quantified outcome. Numbers (%, $, users, projects) make achievements concrete and scannable.',
      })
      continue
    }

    // 3. Bullet doesn't mention any top job keywords — add a tailoring note
    const mentionsKeyword = keywords.some(kw => lower.includes(kw))
    if (!mentionsKeyword && keywords.length > 0) {
      const kw = keywords[0]
      const improved = original.replace(/\.\s*$/, '') + `, leveraging ${kw}`
      suggestions.push({
        original,
        improved,
        reason: `Added "${kw}" — a top keyword from this job description — to improve ATS alignment.`,
      })
      continue
    }

    // 4. Good bullet — show it as-is with a positive note
    if (suggestions.length < 3) {
      suggestions.push({
        original,
        improved: original,
        reason: 'This bullet is already strong. Verify it starts with an action verb and includes a measurable outcome.',
      })
    }
  }

  return suggestions
}

// ── Score band ────────────────────────────────────────────────────────────────
export function getScoreBand(total) {
  if (total >= 85) return { label: 'Excellent',       color: 'green',  bg: 'bg-green-100',  text: 'text-green-800'  }
  if (total >= 70) return { label: 'Good',            color: 'blue',   bg: 'bg-blue-100',   text: 'text-blue-800'   }
  if (total >= 50) return { label: 'Needs Work',      color: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-800' }
  return              { label: 'Major Revision',  color: 'red',    bg: 'bg-red-100',    text: 'text-red-800'    }
}

// ── Main: analyze one job ─────────────────────────────────────────────────────
export function analyzeJobLocally(userProfile, job) {
  const jobMatch   = scoreJobMatch(userProfile, job)
  const impact     = scoreImpact(userProfile)
  const completeness = scoreCompleteness(userProfile)
  const formatting = scoreFormatting(userProfile)
  const writing    = scoreWritingQuality(userProfile)

  const fit_score = jobMatch.score + impact.score + completeness.score + formatting.score + writing.score
  const band      = getScoreBand(fit_score)

  const breakdown = { job_match: jobMatch, impact, completeness, formatting, writing }

  // Top strengths across all categories
  const strengths = Object.values(breakdown)
    .flatMap(c => (c.positives || []).map(s => ({ skill: s, note: '' })))
    .slice(0, 5)

  // Top gaps from job requirements
  const gaps = (job?.requirements || [])
    .filter(req => {
      const words = (req.toLowerCase().match(/\b[a-z]{3,}\b/g) || []).filter(w => !STOP_WORDS.has(w))
      const resume = (userProfile?.raw_text || '').toLowerCase()
      return words.some(w => !resume.includes(w))
    })
    .slice(0, 5)
    .map(req => ({ requirement: req }))

  const level   = fit_score >= 75 ? 'strong' : fit_score >= 55 ? 'moderate' : 'partial'
  const summary = `You are a ${level} match for this role (${fit_score}/100). ${
    jobMatch.score >= 18 ? 'Your keywords align well.' : 'Add more keywords from the job description.'
  } ${impact.score >= 18 ? 'Your resume demonstrates strong impact.' : 'Quantify more of your achievements.'}`

  const resume_bullets = generateResumeSuggestions(userProfile, job)

  return { fit_score, band, breakdown, strengths, gaps, summary, resume_bullets }
}

// ── Analyze all jobs ──────────────────────────────────────────────────────────
export function analyzeAllLocally(userProfile, jobs) {
  const map = {}
  jobs.forEach(job => { map[job.id] = analyzeJobLocally(userProfile, job) })
  return map
}

// ── Overall resume score (not job-specific) ───────────────────────────────────
export function scoreResume(userProfile) {
  // For overall score, use a generic "target role" job object built from user prefs
  const targetRoles = userProfile?.preferences?.roleTitles || []
  const genericJob  = {
    requirements: targetRoles.map(r => `Experience in ${r}`),
    preferred:    [],
    description:  targetRoles.join(' '),
    title:        targetRoles[0] || 'Professional',
    category:     targetRoles[0] || '',
  }
  return analyzeJobLocally(userProfile, genericJob)
}
