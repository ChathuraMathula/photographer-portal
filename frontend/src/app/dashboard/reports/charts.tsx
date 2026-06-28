"use client";

import React, { useState } from "react";

type ChartDataPoint = {
  label: string;
  bookings: number;
  revenueLkr: number;
};

// ── Revenue Area Chart ────────────────────────────────────────────────────────

export function RevenueAreaChart({ data }: { data: ChartDataPoint[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/20">
        <p className="text-body-caption text-zinc-400 italic">No timeline data available</p>
      </div>
    );
  }

  const padding = 40;
  const width = 500;
  const height = 240;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const maxVal = Math.max(...data.map(d => d.revenueLkr), 1000);
  const getX = (index: number) => padding + (index / (data.length - 1)) * chartWidth;
  const getY = (val: number) => padding + chartHeight - (val / maxVal) * chartHeight;

  // Generate path points
  const points = data.map((d, i) => ({ x: getX(i), y: getY(d.revenueLkr) }));
  
  // Construct svg path commands
  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  // Area path (closes at the bottom)
  const areaD = points.length > 0 
    ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
    : "";

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding + ratio * chartHeight;
          const val = maxVal * (1 - ratio);
          return (
            <g key={i} className="opacity-40">
              <line 
                x1={padding} 
                y1={y} 
                x2={width - padding} 
                y2={y} 
                stroke="#e4e4e7" 
                strokeWidth={1}
                strokeDasharray="4,4"
              />
              <text 
                x={padding - 8} 
                y={y + 3} 
                className="text-[9px] fill-zinc-400 font-sans text-right"
                textAnchor="end"
              >
                LKR {Math.round(val).toLocaleString()}
              </text>
            </g>
          );
        })}

        {/* Chart Area Fill */}
        {areaD && <path d={areaD} fill="url(#areaGrad)" />}

        {/* Chart Line */}
        {pathD && (
          <path 
            d={pathD} 
            fill="none" 
            stroke="#2563eb" 
            strokeWidth={2.5} 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        )}

        {/* Data Interaction Points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={hoveredIdx === i ? 6 : 4}
              className={`fill-white stroke-blue-600 transition-all duration-150 cursor-pointer ${
                hoveredIdx === i ? "stroke-[3px]" : "stroke-2"
              }`}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
            {/* Axis Label */}
            <text
              x={p.x}
              y={height - padding + 15}
              className="text-[9px] fill-zinc-400 font-sans"
              textAnchor="middle"
            >
              {data[i].label}
            </text>
          </g>
        ))}
      </svg>

      {/* Tooltip Overlay */}
      {hoveredIdx !== null && (
        <div 
          className="absolute bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-3 py-1.5 rounded-lg shadow-md pointer-events-none text-xs font-sans animate-in fade-in zoom-in-95 duration-100"
          style={{
            left: `${(points[hoveredIdx].x / width) * 100}%`,
            top: `${(points[hoveredIdx].y / height) * 100 - 15}%`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="font-semibold text-[10px] opacity-75">{data[hoveredIdx].label}</div>
          <div className="font-bold">LKR {data[hoveredIdx].revenueLkr.toLocaleString()}</div>
          <div className="text-[10px] text-zinc-350 dark:text-zinc-550">{data[hoveredIdx].bookings} Booking(s)</div>
        </div>
      )}
    </div>
  );
}

// ── Booking Status Donut Chart ──────────────────────────────────────────────────

type DonutDataPoint = {
  name: string;
  value: number;
};

export function BookingStatusDonut({ data }: { data: DonutDataPoint[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <div className="h-64 flex items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/20">
        <p className="text-body-caption text-zinc-400 italic">No bookings recorded in this range</p>
      </div>
    );
  }

  // Segment colors
  const colors: Record<string, string> = {
    PENDING: "#f59e0b",   // amber-500
    PROPOSED: "#3b82f6",  // blue-500
    CONFIRMED: "#10b981", // emerald-500
    COMPLETED: "#6366f1", // indigo-500
    CANCELLED: "#ef4444", // red-500
    REJECTED: "#6b7280",  // gray-500
  };

  const center = 100;
  const radius = 70;
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
      {/* SVG Ring */}
      <div className="relative w-44 h-44">
        <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#f4f4f5"
            strokeWidth={strokeWidth}
          />
          {data.map((d, i) => {
            if (d.value === 0) return null;
            const percentage = d.value / total;
            const strokeLength = percentage * circumference;
            const strokeOffset = currentOffset;
            currentOffset += strokeLength;

            return (
              <circle
                key={i}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={colors[d.name] || "#a1a1aa"}
                strokeWidth={strokeWidth}
                strokeDasharray={`${strokeLength} ${circumference}`}
                strokeDashoffset={-strokeOffset}
                className="transition-all duration-300"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center font-sans">
          <span className="text-title-large font-extrabold text-zinc-800 dark:text-white leading-none">{total}</span>
          <span className="text-[10px] text-zinc-400 font-medium tracking-wider uppercase mt-1">Bookings</span>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {data.map((d, i) => {
          if (d.value === 0) return null;
          const percentage = Math.round((d.value / total) * 100);
          return (
            <div key={i} className="flex items-center gap-3 text-body-small">
              <span 
                className="h-3 w-3 rounded-full shrink-0" 
                style={{ backgroundColor: colors[d.name] || "#a1a1aa" }}
              />
              <span className="font-semibold text-zinc-700 dark:text-zinc-300 w-24 truncate">{d.name}</span>
              <span className="text-zinc-500 font-medium">{d.value} ({percentage}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Package Performance Bar Chart ───────────────────────────────────────────────

type PackageDataPoint = {
  name: string;
  count: number;
  revenueLkr: number;
};

export function PackagePerformanceBar({ data }: { data: PackageDataPoint[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/20">
        <p className="text-body-caption text-zinc-400 italic">No package statistics available</p>
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map(d => d.revenueLkr), 1000);

  return (
    <div className="space-y-4 font-sans">
      {data.map((pkg, i) => {
        const percentage = Math.min(100, (pkg.revenueLkr / maxRevenue) * 100);
        return (
          <div key={i} className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate pr-4">{pkg.name}</span>
              <span className="text-zinc-500 shrink-0 font-semibold">
                LKR {pkg.revenueLkr.toLocaleString()} ({pkg.count} Booking{pkg.count !== 1 ? "s" : ""})
              </span>
            </div>
            <div className="h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500" 
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
