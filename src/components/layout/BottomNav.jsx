import React from 'react';
import { Home, Briefcase, Sparkles, MessageSquare } from 'lucide-react';

// Custom 3 ascending bar chart icon matching Screenshots 1, 2, 3, 4
function ScoreBarsIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 20v-5h3v5" />
      <path d="M10.5 20V10h3v10" />
      <path d="M16 20V5h3v15" />
    </svg>
  );
}

// 4-point sparkle star icon matching Screenshot 2 & 3
function FourPointStarIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 3L14.5 9.5L21 12L14.5 14.5L12 21L9.5 14.5L3 12L9.5 9.5L12 3Z" />
    </svg>
  );
}

const TABS = [
  { id: 'upload', label: 'Home', Icon: Home },
  { id: 'score', label: 'Score', Icon: ScoreBarsIcon },
  { id: 'jobs', label: 'Jobs', Icon: Briefcase },
  { id: 'bullets', label: 'STAR', Icon: FourPointStarIcon },
  { id: 'interview', label: 'Viva', Icon: MessageSquare },
];

export default function BottomNav({ activeTab, onChangeTab, hasData, onNeedResume }) {
  const handleClick = (tabId) => {
    if (tabId !== 'upload' && !hasData) {
      if (onNeedResume) onNeedResume();
      return;
    }
    onChangeTab(tabId);
  };

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-[max(14px,env(safe-area-inset-bottom,14px))] left-1/2 -translate-x-1/2 w-[calc(100%-26px)] max-w-[396px] h-[68px] z-50 select-none"
    >
      <div
        className="w-full h-full rounded-[34px] flex items-center justify-between px-2.5 border border-white/95 shadow-[0_8px_24px_rgba(140,95,55,0.16),inset_0_1px_1px_#ffffff]"
        style={{
          background: 'linear-gradient(180deg, #FDF9F4 0%, #F5ECE0 100%)',
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id || (tab.id === 'score' && activeTab === 'scorecard');
          const Icon = tab.Icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleClick(tab.id)}
              aria-label={tab.label}
              className="flex-1 h-full flex items-center justify-center outline-none cursor-pointer"
            >
              {isActive ? (
                <div
                  className="w-[62px] h-[52px] rounded-[22px] flex flex-col items-center justify-center gap-0.5 text-white shadow-[0_4px_12px_rgba(140,77,25,0.38)] transition-all duration-200"
                  style={{
                    background: 'linear-gradient(180deg, #C07735 0%, #8C4D19 100%)',
                  }}
                >
                  <Icon className="w-[19px] h-[19px] stroke-[2.1] text-white" />
                  <span className="text-[10px] font-bold leading-none tracking-tight text-white">
                    {tab.label}
                  </span>
                </div>
              ) : (
                <div className={`w-[58px] h-[50px] flex flex-col items-center justify-center gap-1 transition-colors ${!hasData && tab.id !== 'upload' ? 'text-[#A89686] opacity-70' : 'text-[#5E4A3A] hover:text-[#2A190E]'}`}>
                  <Icon className="w-[19px] h-[19px] stroke-[1.75]" />
                  <span className="text-[10px] font-semibold leading-none tracking-tight">
                    {tab.label}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
