import artGold from '../../assets/roles/art/gold.webp'
import artJungle from '../../assets/roles/art/jungle.webp'
import artRoam from '../../assets/roles/art/roam.webp'

export const DEFAULT_COACHING_PACKAGE = {
  id: 'three-live-sessions',
  name: '3 live coaching sessions',
  sessionCount: 3,
  sessionDuration: '60 minutes each',
  pricePerSession: 'Rp129.000',
  totalPrice: 'Rp387.000',
  detail: 'Practice with your coach three times and schedule each session during checkout.',
}

export const coaches = [
  {
    id: '1',
    slug: 'kai-pratama',
    name: 'Kai Pratama',
    focusRole: 'Jungle Specialist',
    rank: 'Mythical Immortal',
    rating: '4.9',
    reviewCount: '124',
    sessionCount: '312',
    responseTime: 'Usually replies in 1 hour',
    languages: ['Indonesia', 'English'],
    image: artJungle,
    description:
      'A high-tempo jungle coach for players who want every rotation to have a purpose. Kai breaks down your early pathing, objective setup, and team-fight decisions into habits you can use in your next ranked game.',
    specialties: ['Pathing and tempo', 'Objective setup', 'Hero pool planning', 'VOD review'],
  },
  {
    id: '2',
    slug: 'nara-widjaja',
    name: 'Nara Widjaja',
    focusRole: 'Gold Lane Specialist',
    rank: 'Mythical Glory',
    rating: '4.8',
    reviewCount: '96',
    sessionCount: '228',
    responseTime: 'Usually replies in 2 hours',
    languages: ['Indonesia', 'English'],
    image: artGold,
    description:
      'Nara helps gold laners turn a stable farm into a winning damage lead. Her sessions focus on wave control, safer positioning, and the moments where a carry should join or skip a fight.',
    specialties: ['Lane matchups', 'Power spikes', 'Positioning', 'Late-game conversion'],
  },
  {
    id: '3',
    slug: 'rafa-alam',
    name: 'Rafa Alam',
    focusRole: 'Roam Specialist',
    rank: 'Mythical Immortal',
    rating: '5.0',
    reviewCount: '81',
    sessionCount: '190',
    responseTime: 'Usually replies in 1 hour',
    languages: ['Indonesia', 'English'],
    image: artRoam,
    description:
      'Rafa teaches roam players to read the whole map before the fight starts. Build cleaner vision habits, better engage timing, and stronger communication for every objective setup.',
    specialties: ['Vision control', 'Engage timing', 'Team-fight calls', 'Draft support'],
  },
]

export const getCoach = (id) => coaches.find((coach) => coach.id === id || coach.slug === id)
