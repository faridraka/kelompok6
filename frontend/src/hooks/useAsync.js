import { useCallback, useEffect, useState } from 'react'

export const useAsync = (fn, deps = []) => {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const run = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }))
    return fn().then((data) => setState({ data, loading: false, error: null }), (error) => setState({ data: null, loading: false, error }))
  }, deps)
  useEffect(() => { run() }, [run])
  return { ...state, reload: run }
}
