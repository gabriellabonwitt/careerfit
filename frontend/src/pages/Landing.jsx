import { useNavigate } from 'react-router-dom'

const features = [
  {
    icon: '📄',
    title: 'Upload Your Resume',
    desc: 'Paste or upload your PDF/DOCX. We extract your skills, experience, and education instantly.',
  },
  {
    icon: '🎯',
    title: 'Get a Job Fit Score',
    desc: 'AI analyzes every job against your background and explains exactly why you match or what to fix.',
  },
  {
    icon: '✏️',
    title: 'Tailored Resume Edits',
    desc: 'Get specific bullet rewrites aligned to each job description — not generic advice.',
  },
  {
    icon: '🤝',
    title: 'Networking Templates',
    desc: 'Know who to message on LinkedIn and get a personalized outreach template ready to send.',
  },
]

const steps = [
  { num: '01', label: 'Upload resume' },
  { num: '02', label: 'Set your preferences' },
  { num: '03', label: 'Get ranked matches' },
  { num: '04', label: 'Apply with confidence' },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <span className="text-white font-bold">C</span>
          </div>
          <span className="font-bold text-lg">CareerFit <span className="text-brand-600">AI</span></span>
        </div>
        <button onClick={() => navigate('/onboarding')} className="btn-primary">
          Get started free
        </button>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <span className="badge bg-brand-100 text-brand-700 mb-4 text-sm">
          Powered by Claude AI
        </span>
        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mt-3">
          Upload your resume.<br />
          <span className="text-brand-600">Get ranked jobs + exact changes</span><br />
          to improve your chances.
        </h1>
        <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto">
          CareerFit AI flips the job search. Instead of endlessly scrolling job boards,
          you get a personalized ranked list with AI-explained fit scores and ready-to-use
          resume edits and networking templates.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <button onClick={() => navigate('/onboarding')} className="btn-primary text-base px-7 py-3">
            Get started — it's free
          </button>
        </div>
        <p className="mt-3 text-sm text-gray-400">No account needed · Works with PDF & DOCX</p>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">How it works</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="w-12 h-12 rounded-full bg-brand-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-3">
                  {s.num}
                </div>
                <p className="font-medium text-gray-800">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">Everything in one place</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card p-6 flex gap-4">
              <span className="text-3xl">{f.icon}</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-600 py-16 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to find your fit?</h2>
        <p className="text-brand-200 mb-8">Upload your resume and get AI-powered job matches in seconds.</p>
        <button onClick={() => navigate('/onboarding')} className="bg-white text-brand-600 font-semibold px-8 py-3 rounded-lg hover:bg-brand-50 transition-colors">
          Get started now
        </button>
      </section>

      <footer className="py-8 text-center text-sm text-gray-400">
        © 2025 CareerFit AI · Built for students and early-career professionals
      </footer>
    </div>
  )
}
