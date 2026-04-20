import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import NavBar from '../components/NavBar'
import JobCard from '../components/JobCard'
import { JOBS, ROLE_CATEGORIES, LOCATIONS, filterJobs } from '../jobData'
import { analyzeAllLocally } from '../localAnalysis'
import { apiFetch } from '../api'

const TYPE_FILTERS = ['All', 'Full-time', 'Internship', 'Remote', 'Saved']

const EXPERIENCE_OPTIONS = [
  { value: 'any',   label: 'Any experience' },
  { value: 'entry', label: 'Entry level' },
  { value: '1-3',   label: '1–3 years' },
  { value: '4plus', label: '4+ years' },
]

export default function Dashboard({ userProfile, jobResults, setJobResults, savedJobs = {}, toggleSaveJob, onLogout }) {
  const [analyses, setAnalyses]     = useState({})
  const [typeFilter, setTypeFilter] = useState('All')
  const [analyzing, setAnalyzing]   = useState(false)

  // Re-filter panel state — initialise from saved prefs
  const prefs = userProfile?.preferences || {}
  const [showFilters, setShowFilters]         = useState(false)
  const [activeRoles, setActiveRoles]         = useState(prefs.roleTitles || [])
  const [activeLocations, setActiveLocations] = useState(prefs.locations || [])
  const [activeJobType, setActiveJobType]     = useState(prefs.jobType || 'any')
  const [remoteOnly, setRemoteOnly]           = useState(prefs.remoteOnly || false)
  const [experienceLevel, setExperienceLevel] = useState(prefs.experienceLevel || 'any')
  const [refreshing, setRefreshing]           = useState(false)
  const [jobSource, setJobSource]             = useState(null) // 'muse' | 'local'

  // Fall back to all jobs if empty
  useEffect(() => { if (jobResults.length === 0) setJobResults(JOBS) }, [])

  // Auto-refresh on first load: always re-run the filter to get proper results
  // (clears any stale 1-job cache from a previous bad API fetch)
  useEffect(() => {
    const prefs = userProfile?.preferences || {}
    const roles = prefs.roleTitles || []
    const locs  = prefs.locations  || []
    const exp   = prefs.experienceLevel || 'any'
    const type  = prefs.jobType || 'any'
    fetchLiveJobs(roles, locs, exp, type)
      .then(() => setRefreshing(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-score all jobs whenever the job list or profile changes
  useEffect(() => {
    if (!userProfile || jobResults.length === 0) return
    setAnalyzing(true)
    setTimeout(() => {
      setAnalyses(analyzeAllLocally(userProfile, jobResults))
      setAnalyzing(false)
    }, 50)
  }, [jobResults, userProfile])

  function toggle(list, setList, val) {
    setList(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])
  }

  async function fetchLiveJobs(roles, locs, expLevel, jobType) {
    setRefreshing(true)
    try {
      const res = await apiFetch('/api/jobs/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role_titles:      roles,
          locations:        locs,
          experience_level: expLevel !== 'any' ? expLevel : null,
          job_type:         jobType  !== 'any' ? jobType  : null,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        // Only use API results if they're real live jobs (not the backend's tiny 13-job fallback list)
        if (data.jobs?.length && data.source !== 'local') {
          setJobResults(data.jobs)
          setJobSource('adzuna')
          return
        }
      }
    } catch { /* backend down */ }

    // Use the frontend's own 216-job static dataset (much richer than the backend's fallback)
    const results = filterJobs({ roleTitles: roles, industries: [], locations: locs, jobType, remoteOnly, experienceLevel: expLevel !== 'any' ? expLevel : null })
    setJobResults(results.length ? results : JOBS)
    setJobSource('local')
    setRefreshing(false)
  }

  async function applyFilters() {
    setShowFilters(false)
    await fetchLiveJobs(activeRoles, activeLocations, experienceLevel, activeJobType)
    setRefreshing(false)
  }

  function resetFilters() {
    setActiveRoles([])
    setActiveLocations([])
    setActiveJobType('any')
    setRemoteOnly(false)
    setExperienceLevel('any')
    setJobResults(JOBS)
    setJobSource(null)
    setShowFilters(false)
  }

  // Type/remote/saved quick-filter applied on top of jobResults
  const displayedJobs = jobResults.filter(job => {
    if (typeFilter === 'Remote') return job.remote
    if (typeFilter === 'Saved') return Boolean(savedJobs[job.id])
    if (typeFilter !== 'All') return job.type === typeFilter
    return true
  })

  // Sort by fit score (highest first)
  const sortedJobs = [...displayedJobs].sort((a, b) =>
    (analyses[b.id]?.fit_score ?? -1) - (analyses[a.id]?.fit_score ?? -1)
  )

  const hasAnalyses = Object.keys(analyses).length > 0
  const avgScore    = hasAnalyses
    ? Math.round(Object.values(analyses).reduce((s, a) => s + (a.fit_score || 0), 0) / Object.values(analyses).length)
    : null
  const topGaps     = hasAnalyses
    ? Object.values(analyses)
        .flatMap(a => (a.gaps || []).map(g => g.requirement))
        .reduce((acc, g) => { acc[g] = (acc[g] || 0) + 1; return acc }, {})
    : {}
  const topGapsList = Object.entries(topGaps).sort((a, b) => b[1] - a[1]).slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar userName={userProfile?.name} onLogout={onLogout} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {userProfile?.name ? `Hey ${userProfile.name.split(' ')[0]} 👋` : 'Your Job Matches'}
            </h1>
            <p className="text-gray-500 mt-1">
            {jobResults.length} jobs found
            {jobSource === 'adzuna' && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">● Live from Adzuna</span>}
            {jobSource === 'local'  && <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Demo data · add Adzuna key for live jobs</span>}
          </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => fetchLiveJobs(activeRoles, activeLocations, experienceLevel, activeJobType).then(() => setRefreshing(false))}
              disabled={refreshing}
              className="btn-secondary flex items-center gap-2"
              title="Fetch fresh jobs from The Muse"
            >
              {refreshing
                ? <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                : <span>🔄</span>}
              {refreshing ? 'Loading…' : 'Refresh'}
            </button>
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`btn-secondary flex items-center gap-2 ${showFilters ? 'border-brand-500 text-brand-600' : ''}`}
            >
              <span>⚙️</span> Refine
            </button>
            <Link to="/profile" className="btn-secondary flex items-center gap-2">
              <span>👤</span> Profile
            </Link>
          </div>
        </div>

        {/* ── Re-filter panel ────────────────────────────────────────── */}
        {showFilters && (
          <div className="card p-5 mb-6 border-brand-200">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-gray-900">Refine your job search</p>
              <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            {/* Role categories */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Role types</p>
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
                {ROLE_CATEGORIES.map(r => (
                  <button
                    key={r}
                    onClick={() => toggle(activeRoles, setActiveRoles, r)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      activeRoles.includes(r)
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-brand-400'
                    }`}
                  >
                    {activeRoles.includes(r) && '✓ '}{r}
                  </button>
                ))}
              </div>
            </div>

            {/* Locations */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Locations</p>
              <div className="flex flex-wrap gap-2">
                {LOCATIONS.map(l => (
                  <button
                    key={l}
                    onClick={() => toggle(activeLocations, setActiveLocations, l)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      activeLocations.includes(l)
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-brand-400'
                    }`}
                  >{l}</button>
                ))}
              </div>
            </div>

            {/* Job type + experience + remote */}
            <div className="flex flex-wrap gap-6 items-end mb-5">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Job type</p>
                <select value={activeJobType} onChange={e => setActiveJobType(e.target.value)} className="input w-auto">
                  <option value="any">Any</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Internship">Internship / Co-op</option>
                </select>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Experience level</p>
                <div className="flex gap-2 flex-wrap">
                  {EXPERIENCE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setExperienceLevel(opt.value)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                        experienceLevel === opt.value
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-brand-400'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 pb-1">
                <input type="checkbox" id="remote-filter" checked={remoteOnly}
                  onChange={e => setRemoteOnly(e.target.checked)} className="w-4 h-4 accent-brand-600" />
                <label htmlFor="remote-filter" className="text-sm font-medium text-gray-700">Remote only</label>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={applyFilters} className="btn-primary">Apply filters</button>
              <button onClick={resetFilters} className="btn-secondary">Reset to all jobs</button>
            </div>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard label="Jobs found" value={jobResults.length} />
          <StatCard label="Avg Fit Score" value={avgScore !== null ? `${avgScore}/100` : '—'} />
          <StatCard label="Fully analyzed" value={Object.keys(analyses).length} />
          <StatCard label="Top gap" value={topGapsList[0]?.[0] ?? '—'} small />
        </div>

        {/* Recurring gaps */}
        {topGapsList.length > 0 && (
          <div className="card p-4 mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">Recurring skill gaps across all jobs</p>
            <div className="flex flex-wrap gap-2">
              {topGapsList.map(([gap, count]) => (
                <span key={gap} className="badge bg-red-100 text-red-700">
                  {gap} <span className="ml-1 text-red-400">×{count}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Scoring spinner — shown briefly while scores compute */}
        {analyzing && (
          <div className="flex items-center gap-2 mb-4 text-sm text-brand-600">
            <span className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
            Scoring jobs…
          </div>
        )}

        {/* Quick type filter pills */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {TYPE_FILTERS.map(f => {
            const isSavedPill = f === 'Saved'
            const savedCount = Object.keys(savedJobs).length
            return (
              <button key={f} onClick={() => setTypeFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border flex-shrink-0 transition-colors ${
                  typeFilter === f
                    ? isSavedPill ? 'bg-brand-600 text-white border-brand-600' : 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-brand-400'
                }`}
              >
                {isSavedPill ? `🔖 Saved${savedCount > 0 ? ` (${savedCount})` : ''}` : f}
              </button>
            )
          })}
          {activeRoles.length > 0 && (
            <span className="badge bg-brand-100 text-brand-700 self-center ml-1">
              {activeRoles.length} role{activeRoles.length > 1 ? 's' : ''} selected
            </span>
          )}
          {experienceLevel !== 'any' && (
            <span className="badge bg-purple-100 text-purple-700 self-center">
              {EXPERIENCE_OPTIONS.find(o => o.value === experienceLevel)?.label}
            </span>
          )}
        </div>

        {/* Job grid */}
        {sortedJobs.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold text-gray-700">No jobs match these filters</p>
            <button onClick={resetFilters} className="btn-secondary mt-4">Clear all filters</button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedJobs.map(job => (
              <JobCard key={job.id} job={job} analysis={analyses[job.id] ?? null} savedJobs={savedJobs} toggleSaveJob={toggleSaveJob} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, small }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
      <p className={`font-bold text-gray-900 ${small ? 'text-sm' : 'text-2xl'}`}>{value}</p>
    </div>
  )
}
