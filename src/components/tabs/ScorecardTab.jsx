import React from 'react';
import RadialGauge from '../ui/RadialGauge';
import {
  AlertTriangle,
  CheckCircle2,
  Trophy,
  Code2,
  Star,
  Layers,
  FileText,
} from 'lucide-react';

// Ascending 3-bar icon matching Evaluation Breakdown header
function BreakdownBarsIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <rect x="4" y="13" width="3.5" height="7" rx="1.2" />
      <rect x="10" y="9" width="3.5" height="11" rx="1.2" />
      <rect x="16" y="4" width="3.5" height="16" rx="1.2" />
    </svg>
  );
}

export default function ScorecardTab({ data }) {
  if (!data) return null;

  const {
    atsScore = 82,
    candidateName = 'Candidate Resume',
    profileRole = 'Software Engineer',
    experienceLevel = 'Fresher',
    categoryScores = {},
    verdict = 'Competitive',
    summary = '',
    strengths = [],
    criticalWarnings = [],
    isOfflineFallback = false,
  } = data;

  const categories = [
    { label: 'Impact & Quantified Metrics', score: categoryScores.impact ?? 18, max: 25, Icon: Code2, iconColor: 'text-[#A76524]' },
    { label: 'Action Verbs & Clarity', score: categoryScores.brevity ?? 20, max: 25, Icon: Star, iconColor: 'text-[#D4882A]', fillIcon: true },
    { label: 'Technical Skill Display', score: categoryScores.skills ?? 22, max: 25, Icon: Layers, iconColor: 'text-[#A76524]' },
    { label: 'ATS Document Readability', score: categoryScores.structure ?? 22, max: 25, Icon: FileText, iconColor: 'text-[#B46924]' },
  ];

  return (
    <div className="space-y-4 pb-6 px-1">
      {/* 1. Hero Score Showcase Card (matching Screenshot 1) */}
      <div className="rounded-[24px] bg-[#FFFDFB] border border-[#EFE4D4] border-t-[3px] border-t-[#A45E25] shadow-[0_6px_24px_-4px_rgba(140,95,55,0.08)] p-5 text-center relative overflow-hidden">
        {/* Subtle organic beige curves inside card */}
        <div className="absolute -top-10 -left-10 w-36 h-36 rounded-full bg-[#F5EBE0]/60 pointer-events-none" />
        <div className="absolute top-16 -right-12 w-40 h-40 rounded-full bg-[#F5EBE0]/50 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Candidate Name right above ATS score */}
          {candidateName && (
            <div className="mb-2.5 flex flex-col items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#9C5A25]">
                Resume Report
              </span>
              <h2 className="text-[19px] font-extrabold text-[#2A190E] tracking-tight leading-snug">
                {candidateName}
              </h2>
            </div>
          )}

          <RadialGauge score={atsScore} size={160} strokeWidth={13} />

          {/* Stacked Pill Badges matching Screenshot 1 */}
          <div className="mt-3 flex flex-col items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E3F5E6] border border-[#BFE8C7] text-[#1D7A38] text-[11.5px] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 fill-[#1D7A38] text-white" />
              <span>{isOfflineFallback ? 'Heuristic Analysis Complete' : 'AI Analysis Complete'}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FDF2D6] border border-[#F3D89B] text-[#9A5B13] text-[11.5px] font-bold">
              <Trophy className="w-3.5 h-3.5 text-[#B46918]" />
              <span>{verdict}</span>
            </div>
          </div>

          {summary && (
            <p className="text-[12.5px] leading-[1.55] text-[#4E3D31] font-medium mt-3.5 px-1">
              {summary}
            </p>
          )}

          {/* Profile Metadata Footer matching Screenshot 1 */}
          <div className="w-full mt-4 pt-3 border-t border-[#EFE5D8] flex items-center justify-center gap-3 text-[11.5px]">
            <span className="text-[#7D6959]">
              Profile: <strong className="text-[#2A190E] font-bold">{profileRole}</strong>
            </span>
            <span className="text-[#D6C7B5]">|</span>
            <span className="text-[#7D6959]">
              Experience: <strong className="text-[#2A190E] font-bold">{experienceLevel}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Evaluation Breakdown Card (matching Screenshot 1) */}
      <div className="rounded-[22px] bg-[#FFFDFB] border border-[#EFE4D4] shadow-[0_4px_20px_-4px_rgba(140,95,55,0.07)] p-4.5 p-4 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BreakdownBarsIcon className="w-4 h-4 text-[#B46924]" />
            <h2 className="text-[14.5px] font-extrabold text-[#2A190E] tracking-tight">
              Evaluation Breakdown
            </h2>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[#FAF0E1] border border-[#EDD8BA] text-[#8E5320] text-[10.5px] font-bold">
            4 Areas Analyzed
          </span>
        </div>

        <div className="space-y-3">
          {categories.map((cat) => {
            const Icon = cat.Icon;
            const pct = Math.min(100, Math.round((cat.score / cat.max) * 100));

            return (
              <div key={cat.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-2 text-[#2A190E] font-bold">
                    <Icon
                      className={`w-4 h-4 ${cat.iconColor} ${cat.fillIcon ? 'fill-[#D4882A]' : ''}`}
                      strokeWidth={2.1}
                    />
                    <span>{cat.label}</span>
                  </div>
                  <span className="text-[12px] font-bold text-[#2A190E] tabular-nums">
                    {cat.score} <span className="text-[#8C7A6B] font-medium">/ {cat.max}</span>
                  </span>
                </div>
                <div className="h-[7px] w-full rounded-full bg-[#F3ECE2] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#D68C3E] to-[#9E5618] transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Key Recommendations Card (matching Screenshot 1) */}
      {criticalWarnings.length > 0 && (
        <div className="rounded-[22px] bg-[#FEF8E6] border border-[#F3DFAD] shadow-sm p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-[#3D240B] font-extrabold text-[14px]">
            <AlertTriangle className="w-4 h-4 text-[#C97A16] flex-shrink-0" strokeWidth={2.2} />
            <span>Key Recommendations</span>
          </div>
          <ul className="space-y-1.5 pl-1">
            {criticalWarnings.map((warning, i) => (
              <li key={i} className="text-[12px] text-[#4E3B25] flex items-start gap-2.5 leading-[1.45] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D9821E] mt-1.5 flex-shrink-0" />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 4. Identified Strengths Card (matching clean aesthetic) */}
      {strengths.length > 0 && (
        <div className="rounded-[22px] bg-[#F2FAF4] border border-[#CBEAD2] shadow-sm p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-[#164A27] font-extrabold text-[14px]">
            <CheckCircle2 className="w-4 h-4 text-[#1D7A38] flex-shrink-0" strokeWidth={2.2} />
            <span>Identified Key Strengths</span>
          </div>
          <ul className="space-y-1.5 pl-1">
            {strengths.map((strength, i) => (
              <li key={i} className="text-[12px] text-[#215230] flex items-start gap-2.5 leading-[1.45] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1D7A38] mt-1.5 flex-shrink-0" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
