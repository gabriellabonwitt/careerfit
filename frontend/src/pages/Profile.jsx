import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'
import { ROLE_CATEGORIES, LOCATIONS, filterJobs } from '../jobData'

// Per-user Adzuna key storage (kept separate from profile so they never get serialised into cf_profile)
function loadAdzunaKeys(uid) {
  try { return JSON.parse(localStorage.getItem(`cf_adzuna_${uid}`) || '{}') } catch { return {} }
}
function saveAdzunaKeys(uid, keys) {
  localStorage.setItem(`cf_adzuna_${uid}`, JSON.stringify(keys))
}

export default function Profile({ userProfile, setUserProfile, setJobResults, onLogout }) {
  const navigate = useNavigate()
  const uid = userProfile?.userId || 'guest'

  // Editable fields
  const [name, setName]   = useState(userProfile?.name || '')
  const [email, setEmail] = useState(userProfile?.email || '')
  const [phone, setPhone] = useState(userProfile?.phone || '')
  const [summary, setSummary] = useState(userProfile?.summary || '')
  const [skillInput, setSkillInput] = useState('')
  const [skills, setSkills] = useState(userProfile?.skills || [])

  // Preferences
  const prefs = userProfile?.preferences || {}
  const [roleTitles, setRoleTitles]   = useState(prefs.roleTitles || [])
  const [locations, setLocations]     = useState(prefs.locations || [])
  const [jobType, setJobType]         = useState(prefs.jobType || 'any')
  const [remoteOnly, setRemoteOnly]   = useState(prefs.remoteOnly || false)

  // Adzuna API keys (stored separately in localStorage, never in profile JSON)
  const storedKeys = loadAdzunaKeys(uid)
  const [adzunaId,  setAdzunaId]  = useState(storedKeys.app_id  || '')
  const [adzunaKey, setAdzunaKey] = useState(storedKeys.app_key || '')
  const [showKey, setShowKey]     = useState(false)
  const [keysSaved, setKeysSaved] = useState(false)
  const [keysTesting, setKeysTesting] = useState(false)
  const [keysTestResult, setKeysTestResult] = useState(null) // null | 'ok' | 'fail'

  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('info') // 'info' | 'skills' | 'preferences' | 'api'

  function toggle(list, setList, val) {
    setList(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])
  }

  function addSkill() {
    const s = skillInput.trim()
    if (s && !skills.includes(s)) {
      setSkills(prev => [...prev, s])
    }
    setSkillInput('')
  }

  function removeSkill(s) {
    setSkills(prev => prev.filter(sk => sk !== s))
  }

  function handleSave() {
    const updatedProfile = {
      ...userProfile,
      name, email, phone, summary, skills,
      preferences: { roleTitles, locations, jobType, remoteOnly },
    }
    setUserProfile(updatedProfile)
    // Re-run job filter with new preferences
    const jobs = filterJobs({ roleTitles, industries: [], locations, jobType, remoteOnly })
    setJobResults(jobs)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function saveKeys() {
    saveAdzunaKeys(uid, { app_id: adzunaId.trim(), app_key: adzunaKey.trim() })
    setKeysSaved(true)
    setKeysTestResult(null)
    setTimeout(() => setKeysSaved(false), 3000)
  }

  async function testKeys() {
    setKeysTesting(true)
    setKeysTestResult(null)
    try {
      const res = await fetch(
        `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${encodeURIComponent(adzunaId.trim())}&app_key=${encodeURIComponent(adzunaKey.trim())}&results_per_page=1&what=engineer`,
        { signal: AbortSignal.timeout(8000) }
      )
      setKeysTestResult(res.ok ? 'ok' : 'fail')
      if (res.ok) saveKeys()
    } catch {
      setKeysTestResult('fail')
    } finally {
      setKeysTesting(false)
    }
  }

  function clearKeys() {
    setAdzunaId('')
    setAdzunaKey('')
    saveAdzunaKeys(uid, {})
    setKeysTestResult(null)
  }

  const keysStored = Boolean(loadAdzunaKeys(uid).app_id)

  const TABS = [
    { id: 'info',        label: '👤 Personal Info' },
    { id: 'skills',      label: '🛠️ Skills' },
    { id: 'preferences', label: '🎯 Job Preferences' },
    { id: 'api',         label: '🔑 API Keys' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar userName={userProfile?.name} onLogout={onLogout} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-2xl">
              {name ? name.charAt(0).toUpperCase() : '?'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{name || 'Your Profile'}</h1>
              <p className="text-sm text-gray-500">{email || 'Add your email below'}</p>
            </div>
          </div>
          <Link to="/dashboard" className="btn-secondary text-sm">← Dashboard</Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === t.id
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >{t.label}</button>
          ))}
        </div>

        {/* ── Tab: Personal Info ── */}
        {activeTab === 'info' && (
          <div className="card p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full name</label>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="Jane Smith" className="input" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)}
                placeholder="jane@email.com" type="email" className="input" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
              <input value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="(555) 000-0000" type="tel" className="input" />
            </div>

            {userProfile?.degree && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Degree (from resume)</label>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">{userProfile.degree}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Professional summary</label>
              <textarea value={summary} onChange={e => setSummary(e.target.value)}
                placeholder="A brief description of your background and goals..."
                rows={4} className="input resize-none" />
            </div>

            {userProfile?.linkedin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">LinkedIn (from resume)</label>
                <a href={userProfile.linkedin} target="_blank" rel="noreferrer"
                  className="text-sm text-brand-600 hover:underline">{userProfile.linkedin}</a>
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Skills ── */}
        {activeTab === 'skills' && (
          <div className="card p-6">
            <p className="text-sm text-gray-500 mb-4">
              These were detected from your resume. Add or remove skills to improve your job matches.
            </p>

            {/* Add skill */}
            <div className="flex gap-2 mb-5">
              <input
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
                placeholder="Add a skill and press Enter..."
                className="input flex-1"
              />
              <button onClick={addSkill} className="btn-primary flex-shrink-0">Add</button>
            </div>

            {/* Skill tags */}
            {skills.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-3xl mb-2">🛠️</p>
                <p className="text-sm">No skills added yet. Upload a resume or type skills above.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skills.map(s => (
                  <span key={s} className="flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full text-sm bg-brand-100 text-brand-700 border border-brand-200">
                    {s}
                    <button onClick={() => removeSkill(s)}
                      className="text-brand-400 hover:text-brand-700 font-bold leading-none">×</button>
                  </span>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-400 mt-4">{skills.length} skill{skills.length !== 1 ? 's' : ''} saved</p>
          </div>
        )}

        {/* ── Tab: Job Preferences ── */}
        {activeTab === 'preferences' && (
          <div className="card p-6 space-y-6">
            <p className="text-sm text-gray-500">
              Update your preferences and we'll re-filter your job matches on save.
            </p>

            {/* Role types */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Role types</p>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                {ROLE_CATEGORIES.map(r => (
                  <button key={r} onClick={() => toggle(roleTitles, setRoleTitles, r)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      roleTitles.includes(r)
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-brand-400'
                    }`}
                  >
                    {roleTitles.includes(r) && '✓ '}{r}
                  </button>
                ))}
              </div>
            </div>

            {/* Locations */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Preferred locations</p>
              <div className="flex flex-wrap gap-2">
                {LOCATIONS.map(l => (
                  <button key={l} onClick={() => toggle(locations, setLocations, l)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      locations.includes(l)
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-brand-400'
                    }`}
                  >{l}</button>
                ))}
              </div>
            </div>

            {/* Job type + remote */}
            <div className="flex flex-wrap gap-6 items-end">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Job type</p>
                <select value={jobType} onChange={e => setJobType(e.target.value)} className="input w-auto">
                  <option value="any">Any</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Internship">Internship / Co-op</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pb-1">
                <input type="checkbox" id="remote-pref" checked={remoteOnly}
                  onChange={e => setRemoteOnly(e.target.checked)} className="w-4 h-4 accent-brand-600" />
                <label htmlFor="remote-pref" className="text-sm font-medium text-gray-700">Remote only</label>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: API Keys ── */}
        {activeTab === 'api' && (
          <div className="space-y-4">
            <div className="card p-6 space-y-5">
              <div>
                <p className="font-semibold text-gray-900 mb-1">Adzuna Jobs API</p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Add your free Adzuna API key to pull real live job listings instead of the built-in demo data.
                  Sign up at{' '}
                  <a href="https://developer.adzuna.com" target="_blank" rel="noreferrer"
                    className="text-brand-600 hover:underline font-medium">developer.adzuna.com</a>
                  {' '}— free, no credit card needed (250 calls/day).
                </p>
              </div>

              {keysStored && (
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <span>✅</span>
                  <span className="font-medium">API keys saved — live jobs are enabled</span>
                  <button onClick={clearKeys} className="ml-auto text-xs text-gray-400 hover:text-red-500 transition-colors">
                    Remove
                  </button>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">App ID</label>
                <input
                  value={adzunaId}
                  onChange={e => { setAdzunaId(e.target.value); setKeysTestResult(null) }}
                  placeholder="e.g. a1b2c3d4"
                  className="input font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">App Key</label>
                <div className="relative">
                  <input
                    value={adzunaKey}
                    onChange={e => { setAdzunaKey(e.target.value); setKeysTestResult(null) }}
                    type={showKey ? 'text' : 'password'}
                    placeholder="Paste your App Key here"
                    className="input font-mono text-sm pr-20"
                  />
                  <button
                    onClick={() => setShowKey(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-700 font-medium"
                  >
                    {showKey ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {keysTestResult === 'ok' && (
                <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  ✅ Keys verified and saved! Hit <strong>Refresh</strong> on the dashboard to load live jobs.
                </div>
              )}
              {keysTestResult === 'fail' && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  ❌ Could not connect — double-check your App ID and App Key and try again.
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={testKeys}
                  disabled={!adzunaId.trim() || !adzunaKey.trim() || keysTesting}
                  className="btn-primary flex items-center gap-2"
                >
                  {keysTesting
                    ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Testing…</>
                    : '🔌 Test & Save'}
                </button>
                <button
                  onClick={saveKeys}
                  disabled={!adzunaId.trim() || !adzunaKey.trim()}
                  className="btn-secondary"
                >
                  {keysSaved ? '✅ Saved!' : 'Save without testing'}
                </button>
              </div>
            </div>

            <div className="card p-4 bg-amber-50 border-amber-200">
              <p className="text-xs font-semibold text-amber-700 mb-1">🔒 Privacy note</p>
              <p className="text-xs text-amber-600 leading-relaxed">
                Your keys are stored only in your browser's local storage — they never leave your device and are not sent to any server other than Adzuna directly.
              </p>
            </div>
          </div>
        )}

        {/* Save button (only show for non-API tabs) */}
        <div className={`mt-6 flex items-center justify-between ${activeTab === 'api' ? 'hidden' : ''}`}>
          <p className="text-xs text-gray-400">Changes are saved to your browser session.</p>
          <button onClick={handleSave} className="btn-primary gap-2">
            {saved ? '✅ Saved!' : 'Save changes'}
          </button>
        </div>

        {saved && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700">
            Profile saved! Your job matches have been updated based on your new preferences.{' '}
            <Link to="/dashboard" className="font-semibold underline">View matches →</Link>
          </div>
        )}
      </div>
    </div>
  )
}
