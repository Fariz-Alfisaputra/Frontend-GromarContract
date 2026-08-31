interface SectionDividerProps {
  from?: string
  to?: string
  className?: string
}

function hexToOklch(hex: string): string | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!m) return null
  const [, h] = m
  const r = parseInt(h.slice(0, 2), 16) / 255
  const g = parseInt(h.slice(2, 4), 16) / 255
  const b = parseInt(h.slice(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  let c = 0
  let hDeg = 0
  if (max !== min) {
    const d = max - min
    c = d / (1 - Math.abs(2 * l - 1))
    switch (max) {
      case r:
        hDeg = ((g - b) / d + (g < b ? 6 : 0)) * 60
        break
      case g:
        hDeg = ((b - r) / d + 2) * 60
        break
      default:
        hDeg = ((r - g) / d + 4) * 60
        break
    }
  }

  const C = l > 0 ? c * 0.15 : 0
  if (C < 0.001) {
    return `oklch(${l.toFixed(3)} 0 0)`
  }
  return `oklch(${l.toFixed(3)} ${C.toFixed(3)} ${hDeg.toFixed(1)})`
}

function resolve(value: string | undefined, fallback: string): string {
  if (!value) return fallback
  if (value.startsWith('#')) return hexToOklch(value) ?? fallback
  return value
}

export function SectionDivider({
  from,
  to,
  className = '',
}: SectionDividerProps) {
  const fromColor = resolve(from, 'transparent')
  const toColor = resolve(to, 'transparent')

  return (
    <div
      className={`relative w-full overflow-hidden leading-[0] ${className}`}
      aria-hidden="true"
      style={{
        background: `linear-gradient(180deg, ${fromColor} 0%, ${toColor} 100%)`,
      }}
    >
      <svg
        viewBox="0 0 1440 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative block h-10 w-full sm:h-12"
        preserveAspectRatio="none"
      >
        <path
          d="M0 40C240 72 480 8 720 40C960 72 1200 8 1440 40V64H0V40Z"
          fill={toColor}
        />
      </svg>
    </div>
  )
}
