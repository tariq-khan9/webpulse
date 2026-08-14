/* Build a smooth-ish SVG path from a series of values normalized to the viewbox. */
function buildPath(values: number[], width: number, height: number, pad = 4) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = (width - pad * 2) / (values.length - 1);

  const points = values.map((v, i) => {
    const x = pad + i * stepX;
    const y = pad + (height - pad * 2) * (1 - (v - min) / range);
    return [x, y] as const;
  });

  const d = points
    .map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`))
    .join(" ");

  const area = `${d} L ${points[points.length - 1][0]} ${height} L ${points[0][0]} ${height} Z`;

  return { d, area, points };
}

type LineChartProps = {
  data: number[];
  className?: string;
  color?: string;
  height?: number;
  width?: number;
  showDots?: boolean;
  strokeWidth?: number;
};

export function LineChart({
  data,
  className,
  color = "var(--chart-1)",
  height = 160,
  width = 640,
  showDots = false,
  strokeWidth = 2,
}: LineChartProps) {
  const { d, area, points } = buildPath(data, width, height);
  const gradId = `line-grad-${color.replace(/[^a-z0-9]/gi, "")}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`h-full w-full ${className}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {showDots &&
        points.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2.5" fill={color} />
        ))}
    </svg>
  );
}

type UptimeBarsProps = {
  /* Each value is a fraction 0..1 of uptime for that bar. */
  data: number[];
  className?: string;
};

export function UptimeBars({ data, className }: UptimeBarsProps) {
  return (
    <div className={`flex h-full items-stretch gap-[3px] ${className}`}>
      {data.map((v, i) => {
        const status =
          v >= 0.999
            ? "bg-success"
            : v >= 0.9
              ? "bg-warning"
              : "bg-destructive";
        return (
          <div
            key={i}
            className={`flex-1 rounded-[2px] transition-colors ${status} ${
              v >= 0.999 ? "opacity-90" : "opacity-100"
            }`}
            title={`${(v * 100).toFixed(2)}% uptime`}
          />
        );
      })}
    </div>
  );
}
