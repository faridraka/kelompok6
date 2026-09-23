import { useState } from 'react'
import { BREAKPOINTS, DEFAULT_LAYOUT } from './heroLayout'

const SLIDERS = [
  { key: 'size', label: 'Size', min: 20, max: 110, step: 1, unit: '%' },
  { key: 'x', label: 'Horizontal', min: -40, max: 30, step: 0.5, unit: '%' },
  { key: 'y', label: 'Vertical', min: -40, max: 40, step: 1, unit: '%' },
  { key: 'fade', label: 'Fade starts', min: 0, max: 90, step: 1, unit: '%' },
]

const CharacterTuner = ({ layout, setLayout, breakpoint }) => {
  const [open, setOpen] = useState(true)
  const [copied, setCopied] = useState(false)
  const active = BREAKPOINTS.find((b) => b.key === breakpoint)

  const update = (side, key, value) =>
    setLayout((prev) => ({
      ...prev,
      [side]: {
        ...prev[side],
        [breakpoint]: { ...prev[side][breakpoint], [key]: Number(value) },
      },
    }))

  const copy = async () => {
    const text = `export const DEFAULT_LAYOUT = ${JSON.stringify(layout, null, 2)}`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="fixed bottom-4 left-4 z-[100] w-72 rounded-md border border-white/20 bg-navy-950/95 p-3 text-xs text-white shadow-2xl backdrop-blur">
      <div className="flex items-center justify-between">
        <strong className="text-sm">Hero tuner (dev only)</strong>
        <button type="button" onClick={() => setOpen((v) => !v)} className="rounded bg-white/10 px-2 py-1">
          {open ? 'Hide' : 'Show'}
        </button>
      </div>

      {open && (
        <>
          <p className="mt-2 text-white/70">
            Editing the <b className="text-gold-400">{breakpoint}</b> profile ({active.label}). Resize the window to tune
            the others.
          </p>

          {['left', 'right'].map((side) => (
            <fieldset key={side} className="mt-3 border-t border-white/15 pt-2">
              <legend className="pr-2 font-semibold capitalize">{side} hero</legend>
              {SLIDERS.map((s) => (
                <label key={s.key} className="mt-1.5 flex items-center gap-2">
                  <span className="w-20 shrink-0">{s.label}</span>
                  <input
                    type="range"
                    min={s.min}
                    max={s.max}
                    step={s.step}
                    value={layout[side][breakpoint][s.key]}
                    onChange={(e) => update(side, s.key, e.target.value)}
                    className="min-w-0 flex-1"
                  />
                  <span className="w-12 shrink-0 text-right tabular-nums">
                    {layout[side][breakpoint][s.key]}
                    {s.unit}
                  </span>
                </label>
              ))}
            </fieldset>
          ))}

          <div className="mt-3 flex gap-2">
            <button type="button" onClick={copy} className="flex-1 rounded bg-royal-500 px-3 py-2 font-semibold">
              {copied ? 'Copied!' : 'Copy layout'}
            </button>
            <button
              type="button"
              onClick={() => setLayout(DEFAULT_LAYOUT)}
              className="rounded bg-white/10 px-3 py-2"
            >
              Reset
            </button>
          </div>
          <p className="mt-2 text-white/60">
            Paste the copied text over <code>DEFAULT_LAYOUT</code> in <code>heroLayout.js</code>. Values reset when you
            refresh the page.
          </p>
        </>
      )}
    </div>
  )
}

export default CharacterTuner
