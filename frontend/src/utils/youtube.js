// YouTube helpers. A material link must be a YouTube link, and its thumbnail comes from the video id.
export const isHttpUrl = (v) => /^https?:\/\/\S+$/i.test(v)

// Video id of youtube.com/watch?v=..., youtu.be/... or youtube.com/embed/... ; null for any other link.
export const getYoutubeId = (url) => {
  try {
    const u = new URL(url.trim())
    const host = u.hostname.replace(/^(www|m)\./, '')
    const id = host === 'youtu.be' ? u.pathname.slice(1)
      : host === 'youtube.com' && u.pathname === '/watch' ? u.searchParams.get('v')
        : host === 'youtube.com' && u.pathname.startsWith('/embed/') ? u.pathname.slice(7)
          : null
    return /^[\w-]{11}$/.test(id ?? '') ? id : null
  } catch { return null }
}

export const youtubeThumb = (url) => {
  const id = getYoutubeId(url)
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
}
