export default function FitScoreCircle({ score, size = 80 }) {
  const radius = (size - 10) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const color =
    score >= 80 ? '#16a34a' :
    score >= 60 ? '#d97706' :
    '#dc2626'

  const label =
    score >= 80 ? 'Strong' :
    score >= 60 ? 'Moderate' :
    'Stretch'

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#e5e7eb" strokeWidth="8"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
        <text
          x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
          style={{ transform: 'rotate(90deg)', transformOrigin: 'center', fill: color, fontWeight: 700, fontSize: size * 0.22 }}
        >
          {score}
        </text>
      </svg>
      <span className="text-xs font-semibold" style={{ color }}>{label}</span>
    </div>
  )
}
