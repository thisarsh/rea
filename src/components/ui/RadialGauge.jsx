import React from 'react';

export default function RadialGauge({ score = 0, size = 162, strokeWidth = 14 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(Math.max(score, 0), 100);
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center relative">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          <defs>
            <linearGradient id="caramelGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9A5114" />
              <stop offset="50%" stopColor="#CC7D2E" />
              <stop offset="100%" stopColor="#E49E48" />
            </linearGradient>
            <filter id="gaugeGlow" x="-15%" y="-15%" width="130%" height="130%">
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#B86F2C" floodOpacity="0.22" />
            </filter>
          </defs>

          {/* Background Track in Warm Cream/Beige */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#EAE2D8"
            strokeWidth={strokeWidth}
          />

          {/* Animated Score Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#caramelGaugeGrad)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter="url(#gaugeGlow)"
            style={{ transition: 'stroke-dashoffset 0.95s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        </svg>

        {/* Center Score Readout matching Screenshot 1 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[44px] font-black tracking-tight text-[#2A190E] leading-none">
            {clampedScore}
          </span>
          <span className="text-[12px] font-medium text-[#685547] mt-1">
            Out of 100
          </span>
        </div>
      </div>
    </div>
  );
}
