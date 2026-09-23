import { useEffect, useState } from 'react'
export const BREAKPOINTS = [
  { key: 'desktop', min: 1536, label: '1536px and wider' },
  { key: 'laptop', min: 1024, label: '1024 to 1535px' },
  { key: 'tablet', min: 640, label: '640 to 1023px' },
  { key: 'mobile', min: 0, label: 'under 640px' },
]

export const DEFAULT_LAYOUT = {
  "left": {
    "desktop": {
      "size": 44,
      "x": -6.5,
      "y": 0,
      "fade": 45
    },
    "laptop": {
      "size": 34,
      "x": -3,
      "y": 0,
      "fade": 45
    },
    "tablet": {
      "size": 46,
      "x": -6,
      "y": 0,
      "fade": 45
    },
    "mobile": {
      "size": 64,
      "x": -10,
      "y": 0,
      "fade": 45
    }
  },
  "right": {
    "desktop": {
      "size": 62,
      "x": -7,
      "y": 0,
      "fade": 35
    },
    "laptop": {
      "size": 46,
      "x": -4,
      "y": 0,
      "fade": 45
    },
    "tablet": {
      "size": 56,
      "x": -6,
      "y": 0,
      "fade": 45
    },
    "mobile": {
      "size": 74,
      "x": -12,
      "y": 0,
      "fade": 45
    }
  }
}

const readBreakpoint = () =>
  BREAKPOINTS.find((b) => window.innerWidth >= b.min).key

export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState(readBreakpoint)

  useEffect(() => {
    const onResize = () => setBreakpoint(readBreakpoint())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return breakpoint
}
