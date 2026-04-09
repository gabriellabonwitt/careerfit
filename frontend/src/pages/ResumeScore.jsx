import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import NavBar from '../components/NavBar'
import FitScoreCircle from '../components/FitScoreCircle'
import { scoreResume, getScoreBand } from '../localAnalysis'

const CATEGORIES = [
  { key: 'job_match',    label: 'Job Match',       max: 25, icon: '🎯', desc: 'Keywords from your target roles found in your resume (ATS simulation)' },
  { key: 'impact',       label: 'Impact',           max: 25, icon: '⚡', desc: 'Quantified results, action verbs, and result-focused framing' },
  { key: 'completeness', label: 'Completeness',     max: 20, icon: '✅', desc: 'Required sections, contact info, dates' },
  { key: 'formatting',   label: 'Formatting',       max: 15, icon: '📐', desc: 'Page length, section headers, ATS readability' },
  { key: 'writing',      label: 'Writing Quality',  max: 15, icon: '✍️', desc: 'No clichés, active voice, concise bullets' },
]

const BAR_COLOR = {
  green:  'bg-green-500',
  blue:   'bg-blue-500',
  yellow: 'bg-yellow-500',
  red:    'bg-red-500',
}

export default function ResumeScore({ userProfile, onLogout }) {
  const result = useMemo(() => userProfile ? scoreResume(userProfile) : null, [userProfile])

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar userName={userProfile?.name} onLogout={onLogout} />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <p className="text-5xl mb-4">📄</p>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No resume uploaded yet</h2>
          <p className="text-gray-500 mb-6">Upload your resume during onboarding to get your score.</p>
          <Link to="/onboarding" className="btn-primary">Get started</Link>
        </div>
      </div>
    )
  }

  const { fit_score, band, breakdown } = result
  const allFixes = CATEGORIES.flatMap(c => (breakdown[c.key]?.fixes || []).map(f => ({ fix: f, category: c.label, icon: c.icon })))

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar userName={userProfile?.name} onLogout={onLogout} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Resume Score</h1>
            <p className="text-gray-500 mt-1">Overall quality based on 5 industry-standard criteria</p>
          </div>
          <Link to="/dashboard" className="btn-secondary text-sm">View jobs →</Link>
        </div>

        {/* Overall score card */}
        <div className="card p-6 mb-6 flex flex-col sm:flex-row items-center gap-6">
          <FitScoreCircle score={fit_score} size={120} />
          <div className="flex-1 text-center sm:text-left">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${band.bg} ${band.text} mb-2`}>
              {fit_score >= 85 ? '🏆' : fit_score >= 70 ? '👍' : fit_score >= 50 ? '⚠️' : '🔧'} {band.label}
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">{fit_score} / 100</h2>
            <p className="text-gray-500 text-sm">
              {fit_score >= 85 && 'Your resume is in great shape. Minor tweaks could push it further.'}
              {fit_score >= 70 && fit_score < 85 && 'Good resume with room to improve impact and keyword alignment.'}
              {fit_score >= 50 && fit_score < 70 && 'Your resume needs some work. Focus on the fixes below.'}
              {fit_score < 50 && 'Your resume needs significant improvements before applying.'}
            </p>
            {/* Score bands legend */}
            <div className="flex flex-wrap gap-2 mt-3">
              {[['85–100','Excellent','bg-green-100 text-green-700'],['70–84','Good','bg-blue-100 text-blue-700'],['50–69','Needs Work','bg-yellow-100 text-yellow-700'],['<50','Major Revision','bg-red-100 text-red-700']].map(([range, label, cls]) => (
                <span key={range} className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{range} {label}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="card p-5 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Score Breakdown</h3>
          <div className="space-y-5">
            {CATEGORIES.map(cat => {
              const data = breakdown[cat.key]
              const catBand = getScoreBand(data.pct)
              return (
                <div key={cat.key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                      <span>{cat.icon}</span> {cat.label}
                    </span>
                    <span className="text-sm font-bold text-gray-700">{data.score} / {cat.max} <span className="text-gray-400 font-normal">({data.pct}%)</span></span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 mb-1">
                    <div
                      className={`h-2.5 rounded-full transition-all ${BAR_COLOR[catBand.color]}`}
                      style={{ width: `${data.pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400">{cat.desc}</p>
                  {/* Top fixes for this category */}
                  {data.fixes.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {data.fixes.map((fix, i) => (
                        <li key={i} className="text-xs text-red-700 flex gap-1.5 items-start">
                          <span className="mt-0.5 flex-shrink-0">↳</span> {fix}
                        </li>
                      ))}
                    </ul>
                  )}
                  {/* Positives */}
                  {data.positives.length > 0 && data.fixes.length === 0 && (
                    <ul className="mt-2 space-y-1">
                      {data.positives.map((p, i) => (
                        <li key={i} className="text-xs text-green-700 flex gap-1.5 items-start">
                          <span className="mt-0.5 flex-shrink-0">✓</span> {p}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Prioritized fix list */}
        {allFixes.length > 0 && (
          <div className="card p-5 mb-6">
            <h3 className="font-semibold text-gray-900 mb-1">🔧 Your Prioritized Fix List</h3>
            <p className="text-sm text-gray-500 mb-4">Top improvements ranked by point impact</p>
            <ol className="space-y-3">
              {allFixes.slice(0, 9).map((item, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <div>
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{item.icon} {item.category} · </span>
                    <span className="text-sm text-gray-700">{item.fix}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* How scoring works */}
        <div className="card p-5 border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">📊 How scoring works</h3>
          <div className="space-y-2">
            {CATEGORIES.map(c => (
              <div key={c.key} className="flex gap-3 items-start text-sm">
                <span className="flex-shrink-0 font-bold text-gray-700 w-8">{c.max}pts</span>
                <div>
                  <span className="font-medium text-gray-800">{c.icon} {c.label} — </span>
                  <span className="text-gray-500">{c.desc}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">Scoring is performed locally in your browser. No data is sent anywhere.</p>
        </div>

      </div>
    </div>
  )
}
