import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'

import './index.css'

import App from './App.jsx'
import CoachDashboard from './components/coach/CoachDashboard.jsx'
import PlayerDashboardLayout from './components/player/PlayerDashboardLayout.jsx'
import CoachesPage from './pages/CoachesPage.jsx'
import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import ProfilePage from './pages/player/ProfilePage.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
    children: [
      { index: true, Component: LandingPage },
      { path: 'login', Component: LoginPage },
      { path: 'register', Component: RegisterPage },
      { path: 'coaches', Component: CoachesPage}
    ],
  },
  {
    path: '/coach/dashboard',
    element: <CoachDashboard />,
  },
  {
    path: '/dashboard',
    Component: PlayerDashboardLayout,
    children: [
      { index: true, element: <div className="p-6">Overview</div> },
      { path: 'profile', Component: ProfilePage },
      { path: 'sessions', element: <div className="p-6">Sessions</div> },
      { path: 'transactions', element: <div className="p-6">Transactions</div> },
  ],
},
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
