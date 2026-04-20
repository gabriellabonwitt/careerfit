import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import JobDetail from './pages/JobDetail'
import Profile from './pages/Profile'
import SavedJobs from './pages/SavedJobs'
import ResumeScore from './pages/ResumeScore'
import NetworkingHub from './pages/NetworkingHub'
import { JOBS } from './jobData'

function loadFromStorage(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch {
    return fallback
  }
}

// ── Auth shell ────────────────────────────────────────────────────────────────
export default function App() {
  const [currentUser, setCurrentUser] = useState(() =>
    loadFromStorage('cf_session', null)
  )

  function handleLogin(session) {
    setCurrentUser(session)
  }

  function handleLogout() {
    localStorage.removeItem('cf_session')
    setCurrentUser(null)
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={<Login onLogin={handleLogin} currentUser={currentUser} />}
      />
      <Route
        path="/*"
        element={
          currentUser
            ? <AppContent key={currentUser.id} currentUser={currentUser} onLogout={handleLogout} />
            : <Navigate to="/login" replace />
        }
      />
    </Routes>
  )
}

// ── Per-user content — remounts on user change so state initializers re-run ──
function AppContent({ currentUser, onLogout }) {
  const uid = currentUser.id

  const [userProfile, setUserProfile] = useState(() => loadFromStorage(`cf_profile_${uid}`, null))
  const [jobResults,  setJobResults]  = useState(() => {
    const stored = loadFromStorage(`cf_jobs_${uid}`, JOBS)
    // If localStorage only has a handful of stale jobs, start with the full static list
    return stored.length >= 5 ? stored : JOBS
  })
  const [savedJobs,   setSavedJobs]   = useState(() => loadFromStorage(`cf_saved_${uid}`, {}))
  const [contacts,    setContacts]    = useState(() => loadFromStorage(`cf_contacts_${uid}`, {}))

  useEffect(() => {
    if (userProfile) localStorage.setItem(`cf_profile_${uid}`, JSON.stringify(userProfile))
  }, [userProfile, uid])

  useEffect(() => {
    localStorage.setItem(`cf_jobs_${uid}`, JSON.stringify(jobResults))
  }, [jobResults, uid])

  useEffect(() => {
    localStorage.setItem(`cf_saved_${uid}`, JSON.stringify(savedJobs))
  }, [savedJobs, uid])

  useEffect(() => {
    localStorage.setItem(`cf_contacts_${uid}`, JSON.stringify(contacts))
  }, [contacts, uid])

  function addContact(contact) {
    setContacts(prev => ({ ...prev, [contact.id]: contact }))
  }

  function logInteraction(contactId, interaction) {
    setContacts(prev => ({
      ...prev,
      [contactId]: {
        ...prev[contactId],
        interactions: [...(prev[contactId]?.interactions ?? []), interaction],
      },
    }))
  }

  function deleteContact(contactId) {
    setContacts(prev => { const next = { ...prev }; delete next[contactId]; return next })
  }

  function toggleSaveJob(jobId) {
    setSavedJobs(prev => {
      if (prev[jobId]) {
        const next = { ...prev }
        delete next[jobId]
        return next
      }
      return { ...prev, [jobId]: 'saved' }
    })
  }

  function updateJobStatus(jobId, status) {
    setSavedJobs(prev => ({ ...prev, [jobId]: status }))
  }

  function handleOnboardingComplete(profile, jobs) {
    setUserProfile({ ...profile, userId: uid })
    setJobResults(jobs.length ? jobs : JOBS)

    // Sync confirmed resume name back to auth records so login name stays accurate
    if (profile.name) {
      try {
        const session = JSON.parse(localStorage.getItem('cf_session') || '{}')
        localStorage.setItem('cf_session', JSON.stringify({ ...session, name: profile.name }))
        const users = JSON.parse(localStorage.getItem('cf_users') || '[]')
        const idx = users.findIndex(u => u.id === uid)
        if (idx >= 0) { users[idx].name = profile.name; localStorage.setItem('cf_users', JSON.stringify(users)) }
      } catch { /* ignore */ }
    }
  }

  return (
    <Routes>
      <Route
        path="/onboarding"
        element={<Onboarding onComplete={handleOnboardingComplete} />}
      />
      <Route
        path="/dashboard"
        element={
          <Dashboard
            userProfile={userProfile}
            jobResults={jobResults}
            setJobResults={setJobResults}
            savedJobs={savedJobs}
            toggleSaveJob={toggleSaveJob}
            onLogout={onLogout}
          />
        }
      />
      <Route
        path="/jobs/:jobId"
        element={
          <JobDetail
            userProfile={userProfile}
            jobResults={jobResults}
            savedJobs={savedJobs}
            toggleSaveJob={toggleSaveJob}
            updateJobStatus={updateJobStatus}
            contacts={contacts}
            addContact={addContact}
            logInteraction={logInteraction}
            onLogout={onLogout}
          />
        }
      />
      <Route
        path="/profile"
        element={
          <Profile
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            setJobResults={setJobResults}
            onLogout={onLogout}
          />
        }
      />
      <Route
        path="/resume-score"
        element={<ResumeScore userProfile={userProfile} onLogout={onLogout} />}
      />
      <Route
        path="/networking"
        element={
          <NetworkingHub
            userProfile={userProfile}
            contacts={contacts}
            logInteraction={logInteraction}
            deleteContact={deleteContact}
            onLogout={onLogout}
          />
        }
      />
      <Route
        path="/saved"
        element={
          <SavedJobs
            userProfile={userProfile}
            savedJobs={savedJobs}
            updateJobStatus={updateJobStatus}
            toggleSaveJob={toggleSaveJob}
            onLogout={onLogout}
          />
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
