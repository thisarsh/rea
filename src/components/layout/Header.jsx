import React from 'react';
import { User } from 'lucide-react';

export default function Header({ onReset, hasData }) {
  return (
    <header className="sticky top-0 z-40 w-full max-w-[440px] mx-auto bg-[#FBF4EB]/95 backdrop-blur-md px-5 pt-[max(14px,env(safe-area-inset-top,14px))] pb-2.5 flex items-center justify-between select-none">
      {/* Left: ReA Logo Icon + Two-tone Brand Wordmark matching reference UI */}
      <div 
        onClick={onReset}
        className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
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
        <span className="text-[22px] font-black tracking-tight leading-none">
          <span className="text-[#1C1510]">Re</span>
          <span className="text-[#9C5A25]">A</span>
        </span>
      </div>

      {/* Right: Clean Circular Profile/Action Button matching all 5 reference screens */}
      <button
        type="button"
        onClick={onReset}
        className="w-10 h-10 rounded-full bg-[#F5EBE0] border border-[#E8D9C8] shadow-[1px_2px_6px_rgba(140,95,55,0.12)] flex items-center justify-center text-[#4D3524] hover:border-[#B26E33] active:scale-92 transition-all cursor-pointer"
        title={hasData ? 'Scan Another Resume' : 'ReA Smart ATS Profile'}
        aria-label="Profile / Reset Scan"
      >
        <User className="w-5 h-5 stroke-[1.8] text-[#4D3524]" />
      </button>
    </header>
  );
}
