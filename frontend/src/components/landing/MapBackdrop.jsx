import mapBg from '../../assets/backgrounds/sanctum-map.webp'
const MapBackdrop = ({ children }) => {
  return (
    <section className="relative isolate overflow-hidden bg-navy-950">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-linear-to-b from-navy-950 via-[#0f2b5c] to-[#081a3a]" />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-soft-light grayscale contrast-150 brightness-75"
          style={{ backgroundImage: `url(${mapBg})` }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_45%,rgba(70,120,190,0.2),transparent_72%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_35%,rgba(3,10,28,0.4),transparent_75%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,var(--color-navy-950)_0%,transparent_9%,transparent_92%,var(--color-navy-950)_100%)]" />
      </div>

      <div className="relative">{children}</div>
    </section>
  )
}

export default MapBackdrop
