// =============================================================
// DUMMY DATA — Coach Perspective
// Ganti isi file ini dengan data asli dari API nanti.
// Struktur tiap objek sudah disesuaikan dengan model data PRD.
// =============================================================

export const coachProfile = {
  name: 'Raka Pratama',
  game: 'Mobile Legends: Bang Bang',
  role: 'Jungle',
  rank: 'Mythical Immortal',
  avatarInitials: 'RP',
}

// Summary bar — 4 angka di bagian atas dashboard
export const coachSummary = {
  activeCoaching: 3,
  upcomingSessions: 2,
  pendingReviews: 1,
  availableBalance: 450000,
}

// Sesi yang akan datang (Upcoming Sessions)
export const upcomingSessions = [
  {
    id: 1,
    playerName: 'Dimas Arya',
    game: 'MLBB',
    sessionNumber: 2,
    totalSessions: 3,
    date: '2026-09-25',
    time: '19:00',
    status: 'confirmed',       // 'confirmed' | 'waiting_link' | 'pending'
    meetingLink: 'https://meet.google.com/abc-defg-hij',
  },
  {
    id: 2,
    playerName: 'Fajar Nugroho',
    game: 'MLBB',
    sessionNumber: 1,
    totalSessions: 3,
    date: '2026-09-27',
    time: '20:00',
    status: 'waiting_link',
    meetingLink: null,
  },
]

// Daftar player yang sedang aktif coaching
export const activeCoachingList = [
  {
    id: 1,
    playerName: 'Dimas Arya',
    game: 'MLBB',
    role: 'Jungle',
    sessionsCompleted: 1,
    totalSessions: 3,
    orderId: 'ORD-001',
  },
  {
    id: 2,
    playerName: 'Fajar Nugroho',
    game: 'MLBB',
    role: 'Gold Lane',
    sessionsCompleted: 0,
    totalSessions: 3,
    orderId: 'ORD-002',
  },
  {
    id: 3,
    playerName: 'Nia Kusuma',
    game: 'MLBB',
    role: 'EXP Lane',
    sessionsCompleted: 3,
    totalSessions: 3,
    orderId: 'ORD-003',
  },
]

// Tugas yang belum diselesaikan Coach
export const pendingTasks = [
  {
    id: 1,
    type: 'schedule_session',   // untuk link ke halaman schedule nanti
    label: 'Schedule Session',
    detail: 'Fajar Nugroho — Session 1',
    urgent: true,
  },
  {
    id: 2,
    type: 'add_meeting_link',
    label: 'Add Meeting Link',
    detail: 'Fajar Nugroho — Session 1 (Sep 27)',
    urgent: true,
  },
  {
    id: 3,
    type: 'upload_recording',
    label: 'Upload Recording',
    detail: 'Dimas Arya — Session 1',
    urgent: false,
  },
  {
    id: 4,
    type: 'complete_review',
    label: 'Complete Performance Review',
    detail: 'Nia Kusuma — All sessions done',
    urgent: false,
  },
]

// Saldo Coach
export const coachWallet = {
  availableBalance: 450000,   // bisa ditarik
  pendingBalance: 300000,     // masih escrow
}
