import { Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Landing from './pages/Landing'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import JobDetail from './pages/JobDetail'
import { JOBS } from './jobData'

function loadFromStorage(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch {
    return fallback
  }
}

export default function App() {
  const [userProfile, setUserProfile] = useState(() => loadFromStorage('cf_profile', null))
  const [jobResults, setJobResults] = useState(() => loadFromStorage('cf_jobs', JOBS))

  // Persist to localStorage whenever they change
  useEffect(() => {
    if (userProfile) localStorage.setItem('cf_profile', JSON.stringify(userProfile))
  }, [userProfile])

  useEffect(() => {
    localStorage.setItem('cf_jobs', JSON.stringify(jobResults))
  }, [jobResults])

  function handleOnboardingComplete(profile, jobs) {
    setUserProfile(profile)
    setJobResults(jobs.length ? jobs : JOBS)
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/onboarding"
        element={<Onboarding onComplete={handleOnboardingComplete} />}
      />
      <Route
        path="/dashboard"
        element={<Dashboard userProfile={userProfile} jobResults={jobResults} setJobResults={setJobResults} />}
      />
      <Route
        path="/jobs/:jobId"
        element={<JobDetail userProfile={userProfile} />}
      />
    </Routes>
  )
}
