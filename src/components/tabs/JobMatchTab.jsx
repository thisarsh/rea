import React, { useState } from 'react';
import {
  Briefcase,
  Layers,
  Cpu,
  Code2,
  Database,
  Globe,
  SlidersHorizontal,
  ArrowUpRight,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

// Small inline icons matching Screenshot 2
function DemandBarsIcon({ className }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
      <rect x="2" y="10" width="2.5" height="4" rx="0.6" />
      <rect x="6.5" y="7" width="2.5" height="7" rx="0.6" />
      <rect x="11" y="3" width="2.5" height="11" rx="0.6" />
    </svg>
  );
}

function GoogleGIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

const JOB_CARD_STYLES = [
  { bg: 'bg-[#FBF0E4]', text: 'text-[#B86E2A]', Icon: Layers },
  { bg: 'bg-[#F2ECFE]', text: 'text-[#6B21A8]', Icon: Cpu },
  { bg: 'bg-[#EBF2FE]', text: 'text-[#1D4ED8]', Icon: Code2 },
  { bg: 'bg-[#E3F5E6]', text: 'text-[#15803D]', Icon: Database },
  { bg: 'bg-[#FFF3E0]', text: 'text-[#D97706]', Icon: Globe },
];

export default function JobMatchTab({ data }) {
  if (!data) return null;

  const { matchingJobs = [], extractedSkills = [] } = data;
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...new Set(extractedSkills.map((s) => s.category).filter(Boolean))];
  const filteredSkills =
    selectedCategory === 'All'
      ? extractedSkills
      : extractedSkills.filter((s) => s.category === selectedCategory);

  return (
    <div className="space-y-4 pb-6 px-1">
      {/* Page Header matching Screenshot 2 */}
      <div className="flex items-start gap-3 px-0.5 pt-1">
        <div className="w-11 h-11 rounded-[14px] bg-[#F8EFE4] border border-[#EADBC8] shadow-sm flex items-center justify-center flex-shrink-0">
          <Briefcase className="w-5 h-5 text-[#8C5020]" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-[16.5px] font-extrabold text-[#2A190E] leading-tight tracking-tight truncate">
              Top Matching Job Roles
            </h1>
            <span className="px-2.5 py-1 rounded-full bg-[#FCEFD8] border border-[#F0D5A8] text-[#8E5320] text-[10.5px] font-bold inline-flex items-center gap-1 whitespace-nowrap flex-shrink-0">
              <SlidersHorizontal className="w-3 h-3" />
              <span>Sorted by Fit</span>
            </span>
          </div>
          <p className="text-[11.5px] text-[#756252] mt-0.5 leading-snug font-medium">
            Curated job roles based on your resume, skills, and projects.
          </p>
        </div>
      </div>

      {/* Job Role Cards matching Screenshot 2 */}
      <div className="space-y-3.5">
        {matchingJobs.map((job, idx) => {
          const style = JOB_CARD_STYLES[idx % JOB_CARD_STYLES.length];
          const CardIcon = style.Icon;
          const matchBadge =
            job.matchPercentage >= 80
              ? 'bg-[#E0F5E4] text-[#15803D]'
              : job.matchPercentage >= 65
              ? 'bg-[#FCEFD8] text-[#9A5B13]'
              : 'bg-[#FEF3C7] text-[#B45309]';

          return (
            <div
              key={idx}
              className="rounded-[22px] bg-[#FFFDFB] border border-[#EFE4D4] shadow-[0_4px_20px_-4px_rgba(140,95,55,0.07)] p-4 space-y-3"
            >
              {/* Top Row: Icon + Title/Meta + Match Pill */}
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-[12px] ${style.bg} ${style.text} flex items-center justify-center flex-shrink-0`}
                  >
                    <CardIcon className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[13.5px] font-extrabold text-[#2A190E] leading-snug">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 text-[11.5px] text-[#6E5C4E] font-medium flex-wrap">
                      <span className="font-semibold text-[#4E3D31]">{job.salary || '₹7L – ₹12L'}</span>
                      <span className="text-[#D6C7B5]">|</span>
                      <span className="inline-flex items-center gap-1">
                        <DemandBarsIcon className="w-3 h-3 text-[#8C7A6B]" />
                        <span>{job.demand || 'Very High'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold whitespace-nowrap flex-shrink-0 ${matchBadge}`}
                >
                  {job.matchPercentage}% Match
                </span>
              </div>

              {/* Reason Description Inner Box */}
              {job.reason && (
                <div className="bg-[#F9F3EC] rounded-[14px] p-3 text-[11.5px] text-[#4E3D31] leading-[1.45] font-medium">
                  {job.reason}
                </div>
              )}

              {/* Bottom Search Links Row matching Screenshot 2 */}
              {job.searchUrls && (
                <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                  <span className="text-[11px] font-semibold text-[#7A6858] mr-0.5">
                    Search on:
                  </span>
                  <a
                    href={job.searchUrls.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-full bg-[#EBF3FD] hover:bg-[#DCEBFA] border border-[#CFE2FA] text-[#0A66C2] text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
                  >
                    <span className="w-3.5 h-3.5 rounded-[3px] bg-[#0A66C2] text-white text-[9px] font-black flex items-center justify-center leading-none">
                      in
                    </span>
                    <span>LinkedIn</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>

                  <a
                    href={job.searchUrls.indeed}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-full bg-[#EEF2FF] hover:bg-[#E0E7FF] border border-[#D4DEFC] text-[#2557A7] text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-[#2557A7] text-[#2557A7] text-[9px] font-black flex items-center justify-center leading-none">
                      i
                    </span>
                    <span>Indeed</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>

                  <a
                    href={job.searchUrls.google}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-full bg-[#ECF8EE] hover:bg-[#DCF3E0] border border-[#C6EBD0] text-[#188038] text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
                  >
                    <GoogleGIcon />
                    <span>Google</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Extracted Skills Matrix Card matching Screenshot 2 */}
      <div className="rounded-[22px] bg-[#FFFDFB] border border-[#EFE4D4] shadow-[0_4px_20px_-4px_rgba(140,95,55,0.07)] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#9C521B]" strokeWidth={2.2} />
            <h2 className="text-[14px] font-extrabold text-[#2A190E] tracking-tight">
              Extracted Skills Matrix ({extractedSkills.length})
            </h2>
          </div>
          <ChevronRight className="w-4 h-4 text-[#8C7A6B]" />
        </div>

        {/* Category Filter Pills */}
        {categories.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#9C521B] text-white shadow-sm'
                    : 'bg-[#F7EFE5] border border-[#EADBC8] text-[#5C4838] hover:border-[#C07735]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Extracted Skill Tags */}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {filteredSkills.map((skill, i) => (
            <div
              key={i}
              className="px-2.5 py-1 rounded-xl bg-[#FAF5EE] border border-[#EAE0D2] text-[11.5px] font-semibold text-[#3B2E22] inline-flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3 h-3 text-[#1D7A38]" />
              <span>{skill.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
