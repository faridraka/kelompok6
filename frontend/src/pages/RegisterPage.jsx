import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { request } from '../api/client'
import { FiEye, FiEyeOff, FiLock, FiMail, FiUser, FiChevronRight } from 'react-icons/fi'

const ArrowIcon = () => <FiChevronRight className="h-3 w-2" aria-hidden="true" />

const PlayerIcon = () => (
  <svg
    viewBox="0 0 20 20"
    className="h-4 w-4 fill-none stroke-current"
    strokeWidth="1.5"
    aria-hidden="true"
  >
    <rect x="2.5" y="5" width="15" height="10" rx="2" />
    <path strokeLinecap="round" d="M6 10h4M8 8v4" />
    <circle
      cx="14"
      cy="9"
      r=".8"
      fill="currentColor"
      stroke="none"
    />
    <circle
      cx="16"
      cy="11"
      r=".8"
      fill="currentColor"
      stroke="none"
    />
  </svg>
)

const CoachIcon = () => (
  <svg
    viewBox="0 0 20 20"
    className="h-4 w-4 fill-none stroke-current"
    strokeWidth="1.5"
    aria-hidden="true"
  >
    <circle cx="10" cy="6" r="3" />
    <path
      strokeLinecap="round"
      d="M4 17c.8-3 2.8-4.5 6-4.5s5.2 1.5 6 4.5"
    />
  </svg>
)

const ACCOUNT_TYPES = [
  {
    value: 'player',
    label: 'Player',
    icon: PlayerIcon,
  },
  {
    value: 'coach',
    label: 'Coach',
    icon: CoachIcon,
  },
]

const RegisterPage = () => {
  const navigate = useNavigate()
  const [accountType, setAccountType] = useState('player')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target

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

    if (!formData.name.trim()) {
      nextErrors.name = 'Name or handle is required.'
    } else if (formData.name.trim().length < 2) {
      nextErrors.name = 'Name or handle must be at least 2 characters.'
    }

    if (!formData.email.trim()) {
      nextErrors.email = 'Email address is required.'
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (!formData.password) {
      nextErrors.password = 'Password is required.'
    } else if (formData.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.'
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password.'
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }

    if (!agreed) {
      nextErrors.agreed = 'Please agree to the Terms and Privacy Policy.'
    }

    return nextErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const nextErrors = validate()

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      // Backend expects: { name, email, password, role }
      await request('/auth/register', {
        method: 'POST',
        body: {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          role: accountType,
        },
      })

      navigate('/login', {
        state: {
          registered: true,
        },
      })
    } catch (err) {
      setErrors({
        submit: err.message || 'Registration failed. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy-950">
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-12">
        <div className="w-full max-w-[520px]">
          <div className="border border-white/10 bg-navy-900/70 px-8 py-10">
            <p className="mb-5 font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-400">
              ★ Secure Registration
            </p>

            <h1 className="font-display text-3xl font-bold uppercase leading-tight text-white">
              Create Your GameCoach Account
            </h1>

            <p className="mt-2 text-sm text-white/60">
              Join the platform for structured esports coaching.
            </p>

            <form
              className="mt-8 flex flex-col gap-5"
              onSubmit={handleSubmit}
              noValidate
            >
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-white/70">
                  Account Type
                </span>

                <div className="grid grid-cols-2 gap-2">
                  {ACCOUNT_TYPES.map((type) => {
                    const Icon = type.icon
                    const isActive = accountType === type.value

                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setAccountType(type.value)}
                        aria-pressed={isActive}
                        disabled={isLoading}
                        className={`group flex min-h-[64px] items-center gap-3 border px-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-glow ${
                          isActive
                            ? 'border-royal-500 bg-royal-500/15 text-white'
                            : 'border-white/10 bg-navy-950 text-white/45 hover:border-white/20 hover:text-white/75'
                        }`}
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center border transition-colors ${
                            isActive
                              ? 'border-royal-500 bg-royal-500 text-white'
                              : 'border-white/10 bg-white/[0.03] text-white/40 group-hover:text-white/70'
                          }`}
                        >
                          <Icon />
                        </span>

                        <span className="font-display text-sm font-semibold uppercase tracking-wide">
                          {type.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="name"
                  className="text-xs font-semibold uppercase tracking-wide text-white/70"
                >
                  Full Name or Handle
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                    <FiUser className="h-4 w-4 text-white/40" aria-hidden="true" />
                  </span>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Name"
                    disabled={isLoading}
                    className={`w-full border bg-navy-950 py-3 pl-9 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none ${
                      errors.name
                        ? 'border-red-400/70'
                        : 'border-white/10 focus:border-royal-500'
                    }`}
                  />
                </div>

                {errors.name && (
                  <p className="text-xs text-red-300">{errors.name}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-semibold uppercase tracking-wide text-white/70"
                >
                  Email Address
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                    <FiMail className="h-4 w-4 text-white/40" aria-hidden="true" />
                  </span>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="@gmail.com"
                    disabled={isLoading}
                    className={`w-full border bg-navy-950 py-3 pl-9 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none ${
                      errors.email
                        ? 'border-red-400/70'
                        : 'border-white/10 focus:border-royal-500'
                    }`}
                  />
                </div>

                {errors.email && (
                  <p className="text-xs text-red-300">{errors.email}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-xs font-semibold uppercase tracking-wide text-white/70"
                  >
                    Password
                  </label>

                  <span className="text-[10px] uppercase tracking-wider text-white/30">
                    Min. 8 chars
                  </span>
                </div>

                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                    <FiLock className="h-4 w-4 text-white/40" aria-hidden="true" />
                  </span>

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    disabled={isLoading}
                    className={`w-full border bg-navy-950 py-3 pl-9 pr-11 text-sm text-white placeholder:text-white/30 focus:outline-none ${
                      errors.password
                        ? 'border-red-400/70'
                        : 'border-white/10 focus:border-royal-500'
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                    disabled={isLoading}
                    className="absolute inset-y-0 right-3 flex items-center text-white/40 transition-colors hover:text-white/70"
                  >
                    {showPassword ? <FiEyeOff className="h-4 w-4" aria-hidden="true" /> : <FiEye className="h-4 w-4" aria-hidden="true" />}
                  </button>
                </div>

                {errors.password && (
                  <p className="text-xs text-red-300">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="text-xs font-semibold uppercase tracking-wide text-white/70"
                >
                  Confirm Password
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                    <FiLock className="h-4 w-4 text-white/40" aria-hidden="true" />
                  </span>

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    disabled={isLoading}
                    className={`w-full border bg-navy-950 py-3 pl-9 pr-11 text-sm text-white placeholder:text-white/30 focus:outline-none ${
                      errors.confirmPassword
                        ? 'border-red-400/70'
                        : 'border-white/10 focus:border-royal-500'
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirm((value) => !value)}
                    aria-label={
                      showConfirm
                        ? 'Hide confirm password'
                        : 'Show confirm password'
                    }
                    disabled={isLoading}
                    className="absolute inset-y-0 right-3 flex items-center text-white/40 transition-colors hover:text-white/70"
                  >
                    {showConfirm ? <FiEyeOff className="h-4 w-4" aria-hidden="true" /> : <FiEye className="h-4 w-4" aria-hidden="true" />}
                  </button>
                </div>

                {errors.confirmPassword && (
                  <p className="text-xs text-red-300">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <label className="flex cursor-pointer select-none items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => {
                    setAgreed(e.target.checked)
                    setErrors((current) => ({
                      ...current,
                      agreed: '',
                    }))
                  }}
                  disabled={isLoading}
                  className="mt-0.5 accent-royal-500"
                />

                <span className="text-sm leading-snug text-white/60">
                  I agree to the{' '}
                  <Link
                    to="/terms"
                    className="text-periwinkle-300 transition-colors hover:text-white"
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    to="/privacy"
                    className="text-periwinkle-300 transition-colors hover:text-white"
                  >
                    Privacy Policy
                  </Link>
                </span>
              </label>

              {errors.agreed && (
                <p className="-mt-3 text-xs text-red-300">
                  {errors.agreed}
                </p>
              )}

              {errors.submit && (
                <p className="-mt-2 text-center text-xs text-red-300">
                  {errors.submit}
                </p>
              )}

              <button
                type="submit"
                disabled={!agreed || isLoading}
                className="flex w-full items-center justify-center gap-4 bg-royal-500 px-6 py-[15px] font-display text-[15px] font-semibold uppercase leading-none tracking-wide text-white transition-colors hover:bg-royal-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-glow disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? 'Creating account…' : 'Create Account'}
                <ArrowIcon />
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-white/50">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-periwinkle-300 transition-colors hover:text-white"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default RegisterPage