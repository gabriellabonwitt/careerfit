import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { parseResume } from '../resumeParser'
import { inferRoles, getRoleExplanation } from '../roleInference'
import { filterJobs, ROLE_CATEGORIES, INDUSTRIES, LOCATIONS } from '../jobData'
import { apiFetch } from '../api'

export default function Onboarding({ onComplete }) {
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [step, setStep] = useState(1)

  // Step 1
  const [file, setFile] = useState(null)
  const [parsedProfile, setParsedProfile] = useState(null)
  const [confirmedName, setConfirmedName] = useState('')
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  // Step 2
  const [roleTitles, setRoleTitles] = useState([])
  const [roleExplanation, setRoleExplanation] = useState('')
  const [industries, setIndustries] = useState([])
  const [locations, setLocations] = useState([])
  const [jobType, setJobType] = useState('any')
  const [remoteOnly, setRemoteOnly] = useState(false)
  const [experienceLevel, setExperienceLevel] = useState('any')
  const [searchLoading, setSearchLoading] = useState(false)

  const EXPERIENCE_OPTIONS = [
    { value: 'any',   label: 'Any level' },
    { value: 'entry', label: 'Entry level' },
    { value: '1-3',   label: '1–3 years' },
    { value: '4plus', label: '4+ years' },
  ]

  // When a real resume is parsed, auto-infer roles (skip if user hit "Skip")
  useEffect(() => {
    if (!parsedProfile || parsedProfile._skipped) return
    const suggested = inferRoles(parsedProfile)
    const explanation = getRoleExplanation(parsedProfile, suggested)
    setRoleTitles(suggested)
    setRoleExplanation(explanation || '')
  }, [parsedProfile])

  async function handleFileUpload(f) {
    if (!f) return
    setFile(f)
    setUploadError('')
    setUploadLoading(true)
    try {
      let profile = null
      try {
        const form = new FormData()
        form.append('file', f)
        const res = await apiFetch('/api/resume/upload', { method: 'POST', body: form })
        if (res.ok) {
          const data = await res.json()
          profile = data.profile
        }
      } catch { /* backend not running — use client-side parser */ }

      if (!profile) profile = await parseResume(f)
      setParsedProfile(profile)
      setConfirmedName(profile.name || '')
    } catch {
      setUploadError('Could not parse this file. Please try a different PDF or DOCX.')
      setFile(null)
    } finally {
      setUploadLoading(false)
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFileUpload(f)
  }

  function toggle(list, setList, val) {
    setList(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])
  }

  function skipWithoutResume() {
    // Use a sentinel so the useEffect knows not to run inference
    setParsedProfile({ _skipped: true, skills: [], experience: '', education: '', projects: '', name: '', email: '', raw_text: '' })
    setRoleTitles([])
    setStep(2)
  }

  async function handleSubmit() {
    setSearchLoading(true)
    try {
      // Always filter from the frontend job database so categories match exactly
      const jobs = filterJobs({ roleTitles, industries, locations, jobType, remoteOnly, experienceLevel: experienceLevel !== 'any' ? experienceLevel : null })
      const profile = { ...(parsedProfile || {}), name: confirmedName, preferences: { roleTitles, industries, locations, jobType, remoteOnly, experienceLevel } }
      onComplete(profile, jobs)
      navigate('/dashboard')
    } catch (e) {
      console.error(e)
    } finally {
      setSearchLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
          <span className="text-white font-bold text-sm">C</span>
        </div>
        <span className="font-bold text-gray-900">CareerFit <span className="text-brand-600">AI</span></span>
      </div>

      {/* Progress */}
      <div className="max-w-2xl mx-auto w-full px-6 pt-8">
        <div className="flex items-center gap-3 mb-8">
          {[1, 2].map(n => (
            <div key={n} className="flex items-center gap-3 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${
                step >= n ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>{n}</div>
              {n < 2 && <div className={`h-1 flex-1 rounded transition-colors ${step > n ? 'bg-brand-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* ── Step 1: Resume Upload ── */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Upload your resume</h2>
            <p className="text-gray-500 mb-6">PDF or DOCX · We'll detect your skills and suggest matching roles.</p>

            <div
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                isDragging ? 'border-brand-500 bg-brand-50' : 'border-gray-300 hover:border-brand-400'
              }`}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" className="hidden"
                onChange={e => handleFileUpload(e.target.files[0])} />
              {uploadLoading ? (
                <div className="flex flex-col items-center gap-2">
                  <span className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-brand-600 font-medium">Parsing resume and detecting skills...</p>
                </div>
              ) : file && parsedProfile ? (
                <div>
                  <p className="text-3xl mb-2">✅</p>
                  <p className="font-semibold text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-400 mt-1">Click to replace</p>
                </div>
              ) : (
                <div>
                  <p className="text-4xl mb-3">📄</p>
                  <p className="font-medium text-gray-700">Drag & drop your resume here</p>
                  <p className="text-sm text-gray-400 mt-1">or click to browse files (PDF or DOCX)</p>
                </div>
              )}
            </div>

            {uploadError && (
              <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg p-3">{uploadError}</p>
            )}

            {/* Parsed preview */}
            {parsedProfile && (
              <div className="mt-4 card p-4 space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Extracted from your resume</p>

                {/* Always show editable name field — pre-filled from parser, user can correct */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your name <span className="text-gray-400 font-normal">(confirm or correct)</span>
                  </label>
                  <input
                    value={confirmedName}
                    onChange={e => setConfirmedName(e.target.value)}
                    placeholder="First Last"
                    className="input text-sm"
                  />
                  {parsedProfile.name && parsedProfile.name !== confirmedName && confirmedName === '' && (
                    <p className="text-xs text-amber-600 mt-1">We detected "{parsedProfile.name}" — edit if incorrect</p>
                  )}
                </div>
                {parsedProfile.email && (
                  <p className="text-sm"><span className="font-medium text-gray-700">Email:</span> {parsedProfile.email}</p>
                )}
                {parsedProfile.degree && (
                  <p className="text-sm"><span className="font-medium text-gray-700">Degree:</span> {parsedProfile.degree}</p>
                )}

                {parsedProfile.skills?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1.5">
                      Skills detected <span className="text-gray-400 font-normal">({parsedProfile.skills.length})</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                      {parsedProfile.skills.map(s => (
                        <span key={s} className="badge bg-brand-100 text-brand-700">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {roleTitles.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-green-700 mb-1.5">
                      ✨ Roles we suggest for you {roleExplanation && <span className="font-normal text-green-600">— {roleExplanation}</span>}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {roleTitles.map(r => (
                        <span key={r} className="badge bg-green-100 text-green-800">{r}</span>
                      ))}
                    </div>
                    <p className="text-xs text-green-600 mt-2">You can edit these in the next step.</p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <button onClick={skipWithoutResume} className="btn-secondary text-sm">
                Skip — continue without resume
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!parsedProfile}
                className="btn-primary"
              >
                Next: Review & customize →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Role Preferences ── */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Review your matches</h2>
            <p className="text-gray-500 mb-6">
              {roleTitles.length > 0
                ? "We've pre-selected roles based on your resume. Add or remove anything."
                : "Select the types of roles you're interested in."}
            </p>

            <div className="space-y-6">
              {/* Role types */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Role types <span className="text-gray-400 font-normal">(select all that apply)</span></p>
                <div className="flex flex-wrap gap-2">
                  {ROLE_CATEGORIES.map(r => (
                    <button
                      key={r}
                      onClick={() => toggle(roleTitles, setRoleTitles, r)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                        roleTitles.includes(r)
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-brand-400'
                      }`}
                    >
                      {roleTitles.includes(r) && <span className="mr-1">✓</span>}
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Industries */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Industries <span className="text-gray-400 font-normal">(optional)</span></p>
                <div className="flex flex-wrap gap-2">
                  {INDUSTRIES.map(i => (
                    <button
                      key={i}
                      onClick={() => toggle(industries, setIndustries, i)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                        industries.includes(i)
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-brand-400'
                      }`}
                    >{i}</button>
                  ))}
                </div>
              </div>

              {/* Locations */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Locations <span className="text-gray-400 font-normal">(optional)</span></p>
                <div className="flex flex-wrap gap-2">
                  {LOCATIONS.map(l => (
                    <button
                      key={l}
                      onClick={() => toggle(locations, setLocations, l)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                        locations.includes(l)
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-brand-400'
                      }`}
                    >{l}</button>
                  ))}
                </div>
              </div>

              {/* Experience level */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Experience level</p>
                <div className="flex flex-wrap gap-2">
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
                  <input type="checkbox" id="remote" checked={remoteOnly}
                    onChange={e => setRemoteOnly(e.target.checked)} className="w-4 h-4 accent-brand-600" />
                  <label htmlFor="remote" className="text-sm font-medium text-gray-700">Remote only</label>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between items-center">
              <button onClick={() => setStep(1)} className="btn-secondary">← Back</button>
              <button onClick={handleSubmit} disabled={searchLoading} className="btn-primary">
                {searchLoading
                  ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Finding matches...</span>
                  : `Find my matches →`
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
