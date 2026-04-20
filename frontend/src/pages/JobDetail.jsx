import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import NavBar from '../components/NavBar'
import FitScoreCircle from '../components/FitScoreCircle'
import { JOBS, getApplyUrl } from '../jobData'
import { apiFetch } from '../api'
import { analyzeJobLocally, getScoreBand } from '../localAnalysis'
import { draftNetworkingEmail } from '../emailDrafter'

const TABS = ['Fit Breakdown', 'Resume Suggestions', 'Networking']

const CONNECTION_OPTIONS = [
  { value: 'alumni',    label: 'Alumni' },
  { value: 'recruiter', label: 'Recruiter' },
  { value: 'referral',  label: 'Referral' },
  { value: 'cold',      label: 'Cold outreach' },
  { value: 'friend',    label: 'Friend / Family' },
  { value: 'professor', label: 'Professor / Mentor' },
  { value: 'colleague', label: 'Former colleague' },
  { value: 'other',     label: 'Other' },
]

const INTERACTION_TYPES = [
  { value: 'email_sent',     label: 'Sent email',         icon: '📧' },
  { value: 'email_received', label: 'Got reply',          icon: '📨' },
  { value: 'linkedin_msg',   label: 'LinkedIn message',   icon: '💼' },
  { value: 'call',           label: 'Phone / video call', icon: '📞' },
  { value: 'meeting',        label: 'Coffee / meeting',   icon: '🤝' },
  { value: 'referred',       label: 'Got a referral',     icon: '🎉' },
  { value: 'other',          label: 'Other',              icon: '📝' },
]

const BLANK_CONTACT = { name: '', email: '', title: '', connection: '', linkedin: '', notes: '' }

function timeAgo(ts) {
  if (!ts) return 'Never'
  const diff = Date.now() - ts
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}

export default function JobDetail({ userProfile, jobResults = [], savedJobs = {}, toggleSaveJob, updateJobStatus, contacts = {}, addContact, logInteraction, onLogout }) {
  const { jobId } = useParams()
  const navigate = useNavigate()

  const [job, setJob] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [tab, setTab] = useState('Fit Breakdown')
  const [loadingJob, setLoadingJob] = useState(true)
  const [error, setError] = useState('')

  // Networking tab state
  const [showAddForm, setShowAddForm]     = useState(false)
  const [newContact, setNewContact]       = useState(BLANK_CONTACT)
  const [logForm, setLogForm]             = useState(null) // contactId
  const [logData, setLogData]             = useState({ type: '', note: '', date: new Date().toISOString().split('T')[0] })
  const [draftFor, setDraftFor]           = useState(null) // contactId whose email is open
  const [draftEdits, setDraftEdits]       = useState({ subject: '', body: '' })
  const [copied, setCopied]               = useState(false)

  // Load job from local data, then auto-score
  useEffect(() => {
    setError('')
    // Check live job results first (Adzuna etc.), then fall back to static list
    const found = jobResults.find(j => j.id === jobId) || JOBS.find(j => j.id === jobId)
    if (found) {
      setJob(found)
      setLoadingJob(false)
      return
    }
    apiFetch(`/api/jobs/${jobId}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => {
        if (d.job) { setJob(d.job); setLoadingJob(false) }
        else { setError('Job not found'); setLoadingJob(false) }
      })
      .catch(() => {
        setError('Job not found')
        setLoadingJob(false)
      })
  }, [jobId, jobResults])

  // Auto-score as soon as the job is loaded
  useEffect(() => {
    if (job && userProfile) {
      setAnalysis(analyzeJobLocally(userProfile, job))
    }
  }, [job, userProfile])

  // Contacts for this specific job
  const jobContacts = Object.values(contacts).filter(c => c.jobId === jobId)

  function handleAddContact() {
    if (!newContact.name.trim()) return
    const contact = {
      ...newContact,
      id: Date.now().toString(),
      jobId,
      jobTitle: job?.title ?? '',
      company: job?.company ?? '',
      addedAt: Date.now(),
      interactions: [],
    }
    addContact(contact)
    setNewContact(BLANK_CONTACT)
    setShowAddForm(false)
  }

  function handleLogInteraction(contactId) {
    if (!logData.type) return
    logInteraction(contactId, {
      id: Date.now().toString(),
      type: logData.type,
      date: logData.date ? new Date(logData.date).getTime() : Date.now(),
      note: logData.note,
    })
    setLogForm(null)
    setLogData({ type: '', note: '', date: new Date().toISOString().split('T')[0] })
  }

  function openDraft(contact) {
    const draft = draftNetworkingEmail(contact, job, userProfile)
    setDraftEdits(draft)
    setDraftFor(contact.id)
    setCopied(false)
  }

  function copyDraft() {
    const full = `Subject: ${draftEdits.subject}\n\n${draftEdits.body}`
    navigator.clipboard.writeText(full)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  if (loadingJob) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>
  if (!job) return <div className="min-h-screen flex items-center justify-center"><p className="text-red-500">{error}</p></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar userName={userProfile?.name} onLogout={onLogout} />

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

          {/* Apply actions */}
          <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-3">
            <a
              href={getApplyUrl(job)}
              target="_blank"
              rel="noreferrer"
              className="btn-primary flex items-center gap-2"
            >
              🚀 Apply now
            </a>

            {savedJobs[job.id] === 'applied' ? (
              <span className="flex items-center gap-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
                ✓ Marked as applied
              </span>
            ) : (
              <button
                onClick={() => {
                  if (!savedJobs[job.id]) toggleSaveJob(job.id)
                  updateJobStatus(job.id, 'applied')
                }}
                className="btn-secondary flex items-center gap-2"
              >
                ✓ Mark as applied
              </button>
            )}

            {!savedJobs[job.id] && (
              <button
                onClick={() => toggleSaveJob(job.id)}
                className="text-sm text-gray-500 hover:text-gray-800 font-medium"
              >
                🔖 Save for later
              </button>
            )}
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
                {/* Summary card */}
                <div className="card p-5 flex gap-5 items-center">
                  <FitScoreCircle score={analysis.fit_score} size={88} />
                  <div className="flex-1">
                    {analysis.band && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2 ${analysis.band.bg} ${analysis.band.text}`}>
                        {analysis.band.label}
                      </span>
                    )}
                    <p className="text-gray-700 text-sm leading-relaxed">{analysis.summary}</p>
                  </div>
                </div>

                {/* 5-category breakdown */}
                {analysis.breakdown && (
                  <div className="card p-5">
                    <p className="font-semibold text-gray-900 mb-4">Score Breakdown</p>
                    <div className="space-y-4">
                      {[
                        { key: 'job_match',    label: 'Job Match',      max: 25, icon: '🎯' },
                        { key: 'impact',       label: 'Impact',          max: 25, icon: '⚡' },
                        { key: 'completeness', label: 'Completeness',    max: 20, icon: '✅' },
                        { key: 'formatting',   label: 'Formatting',      max: 15, icon: '📐' },
                        { key: 'writing',      label: 'Writing Quality', max: 15, icon: '✍️' },
                      ].map(cat => {
                        const d    = analysis.breakdown[cat.key]
                        const band = getScoreBand(d.pct)
                        const barColor = { green: 'bg-green-500', blue: 'bg-blue-500', yellow: 'bg-yellow-500', red: 'bg-red-500' }[band.color]
                        return (
                          <div key={cat.key}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium text-gray-800">{cat.icon} {cat.label}</span>
                              <span className="text-sm font-bold text-gray-700">{d.score}<span className="text-gray-400 font-normal">/{cat.max}</span></span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 mb-1.5">
                              <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${d.pct}%` }} />
                            </div>
                            {d.fixes.length > 0 && (
                              <ul className="space-y-0.5">
                                {d.fixes.map((fix, i) => (
                                  <li key={i} className="text-xs text-red-700 flex gap-1"><span>↳</span>{fix}</li>
                                ))}
                              </ul>
                            )}
                            {d.fixes.length === 0 && d.positives.length > 0 && (
                              <p className="text-xs text-green-700">✓ {d.positives[0]}</p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Gaps */}
                {(analysis.gaps || []).length > 0 && (
                  <div className="card p-5">
                    <p className="font-semibold text-gray-900 mb-3">⚠️ Requirements to address</p>
                    <div className="space-y-2">
                      {analysis.gaps.map((g, i) => (
                        <div key={i} className="bg-red-50 rounded-lg p-3">
                          <p className="text-sm text-red-700 font-medium">{g.requirement}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strengths */}
                {(analysis.strengths || []).length > 0 && (
                  <div className="card p-5">
                    <p className="font-semibold text-gray-900 mb-3">✅ What's working</p>
                    <ul className="space-y-1.5">
                      {analysis.strengths.map((s, i) => (
                        <li key={i} className="text-sm text-gray-700 flex gap-2">
                          <span className="text-green-500">✓</span> {s.skill}
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
                <p className="text-sm text-gray-500">Per-bullet coaching based on this job — rewrites where needed, and specific questions to help you fill in your own metrics.</p>
                {(analysis.resume_bullets || []).length === 0 ? (
                  <div className="card p-8 text-center text-gray-400">
                    <p className="text-2xl mb-2">📄</p>
                    <p className="font-medium text-gray-500">No resume bullets found</p>
                    <p className="text-sm mt-1">Upload a resume on the onboarding page so we can suggest improvements.</p>
                  </div>
                ) : (
                  analysis.resume_bullets.map((b, i) => {
                    const isRewrite = b.type === 'rewrite'
                    const isAdd     = b.type === 'add'

                    return (
                      <div key={i} className="card p-5 space-y-3">

                        {/* ── Your bullet ── */}
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Your bullet</p>
                          <p className={`text-sm leading-relaxed ${isRewrite ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                            {b.original}
                          </p>
                        </div>

                        {/* ── Rewrite (weak opener replaced) ── */}
                        {isRewrite && (
                          <div>
                            <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">Suggested rewrite</p>
                            <p className="text-sm text-gray-900 font-medium leading-relaxed">{b.improved}</p>
                          </div>
                        )}

                        {/* ── What to add (missing metric) ── */}
                        {b.suggestion && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">💡 Fill in your own number</p>
                            <p className="text-sm text-amber-800">{b.suggestion}</p>
                          </div>
                        )}

                        {/* ── Already strong ── */}
                        {!isRewrite && !isAdd && (
                          <div>
                            <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-0.5">✓ Already strong</p>
                          </div>
                        )}

                        {/* ── Why / tip ── */}
                        <div className="bg-brand-50 rounded-lg px-3 py-2">
                          <p className="text-xs text-brand-700">
                            <span className="font-semibold">Why: </span>{b.reason}
                          </p>
                        </div>

                      </div>
                    )
                  })
                )}
              </div>
            )}

            {/* Tab: Networking */}
            {tab === 'Networking' && (
              <div className="space-y-4">

                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">Contacts for this job</p>
                    <p className="text-sm text-gray-500">Track everyone you reach out to at {job.company}.</p>
                  </div>
                  <div className="flex gap-2">
                    <Link to="/networking" className="btn-secondary text-sm">View all →</Link>
                    <button onClick={() => setShowAddForm(v => !v)} className="btn-primary text-sm">
                      {showAddForm ? 'Cancel' : '+ Add contact'}
                    </button>
                  </div>
                </div>

                {/* Add contact form */}
                {showAddForm && (
                  <div className="card p-5 border-brand-200 bg-brand-50 space-y-4">
                    <p className="font-semibold text-brand-900">Add a new contact</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">Full name *</label>
                        <input value={newContact.name} onChange={e => setNewContact(p => ({ ...p, name: e.target.value }))}
                          placeholder="Jane Smith" className="input text-sm w-full" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">Their job title</label>
                        <input value={newContact.title} onChange={e => setNewContact(p => ({ ...p, title: e.target.value }))}
                          placeholder="Engineering Manager" className="input text-sm w-full" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">Email</label>
                        <input value={newContact.email} onChange={e => setNewContact(p => ({ ...p, email: e.target.value }))}
                          placeholder="jane@company.com" type="email" className="input text-sm w-full" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">How are you connected?</label>
                        <select value={newContact.connection} onChange={e => setNewContact(p => ({ ...p, connection: e.target.value }))}
                          className="input text-sm w-full">
                          <option value="">Select…</option>
                          {CONNECTION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">LinkedIn profile URL</label>
                        <input value={newContact.linkedin} onChange={e => setNewContact(p => ({ ...p, linkedin: e.target.value }))}
                          placeholder="https://linkedin.com/in/janesmith" className="input text-sm w-full" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold text-gray-600 mb-1 block">Notes</label>
                        <input value={newContact.notes} onChange={e => setNewContact(p => ({ ...p, notes: e.target.value }))}
                          placeholder="Met at career fair, mutual connection via Prof. Lee…" className="input text-sm w-full" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleAddContact} disabled={!newContact.name.trim()} className="btn-primary text-sm">Save contact</button>
                      <button onClick={() => { setShowAddForm(false); setNewContact(BLANK_CONTACT) }} className="btn-secondary text-sm">Cancel</button>
                    </div>
                  </div>
                )}

                {/* Contacts list */}
                {jobContacts.length === 0 && !showAddForm && (
                  <div className="card p-10 text-center">
                    <p className="text-3xl mb-2">👤</p>
                    <p className="font-medium text-gray-700 mb-1">No contacts yet</p>
                    <p className="text-sm text-gray-400">Add anyone you've reached out to — recruiters, employees, alumni.</p>
                  </div>
                )}

                {jobContacts.map(contact => {
                  const lastIx = contact.interactions?.slice(-1)[0]
                  const isLogging = logForm === contact.id
                  return (
                    <div key={contact.id} className="card p-4 space-y-3">
                      {/* Contact header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm flex-shrink-0">
                            {contact.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{contact.name}</p>
                            <p className="text-sm text-gray-500">
                              {[contact.title, contact.connection ? CONNECTION_OPTIONS.find(o => o.value === contact.connection)?.label : ''].filter(Boolean).join(' · ')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right text-xs text-gray-400">
                          {lastIx
                            ? <span className={Date.now() - lastIx.date > 7*86400000 ? 'text-amber-600 font-medium' : 'text-green-600 font-medium'}>
                                Last: {timeAgo(lastIx.date)}
                              </span>
                            : <span className="italic">No contact yet</span>
                          }
                        </div>
                      </div>

                      {/* Contact details */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                        {contact.email && <a href={`mailto:${contact.email}`} className="text-brand-600 hover:underline">📧 {contact.email}</a>}
                        {contact.linkedin && <a href={contact.linkedin} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">💼 LinkedIn</a>}
                        {contact.notes && <span className="text-gray-500 w-full text-xs italic">"{contact.notes}"</span>}
                      </div>

                      {/* Interaction history */}
                      {contact.interactions?.length > 0 && (
                        <div className="space-y-1 pl-2 border-l-2 border-gray-200">
                          {[...contact.interactions].reverse().slice(0, 3).map(ix => {
                            const t = INTERACTION_TYPES.find(t => t.value === ix.type)
                            return (
                              <div key={ix.id} className="flex items-center gap-2 text-xs text-gray-600">
                                <span>{t?.icon ?? '📝'}</span>
                                <span className="font-medium">{t?.label}</span>
                                <span className="text-gray-400">{timeAgo(ix.date)}</span>
                                {ix.note && <span className="text-gray-500">— {ix.note}</span>}
                              </div>
                            )
                          })}
                          {contact.interactions.length > 3 && (
                            <p className="text-xs text-gray-400">+{contact.interactions.length - 3} more</p>
                          )}
                        </div>
                      )}

                      {/* Log interaction */}
                      {isLogging ? (
                        <div className="bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-200">
                          <div className="grid grid-cols-2 gap-2">
                            <select value={logData.type} onChange={e => setLogData(p => ({ ...p, type: e.target.value }))}
                              className="input text-sm w-full">
                              <option value="">Type…</option>
                              {INTERACTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
                            </select>
                            <input type="date" value={logData.date}
                              onChange={e => setLogData(p => ({ ...p, date: e.target.value }))}
                              className="input text-sm w-full" />
                          </div>
                          <input value={logData.note} onChange={e => setLogData(p => ({ ...p, note: e.target.value }))}
                            placeholder="Optional note…" className="input text-sm w-full" />
                          <div className="flex gap-2">
                            <button onClick={() => handleLogInteraction(contact.id)} className="btn-primary text-sm">Save</button>
                            <button onClick={() => setLogForm(null)} className="btn-secondary text-sm">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-3 flex-wrap">
                          <button
                            onClick={() => { setLogForm(contact.id); setDraftFor(null); setLogData({ type: '', note: '', date: new Date().toISOString().split('T')[0] }) }}
                            className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                          >
                            + Log interaction
                          </button>
                          <button
                            onClick={() => draftFor === contact.id ? setDraftFor(null) : openDraft(contact)}
                            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                          >
                            ✉️ {draftFor === contact.id ? 'Hide draft' : 'Draft email'}
                          </button>
                        </div>
                      )}

                      {/* Email draft panel */}
                      {draftFor === contact.id && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-purple-900">✉️ Email draft</p>
                            <div className="flex gap-2">
                              <button onClick={copyDraft}
                                className="text-xs font-medium text-purple-700 hover:text-purple-900 bg-purple-100 hover:bg-purple-200 px-2 py-1 rounded transition-colors">
                                {copied ? '✓ Copied!' : 'Copy all'}
                              </button>
                              {contact.email && (
                                <a
                                  href={`mailto:${contact.email}?subject=${encodeURIComponent(draftEdits.subject)}&body=${encodeURIComponent(draftEdits.body)}`}
                                  className="text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded transition-colors"
                                >
                                  Open in mail
                                </a>
                              )}
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-purple-700 mb-1 block">Subject</label>
                            <input
                              value={draftEdits.subject}
                              onChange={e => setDraftEdits(p => ({ ...p, subject: e.target.value }))}
                              className="input text-sm w-full bg-white"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-purple-700 mb-1 block">Body</label>
                            <textarea
                              value={draftEdits.body}
                              onChange={e => setDraftEdits(p => ({ ...p, body: e.target.value }))}
                              rows={12}
                              className="input text-sm w-full bg-white resize-none font-mono leading-relaxed"
                            />
                          </div>
                          <p className="text-xs text-purple-600">Edit freely — this is your draft. Personalize before sending!</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
