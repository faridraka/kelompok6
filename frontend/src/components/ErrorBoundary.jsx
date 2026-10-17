import { isRouteErrorResponse, Link, useNavigate, useRouteError } from 'react-router'

// Route-level error boundary, wired into the router in main.jsx.
// Catches uncaught loader/render errors so users see this themed screen
// instead of React Router's raw "Unexpected Application Error!" page.
const ErrorBoundary = () => {
  const error = useRouteError()
  const navigate = useNavigate()

  let status
  let title = 'Something went wrong'
  let detail = 'An unexpected error occurred while loading this page.'

  if (isRouteErrorResponse(error)) {
    status = error.status
    title = error.statusText || title
    if (error.data) detail = typeof error.data === 'string' ? error.data : detail
  } else if (error instanceof Error) {
    detail = error.message
  } else if (typeof error === 'string') {
    detail = error
  }

  const onDashboard = window.location.pathname.startsWith('/player')
  const onCoach = window.location.pathname.startsWith('/coach')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy-950 px-6 text-center">
      <p className="font-display text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-400">{status ?? 'Error'}</p>
      <h1 className="mt-3 font-display text-3xl font-bold uppercase text-white lg:text-4xl">{title}</h1>
      <p className="mt-4 max-w-xl text-sm text-white/60">{String(detail)}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => navigate(0)} className="inline-flex items-center justify-center bg-royal-500 px-4 py-2 font-display text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-royal-600">
          Try again
        </button>
        {(onDashboard || onCoach) && (
          <Link to="/" className="inline-flex items-center justify-center border border-white/15 px-4 py-2 font-display text-xs font-semibold uppercase tracking-wide text-white/70 transition-colors hover:border-white/30 hover:text-white">
            Go home
          </Link>
        )}
        {onCoach && (
          <Link to="/coach/dashboard" className="inline-flex items-center justify-center border border-white/15 px-4 py-2 font-display text-xs font-semibold uppercase tracking-wide text-white/70 transition-colors hover:border-white/30 hover:text-white">
            Coach dashboard
          </Link>
        )}
        {onDashboard && (
          <Link to="/player/dashboard" className="inline-flex items-center justify-center border border-white/15 px-4 py-2 font-display text-xs font-semibold uppercase tracking-wide text-white/70 transition-colors hover:border-white/30 hover:text-white">
            Player dashboard
          </Link>
        )}
      </div>
    </div>
  )
}

export default ErrorBoundary
