/**
 * Direct browser → Adzuna API client.
 * Used on Vercel (and anywhere the Flask backend isn't available) so users
 * with their own Adzuna key get live jobs without needing a backend server.
 */

const ADZUNA_BASE = 'https://api.adzuna.com/v1/api/jobs/us/search'

const ROLE_KEYWORDS = {
  'Software Engineering':         'software engineer developer',
  'Data & Analytics':             'data analyst scientist',
  'Product Management':           'product manager',
  'Design & UX':                  'UX designer',
  'Marketing & Communications':   'marketing',
  'Sales & Business Development': 'sales business development',
  'Finance & Accounting':         'finance analyst accounting',
  'Consulting & Strategy':        'consultant strategy',
  'Healthcare & Medicine':        'healthcare medical',
  'Education & Teaching':         'teacher educator',
  'Legal & Compliance':           'legal attorney compliance',
  'Human Resources':              'human resources HR recruiter',
  'Operations & Supply Chain':    'operations supply chain',
  'Engineering':                  'engineer',
  'Science & Research':           'research scientist',
  'Non-profit & Government':      'nonprofit government',
  'Creative & Media':             'creative media designer',
  'Social Work & Counseling':     'social worker counselor',
  'Hospitality & Tourism':        'hospitality hotel tourism',
  'Trades & Skilled Labor':       'technician trades',
}

const CATEGORY_MAP = {
  'Software Engineering':         'it-jobs',
  'Data & Analytics':             'it-jobs',
  'Product Management':           'it-jobs',
  'Design & UX':                  'creative-design-jobs',
  'Marketing & Communications':   'pr-advertising-marketing-jobs',
  'Sales & Business Development': 'sales-jobs',
  'Finance & Accounting':         'accounting-finance-jobs',
  'Consulting & Strategy':        'consultancy-jobs',
  'Healthcare & Medicine':        'healthcare-nursing-jobs',
  'Education & Teaching':         'education-jobs',
  'Legal & Compliance':           'legal-jobs',
  'Human Resources':              'human-resources-jobs',
  'Operations & Supply Chain':    'logistics-warehouse-jobs',
  'Engineering':                  'engineering-jobs',
  'Science & Research':           'scientific-qa-jobs',
  'Non-profit & Government':      'social-work-jobs',
  'Creative & Media':             'creative-design-jobs',
  'Social Work & Counseling':     'social-work-jobs',
  'Hospitality & Tourism':        'hospitality-catering-jobs',
  'Trades & Skilled Labor':       'trade-construction-jobs',
}

function buildWhat(roles, jobType) {
  const kws = new Set()
  for (const role of (roles || [])) {
    const kw = ROLE_KEYWORDS[role]
    if (kw) kw.split(' ').forEach(w => kws.add(w))
    else role.toLowerCase().split(' ').forEach(w => kws.add(w))
  }
  if (jobType === 'Internship') { kws.add('intern'); kws.add('internship') }
  if (kws.size === 0) kws.add('professional')
  return [...kws].slice(0, 6).join(' ')
}

function buildWhere(locations) {
  const nonRemote = (locations || []).filter(l => !/remote/i.test(l))
  return nonRemote[0] || ''
}

function mapJob(item, idx) {
  const company  = item.company?.display_name || 'Unknown'
  const location = item.location?.display_name || 'Remote'
  const category = item.category?.label || 'Other'
  const contract = item.contract_time || ''
  const isRemote = /remote/i.test((item.description || '') + location)

  const salMin = item.salary_min
  const salMax = item.salary_max
  const salary = salMin && salMax
    ? `$${Math.round(salMin).toLocaleString()} – $${Math.round(salMax).toLocaleString()}`
    : salMin ? `From $${Math.round(salMin).toLocaleString()}` : 'See job posting'

  // Strip HTML and tidy whitespace
  const desc = (item.description || '')
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 600)

  const requirements = desc
    .split(/[.•·●\n]/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && s.length < 120)
    .slice(0, 4)

  const posted = (item.created || '').slice(0, 10) || 'Recently'
  const lowerDesc = desc.toLowerCase()
  const seniority = contract === 'internship' ? 'Internship'
    : /entry.?level|junior|0.?2 years/.test(lowerDesc) ? 'Entry-level'
    : 'Not specified'

  return {
    id:              `adzuna_${item.id || idx}`,
    title:           item.title || 'Untitled',
    company,
    location,
    remote:          isRemote,
    industry:        category,
    type:            seniority === 'Internship' ? 'Internship' : 'Full-time',
    seniority,
    category,
    description:     desc,
    requirements,
    preferred:       [],
    responsibilities:[],
    salary,
    posted,
    source:          'Adzuna',
    logo_color:      '#2563EB',
    apply_url:       item.redirect_url || '',
  }
}

/**
 * Fetch jobs directly from Adzuna in the browser.
 * Returns [] if keys are missing or all requests fail.
 */
export async function fetchAdzunaDirect({ appId, appKey, roles, locations, jobType, resultsPerPage = 50 }) {
  if (!appId || !appKey) return []

  const where = buildWhere(locations)
  const roleList = roles?.length ? roles : ['']
  const seen = new Set()
  const allJobs = []

  for (let i = 0; i < Math.min(roleList.length, 3); i++) {
    const role = roleList[i]
    const what = buildWhat(role ? [role] : [], jobType)
    const adzunaCat = role ? CATEGORY_MAP[role] : null

    const params = new URLSearchParams({
      app_id:           appId,
      app_key:          appKey,
      what,
      results_per_page: resultsPerPage,
      sort_by:          'date',
    })
    if (where)      params.set('where', where)
    if (adzunaCat)  params.set('category', adzunaCat)
    if (jobType === 'Full-time')   params.set('full_time', '1')
    if (jobType === 'Internship')  params.set('permanent', '0')

    try {
      const res = await fetch(`${ADZUNA_BASE}/1?${params}`)
      if (!res.ok) continue
      const data = await res.json()
      for (const [idx, item] of (data.results || []).entries()) {
        const job = mapJob(item, idx + i * resultsPerPage)
        if (!seen.has(job.id)) { seen.add(job.id); allJobs.push(job) }
      }
    } catch {
      // network error — skip this role query
    }
  }

  return allJobs
}
