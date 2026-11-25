import React from 'react';
import { User } from 'lucide-react';

export default function Header({ onReset, hasData }) {
  return (
    <header
      style={{
        flexShrink: 0,
        width: '100%',
        maxWidth: 440,
        margin: '0 auto',
        background: 'rgba(251, 244, 235, 0.94)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 'max(14px, env(safe-area-inset-top, 14px))',
        paddingBottom: 12,
        paddingLeft: 16,
        paddingRight: 16,
        zIndex: 50,
        boxSizing: 'border-box',
        position: 'sticky',
        top: 0,
        borderBottom: '1px solid rgba(232, 217, 200, 0.65)',
      }}
      className="select-none"
    >
      {/* Left: ReA Logo Icon + Two-tone Brand Wordmark matching dilwali /wallet top nav */}
      <div
        onClick={onReset}
        className="flex items-center gap-2.5 cursor-pointer active:scale-95 transition-transform"
        title="ReA — New Resume Scan"
      >
        <img
          src="/header_logo.png"
          alt="ReA"
          className="h-7 w-auto object-contain drop-shadow-sm"
          onError={(e) => {
            e.currentTarget.src = '/logo.png';
          }}
        />
        <span className="text-[22px] font-black tracking-tight leading-none font-sans">
          <span className="text-[#1C1510]">Re</span>
          <span className="text-[#9C5A25]">A</span>
        </span>
      </div>

      {/* Right: Soft Neumorphic Circular Profile/Reset Button matching dilwali /wallet */}
      <button
        type="button"
        onClick={onReset}
        className="w-[40px] h-[40px] rounded-full flex items-center justify-center text-[#4D3524] active:scale-95 transition-transform cursor-pointer outline-none"
        style={{
          background: 'linear-gradient(145deg, #ffffff 0%, #f5ebe0 100%)',
          boxShadow:
            '5px 6px 12px rgba(180, 145, 112, 0.24), -4px -4px 10px rgba(255, 255, 255, 0.96), inset 1px 1px 1.5px rgba(255, 255, 255, 0.95)',
        }}
        title={hasData ? 'Scan Another Resume' : 'ReA Smart ATS Profile'}
        aria-label="Profile / Reset Scan"
      >
        <User className="w-[19px] h-[19px] stroke-[2.1] text-[#4D3524]" />
      </button>
    </header>
  );
}
