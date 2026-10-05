// Thumbnail rules for a recording. The thumbnail always comes from the recording itself:
//   1. a frame grabbed from the video file the coach picked,
//   2. else the YouTube thumbnail of the VOD link,
//   3. else the first frame of the link when it points straight at a video file,
//   4. else nothing (the card shows plain black).
// Nothing is uploaded: file frames live in memory only, keyed by session id.
const frames = new Map()

// Save a new frame, or clear the old one when `frame` is null (link-only or replaced recording).
export const setFrame = (sessionId, frame) => (frame ? frames.set(sessionId, frame) : frames.delete(sessionId))

// Grabs one frame of a local video file as a small JPEG data URL. Resolves null if the browser cannot.
export const frameFromFile = (file) => new Promise((resolve) => {
  const objectUrl = URL.createObjectURL(file)
  const video = document.createElement('video')
  let timer
  const finish = (result) => {
    clearTimeout(timer)
    URL.revokeObjectURL(objectUrl) // always release the blob URL, success or not
    video.removeAttribute('src')
    video.load()
    resolve(result)
  }
  video.muted = true
  video.preload = 'metadata'
  video.onerror = () => finish(null)
  video.onloadedmetadata = () => { video.currentTime = Math.min(1, (video.duration || 2) / 2) } // seek past a black first frame
  video.onseeked = () => {
    if (!video.videoWidth) return finish(null) // audio only
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 640
      canvas.height = Math.round((640 * video.videoHeight) / video.videoWidth)
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
      finish(canvas.toDataURL('image/jpeg', 0.7))
    } catch { finish(null) }
  }
  timer = setTimeout(() => finish(null), 8000) // never hang the Save button
  video.src = objectUrl
})

const YOUTUBE = /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/))([\w-]{11})/
const VIDEO_FILE = /\.(mp4|webm|mov|m4v|ogv|mkv)$/i

// What to draw inside the thumbnail for a session's recording: { type: 'image' | 'video', src } or null.
export const thumbSource = (sessionId, vod) => {
  if (frames.has(sessionId)) return { type: 'image', src: frames.get(sessionId) }
  const youtube = vod.url.match(YOUTUBE)?.[1]
  if (youtube) return { type: 'image', src: `https://i.ytimg.com/vi/${youtube}/hqdefault.jpg` }
  if (VIDEO_FILE.test(vod.url.split(/[?#]/)[0])) return { type: 'video', src: vod.url }
  return null
}
