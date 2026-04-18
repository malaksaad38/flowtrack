"use client";

const PALETTE = [
  "hsl(142,72%,36%)",
  "hsl(217,91%,60%)",
  "hsl(262,80%,58%)",
  "hsl(330,80%,58%)",
  "hsl(25,90%,55%)",
  "hsl(48,96%,48%)",
  "hsl(188,74%,44%)",
];

interface DonutChartProps {
  data: { label: string; value: number }[];
}

export function DonutChart({ data }: DonutChartProps) {
  const filtered = data.filter((d) => d.value > 0);

  if (!filtered.length) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        No data this month
      </div>
    );
  }

  const total = filtered.reduce((s, d) => s + d.value, 0);
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const r = 58;
  const innerR = 34;

  let startAngle = -Math.PI / 2;

  const slices = filtered.map((d, i) => {
    const angle = (d.value / total) * 2 * Math.PI;
    const endAngle = startAngle + angle;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);

    const ix1 = cx + innerR * Math.cos(endAngle);
    const iy1 = cy + innerR * Math.sin(endAngle);
    const ix2 = cx + innerR * Math.cos(startAngle);
    const iy2 = cy + innerR * Math.sin(startAngle);

    const largeArc = angle > Math.PI ? 1 : 0;

    const path = [
      `M ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix1} ${iy1}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2}`,
      "Z",
    ].join(" ");

    const result = { path, color: PALETTE[i % PALETTE.length], label: d.label, value: d.value, pct: ((d.value / total) * 100).toFixed(0) };
    startAngle = endAngle;
    return result;
  });

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-40 flex-shrink-0">
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} stroke="hsl(var(--background))" strokeWidth={1.5} />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" className="text-[11px] font-semibold fill-foreground" fontSize={11}>
          Total
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" className="text-[9px] fill-muted-foreground" fontSize={9}>
          {filtered.length} categories
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs">
            <span className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
            <span className="text-foreground font-medium">{s.label}</span>
            <span className="text-muted-foreground">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
