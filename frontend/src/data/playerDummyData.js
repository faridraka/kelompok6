export const playerProfile = {
  name: 'Dimas Arya',
  game: 'Mobile Legends: Bang Bang',
  role: 'Jungle',
  rank: 'Epic',
  avatarInitials: 'DA',
  level: 125,
  mlbbID: '123456789',
}

export const playerStats = {
  totalSessions: 12,
  hoursPlayed: 48,
  winRate: 62,
  averageKDA: 4.5,
}

export const recentSessions = [
  {
    id: 1,
    coachName: 'Raka Pratama',
    date: '2026-09-25',
    duration: '60 min',
    result: 'win',
    topics: ['jungle_control', 'objective_focus'],
  },
  {
    id: 2,
    coachName: 'Raka Pratama',
    date: '2026-09-20',
    duration: '60 min',
    result: 'win',
    topics: ['opening_strategy', 'early_game'],
  },
  {
    id: 3,
    coachName: 'Putra Wijaya',
    date: '2026-09-15',
    duration: '45 min',
    result: 'loss',
    topics: ['lane_pressing', 'team_fights'],
  },
]

export const activePackages = [
  {
    id: 1,
    coachName: 'Raka Pratama',
    role: 'Jungle',
    sessionsCompleted: 2,
    totalSessions: 3,
    status: 'active',
    remaining: 1,
  },
]

export const transactionHistory = [
  {
    id: 'TRX-001',
    date: '2026-09-10',
    description: 'Package - Jungle Coaching (3 Sessions)',
    amount: 450000,
    status: 'completed',
    type: 'payment',
  },
  {
    id: 'TRX-002',
    date: '2026-09-05',
    description: 'Top Up Balance',
    amount: 100000,
    status: 'completed',
    type: 'topup',
  },
]

