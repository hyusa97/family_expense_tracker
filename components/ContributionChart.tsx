"use client";

import { ContributorStats } from "@/types";
import { formatCurrency } from "@/lib/calculations";

const COLORS = ["#818cf8", "#34d399", "#fb923c", "#f472b6"];

interface ContributionChartProps {
  stats: ContributorStats[];
}

export default function ContributionChart({ stats }: ContributionChartProps) {
  const total = stats.reduce((s, c) => s + c.contributed, 0);

  // Build SVG donut slices
  const cx = 80;
  const cy = 80;
  const r = 64;
  const innerR = 44;
  const gap = 2;

  function polarToCartesian(angle: number, radius: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  }

  function describeArc(startAngle: number, endAngle: number, radius: number, iR: number) {
    const start = polarToCartesian(startAngle + gap / 2, radius);
    const end = polarToCartesian(endAngle - gap / 2, radius);
    const startInner = polarToCartesian(startAngle + gap / 2, iR);
    const endInner = polarToCartesian(endAngle - gap / 2, iR);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} L ${endInner.x} ${endInner.y} A ${iR} ${iR} 0 ${largeArc} 0 ${startInner.x} ${startInner.y} Z`;
  }

  let currentAngle = 0;
  const slices = stats.map((s, i) => {
    const pct = total > 0 ? s.contributed / total : 0.25;
    const angle = pct * 360;
    const path = describeArc(currentAngle, currentAngle + angle, r, innerR);
    currentAngle += angle;
    return { ...s, path, color: COLORS[i] };
  });

  return (
    <div className="glass rounded-2xl border border-white/[0.06] p-5">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">Contribution Distribution</h3>
      <div className="flex items-center gap-6">
        <div className="relative flex-shrink-0">
          <svg width="160" height="160" viewBox="0 0 160 160">
            {slices.map((slice, i) => (
              <path
                key={i}
                d={slice.path}
                fill={slice.color}
                opacity={slice.contributed > 0 ? 0.85 : 0.15}
                className="transition-all duration-300 hover:opacity-100"
              />
            ))}
            {/* Center text */}
            <text x={cx} y={cy - 6} textAnchor="middle" fill="#9ca3af" fontSize="10" fontFamily="Sora">
              Total
            </text>
            <text x={cx} y={cy + 10} textAnchor="middle" fill="white" fontSize="12" fontWeight="600" fontFamily="JetBrains Mono">
              {total > 0 ? `₹${(total / 1000).toFixed(1)}k` : "₹0"}
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2.5">
          {slices.map((slice, i) => {
            const pct = total > 0 ? ((slice.contributed / total) * 100).toFixed(1) : "0";
            return (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="text-xs text-gray-400 truncate max-w-[100px]">
                    {slice.name.split(" ")[0]}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono-jet font-medium text-white">
                    {pct}%
                  </span>
                  <div className="text-xs text-gray-600 font-mono-jet">
                    {formatCurrency(slice.contributed)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
