import { getYoutubeId, isHttpUrl, youtubeThumb } from './youtube'

// A material is one row of the MATERIALS table: { id, type, title, tagline, description, thumbnailUrl, link, createdAt }.
// The form edits a "draft" (only the fields the coach types); id and createdAt are added when it is saved.
export const TYPES = [['guide', 'Guide'], ['fundamental', 'Fundamental']]
export const LIMITS = { title: 80, tagline: 100, description: 300 }
export const emptyDraft = { type: 'guide', title: '', tagline: '', description: '', thumbnailUrl: '', link: '' }

// Draft from a saved material. A thumbnail that is just the automatic YouTube one is shown as empty.
export const draftOf = (m) => m
  ? { ...emptyDraft, ...m, thumbnailUrl: m.thumbnailUrl === youtubeThumb(m.link) ? '' : m.thumbnailUrl }
  : emptyDraft

// Checks a draft. Returns { error }, or { material } (null when the whole block is empty = no material).
// The mock backend calls this too, so the form and the backend follow the same rules.
export const readDraft = (draft) => {
  const d = Object.fromEntries(Object.entries(draft).map(([k, v]) => [k, String(v ?? '').trim()]))
  if (!d.title && !d.tagline && !d.description && !d.thumbnailUrl && !d.link) return { material: null }
  if (!TYPES.some(([value]) => value === d.type)) return { error: 'Choose a material type.' }
  if (!d.title) return { error: 'Enter the material title.' }
  const long = Object.keys(LIMITS).find((k) => d[k].length > LIMITS[k])
  if (long) return { error: `${long[0].toUpperCase()}${long.slice(1)} must be ${LIMITS[long]} characters or less.` }
  if (!getYoutubeId(d.link)) return { error: 'Use an unlisted YouTube link' }
  if (d.thumbnailUrl && !isHttpUrl(d.thumbnailUrl)) return { error: 'Thumbnail URL must start with http:// or https://' }
  return { material: { ...d, thumbnailUrl: d.thumbnailUrl || youtubeThumb(d.link) } } // empty thumbnail = the YouTube one
}
