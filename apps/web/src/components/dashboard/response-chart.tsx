"use client";

import { useState } from "react";

export interface ResponseSample {
  timestamp: number;
  responseMs: number;
}

// Validated against this app's dark chart surface (#0d1119): inside the
// lightness band, above the chroma floor, and over 3:1 contrast.
const LINE = "#6366f1";

const WIDTH = 720;
const HEIGHT = 200;
const PAD = { top: 12, right: 12, bottom: 24, left: 44 };

const PLOT_W = WIDTH - PAD.left - PAD.right;
const PLOT_H = HEIGHT - PAD.top - PAD.bottom;

function niceCeil(value: number): number {
  if (value <= 0) return 100;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / magnitude) * magnitude;
}

function formatClock(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ResponseChart({ samples }: { samples: ResponseSample[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (samples.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-slate-500">
        No response times recorded yet. Successful checks will appear here.
      </p>
    );
  }

  const minT = samples[0].timestamp;
  const maxT = samples[samples.length - 1].timestamp;
  const spanT = Math.max(1, maxT - minT);
  const maxY = niceCeil(Math.max(...samples.map((s) => s.responseMs)));

  const x = (ts: number) => PAD.left + ((ts - minT) / spanT) * PLOT_W;
  const y = (ms: number) => PAD.top + PLOT_H - (ms / maxY) * PLOT_H;

  const points = samples.map((s) => `${x(s.timestamp)},${y(s.responseMs)}`).join(" ");
  const gridValues = [0, maxY / 2, maxY];
  const active = hoverIndex === null ? null : samples[hoverIndex];

  // Nearest-point lookup: the hit area is the whole plot, not the 2px line.
  function handleMove(event: React.MouseEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const localX =
      ((event.clientX - rect.left) / rect.width) * WIDTH - PAD.left;
    const ratio = Math.min(1, Math.max(0, localX / PLOT_W));
    const target = minT + ratio * spanT;

    let nearest = 0;
    for (let i = 1; i < samples.length; i++) {
      if (
        Math.abs(samples[i].timestamp - target) <
        Math.abs(samples[nearest].timestamp - target)
      ) {
        nearest = i;
      }
    }
    setHoverIndex(nearest);
  }

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        role="img"
        aria-label={`Response time over the last ${samples.length} checks`}
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        {gridValues.map((value) => (
          <g key={value}>
            <line
              x1={PAD.left}
              x2={WIDTH - PAD.right}
              y1={y(value)}
              y2={y(value)}
              stroke="#ffffff"
              strokeOpacity={0.08}
              strokeWidth={1}
            />
            <text
              x={PAD.left - 8}
              y={y(value) + 4}
              textAnchor="end"
              className="fill-slate-500"
              fontSize={11}
            >
              {Math.round(value)}
            </text>
          </g>
        ))}

        <text x={PAD.left} y={HEIGHT - 6} className="fill-slate-500" fontSize={11}>
          {formatClock(minT)}
        </text>
        <text
          x={WIDTH - PAD.right}
          y={HEIGHT - 6}
          textAnchor="end"
          className="fill-slate-500"
          fontSize={11}
        >
          {formatClock(maxT)}
        </text>

        <polyline
          points={points}
          fill="none"
          stroke={LINE}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {active ? (
          <g>
            <line
              x1={x(active.timestamp)}
              x2={x(active.timestamp)}
              y1={PAD.top}
              y2={PAD.top + PLOT_H}
              stroke="#ffffff"
              strokeOpacity={0.25}
              strokeWidth={1}
            />
            {/* 2px surface ring keeps the marker readable over the line */}
            <circle
              cx={x(active.timestamp)}
              cy={y(active.responseMs)}
              r={5}
              fill={LINE}
              stroke="#0d1119"
              strokeWidth={2}
            />
          </g>
        ) : null}
      </svg>

      {active ? (
        <div
          className="pointer-events-none absolute -translate-x-1/2 rounded-lg border border-white/10 bg-[#0b1324] px-2.5 py-1.5 text-xs whitespace-nowrap text-slate-200 shadow-lg"
          style={{
            left: `${(x(active.timestamp) / WIDTH) * 100}%`,
            top: 0,
          }}
        >
          <span className="font-medium text-white">{active.responseMs} ms</span>
          <span className="mx-1.5 text-slate-600">·</span>
          {formatClock(active.timestamp)}
        </div>
      ) : null}
    </div>
  );
}
