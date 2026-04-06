import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { parseResume } from '../resumeParser'
import { filterJobs } from '../jobData'
import { apiFetch } from '../api'

const ROLE_OPTIONS = ['Software Engineer', 'Data Analyst', 'Product Manager', 'Marketing', 'Finance', 'UX Designer', 'Business Analyst', 'Machine Learning Engineer']
const INDUSTRY_OPTIONS = ['Tech', 'Finance', 'Consulting', 'Healthcare', 'Consumer Goods', 'EdTech', 'SaaS', 'AI / Research']
const LOCATION_OPTIONS = ['New York, NY', 'San Francisco, CA', 'Chicago, IL', 'Seattle, WA', 'Boston, MA', 'Remote']

export default function Onboarding({ onComplete }) {
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [step, setStep] = useState(1) // 1 = resume, 2 = interests

  // Step 1 state
  const [file, setFile] = useState(null)
  const [parsedProfile, setParsedProfile] = useState(null)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  // Step 2 state
  const [roleTitles, setRoleTitles] = useState([])
  const [industries, setIndustries] = useState([])
  const [locations, setLocations] = useState([])
  const [jobType, setJobType] = useState('any')
  const [remoteOnly, setRemoteOnly] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)

  async function handleFileUpload(f) {
    if (!f) return
    setFile(f)
    setUploadError('')
    setUploadLoading(true)
    try {
      // Try backend first; fall back to client-side parsing if unavailable
      let profile = null
      try {
        const form = new FormData()
        form.append('file', f)
        const res = await apiFetch('/api/resume/upload', { method: 'POST', body: form })
        if (res.ok) {
          const data = await res.json()
          profile = data.profile
        }
      } catch {
        // backend not running — use client-side parser
      }
      if (!profile) {
        profile = await parseResume(f)
      }
      setParsedProfile(profile)
    } catch (e) {
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

  async function handleSubmit() {
    setSearchLoading(true)
    try {
      let jobs = []
      try {
        const res = await apiFetch('/api/jobs/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role_titles: roleTitles, industries, locations, job_type: jobType, remote_only: remoteOnly }),
        })
        if (res.ok) {
          const data = await res.json()
          jobs = data.jobs || []
        }
      } catch {
        // backend not running — fetch all jobs as fallback
        try {
          const res = await apiFetch('/api/jobs/all')
          if (res.ok) {
            const data = await res.json()
            jobs = data.jobs || []
          }
        } catch { /* both failed */ }
      }
      // Final fallback: use bundled job data
      if (!jobs.length) {
        jobs = filterJobs({ roleTitles, industries, locations, jobType, remoteOnly })
      }
      const profile = { ...(parsedProfile || {}), preferences: { roleTitles, industries, locations, jobType, remoteOnly } }
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
      <div className="max-w-xl mx-auto w-full px-6 pt-8">
        <div className="flex items-center gap-3 mb-8">
          {[1, 2].map(n => (
            <div key={n} className="flex items-center gap-3 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                step >= n ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>{n}</div>
              <div className={`h-1 flex-1 rounded ${n < 2 ? (step > n ? 'bg-brand-600' : 'bg-gray-200') : 'hidden'}`} />
            </div>
          ))}
        </div>

        {/* Step 1: Resume Upload */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Upload your resume</h2>
            <p className="text-gray-500 mb-6">PDF or DOCX · Max 5 MB</p>

            {/* Drop zone */}
            <div
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                isDragging ? 'border-brand-500 bg-brand-50' : 'border-gray-300 hover:border-brand-400'
              }`}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={e => handleFileUpload(e.target.files[0])} />
              {uploadLoading ? (
                <p className="text-brand-600 font-medium animate-pulse">Parsing resume...</p>
              ) : file ? (
                <div>
                  <p className="text-2xl mb-2">✅</p>
                  <p className="font-semibold text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-400 mt-1">Click to replace</p>
                </div>
              ) : (
                <div>
                  <p className="text-4xl mb-3">📄</p>
                  <p className="font-medium text-gray-700">Drag & drop your resume here</p>
                  <p className="text-sm text-gray-400 mt-1">or click to browse files</p>
                </div>
              )}
            </div>

            {uploadError && (
              <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg p-3">{uploadError}</p>
            )}

            {/* Parsed preview */}
            {parsedProfile && (
              <div className="mt-4 card p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Extracted from resume</p>
                <div className="space-y-2">
                  {parsedProfile.name && <p className="text-sm"><span className="font-medium">Name:</span> {parsedProfile.name}</p>}
                  {parsedProfile.email && <p className="text-sm"><span className="font-medium">Email:</span> {parsedProfile.email}</p>}
                  {parsedProfile.skills?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1">Skills detected:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {parsedProfile.skills.slice(0, 15).map(s => (
                          <span key={s} className="badge bg-brand-100 text-brand-700">{s}</span>
                        ))}
                        {parsedProfile.skills.length > 15 && (
                          <span className="text-xs text-gray-400">+{parsedProfile.skills.length - 15} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <button onClick={() => { setParsedProfile({ skills: [], experience: '', education: '', projects: '', name: '', email: '' }); setStep(2) }} className="btn-secondary text-sm">
                Skip — continue without resume
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!parsedProfile && !file}
                className="btn-primary"
              >
                Next: Set interests →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Interests */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Set your preferences</h2>
            <p className="text-gray-500 mb-6">Select all that apply — we'll use these to find your best matches.</p>

            <div className="space-y-6">
              {/* Role types */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Role types</p>
                <div className="flex flex-wrap gap-2">
                  {ROLE_OPTIONS.map(r => (
                    <button
                      key={r}
                      onClick={() => toggle(roleTitles, setRoleTitles, r)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                        roleTitles.includes(r) ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-700 border-gray-300 hover:border-brand-400'
                      }`}
                    >{r}</button>
                  ))}
                </div>
              </div>

              {/* Industries */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Industries</p>
                <div className="flex flex-wrap gap-2">
                  {INDUSTRY_OPTIONS.map(i => (
                    <button
                      key={i}
                      onClick={() => toggle(industries, setIndustries, i)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                        industries.includes(i) ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-700 border-gray-300 hover:border-brand-400'
                      }`}
                    >{i}</button>
                  ))}
                </div>
              </div>

              {/* Locations */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Locations</p>
                <div className="flex flex-wrap gap-2">
                  {LOCATION_OPTIONS.map(l => (
                    <button
                      key={l}
                      onClick={() => toggle(locations, setLocations, l)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                        locations.includes(l) ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-700 border-gray-300 hover:border-brand-400'
                      }`}
                    >{l}</button>
                  ))}
                </div>
              </div>

              {/* Job type + remote */}
              <div className="flex flex-wrap gap-6">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Job type</p>
                  <select value={jobType} onChange={e => setJobType(e.target.value)} className="input w-auto">
                    <option value="any">Any</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <input type="checkbox" id="remote" checked={remoteOnly} onChange={e => setRemoteOnly(e.target.checked)} className="w-4 h-4 accent-brand-600" />
                  <label htmlFor="remote" className="text-sm font-medium text-gray-700">Remote only</label>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button onClick={() => setStep(1)} className="btn-secondary">← Back</button>
              <button onClick={handleSubmit} disabled={searchLoading} className="btn-primary">
                {searchLoading ? 'Finding matches...' : 'Find my matches →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
