export const formatIDR = (n) => 'Rp ' + Number(n).toLocaleString('id-ID')

export const formatSession = (iso) => {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
  }
}
