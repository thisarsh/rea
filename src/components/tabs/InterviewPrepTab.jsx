import React, { useState, useRef, useEffect } from 'react';
import { Mic, ChevronDown, ChevronUp, Copy, Check, Lightbulb, List, Sparkles, Loader2 } from 'lucide-react';

export default function InterviewPrepTab({ data, onCopy, onLoadMore, isLoadingMore }) {
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const questions = data?.interviewQuestions || [];
  const prevLenRef = useRef(questions.length);

  // Auto-expand the first newly loaded question when "+5 more" finishes
  useEffect(() => {
    if (questions.length > prevLenRef.current) {
      setExpandedIndex(prevLenRef.current);
    }
    prevLenRef.current = questions.length;
  }, [questions.length]);

  const handleCopy = (e, text, idx) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    onCopy('Copied interview question to clipboard!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-4 pb-6 px-1">
      {/* Page Header matching Screenshot 4 */}
      <div className="flex items-start gap-3 px-0.5 pt-1">
        <div className="w-11 h-11 rounded-[14px] bg-[#F8EFE4] border border-[#EADBC8] shadow-sm flex items-center justify-center flex-shrink-0">
          <Mic className="w-5 h-5 text-[#8C5020]" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-[16.5px] font-extrabold text-[#2A190E] leading-tight tracking-tight">
            AI Interview Questions
          </h1>
          <p className="text-[11.5px] text-[#756252] mt-0.5 leading-snug font-medium">
            Personalized, technical, and behavioral questions based on your resume and projects.
          </p>
        </div>
      </div>

      {/* Questions Accordion Cards matching Screenshot 4 */}
      <div className="space-y-3">
        {questions.map((item, idx) => {
          const isExpanded = expandedIndex === idx;
          const numStr = String(idx + 1).padStart(2, '0');
          const typeLabel = item.type === 'Technical Experience' ? 'Technical' : (item.type || 'Technical');

          const typeBadgeClass =
            typeLabel === 'System Design'
              ? 'bg-[#FCECD9] text-[#A25517]'
              : typeLabel === 'Behavioral'
              ? 'bg-[#E3F5E6] text-[#1D7A38]'
              : 'bg-[#EAE9FE] text-[#4F46E5]';

          return (
            <div
              key={idx}
              className="rounded-[22px] bg-[#FFFDFB] border border-[#EFE4D4] shadow-[0_4px_20px_-4px_rgba(140,95,55,0.07)] overflow-hidden transition-all"
            >
              {/* Question Header */}
              <div
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="p-4 cursor-pointer select-none"
              >
                {/* Top Pill Row: Number + Category + Copy/Chevron */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#F5E8D8] text-[#5A3E28] text-[11px] font-extrabold">
                      {numStr}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${typeBadgeClass}`}>
                      {typeLabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[#7D6959]">
                    <button
                      type="button"
                      onClick={(e) => handleCopy(e, item.question, idx)}
                      className="p-1 rounded-lg hover:bg-[#F5ECE0] text-[#7D6959] hover:text-[#2A190E] transition-colors cursor-pointer"
                      title="Copy Question"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-4 h-4 text-[#1D7A38]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <div className="text-[#6E5C4E]">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Question Text */}
                <h3 className="text-[13px] font-extrabold text-[#22140B] leading-[1.45] mt-2.5">
                  {item.question}
                </h3>

                {/* Expanded Content inside card (matching Screenshot 4 padding & flow) */}
                {isExpanded && (
                  <div className="mt-3.5 space-y-3.5" onClick={(e) => e.stopPropagation()}>
                    {item.whyAsked && (
                      <div className="bg-[#FAF4EC] rounded-[16px] border border-[#EFE3D2] p-3.5">
                        <div className="flex items-center gap-1.5 text-[12.5px] font-extrabold text-[#9C4E14]">
                          <Lightbulb className="w-4 h-4 text-[#D97706] flex-shrink-0" strokeWidth={2.1} />
                          <span>Why This Question?</span>
                        </div>
                        <p className="text-[11.5px] text-[#4E3D31] leading-[1.48] mt-1 font-medium">
                          {item.whyAsked}
                        </p>
                      </div>
                    )}

                    {Array.isArray(item.keyTalkingPoints) && item.keyTalkingPoints.length > 0 && (
                      <div className="space-y-2 px-0.5">
                        <div className="flex items-center gap-2 text-[10.5px] font-extrabold tracking-wider uppercase text-[#756252]">
                          <List className="w-3.5 h-3.5 text-[#756252]" />
                          <span>Key Discussion Points</span>
                        </div>
                        <ul className="space-y-1.5 pl-1">
                          {item.keyTalkingPoints.map((point, pIdx) => (
                            <li
                              key={pIdx}
                              className="text-[12px] text-[#3B2E22] flex items-start gap-2.5 leading-[1.45] font-medium"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#E29331] mt-1.5 flex-shrink-0" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Load 5 More Tailored Questions Button when reaching the end */}
      {questions.length > 0 && onLoadMore && (
        <div className="pt-2 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="w-full py-3.5 px-6 rounded-full bg-gradient-to-b from-[#C07735] to-[#8C4D19] text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-[0_6px_16px_rgba(140,77,25,0.28)] active:scale-[0.98] transition-all disabled:opacity-65 cursor-pointer"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating 5 More Questions...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Get More Questions (+5)</span>
              </>
            )}
          </button>
          <span className="text-[11px] font-semibold text-[#8C7A6B]">
            Showing {questions.length} tailored questions
          </span>
        </div>
      )}
    </div>
  );
}
