import { LIMITS, TYPES } from '../../utils/material'
import { btnGhost, input } from './ui'

const label = 'block text-xs text-white/60'

// The "Material (optional)" block of the recording form. Closed by default; the parent keeps the draft and decides what Save does.
const MaterialFields = ({ open, draft, onChange, onOpen, onRemove }) => {
  const field = (key) => ({ value: draft[key], onChange: (e) => onChange({ ...draft, [key]: e.target.value }), className: `${input} mt-1` })
  return (
    <div className="space-y-2">
      <p className={label}>Material (optional)</p>
      {!open ? <button type="button" onClick={onOpen} className={btnGhost}>Add material</button> : (
        <div className="space-y-3 rounded-md border border-white/10 p-3">
          <label className={label}>Type
            <select {...field('type')}>{TYPES.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select>
          </label>
          <label className={label}>Title
            <input type="text" maxLength={LIMITS.title} {...field('title')} />
          </label>
          <label className={label}>Tagline
            <input type="text" maxLength={LIMITS.tagline} {...field('tagline')} />
          </label>
          <label className={label}>Description
            <textarea rows={3} maxLength={LIMITS.description} {...field('description')} />
          </label>
          <label className={label}>Thumbnail URL (optional)
            <input type="text" inputMode="url" placeholder="Empty = YouTube thumbnail" {...field('thumbnailUrl')} />
          </label>
          <label className={label}>Link
            <input type="text" inputMode="url" placeholder="Unlisted YouTube link" {...field('link')} />
          </label>
          <button type="button" onClick={onRemove} className={btnGhost}>Remove material</button>
        </div>
      )}
    </div>
  )
}
export default MaterialFields
