import { Link } from 'react-router-dom'
import FitScoreCircle from './FitScoreCircle'

export default function JobCard({ job, analysis, savedJobs = {}, toggleSaveJob }) {
  const score = analysis?.fit_score ?? null
  const strengths = analysis?.strengths?.slice(0, 3) ?? []
  const gaps = analysis?.gaps?.slice(0, 3) ?? []
  const isSaved = Boolean(savedJobs[job.id])

  function handleBookmark(e) {
    e.preventDefault()
    e.stopPropagation()
    toggleSaveJob?.(job.id)
  }

  return (
    <Link
      to={`/jobs/${job.id}`}
      className="card p-5 hover:shadow-md transition-shadow block relative"
    >
      {/* Bookmark button */}
      {toggleSaveJob && (
        <button
          onClick={handleBookmark}
          title={isSaved ? 'Remove from saved' : 'Save job'}
          className={`absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full transition-colors z-10 ${
            isSaved
              ? 'bg-brand-100 text-brand-600 hover:bg-brand-200'
              : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
          }`}
        >
          {isSaved ? '🔖' : '🔖'}
          <span className="sr-only">{isSaved ? 'Saved' : 'Save'}</span>
        </button>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ backgroundColor: job.logo_color || '#6366f1' }}
            >
              {job.company.charAt(0)}
            </div>
            <div className="min-w-0 pr-6">
              <h3 className="font-semibold text-gray-900 truncate">{job.title}</h3>
              <p className="text-sm text-gray-500">{job.company} · {job.location}</p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className={`badge ${job.type === 'Internship' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
              {job.type}
            </span>
            {job.remote && (
              <span className="badge bg-green-100 text-green-700">Remote OK</span>
            )}
            <span className="badge bg-gray-100 text-gray-600">{job.industry}</span>
            {isSaved && (
              <span className={`badge ${STATUS_BADGE[savedJobs[job.id]] ?? 'bg-brand-100 text-brand-700'}`}>
                {STATUS_LABEL[savedJobs[job.id]] ?? 'Saved'}
              </span>
            )}
          </div>

          {/* Strengths / Gaps */}
          {score !== null && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              {strengths.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-green-700 mb-1">Strengths</p>
                  <ul className="space-y-0.5">
                    {strengths.map((s, i) => (
                      <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                        <span className="text-green-500 mt-0.5">✓</span> {s.skill}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {gaps.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-red-600 mb-1">Gaps</p>
                  <ul className="space-y-0.5">
                    {gaps.map((g, i) => (
                      <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                        <span className="text-red-400 mt-0.5">✗</span> {g.requirement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {score === null && (
            <p className="text-xs text-gray-400 mt-2 italic">Click to analyze fit with AI →</p>
          )}
        </div>

        {/* Score */}
        <div className="flex-shrink-0">
          {score !== null
            ? <FitScoreCircle score={score} size={72} />
            : (
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                <span className="text-gray-400 text-xs text-center leading-tight">Tap<br/>to score</span>
              </div>
            )
          }
        </div>
      </div>

      {/* Salary + Posted */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <span className="text-xs font-medium text-gray-700">{job.salary}</span>
        <span className="text-xs text-gray-400">{job.posted} · {job.source}</span>
      </div>
    </Link>
  )
}

export const STATUS_LABEL = {
  saved:        'Want to Apply',
  applied:      'Applied',
  interviewing: 'Interviewing',
  offer:        'Offer Received',
  rejected:     'Not Moving Forward',
}

export const STATUS_BADGE = {
  saved:        'bg-brand-100 text-brand-700',
  applied:      'bg-blue-100 text-blue-700',
  interviewing: 'bg-yellow-100 text-yellow-700',
  offer:        'bg-green-100 text-green-700',
  rejected:     'bg-gray-100 text-gray-500',
}
