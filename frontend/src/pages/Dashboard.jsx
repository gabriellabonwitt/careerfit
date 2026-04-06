import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'
import JobCard from '../components/JobCard'
import { JOBS } from '../jobData'
import { apiFetch } from '../api'

const FILTERS = ['All', 'Full-time', 'Internship', 'Remote']

export default function Dashboard({ userProfile, jobResults, setJobResults }) {
  const navigate = useNavigate()
  const [analyses, setAnalyses] = useState({})
  const [filter, setFilter] = useState('All')

  // Always show jobs — fall back to bundled data if empty
  useEffect(() => {
    if (jobResults.length === 0) {
      setJobResults(JOBS)
    }
  }, [])
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState('')

  const filteredJobs = jobResults.filter(job => {
    if (filter === 'All') return true
    if (filter === 'Remote') return job.remote
    return job.type === filter
  })

  async function analyzeAll() {
    setAnalyzing(true)
    setAnalyzeError('')
    try {
      const results = await Promise.all(
        jobResults.map(job =>
          apiFetch('/api/jobs/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resume_profile: userProfile, job_id: job.id }),
          })
            .then(r => r.json())
            .then(d => ({ id: job.id, analysis: d.analysis }))
            .catch(() => ({ id: job.id, analysis: null }))
        )
      )
      const map = {}
      results.forEach(({ id, analysis }) => { if (analysis) map[id] = analysis })
      setAnalyses(map)
    } catch (e) {
      setAnalyzeError('Analysis failed. Make sure the backend is running with your ANTHROPIC_API_KEY.')
    } finally {
      setAnalyzing(false)
    }
  }

  const hasAnalyses = Object.keys(analyses).length > 0

  // Sort by fit score if available
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    const sa = analyses[a.id]?.fit_score ?? -1
    const sb = analyses[b.id]?.fit_score ?? -1
    return sb - sa
  })

  const avgScore = hasAnalyses
    ? Math.round(Object.values(analyses).reduce((s, a) => s + (a.fit_score || 0), 0) / Object.values(analyses).length)
    : null

  const topGaps = hasAnalyses
    ? Object.values(analyses)
        .flatMap(a => (a.gaps || []).map(g => g.requirement))
        .reduce((acc, g) => { acc[g] = (acc[g] || 0) + 1; return acc }, {})
    : {}
  const topGapsList = Object.entries(topGaps).sort((a, b) => b[1] - a[1]).slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar userName={userProfile?.name} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome banner */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {userProfile?.name ? `Hey ${userProfile.name.split(' ')[0]} 👋` : 'Your Job Matches'}
          </h1>
          <p className="text-gray-500 mt-1">{jobResults.length} jobs found based on your preferences.</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard label="Jobs found" value={jobResults.length} />
          <StatCard label="Avg Fit Score" value={avgScore !== null ? `${avgScore}/100` : '—'} />
          <StatCard label="Fully analyzed" value={Object.keys(analyses).length} />
          <StatCard
            label="Top gap"
            value={topGapsList[0]?.[0] ?? '—'}
            small
          />
        </div>

        {/* Top recurring gaps */}
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

        {/* Analyze CTA */}
        {!hasAnalyses && (
          <div className="card p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-brand-200 bg-brand-50">
            <div>
              <p className="font-semibold text-brand-900">Get AI Fit Scores for all jobs</p>
              <p className="text-sm text-brand-700 mt-0.5">Requires your ANTHROPIC_API_KEY in the backend .env file.</p>
            </div>
            <button onClick={analyzeAll} disabled={analyzing} className="btn-primary flex-shrink-0">
              {analyzing ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </span>
              ) : '✨ Analyze all jobs'}
            </button>
          </div>
        )}

        {analyzeError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-sm text-red-700">{analyzeError}</div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border flex-shrink-0 transition-colors ${
                filter === f ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-300 hover:border-brand-400'
              }`}
            >{f}</button>
          ))}
        </div>

        {/* Job grid */}
        {sortedJobs.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold text-gray-700">No jobs match this filter</p>
            <button onClick={() => setFilter('All')} className="btn-secondary mt-4">Clear filter</button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedJobs.map(job => (
              <JobCard key={job.id} job={job} analysis={analyses[job.id] ?? null} />
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
