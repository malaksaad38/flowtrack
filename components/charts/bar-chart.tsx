"use client";

interface BarChartProps {
  data: { label: string; value: number }[];
  height?: number;
}

export function BarChart({ data, height = 160 }: BarChartProps) {
  if (!data.length) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        No data this month
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1);
  const barWidth = Math.max(4, Math.floor(400 / data.length) - 4);
  const gap = 4;
  const totalWidth = data.length * (barWidth + gap);
  const padTop = 8;
  const padBottom = 24;
  const chartHeight = height - padTop - padBottom;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${Math.max(totalWidth, 300)} ${height}`}
        className="w-full"
        preserveAspectRatio="none"
        style={{ minHeight: height }}
      >
        {data.map((d, i) => {
          const barH = Math.max(2, (d.value / max) * chartHeight);
          const x = i * (barWidth + gap);
          const y = padTop + chartHeight - barH;

          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                rx={3}
                className="fill-primary opacity-80"
              />
              {/* Day label — show every 5th or every label if sparse */}
              {(data.length <= 15 || i % 5 === 0) && (
                <text
                  x={x + barWidth / 2}
                  y={height - 4}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[9px]"
                  fontSize={9}
                >
                  {d.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
