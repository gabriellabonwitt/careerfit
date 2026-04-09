import { Link, useLocation } from 'react-router-dom'

export default function NavBar({ userName, onLogout }) {
  const { pathname } = useLocation()

  const navLink = (to, label) =>
    pathname !== to && (
      <Link
        to={to}
        className={`text-sm font-medium transition-colors ${
          pathname === to
            ? 'text-brand-600'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        {label}
      </Link>
    )

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="font-bold text-gray-900">CareerFit <span className="text-brand-600">AI</span></span>
        </Link>

        <div className="flex items-center gap-4">
          {navLink('/dashboard',    'Dashboard')}
          {navLink('/resume-score', '📊 Resume Score')}
          {navLink('/networking',   '🤝 Networking')}
          {navLink('/saved',        'Saved Jobs')}
          {navLink('/profile',      'Profile')}

          {/* User avatar + name + sign out */}
          {userName && (
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <Link
                to="/profile"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center ring-2 ring-transparent hover:ring-brand-300 transition-all">
                  <span className="text-brand-700 font-semibold text-sm">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700 hidden md:block max-w-[120px] truncate">
                  {userName}
                </span>
              </Link>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
                  title="Sign out"
                >
                  Sign out
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
