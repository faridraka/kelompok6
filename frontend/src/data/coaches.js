import testAvatar1 from '../assets/coaches/faros.png'
import testAvatar2 from '../assets/coaches/aruya.png'

export const LANES = [
  { key: 'gold', label: 'Gold Lane' },
  { key: 'exp', label: 'EXP Lane' },
  { key: 'mid', label: 'Mid Lane' },
  { key: 'jungle', label: 'Jungle' },
  { key: 'roam', label: 'Roam' },
]

export const laneLabel = (key) => LANES.find((l) => l.key === key)?.label ?? key

// Prices are plain numbers in IDR (matches coaches.price_per_session / original_price).
const DUMMY_COACHES = [
  {
    name: 'Coach Faros',
    academyLabel: 'Mid Lane Academy',
    bio: 'Head Coach of the Mid Lane Academy, former pro mid laner and 6-year high-elo MLBB veteran with hundreds of live reviews under his belt.',
    peakRank: 'Mythical Immortal',
    vodsCoached: '850+',
    mainHero: 'Ling',
    rating: 5,
    testimonial: {
      quote: 'He remembered who I was and goes a long way to feeling like you\u2019re not alone.',
      reviewerInitials: 'MH',
      reviewerName: 'Mars H.',
    },
    price: 450000,
    originalPrice: 600000,
    discordUsername: 'coach_faros',
    avatar: testAvatar1,
  },
  {
    name: 'Coach Seemon',
    academyLabel: 'ADC Academy',
    bio: 'Head Coach of the ADC Academy, consistently Rank 1 in solo queue and knows exactly what it takes to climb out of any elo.',
    peakRank: '3000 Stars',
    vodsCoached: '700+',
    mainHero: 'Beatrix',
    rating: 5,
    testimonial: {
      quote: 'Lots of high-level and detailed advice for an ADC player in Legend.',
      reviewerInitials: 'M',
      reviewerName: 'Matt',
    },
    price: 400000,
    originalPrice: 550000,
    discordUsername: 'coach_seemon',
    avatar: testAvatar2,
  },
]

export const generateCoaches = (count = 9) =>
  Array.from({ length: count }, (_, i) => {
    const base = DUMMY_COACHES[i % DUMMY_COACHES.length]
    const primary = LANES[i % LANES.length].key
    const secondary = LANES[(i + 2) % LANES.length].key
    return { ...base, id: i + 1, lanes: i % 3 === 0 ? [primary, secondary] : [primary] }
  })
