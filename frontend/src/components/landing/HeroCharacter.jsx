const HeroCharacter = ({ src, width, height, side, size, x, y, fade }) => {
  const toward = side === 'left' ? 'to right' : 'to left'
  const mask = `linear-gradient(${toward}, #000 ${fade}%, rgba(0,0,0,0.55) ${Math.min(fade + 23, 99)}%, transparent ${Math.min(fade + 51, 100)}%)`

  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      width={width}
      height={height}
      className="pointer-events-none absolute bottom-0 -z-10 select-none"
      style={{
        width: `${size}%`,
        [side]: `${x}%`,
        transform: `translateY(${y}%)`,
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    />
  )
}

export default HeroCharacter
