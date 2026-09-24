import { useId } from 'react'
const Logo = ({ className = '' }) => {
  const uid = useId().replace(/:/g, '')
  const gold = `goldGrad-${uid}`
  const glow = `glow-${uid}`

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 216 60"
      fill="none"
      role="img"
      aria-label="MetaGames"
      className={className}
    >
      <defs>
        <linearGradient id={gold} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFE685" />
          <stop offset="50%" stopColor="#F5B738" />
          <stop offset="100%" stopColor="#C2820A" />
        </linearGradient>
        <filter id={glow} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#F5B738" floodOpacity="0.6" />
        </filter>
      </defs>

      <g transform="translate(10, 8)" filter={`url(#${glow})`}>
        <polygon
          points="22,2 42,12 36,36 22,44 8,36 2,12"
          fill="#131926"
          stroke={`url(#${gold})`}
          strokeWidth="2.5"
        />
        <path
          d="M22,9 L33,16 L29,32 L22,37 L15,32 L11,16 Z"
          fill={`url(#${gold})`}
          fillOpacity="0.2"
        />
        <path
          d="M16,16 L22,25 L28,16 L31,29 L27,29 L24,21 L22,24 L20,21 L17,29 L13,29 Z"
          fill={`url(#${gold})`}
        />
        <circle cx="22" cy="7" r="2.5" fill="#00F0FF" />
      </g>

      <text
        x="64"
        y="38"
        fontFamily="'Space Grotesk', 'Rajdhani', sans-serif"
        fontWeight="800"
        fontSize="22"
        fill="#FFFFFF"
        letterSpacing="2"
      >
        META<tspan fill={`url(#${gold})`}>GAMES</tspan>
      </text>
    </svg>
  )
}

export default Logo
