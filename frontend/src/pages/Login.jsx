import { useState } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'

function getUsers() {
  try { return JSON.parse(localStorage.getItem('cf_users') || '[]') } catch { return [] }
}

const FEATURES = [
  { icon: '🎯', text: 'Get a personalized fit score for every job' },
  { icon: '📄', text: 'Upload your resume and auto-detect skills' },
  { icon: '✏️', text: 'See bullet rewrites tailored to each role' },
  { icon: '🤝', text: 'Track your networking contacts in one place' },
]

export default function Login({ onLogin, currentUser }) {
  const navigate = useNavigate()

  if (currentUser) return <Navigate to="/dashboard" replace />

  const [mode, setMode]         = useState('signin')
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  function switchMode(m) {
    setMode(m); setError(''); setName(''); setEmail(''); setPassword('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const users = getUsers()

    if (mode === 'signup') {
      if (!name.trim())          { setError('Please enter your full name.'); setLoading(false); return }
      if (!email.trim())         { setError('Please enter your email address.'); setLoading(false); return }
      if (!/\S+@\S+\.\S+/.test(email)) { setError('Please enter a valid email address.'); setLoading(false); return }
      if (password.length < 6)  { setError('Password must be at least 6 characters.'); setLoading(false); return }
      if (users.find(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
        setError('An account with this email already exists.'); setLoading(false); return
      }
      const user = {
        id: Date.now().toString(),
        email: email.trim().toLowerCase(),
        password,
        name: name.trim(),
      }
      localStorage.setItem('cf_users', JSON.stringify([...users, user]))
      const session = { id: user.id, email: user.email, name: user.name }
      localStorage.setItem('cf_session', JSON.stringify(session))
      onLogin(session)
      navigate('/onboarding')
    } else {
      if (!email.trim() || !password) { setError('Please enter your email and password.'); setLoading(false); return }
      const user = users.find(
        u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
      )
      if (!user) { setError('Incorrect email or password. Please try again.'); setLoading(false); return }
      const session = { id: user.id, email: user.email, name: user.name }
      localStorage.setItem('cf_session', JSON.stringify(session))
      onLogin(session)
      const hasProfile = !!localStorage.getItem(`cf_profile_${user.id}`)
      navigate(hasProfile ? '/dashboard' : '/onboarding')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel — branding (hidden on mobile) ── */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 bg-brand-600 px-10 py-10">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <span className="text-white font-bold">C</span>
          </div>
          <span className="text-white font-bold text-lg">CareerFit <span className="text-brand-200">AI</span></span>
        </Link>

        <div>
          <h2 className="text-3xl font-extrabold text-white leading-snug mb-4">
            Your job search,<br />finally organized.
          </h2>
          <p className="text-brand-200 text-sm mb-8">
            Upload your resume, get ranked matches, and track every application — all in one place.
          </p>
          <ul className="space-y-4">
            {FEATURES.map(f => (
              <li key={f.text} className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{f.icon}</span>
                <span className="text-brand-100 text-sm">{f.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-brand-300 text-xs">
          Data stored locally on your device · Free to use
        </p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Mobile header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="font-bold text-gray-900">CareerFit <span className="text-brand-600">AI</span></span>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">

            <div className="mb-8">
              <h1 className="text-2xl font-extrabold text-gray-900">
                {mode === 'signup' ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                {mode === 'signup'
                  ? 'Start tracking your job search today — it\'s free.'
                  : 'Sign in to pick up where you left off.'}
              </p>
            </div>

            {/* Tab toggle */}
            <div className="flex bg-gray-200 rounded-xl p-1 mb-6 gap-1">
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  mode === 'signin'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  mode === 'signup'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Create account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">

              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full name</label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Jane Smith"
                    className="input"
                    autoFocus
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="input"
                  autoFocus={mode === 'signin'}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
                  className="input"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-sm text-red-700">
                  <span className="mt-0.5 flex-shrink-0">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-2.5 text-sm"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {mode === 'signup' ? 'Creating account…' : 'Signing in…'}
                  </span>
                ) : mode === 'signup' ? 'Create account →' : 'Sign in →'}
              </button>
            </form>

            <p className="text-center text-xs text-gray-400 mt-5">
              Your data is stored locally on this device · No server required
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
