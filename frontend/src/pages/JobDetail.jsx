import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'
import FitScoreCircle from '../components/FitScoreCircle'
import { JOBS } from '../jobData'
import { apiFetch } from '../api'

const TABS = ['Fit Breakdown', 'Resume Suggestions', 'Networking']

export default function JobDetail({ userProfile }) {
  const { jobId } = useParams()
  const navigate = useNavigate()

  const [job, setJob] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [outreach, setOutreach] = useState(null)
  const [tab, setTab] = useState('Fit Breakdown')
  const [loadingJob, setLoadingJob] = useState(true)
  const [loadingAnalysis, setLoadingAnalysis] = useState(false)
  const [loadingOutreach, setLoadingOutreach] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    apiFetch(`/api/jobs/${jobId}`)
      .then(r => r.json())
      .then(d => { setJob(d.job); setLoadingJob(false) })
      .catch(() => {
        // Backend not running — fall back to bundled data
        const found = JOBS.find(j => j.id === jobId)
        if (found) { setJob(found); setLoadingJob(false) }
        else { setError('Job not found'); setLoadingJob(false) }
      })
  }, [jobId])

  async function runAnalysis() {
    setLoadingAnalysis(true)
    setError('')
    try {
      const res = await apiFetch('/api/jobs/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_profile: userProfile, job_id: jobId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAnalysis(data.analysis)
    } catch (e) {
      setError(e.message || 'Analysis failed. Check that the backend is running with ANTHROPIC_API_KEY.')
    } finally {
      setLoadingAnalysis(false)
    }
  }

  async function runOutreach() {
    setLoadingOutreach(true)
    setError('')
    try {
      const res = await apiFetch('/api/networking/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_profile: userProfile, job_id: jobId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setOutreach(data.outreach)
    } catch (e) {
      setError(e.message || 'Generation failed.')
    } finally {
      setLoadingOutreach(false)
    }
  }

  if (loadingJob) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>
  if (!job) return <div className="min-h-screen flex items-center justify-center"><p className="text-red-500">{error}</p></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar userName={userProfile?.name} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Back */}
        <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1 mb-5">
          ← Back to dashboard
        </button>

        {/* Job header */}
        <div className="card p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                style={{ backgroundColor: job.logo_color || '#6366f1' }}
              >
                {job.company.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                <p className="text-gray-600 mt-0.5">{job.company} · {job.location}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className={`badge ${job.type === 'Internship' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{job.type}</span>
                  {job.remote && <span className="badge bg-green-100 text-green-700">Remote OK</span>}
                  <span className="badge bg-gray-100 text-gray-600">{job.industry}</span>
                  <span className="badge bg-gray-100 text-gray-600">{job.seniority}</span>
                </div>
              </div>
            </div>
            {analysis && <FitScoreCircle score={analysis.fit_score} size={88} />}
          </div>

          <p className="text-sm text-gray-600 mt-4 leading-relaxed">{job.description}</p>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">{job.salary}</span>
            <span className="text-sm text-gray-400">{job.posted} · via {job.source}</span>
          </div>
        </div>

        {/* Requirements summary */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="card p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Required</p>
            <ul className="space-y-1.5">
              {job.requirements.map((r, i) => (
                <li key={i} className="text-sm text-gray-700 flex gap-2">
                  <span className="text-gray-400 flex-shrink-0">•</span> {r}
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Preferred / Nice-to-have</p>
            <ul className="space-y-1.5">
              {job.preferred.map((p, i) => (
                <li key={i} className="text-sm text-gray-700 flex gap-2">
                  <span className="text-gray-400 flex-shrink-0">•</span> {p}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Analyze CTA */}
        {!analysis && (
          <div className="card p-5 mb-6 border-brand-200 bg-brand-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-brand-900">Analyze your fit with AI</p>
              <p className="text-sm text-brand-700 mt-0.5">See your fit score, strengths, gaps, and resume suggestions for this role.</p>
            </div>
            <button onClick={runAnalysis} disabled={loadingAnalysis} className="btn-primary flex-shrink-0">
              {loadingAnalysis ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </span>
              ) : '✨ Analyze my fit'}
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-sm text-red-700">{error}</div>
        )}

        {/* Tabs */}
        {analysis && (
          <>
            <div className="flex gap-1 mb-6 border-b border-gray-200">
              {TABS.map(t => (
                <button
                  key={t}
                  onClick={() => { setTab(t); if (t === 'Networking' && !outreach) runOutreach() }}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    tab === t ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >{t}</button>
              ))}
            </div>

            {/* Tab: Fit Breakdown */}
            {tab === 'Fit Breakdown' && (
              <div className="space-y-4">
                {/* Summary */}
                <div className="card p-5">
                  <div className="flex gap-4 items-start">
                    <FitScoreCircle score={analysis.fit_score} size={80} />
                    <div>
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        {analysis.confidence}
                      </p>
                      <p className="text-gray-700 text-sm leading-relaxed">{analysis.summary}</p>
                    </div>
                  </div>
                </div>

                {/* Strengths */}
                <div className="card p-5">
                  <p className="font-semibold text-gray-900 mb-3">✅ Strengths</p>
                  <div className="space-y-3">
                    {(analysis.strengths || []).map((s, i) => (
                      <div key={i} className="flex gap-3">
                        <span className="badge bg-green-100 text-green-700 flex-shrink-0">{s.skill}</span>
                        <p className="text-sm text-gray-600">{s.evidence}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gaps */}
                <div className="card p-5">
                  <p className="font-semibold text-gray-900 mb-3">⚠️ Gaps to address</p>
                  <div className="space-y-3">
                    {(analysis.gaps || []).map((g, i) => (
                      <div key={i} className="bg-red-50 rounded-lg p-3">
                        <p className="text-sm font-semibold text-red-700">{g.requirement}</p>
                        <p className="text-sm text-gray-600 mt-0.5">{g.suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick wins */}
                {analysis.quick_wins?.length > 0 && (
                  <div className="card p-5">
                    <p className="font-semibold text-gray-900 mb-3">⚡ Quick wins</p>
                    <ul className="space-y-2">
                      {analysis.quick_wins.map((w, i) => (
                        <li key={i} className="text-sm text-gray-700 flex gap-2">
                          <span className="text-brand-500 font-bold">{i + 1}.</span> {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Resume Suggestions */}
            {tab === 'Resume Suggestions' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">AI-generated bullet rewrites tailored to this job's language and requirements.</p>
                {(analysis.resume_bullets || []).length === 0 ? (
                  <div className="card p-8 text-center text-gray-400">No suggestions generated.</div>
                ) : (
                  analysis.resume_bullets.map((b, i) => (
                    <div key={i} className="card p-5">
                      {b.original && (
                        <div className="mb-3">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Original</p>
                          <p className="text-sm text-gray-500 line-through">{b.original}</p>
                        </div>
                      )}
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">Suggested</p>
                        <p className="text-sm text-gray-800 font-medium leading-relaxed">{b.improved}</p>
                      </div>
                      <div className="bg-brand-50 rounded-lg px-3 py-2">
                        <p className="text-xs text-brand-700"><span className="font-semibold">Why: </span>{b.reason}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab: Networking */}
            {tab === 'Networking' && (
              <div className="space-y-4">
                {loadingOutreach ? (
                  <div className="card p-12 flex items-center justify-center gap-3">
                    <span className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500">Generating outreach template...</p>
                  </div>
                ) : outreach ? (
                  <>
                    {/* Message */}
                    <div className="card p-5">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-semibold text-gray-900">LinkedIn outreach template</p>
                        <button
                          onClick={() => navigator.clipboard.writeText(outreach.message)}
                          className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                        >Copy</button>
                      </div>
                      <p className="text-xs font-semibold text-gray-500 mb-1">Subject</p>
                      <p className="text-sm text-gray-700 mb-4 italic">{outreach.subject}</p>
                      <p className="text-xs font-semibold text-gray-500 mb-1">Message</p>
                      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap border border-gray-200">
                        {outreach.message}
                      </div>
                    </div>

                    {/* Who to target */}
                    {outreach.who_to_target?.length > 0 && (
                      <div className="card p-5">
                        <p className="font-semibold text-gray-900 mb-3">👥 Who to reach out to</p>
                        <ul className="space-y-2">
                          {outreach.who_to_target.map((w, i) => (
                            <li key={i} className="text-sm text-gray-700 flex gap-2">
                              <span className="text-brand-500">→</span> {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Personalization prompts */}
                    {outreach.personalization_prompts?.length > 0 && (
                      <div className="card p-5 bg-yellow-50 border-yellow-200">
                        <p className="font-semibold text-yellow-800 mb-3">✏️ Personalize before sending</p>
                        <ul className="space-y-2">
                          {outreach.personalization_prompts.map((p, i) => (
                            <li key={i} className="text-sm text-yellow-700 flex gap-2">
                              <span className="font-bold">{i + 1}.</span> {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Dos and Don'ts */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      {outreach.dos?.length > 0 && (
                        <div className="card p-4">
                          <p className="text-sm font-semibold text-green-700 mb-2">✅ Do</p>
                          <ul className="space-y-1.5">
                            {outreach.dos.map((d, i) => <li key={i} className="text-sm text-gray-600">{d}</li>)}
                          </ul>
                        </div>
                      )}
                      {outreach.donts?.length > 0 && (
                        <div className="card p-4">
                          <p className="text-sm font-semibold text-red-600 mb-2">✗ Don't</p>
                          <ul className="space-y-1.5">
                            {outreach.donts.map((d, i) => <li key={i} className="text-sm text-gray-600">{d}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="card p-8 text-center">
                    <p className="text-gray-500">Click the Networking tab again to generate your outreach template.</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
