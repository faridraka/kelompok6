import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'

import './index.css'
import LandingPage from './pages/LandingPage.jsx'
import CoachDashboard from '../coach/CoachDashboard.jsx'

const router = createBrowserRouter([
  // ── Player / Public routes (tidak diubah) ──
  {
    path: '/',
    element: <LandingPage />,
  },

  // ── Coach routes (baru) ──
  {
    path: '/coach/dashboard',
    element: <CoachDashboard />,
  },
  // Halaman Coach berikutnya ditambahkan di sini:
  // { path: '/coach/services',  element: <CoachServices /> },
  // { path: '/coach/sessions',  element: <CoachSessions /> },
  // { path: '/coach/reviews',   element: <CoachReviews /> },
  // { path: '/coach/wallet',    element: <CoachWallet /> },
  // { path: '/coach/profile',   element: <CoachProfile /> },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
