import { Link } from 'react-router'

import iconGold from '../../assets/roles/role-gold.png'
import iconExp from '../../assets/roles/role-exp.png'
import iconMid from '../../assets/roles/role-mid.png'
import iconJungle from '../../assets/roles/role-jungle.png'
import iconRoam from '../../assets/roles/role-roam.png'

import artGold from '../../assets/roles/art/gold.webp'
import artExp from '../../assets/roles/art/exp.webp'
import artMid from '../../assets/roles/art/mid.webp'
import artJungle from '../../assets/roles/art/jungle.webp'
import artRoam from '../../assets/roles/art/roam.webp'

const EYEBROW = 'Choose your role'
const HEADING = 'Find a coach who plays your lane'

const ROLES = [
  {
    key: 'gold',
    icon: iconGold,
    art: artGold,
    category: 'Gold Lane / Coaching',
    name: 'Gold Lane',
    description: 'Farm efficiently, hit your power spikes on time, and close out games as the damage core.',
    cta: 'I play Gold Lane',
    to: '/coaches?role=gold',
  },
  {
    key: 'exp',
    icon: iconExp,
    art: artExp,
    category: 'EXP Lane / Coaching',
    name: 'EXP Lane',
    description: 'Hold your lane solo, survive the early game, and turn a split push into map pressure.',
    cta: 'I play EXP Lane',
    to: '/coaches?role=exp',
  },
  {
    key: 'mid',
    icon: iconMid,
    art: artMid,
    category: 'Mid Lane / Coaching',
    name: 'Mid Lane',
    description: 'Win the trade phase, roam with purpose, and convert a lane lead into an actual win.',
    cta: 'I play Mid Lane',
    to: '/coaches?role=mid',
  },
  {
    key: 'jungle',
    icon: iconJungle,
    art: artJungle,
    category: 'Jungle / Coaching',
    name: 'Jungle',
    description: 'Clear on a real route, track the map, and show up for every fight that matters.',
    cta: 'I play Jungle',
    to: '/coaches?role=jungle',
  },
  {
    key: 'roam',
    icon: iconRoam,
    art: artRoam,
    category: 'Roam / Coaching',
    name: 'Roam',
    description: 'Control vision, protect your carries, and make the engages that win team fights.',
    cta: 'I play Roam',
    to: '/coaches?role=roam',
  },
]

const ArrowIcon = () => (
  <svg viewBox="0 0 8 12" className="h-3 w-2 fill-current" aria-hidden="true">
    <path d="M0 0l8 6-8 6z" />
  </svg>
)

const RoleCard = ({ role }) => (
  <div className="flex flex-1 flex-col items-center" id='choose-your-role'>
    <img src={role.icon} alt="" aria-hidden="true" width={320} height={320} className="mb-4 h-14 w-14 drop-shadow-[0_0_5px_rgba(240,201,107,0.2)] sm:h-16 sm:w-16" />

    <article className="flex w-full flex-1 flex-col overflow-hidden border border-white/10 bg-navy-900/70 backdrop-blur-sm">
      <div className="relative aspect-[240/390] overflow-hidden border-b border-white/10 bg-navy-950">
        <img
          src={role.art}
          alt=""
          aria-hidden="true"
          width={240}
          height={390}
          className="h-full w-full object-cover object-top"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 bg-royal-600 p-5">
        <p className="text-xs uppercase tracking-wide text-periwinkle-300">{role.category}</p>
        <h3 className="font-display text-2xl font-bold uppercase leading-tight text-white">{role.name}</h3>
        <p className="flex-1 text-sm leading-relaxed text-white/85">{role.description}</p>

        <Link
          to={role.to}
          className="inline-flex items-center justify-center gap-3 bg-navy-950 px-4 py-3 font-display text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-glow"
        >
          {role.cta}
          <ArrowIcon />
        </Link>
      </div>
    </article>
  </div>
)

const Roles = () => {
  return (
    <div className="mx-auto max-w-[1650px] px-6 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <p className="font-display text-xs font-medium uppercase tracking-[0.26em] text-gold-400 sm:text-sm">
          {EYEBROW}
        </p>
        <h2 className="mt-4 font-display text-3xl font-bold uppercase leading-tight text-white sm:text-4xl lg:text-5xl">
          {HEADING}
        </h2>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {ROLES.map((role, i) => (
          <div
            key={role.key}
            className={`flex flex-col ${i === ROLES.length - 1 ? 'sm:col-span-2 sm:mx-auto sm:w-full sm:max-w-sm lg:col-span-1 lg:max-w-none' : ''}`}
          >
            <RoleCard role={role} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default Roles
