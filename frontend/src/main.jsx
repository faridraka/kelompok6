import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate } from 'react-router'
import { RouterProvider } from 'react-router/dom'

import './index.css'

import App from './App.jsx'
import LandingPage from './pages/LandingPage.jsx'
import CoachesPage from './pages/CoachesPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import CartPage from './pages/CartPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import PaymentPage from './pages/PaymentPage.jsx'
import OrderSuccessPage from './pages/OrderSuccessPage.jsx'
import PlayerLayout from './components/player/PlayerLayout.jsx'
import PlayerDashboard from './pages/player/PlayerDashboard.jsx'
import PlayerSessions from './pages/player/PlayerSessions.jsx'
import PlayerMaterials from './pages/player/PlayerMaterials.jsx'
import PlayerVods from './pages/player/PlayerVods.jsx'
import PlayerAccount from './pages/player/PlayerAccount.jsx'
import PlayerOrder from './pages/player/PlayerOrder.jsx'
import CoachDashboard from './components/coach/CoachDashboard.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import { protectedLoader, guestLoader, coachOnlyLoader } from './routes/authMiddleware'

const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
    children: [
      { index: true, Component: LandingPage },
      { path: 'login', Component: LoginPage, loader: guestLoader },
      { path: 'register', Component: RegisterPage, loader: guestLoader },
      { path: 'coaches', Component: CoachesPage },
      { path: 'cart', Component: CartPage, loader: protectedLoader },
      { path: 'checkout', Component: CheckoutPage, loader: protectedLoader },
      { path: 'payment/:paymentId', Component: PaymentPage, loader: protectedLoader },
      { path: 'orders/:orderId/success', Component: OrderSuccessPage, loader: protectedLoader },
    ],
  },
  {
    path: '/coach/dashboard',
    Component: CoachDashboard,
    loader: coachOnlyLoader,
  },
  {
    path: '/player',
    Component: PlayerLayout,
    loader: protectedLoader,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', Component: PlayerDashboard },
      { path: 'sessions', Component: PlayerSessions },
      { path: 'materials', Component: PlayerMaterials },
      { path: 'vods', Component: PlayerVods },
      { path: 'account', Component: PlayerAccount },
      { path: 'orders/:id', Component: PlayerOrder },
    ],
  },
  { path: '*', Component: NotFoundPage }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)