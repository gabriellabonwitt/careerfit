import { useState } from 'react'
import { Link } from 'react-router-dom'
import NavBar from '../components/NavBar'
import { draftNetworkingEmail } from '../emailDrafter'
import { JOBS } from '../jobData'

const INTERACTION_TYPES = [
  { value: 'email_sent',     label: 'Sent email',           icon: '📧' },
  { value: 'email_received', label: 'Got reply',            icon: '📨' },
  { value: 'linkedin_msg',   label: 'LinkedIn message',     icon: '💼' },
  { value: 'call',           label: 'Phone / video call',   icon: '📞' },
  { value: 'meeting',        label: 'Coffee / meeting',     icon: '🤝' },
  { value: 'referred',       label: 'Got a referral',       icon: '🎉' },
  { value: 'other',          label: 'Other',                icon: '📝' },
]

const CONNECTION_LABELS = {
  alumni:    'Alumni',
  recruiter: 'Recruiter',
  referral:  'Referral',
  cold:      'Cold outreach',
  friend:    'Friend / Family',
  professor: 'Professor / Mentor',
  colleague: 'Former colleague',
  other:     'Other',
}

function timeAgo(ts) {
  if (!ts) return 'Never'
  const diff = Date.now() - ts
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7)  return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function NetworkingHub({ userProfile, contacts, logInteraction, deleteContact, onLogout }) {
  const [search, setSearch]             = useState('')
  const [filterConnection, setFilterConnection] = useState('all')
  const [expandedId, setExpandedId]     = useState(null)
  const [logForm, setLogForm]           = useState(null)
  const [sortBy, setSortBy]             = useState('last_contact')
  const [draftFor, setDraftFor]         = useState(null)
  const [draftEdits, setDraftEdits]     = useState({ subject: '', body: '' })
  const [copied, setCopied]             = useState(false)

  const allContacts = Object.values(contacts)

  // Filter
  const filtered = allContacts.filter(c => {
    const q = search.toLowerCase()
    const matchesSearch = !q || c.name.toLowerCase().includes(q) || c.company?.toLowerCase().includes(q) || c.title?.toLowerCase().includes(q)
    const matchesConn = filterConnection === 'all' || c.connection === filterConnection
    return matchesSearch && matchesConn
  })

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    if (sortBy === 'added') return b.addedAt - a.addedAt
    // last_contact: contacts never reached out to go last
    const aLast = a.interactions?.slice(-1)[0]?.date ?? 0
    const bLast = b.interactions?.slice(-1)[0]?.date ?? 0
    return bLast - aLast
  })

  function submitLog(contactId) {
    if (!logForm?.type) return
    logInteraction(contactId, {
      id: Date.now().toString(),
      type: logForm.type,
      date: logForm.date ? new Date(logForm.date).getTime() : Date.now(),
      note: logForm.note || '',
    })
    setLogForm(null)
  }

  function openDraft(contact) {
    const job = JOBS.find(j => j.id === contact.jobId) || { title: contact.jobTitle, company: contact.company }
    const draft = draftNetworkingEmail(contact, job, userProfile)
    setDraftEdits(draft)
    setDraftFor(contact.id)
    setCopied(false)
  }

  function copyDraft() {
    navigator.clipboard.writeText(`Subject: ${draftEdits.subject}\n\n${draftEdits.body}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const totalInteractions = allContacts.reduce((s, c) => s + (c.interactions?.length ?? 0), 0)
  const reachedOut = allContacts.filter(c => c.interactions?.length > 0).length
  const needsFollowUp = allContacts.filter(c => {
    const last = c.interactions?.slice(-1)[0]?.date ?? 0
    return Date.now() - last > 7 * 86400000 // no contact in 7+ days
  }).length

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar userName={userProfile?.name} onLogout={onLogout} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🤝 Networking Hub</h1>
            <p className="text-gray-500 mt-1">Track every contact across all your job applications.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total contacts" value={allContacts.length} />
          <StatCard label="Reached out" value={reachedOut} />
          <StatCard label="Interactions" value={totalInteractions} />
          <StatCard label="Need follow-up" value={needsFollowUp} warn={needsFollowUp > 0} />
        </div>

        {/* Empty state */}
        {allContacts.length === 0 && (
          <div className="card p-12 text-center">
            <p className="text-4xl mb-3">🤝</p>
            <p className="font-semibold text-gray-700 mb-1">No contacts yet</p>
            <p className="text-sm text-gray-500 mb-4">Open a job and go to the Networking tab to add your first contact.</p>
            <Link to="/dashboard" className="btn-primary">Browse jobs →</Link>
          </div>
        )}

        {allContacts.length > 0 && (
          <>
            {/* Controls */}
            <div className="flex flex-wrap gap-3 mb-4 items-center">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, company, role…"
                className="input flex-1 min-w-48 text-sm"
              />
              <select value={filterConnection} onChange={e => setFilterConnection(e.target.value)} className="input w-auto text-sm">
                <option value="all">All connections</option>
                {Object.entries(CONNECTION_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input w-auto text-sm">
                <option value="last_contact">Sort: Last contact</option>
                <option value="name">Sort: Name</option>
                <option value="added">Sort: Recently added</option>
              </select>
            </div>

            {sorted.length === 0 && (
              <div className="card p-8 text-center text-gray-400">No contacts match your search.</div>
            )}

            {/* Contact cards */}
            <div className="space-y-3">
              {sorted.map(contact => {
                const lastInteraction = contact.interactions?.slice(-1)[0]
                const isExpanded = expandedId === contact.id
                const isLogging = logForm?.contactId === contact.id

                return (
                  <div key={contact.id} className="card overflow-hidden">
                    {/* Summary row */}
                    <div
                      className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedId(isExpanded ? null : contact.id)}
                    >
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm flex-shrink-0">
                        {contact.name.charAt(0).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900">{contact.name}</p>
                          {contact.connection && (
                            <span className="badge bg-purple-100 text-purple-700 text-xs">
                              {CONNECTION_LABELS[contact.connection] ?? contact.connection}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {[contact.title, contact.company].filter(Boolean).join(' · ')}
                          {contact.jobTitle && <span className="text-gray-400"> — for <em>{contact.jobTitle}</em></span>}
                        </p>
                      </div>

                      {/* Last contact + count */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-medium text-gray-700">
                          {lastInteraction
                            ? <span className={Date.now() - lastInteraction.date > 7*86400000 ? 'text-amber-600' : 'text-green-600'}>
                                {INTERACTION_TYPES.find(t => t.value === lastInteraction.type)?.icon} {timeAgo(lastInteraction.date)}
                              </span>
                            : <span className="text-gray-400 italic text-xs">No contact yet</span>
                          }
                        </p>
                        <p className="text-xs text-gray-400">
                          {contact.interactions?.length ?? 0} interaction{contact.interactions?.length !== 1 ? 's' : ''}
                        </p>
                      </div>

                      <span className="text-gray-400 text-sm">{isExpanded ? '▲' : '▼'}</span>
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-4">

                        {/* Contact details */}
                        <div className="grid sm:grid-cols-2 gap-3 text-sm">
                          {contact.email && (
                            <div><span className="text-gray-500">Email: </span>
                              <a href={`mailto:${contact.email}`} className="text-brand-600 hover:underline">{contact.email}</a>
                            </div>
                          )}
                          {contact.linkedin && (
                            <div><span className="text-gray-500">LinkedIn: </span>
                              <a href={contact.linkedin} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline truncate block max-w-xs">
                                {contact.linkedin.replace('https://www.', '').replace('https://', '')}
                              </a>
                            </div>
                          )}
                          {contact.notes && (
                            <div className="sm:col-span-2"><span className="text-gray-500">Notes: </span>{contact.notes}</div>
                          )}
                          <div><span className="text-gray-500">Added: </span>{formatDate(contact.addedAt)}</div>
                          {contact.jobId && (
                            <div><span className="text-gray-500">Job: </span>
                              <Link to={`/jobs/${contact.jobId}`} className="text-brand-600 hover:underline">{contact.jobTitle} at {contact.company}</Link>
                            </div>
                          )}
                        </div>

                        {/* Interaction timeline */}
                        {contact.interactions?.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Interaction history</p>
                            <div className="space-y-2">
                              {[...contact.interactions].reverse().map(ix => {
                                const t = INTERACTION_TYPES.find(t => t.value === ix.type)
                                return (
                                  <div key={ix.id} className="flex items-start gap-2 text-sm">
                                    <span className="text-base leading-none mt-0.5">{t?.icon ?? '📝'}</span>
                                    <div>
                                      <span className="font-medium text-gray-700">{t?.label ?? ix.type}</span>
                                      <span className="text-gray-400 ml-2 text-xs">{formatDate(ix.date)}</span>
                                      {ix.note && <p className="text-gray-500 mt-0.5">{ix.note}</p>}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* Log interaction form */}
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
                                  <a href={`mailto:${contact.email}?subject=${encodeURIComponent(draftEdits.subject)}&body=${encodeURIComponent(draftEdits.body)}`}
                                    className="text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded transition-colors">
                                    Open in mail
                                  </a>
                                )}
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-purple-700 mb-1 block">Subject</label>
                              <input value={draftEdits.subject} onChange={e => setDraftEdits(p => ({ ...p, subject: e.target.value }))}
                                className="input text-sm w-full bg-white" />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-purple-700 mb-1 block">Body</label>
                              <textarea value={draftEdits.body} onChange={e => setDraftEdits(p => ({ ...p, body: e.target.value }))}
                                rows={12} className="input text-sm w-full bg-white resize-none font-mono leading-relaxed" />
                            </div>
                            <p className="text-xs text-purple-600">Edit freely — personalize before sending!</p>
                          </div>
                        )}

                        {isLogging ? (
                          <div className="bg-white rounded-lg border border-brand-200 p-4 space-y-3">
                            <p className="text-sm font-semibold text-gray-800">Log an interaction</p>
                            <div className="grid sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-medium text-gray-600 mb-1 block">Type</label>
                                <select
                                  value={logForm.type || ''}
                                  onChange={e => setLogForm(f => ({ ...f, type: e.target.value }))}
                                  className="input text-sm w-full"
                                >
                                  <option value="">Select type…</option>
                                  {INTERACTION_TYPES.map(t => (
                                    <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-600 mb-1 block">Date</label>
                                <input
                                  type="date"
                                  value={logForm.date || new Date().toISOString().split('T')[0]}
                                  onChange={e => setLogForm(f => ({ ...f, date: e.target.value }))}
                                  className="input text-sm w-full"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-600 mb-1 block">Note (optional)</label>
                              <input
                                value={logForm.note || ''}
                                onChange={e => setLogForm(f => ({ ...f, note: e.target.value }))}
                                placeholder="Brief description…"
                                className="input text-sm w-full"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => submitLog(contact.id)} className="btn-primary text-sm">Save</button>
                              <button onClick={() => setLogForm(null)} className="btn-secondary text-sm">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() => { setLogForm({ contactId: contact.id, type: '', note: '', date: new Date().toISOString().split('T')[0] }); setDraftFor(null) }}
                              className="btn-primary text-sm"
                            >
                              + Log interaction
                            </button>
                            <button
                              onClick={() => draftFor === contact.id ? setDraftFor(null) : openDraft(contact)}
                              className="text-sm font-medium px-3 py-1.5 rounded-lg border border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
                            >
                              ✉️ {draftFor === contact.id ? 'Hide draft' : 'Draft email'}
                            </button>
                            <button
                              onClick={() => { if (window.confirm('Remove this contact?')) deleteContact(contact.id) }}
                              className="btn-secondary text-sm text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, warn }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
      <p className={`text-2xl font-bold ${warn ? 'text-amber-600' : 'text-gray-900'}`}>{value}</p>
    </div>
  )
}
