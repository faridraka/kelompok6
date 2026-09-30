import mapBg from '../../assets/backgrounds/sanctum-map.webp'

const PlayerBackdrop = () => (
  <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 lg:left-60">
    <div className="absolute inset-0 bg-linear-to-b from-navy-950 via-[#0f2b5c] to-[#081a3a]" />
    <div
      className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-soft-light grayscale contrast-150 brightness-75"
      style={{ backgroundImage: `url(${mapBg})` }}
    />
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_45%,rgba(70,120,190,0.2),transparent_72%)]" />
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,var(--color-navy-950)_130%)]" />
  </div>
)

export default PlayerBackdrop
