import { Link, useLocation } from 'react-router-dom'

export default function NavBar({ userName }) {
  const { pathname } = useLocation()

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
          {pathname !== '/dashboard' && (
            <Link to="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
              Dashboard
            </Link>
          )}
          {userName && (
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
              <span className="text-brand-700 font-semibold text-sm">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
