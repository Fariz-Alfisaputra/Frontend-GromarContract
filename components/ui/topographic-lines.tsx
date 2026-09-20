interface TopographicLinesProps {
  className?: string
  color?: string
  opacity?: number
}

type Cluster = {
  cx: number
  cy: number
  rx: number
  ry: number
  rings: number
}

function ovalPath(cx: number, cy: number, rx: number, ry: number): string {
  const k = 0.5523
  const ox = rx * k
  const oy = ry * k
  return [
    `M${cx - rx} ${cy}`,
    `C${cx - rx} ${cy - oy} ${cx - ox} ${cy - ry} ${cx} ${cy - ry}`,
    `C${cx + ox} ${cy - ry} ${cx + rx} ${cy - oy} ${cx + rx} ${cy}`,
    `C${cx + rx} ${cy + oy} ${cx + ox} ${cy + ry} ${cx} ${cy + ry}`,
    `C${cx - ox} ${cy + ry} ${cx - rx} ${cy + oy} ${cx - rx} ${cy}`,
    'Z',
  ].join(' ')
}

const CLUSTERS: Cluster[] = [
  { cx: 220, cy: 520, rx: 150, ry: 100, rings: 5 },
  { cx: 1280, cy: 150, rx: 170, ry: 120, rings: 5 },
  { cx: 900, cy: 430, rx: 90, ry: 65, rings: 4 },
  { cx: 560, cy: 120, rx: 110, ry: 70, rings: 4 },
  { cx: 130, cy: 180, rx: 80, ry: 60, rings: 3 },
  { cx: 1180, cy: 520, rx: 70, ry: 50, rings: 3 },
]

export function TopographicLines({
  className = '',
  color = 'currentColor',
  opacity = 0.18,
}: TopographicLinesProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 1440 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        {CLUSTERS.map((cluster, ci) => {
          const paths = []
          for (let r = 0; r < cluster.rings; r++) {
            const scale = 1 - r / (cluster.rings + 0.5)
            const rx = Math.max(18, cluster.rx * scale)
            const ry = Math.max(14, cluster.ry * scale)
            const cx = cluster.cx + r * 4
            const cy = cluster.cy - r * 3
            paths.push(
              <path
                key={`${ci}-${r}`}
                d={ovalPath(cx, cy, rx, ry)}
                stroke={color}
                strokeWidth="1.2"
                fill="none"
                opacity={opacity}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )
          }
          return <g key={ci}>{paths}</g>
        })}
      </svg>
    </div>
  )
}
