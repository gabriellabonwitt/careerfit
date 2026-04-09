import { Link } from 'react-router-dom'
import NavBar from '../components/NavBar'
import { JOBS, getApplyUrl } from '../jobData'
import { STATUS_LABEL, STATUS_BADGE } from '../components/JobCard'

const STATUSES = ['saved', 'applied', 'interviewing', 'offer', 'rejected']

const STATUS_ICON = {
  saved:        '🔖',
  applied:      '📨',
  interviewing: '🗣️',
  offer:        '🎉',
  rejected:     '❌',
}

export default function SavedJobs({ userProfile, savedJobs = {}, updateJobStatus, toggleSaveJob, onLogout }) {
  const savedIds = Object.keys(savedJobs)
  const savedJobsList = JOBS.filter(j => savedIds.includes(j.id))

  const byStatus = STATUSES.reduce((acc, s) => {
    acc[s] = savedJobsList.filter(j => savedJobs[j.id] === s)
    return acc
  }, {})

  if (savedJobsList.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar userName={userProfile?.name} onLogout={onLogout} />
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <p className="text-5xl mb-4">🔖</p>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No saved jobs yet</h2>
          <p className="text-gray-500 mb-6">Tap the bookmark icon on any job card to save it here.</p>
          <Link to="/dashboard" className="btn-primary">Browse jobs</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar userName={userProfile?.name} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Saved Jobs</h1>
            <p className="text-gray-500 mt-1">{savedJobsList.length} job{savedJobsList.length !== 1 ? 's' : ''} saved · track your progress below</p>
          </div>
          <Link to="/dashboard" className="btn-secondary text-sm">← Back to all jobs</Link>
        </div>

        {/* Summary pills */}
        <div className="flex flex-wrap gap-3 mb-8">
          {STATUSES.map(s => {
            const count = byStatus[s].length
            if (count === 0) return null
            return (
              <div key={s} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${STATUS_BADGE[s]}`}>
                <span>{STATUS_ICON[s]}</span>
                <span>{STATUS_LABEL[s]}</span>
                <span className="bg-white bg-opacity-60 rounded-full px-1.5 text-xs font-bold">{count}</span>
              </div>
            )
          })}
        </div>

        {/* Job rows grouped by status */}
        {STATUSES.map(s => {
          const jobs = byStatus[s]
          if (jobs.length === 0) return null
          return (
            <div key={s} className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{STATUS_ICON[s]}</span>
                <h2 className="font-semibold text-gray-800">{STATUS_LABEL[s]}</h2>
                <span className="text-sm text-gray-400">({jobs.length})</span>
              </div>
              <div className="space-y-3">
                {jobs.map(job => (
                  <SavedJobRow
                    key={job.id}
                    job={job}
                    status={savedJobs[job.id]}
                    onStatusChange={status => updateJobStatus(job.id, status)}
                    onRemove={() => toggleSaveJob(job.id)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SavedJobRow({ job, status, onStatusChange, onRemove }) {
  return (
    <div className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
      {/* Company logo + info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ backgroundColor: job.logo_color || '#6366f1' }}
        >
          {job.company.charAt(0)}
        </div>
        <div className="min-w-0">
          <Link to={`/jobs/${job.id}`} className="font-semibold text-gray-900 hover:text-brand-600 truncate block">
            {job.title}
          </Link>
          <p className="text-sm text-gray-500">{job.company} · {job.location}</p>
          <p className="text-xs text-gray-400 mt-0.5">{job.salary}</p>
        </div>
      </div>

      {/* Badges */}
      <div className="flex gap-2 flex-wrap sm:flex-nowrap flex-shrink-0">
        <span className={`badge ${job.type === 'Internship' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
          {job.type}
        </span>
        {job.remote && <span className="badge bg-green-100 text-green-700">Remote</span>}
      </div>

      {/* Status selector */}
      <select
        value={status}
        onChange={e => onStatusChange(e.target.value)}
        className="input text-sm w-full sm:w-48 flex-shrink-0"
      >
        {STATUSES.map(s => (
          <option key={s} value={s}>{STATUS_ICON[s]} {STATUS_LABEL[s]}</option>
        ))}
      </select>

      {/* Apply link */}
      <a
        href={getApplyUrl(job)}
        target="_blank"
        rel="noreferrer"
        className="btn-primary text-sm flex-shrink-0 whitespace-nowrap"
      >
        🚀 Apply
      </a>

      {/* Remove button */}
      <button
        onClick={onRemove}
        title="Remove from saved"
        className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 text-lg"
      >
        ×
      </button>
    </div>
  )
}
