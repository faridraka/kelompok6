import { Link } from 'react-router'

const NotFoundPage = () => {
  return (
    <div className="min-h-dvh bg-navy-950 flex items-center py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center">
          {/* 404 Display */}
          <div className="mb-4 sm:mb-6">
            <div className="font-display text-[56px] sm:text-[80px] md:text-[100px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-glow via-royal-500 to-gold-500">
              404
            </div>
          </div>

          {/* Content */}
          <div className="max-w-2xl mx-auto">
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3">
              Lane Not Found
            </h1>
            <p className="text-sm sm:text-base text-white/80 mb-4 sm:mb-6 leading-relaxed">
              Looks like your gank took an unexpected turn. This page might have been moved or doesn't exist in our game plan.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-royal-600 to-royal-700 px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white shadow-lg hover:shadow-xl hover:shadow-cyan-glow/10 transition-all duration-250 hover:scale-105 w-full sm:w-auto"
              >
                <span>Return to Base</span>
                <svg className="ml-2 h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>

              <Link
                to="/coaches"
                className="inline-flex items-center justify-center rounded-lg border border-cyan-glow/40 bg-navy-900/40 px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white backdrop-blur-sm hover:border-cyan-glow hover:bg-navy-900/60 transition-all duration-250 hover:scale-105 w-full sm:w-auto"
              >
                <svg className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-cyan-glow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Find a Coach</span>
              </Link>
            </div>

            {/* Help Section */}
            <div className="hidden md:block rounded-lg border border-white/10 bg-navy-900/30 p-4 sm:p-5 mb-4 sm:mb-6">
              <h2 className="font-display text-base sm:text-lg font-semibold text-gold-400 mb-2 sm:mb-3">
                <span className="text-cyan-glow">Pro Tip</span> - Quick Recovery
              </h2>
              <ul className="space-y-2 text-left text-white/70 text-sm">
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-glow shrink-0"></span>
                  <span>Check the URL for typos</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-glow shrink-0"></span>
                  <span>Use the navigation menu above</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-glow shrink-0"></span>
                  <span>Need help? Check our FAQ or contact support</span>
                </li>
              </ul>
            </div>

            {/* Footer Text */}
            <div className="text-xs sm:text-sm text-white/60">
              <p>
                Still lost in the jungle?{' '}
                <Link
                  to="/"
                  className="text-cyan-glow hover:text-cyan-glow/80 font-medium"
                >
                  Contact our support team
                </Link>{' '}
                for assistance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
