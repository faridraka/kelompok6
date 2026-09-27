import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'

import './index.css'

import LandingPage from './pages/LandingPage.jsx'
import CoachesPage from './pages/CoachesPage.jsx'
import CoachDetailsPage from './pages/CoachDetailsPage.jsx'
import App from './App.jsx'
import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import CoachDashboard from './components/coach/CoachDashboard.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
    children: [
      { index: true, Component: LandingPage },
      { path: 'login', Component: LoginPage },
      { path: 'register', Component: RegisterPage },
    ],
  },
  {
    path: '/coach/dashboard',
    element: <CoachDashboard />,
  },
      { path: "coaches", Component: CoachesPage },
      { path: "coaches/:id", Component: CoachDetailsPage },
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)