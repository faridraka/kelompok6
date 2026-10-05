import { useEffect, useState } from 'react'

// Current timestamp, refreshed every `ms` so time-gated buttons enable on their own.
export const useNow = (ms = 30000) => {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms)
    return () => clearInterval(t)
  }, [ms])
  return now
}
