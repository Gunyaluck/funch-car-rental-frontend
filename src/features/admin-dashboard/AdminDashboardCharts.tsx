import type { ChartItem } from './types'

export function MiniBarChart({ items }: { items: ChartItem[] }) {
  const maxValue = Math.max(...items.map((item) => item.value), 1)

  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <div key={item.label} className="grid gap-1">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-stone-700">{item.label}</span>
            <span className="text-stone-500">{item.value}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-black/5">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(item.value / maxValue) * 100}%`,
                background: item.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export function MiniLineChart({ items }: { items: ChartItem[] }) {
  const width = 360
  const height = 140
  const padding = 18
  const maxValue = Math.max(...items.map((item) => item.value), 1)
  const stepX = items.length > 1 ? (width - padding * 2) / (items.length - 1) : 0
  const points = items.map((item, index) => {
    const x = padding + index * stepX
    const y = height - padding - ((item.value / maxValue) * (height - padding * 2))
    return { ...item, x, y }
  })
  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')
  const areaPath = `${linePath} L ${points.at(-1)?.x ?? padding} ${height - padding} L ${
    points[0]?.x ?? padding
  } ${height - padding} Z`

  return (
    <div className="grid gap-3">
      <div className="overflow-hidden rounded-[24px] border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(244,239,228,0.58))] p-3">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-40 w-full">
          <defs>
            <linearGradient id="dashboardTrendFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(35,88,63,0.32)" />
              <stop offset="100%" stopColor="rgba(35,88,63,0.04)" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((ratio) => (
            <line
              key={ratio}
              x1={padding}
              x2={width - padding}
              y1={padding + ratio * (height - padding * 2)}
              y2={padding + ratio * (height - padding * 2)}
              stroke="rgba(0,0,0,0.08)"
              strokeDasharray="4 6"
            />
          ))}
          <path d={areaPath} fill="url(#dashboardTrendFill)" />
          <path d={linePath} fill="none" stroke="rgb(35,88,63)" strokeWidth="3" strokeLinecap="round" />
          {points.map((point) => (
            <g key={point.label}>
              <circle cx={point.x} cy={point.y} r="4.5" fill="rgb(35,88,63)" />
              <text x={point.x} y={height - 2} textAnchor="middle" fontSize="10" fill="rgb(120,113,108)">
                {point.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
}
