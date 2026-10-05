import { useEffect, useState } from 'react'

// Time left until an ISO date, refreshed every second. `started` is true once the time has passed (or there is no date).
export const useCountdown = (iso) => {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!iso) return undefined
    setNow(Date.now())
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [iso])

  const left = iso ? new Date(iso).getTime() - now : 0
  if (left <= 0) return { started: true, days: 0, hours: 0, minutes: 0 }
  const minutes = Math.floor(left / 60000)
  return { started: false, days: Math.floor(minutes / 1440), hours: Math.floor((minutes % 1440) / 60), minutes: minutes % 60 }
}
