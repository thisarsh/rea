import React, { useState } from 'react';
import { FileText, Info, Copy, Check, Wand2 } from 'lucide-react';

// 4-point sparkle SVG matching Screenshot 3
function Sparkle4Icon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
    </svg>
  );
}

function Sparkle4OutlineIcon({ className }) {
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

export default function BulletOptimizerTab({ data, onCopy }) {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [customBullet, setCustomBullet] = useState('');
  const [customRewrites, setCustomRewrites] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const bulletOptimizations = data?.bulletOptimizations || [];

  const handleCopy = (text, identifier) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(identifier);
    onCopy('Copied STAR bullet point to clipboard!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleGenerateCustom = () => {
    if (!customBullet.trim() || customBullet.length < 10) return;
    setIsGenerating(true);

    setTimeout(() => {
      const cleaned = customBullet.replace(/^(worked on|helped with|did|handled|responsible for)\s*/i, '');
      setCustomRewrites({
        original: customBullet,
        star1: `Reduced execution overhead by 35% by re-architecting ${cleaned}, reliably handling 10,000+ monthly active operations.`,
        star2: `Architected and shipped ${cleaned} with automated testing and monitoring, sustaining 99.9% production availability.`,
      });
      setIsGenerating(false);
    }, 350);
  };

  return (
    <div className="space-y-4 pb-6 px-1">
      {/* Page Header matching Screenshot 3 */}
      <div className="flex items-start gap-3 px-0.5 pt-1">
        <div className="w-11 h-11 rounded-[14px] bg-[#F8EFE4] border border-[#EADBC8] shadow-sm flex items-center justify-center flex-shrink-0">
          <Sparkle4OutlineIcon className="w-5 h-5 text-[#B06A28]" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-[16.5px] font-extrabold text-[#2A190E] leading-tight tracking-tight">
            STAR Bullet Point Optimizer
          </h1>
          <p className="text-[11.5px] text-[#756252] mt-0.5 leading-snug font-medium">
            Rewrite your resume bullets into high-impact, quantifiable STAR statements (Situation, Task, Action, Result).
          </p>
        </div>
      </div>

      {/* Bullet Optimization Cards matching Screenshot 3 */}
      <div className="space-y-4">
        {bulletOptimizations.map((item, idx) => (
          <div
            key={idx}
            className="rounded-[22px] bg-[#FFFDFB] border border-[#EFE4D4] shadow-[0_4px_20px_-4px_rgba(140,95,55,0.07)] p-4 space-y-3"
          >
            {/* 1. Original Resume Bullet */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[12.5px] font-extrabold text-[#382313]">
                <FileText className="w-4 h-4 text-[#9C521B]" strokeWidth={2.1} />
                <span>Original Resume Bullet</span>
              </div>
              <div className="bg-[#FAF3E3] rounded-[14px] p-3 text-[12px] text-[#3B2E22] leading-[1.45] font-medium">
                “{item.original}”
              </div>
            </div>

            {/* 2. Why Improve? */}
            {item.improvementReason && (
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-[12px] font-extrabold text-[#9A5B1E]">
                  <Info className="w-3.5 h-3.5 text-[#9A5B1E]" strokeWidth={2.2} />
                  <span>Why Improve?</span>
                </div>
                <p className="text-[11.5px] text-[#6E5C4E] leading-[1.45] pl-5 font-medium">
                  {item.improvementReason}
                </p>
              </div>
            )}

            {/* 3. STAR Option 1 (Quantified Impact) */}
            <div className="space-y-1.5 pt-0.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[12px] font-extrabold text-[#1D803B]">
                  <Sparkle4Icon className="w-3.5 h-3.5 text-[#1D803B]" />
                  <span>STAR Option 1 (Quantified Impact)</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(item.starAlternative1, `${idx}-1`)}
                  className="px-2.5 py-0.5 rounded-full bg-[#F2FBF4] hover:bg-[#E4F7E8] border border-[#BCE5C6] text-[#1D803B] text-[11px] font-bold inline-flex items-center gap-1 transition-all active:scale-95 cursor-pointer flex-shrink-0"
                >
                  {copiedIndex === `${idx}-1` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedIndex === `${idx}-1` ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="bg-[#ECF7EE] rounded-[14px] p-3 text-[12px] text-[#1D2D21] leading-[1.45] font-medium">
                {item.starAlternative1}
              </div>
            </div>

            {/* 4. STAR Option 2 (Leadership & Scale) */}
            {item.starAlternative2 && (
              <div className="space-y-1.5 pt-0.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[12px] font-extrabold text-[#B6691E]">
                    <Sparkle4Icon className="w-3.5 h-3.5 text-[#D4882A]" />
                    <span>STAR Option 2 (Leadership & Scale)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(item.starAlternative2, `${idx}-2`)}
                    className="px-2.5 py-0.5 rounded-full bg-[#FDF7EE] hover:bg-[#FAF0E0] border border-[#EBD6BA] text-[#8E5320] text-[11px] font-bold inline-flex items-center gap-1 transition-all active:scale-95 cursor-pointer flex-shrink-0"
                  >
                    {copiedIndex === `${idx}-2` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedIndex === `${idx}-2` ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="bg-[#FAF2E4] rounded-[14px] p-3 text-[12px] text-[#2F2419] leading-[1.45] font-medium">
                  {item.starAlternative2}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Interactive Custom Bullet Lab matching theme */}
      <div className="rounded-[22px] bg-[#FFFDFB] border border-[#EFE4D4] shadow-[0_4px_20px_-4px_rgba(140,95,55,0.07)] p-4 space-y-3">
        <div className="flex items-center gap-2 text-[#2A190E] font-extrabold text-[13px]">
          <Wand2 className="w-4 h-4 text-[#9C521B]" />
          <span>Rewrite Custom Bullet Point</span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={customBullet}
            onChange={(e) => setCustomBullet(e.target.value)}
            placeholder="e.g. Built login module with React & JWT..."
            className="flex-1 px-3.5 py-2 rounded-full bg-[#FAF5EE] border border-[#E5D7C5] text-[#2A190E] placeholder-[#9E8E7E] text-[12px] focus:outline-none focus:border-[#9C521B] font-medium"
          />
          <button
            type="button"
            disabled={customBullet.trim().length < 10 || isGenerating}
            onClick={handleGenerateCustom}
            className="px-4 py-2 rounded-full bg-gradient-to-b from-[#C07735] to-[#8C4D19] text-white text-[12px] font-bold shadow-sm active:scale-95 disabled:opacity-40 cursor-pointer whitespace-nowrap"
          >
            {isGenerating ? 'Working...' : 'Enhance'}
          </button>
        </div>

        {customRewrites && (
          <div className="space-y-2 pt-1">
            <div className="bg-[#ECF7EE] rounded-[14px] p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-[#1D803B]">STAR Option 1 (Quantified)</span>
                <button
                  type="button"
                  onClick={() => handleCopy(customRewrites.star1, 'custom-1')}
                  className="px-2 py-0.5 rounded-full bg-white border border-[#BCE5C6] text-[#1D803B] text-[10.5px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copiedIndex === 'custom-1' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
              </div>
              <p className="text-[12px] text-[#1D2D21] leading-relaxed font-medium">{customRewrites.star1}</p>
            </div>

            <div className="bg-[#FAF2E4] rounded-[14px] p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-[#B6691E]">STAR Option 2 (Architecture)</span>
                <button
                  type="button"
                  onClick={() => handleCopy(customRewrites.star2, 'custom-2')}
                  className="px-2 py-0.5 rounded-full bg-white border border-[#EBD6BA] text-[#8E5320] text-[10.5px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copiedIndex === 'custom-2' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
              </div>
              <p className="text-[12px] text-[#2F2419] leading-relaxed font-medium">{customRewrites.star2}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
