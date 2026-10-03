import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { request } from '../api/client'
import { setSession } from '../utils/session'


const EyeIcon = ({ open }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    className="h-5 w-5"
    aria-hidden="true"
  >
    {open ? (
      <>
        <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ) : (
      <>
        <path d="m3 3 18 18" />
        <path d="M10.6 6.2A10.8 10.8 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-3.1 3.8" />
        <path d="M6.1 6.1C3.7 7.8 2.5 12 2.5 12s3.5 6 9.5 6c1.5 0 2.8-.4 4-.9" />
      </>
    )}
  </svg>
)

const MailIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    className="h-5 w-5"
    aria-hidden="true"
  >
    <rect x="3" y="5" width="18" height="14" rx="1.5" />
    <path d="m3 7 9 6 9-6" />
  </svg>
)

const LockIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    className="h-5 w-5"
    aria-hidden="true"
  >
    <rect x="5" y="10" width="14" height="10" rx="1.5" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
)

const ArrowIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="h-5 w-5"
    aria-hidden="true"
  >
    <path
      d="M8 5l7 7-7 7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
    />
  </svg>
)

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (location.state?.registered) {
      // Use setTimeout to avoid synchronous state update in effect
      setTimeout(() => {
        setSuccessMessage(
          'Account created successfully. You can now sign in.',
        )
      }, 0)
      navigate('/login', {
        replace: true,
        state: {},
      })
    }
  }, [location.state, navigate])

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((current) => ({
      ...current,
      [name]: value,
    }))

    setErrors((current) => ({
      ...current,
      [name]: '',
      submit: '',
    }))
  }

  const validate = () => {
    const nextErrors = {}
    const email = formData.email.trim()

    if (!email) {
      nextErrors.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (!formData.password) {
      nextErrors.password = 'Password is required.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSuccessMessage('')

    if (!validate()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const response = await request('/auth/login', {
        method: 'POST',
        body: {
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        },
      })

      // Backend returns: { access_token, refresh_token, expires_at, user: { id, email, role } }
      setSession(response)

      // Role-based redirect: coach -> dashboard, player -> home
      const destination = response.user?.role === 'coach'
        ? '/coach/dashboard'
        : '/'

      navigate(destination, { replace: true })
    } catch (err) {
      setErrors({
        submit: err.message || 'Login failed. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-navy-950 px-5 py-14">
      <div className="mx-auto w-full max-w-[525px] border border-white/10 bg-navy-900 px-10 py-12">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold uppercase leading-none text-white">
            Welcome Back
          </h1>
          <p className="mt-3 max-w-[420px] text-[16px] leading-7 text-periwinkle-300">
            Sign in to continue your coaching sessions and track
            your progress.
          </p>
        </div>

        {successMessage && (
          <div className="mb-6 border border-cyan-glow/20 bg-cyan-glow/5 px-4 py-3 text-sm text-cyan-glow">
            {successMessage}
          </div>
        )}

        {errors.submit && (
          <div className="mb-6 border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div>
            <label
              htmlFor="email"
              className="font-display text-sm font-semibold uppercase tracking-wide text-periwinkle-300"
            >
              Email Address
            </label>

            <div
              className={`mt-2 flex h-[57px] items-center border bg-navy-950 ${
                errors.email
                  ? 'border-red-400/70'
                  : 'border-white/10'
              }`}
            >
              <span className="pl-4 text-white/40">
                <MailIcon />
              </span>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="player@pro-domain.gg"
                autoComplete="email"
                className="h-full w-full bg-transparent px-3 text-white outline-none placeholder:text-white/30"
                disabled={isLoading}
              />
            </div>

            {errors.email && (
              <p className="mt-2 text-xs text-red-300">
                {errors.email}
              </p>
            )}
          </div>

          <div className="mt-7">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="font-display text-sm font-semibold uppercase tracking-wide text-periwinkle-300"
              >
                Password
              </label>

              <Link
                to="/forgot-password"
                className="text-sm text-periwinkle-300 transition-colors hover:text-white"
              >
                Forgot password?
              </Link>
            </div>

            <div
              className={`mt-2 flex h-[57px] items-center border bg-navy-950 ${
                errors.password
                  ? 'border-red-400/70'
                  : 'border-white/10'
              }`}
            >
              <span className="pl-4 text-white/40">
                <LockIcon />
              </span>

              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="Your password"
                autoComplete="current-password"
                className="h-full w-full bg-transparent px-3 text-white outline-none placeholder:text-white/30"
                disabled={isLoading}
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="mr-3 text-white/35 transition-colors hover:text-white/70"
                aria-label={
                  showPassword
                    ? 'Hide password'
                    : 'Show password'
                }
                disabled={isLoading}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>

            {errors.password && (
              <p className="mt-2 text-xs text-red-300">
                {errors.password}
              </p>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-3 text-sm text-periwinkle-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) =>
                  setRememberMe(event.target.checked)
                }
                className="h-4 w-4 accent-[#2a5ad8]"
                disabled={isLoading}
              />
              <span>Remember me</span>
            </label>

            <span className="font-display text-xs uppercase tracking-wider text-white/30">
              Secured session
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-7 flex h-[57px] w-full items-center justify-center gap-3 bg-royal-500 font-display text-lg font-bold uppercase tracking-wide text-white transition-colors hover:bg-royal-600 active:bg-royal-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isLoading ? 'Signing in…' : 'Sign In'}</span>
            <ArrowIcon />
          </button>
        </form>

        <p className="mt-10 text-center text-[16px] text-periwinkle-300">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-periwinkle-300 transition-colors hover:text-white"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
