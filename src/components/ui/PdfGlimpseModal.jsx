import React, { useEffect, useRef, useState } from 'react';
import { FileText, X, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { loadPdfDocument, renderPdfPageToCanvas } from '../../services/pdfParserService';

export default function PdfGlimpseModal({ file, onContinue, onClose, isAnalyzing }) {
  const containerRef = useRef(null);
  const [numPages, setNumPages] = useState(1);
  const [rendering, setRendering] = useState(true);
  const [renderError, setRenderError] = useState(null);
  const canvasRefs = useRef([]);

  useEffect(() => {
    if (!file) return;
    let cancelled = false;

    async function renderPreview() {
      setRendering(true);
      setRenderError(null);
      try {
        const pdf = await loadPdfDocument(file);
        if (cancelled) return;
        setNumPages(pdf.numPages);

        // Wait one frame for canvas elements to mount
        await new Promise((r) => setTimeout(r, 60));
        if (cancelled) return;

        const containerWidth = Math.min((containerRef.current?.clientWidth || 350) - 16, 368);
        for (let p = 1; p <= pdf.numPages; p++) {
          const canvas = canvasRefs.current[p - 1];
          if (canvas) {
            await renderPdfPageToCanvas(pdf, p, canvas, containerWidth);
          }
        }
      } catch (err) {
        console.error('[PDF Glimpse Error]', err);
        if (!cancelled) setRenderError('Preview unavailable on this view, you can still continue analysis.');
      } finally {
        if (!cancelled) setRendering(false);
      }
    }

    renderPreview();
    return () => {
      cancelled = true;
    };
  }, [file]);

  if (!file) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2A190E]/55 backdrop-blur-sm p-3.5 animate-fadeIn">
      <div className="w-full max-w-[400px] rounded-[28px] bg-[#FBF4EB] border border-[#EADBC8] shadow-[0_20px_50px_rgba(42,25,14,0.32)] overflow-hidden flex flex-col max-h-[88vh]">
        {/* Modal Header */}
        <div className="px-4 py-3.5 bg-[#FFFDFB] border-b border-[#EFE4D4] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#F8EFE4] border border-[#EADBC8] flex items-center justify-center flex-shrink-0">
              <FileText className="w-4.5 h-4.5 text-[#9C521B]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-[13px] font-extrabold text-[#2A190E] truncate">
                {file.name}
              </h3>
              <p className="text-[10.5px] font-semibold text-[#8C7A6B]">
                Resume PDF Glimpse • {numPages} {numPages === 1 ? 'Page' : 'Pages'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isAnalyzing}
            className="w-8 h-8 rounded-full bg-[#F5EBE0] hover:bg-[#EADBC8] text-[#5C4533] flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40"
            aria-label="Close preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable PDF Canvas Preview Area */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto p-3 bg-[#EFE6D8]/70 flex flex-col items-center gap-3 min-h-[260px]"
        >
          {rendering && (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <Loader2 className="w-7 h-7 text-[#9C521B] animate-spin mb-2" />
              <span className="text-xs font-bold text-[#6E5C4E]">
                Rendering PDF glimpse...
              </span>
            </div>
          )}

          {renderError && !rendering && (
            <div className="p-4 rounded-2xl bg-[#FFFDFB] border border-[#EAE0D0] text-center text-xs font-medium text-[#6E5C4E]">
              {renderError}
            </div>
          )}

          {Array.from({ length: numPages }, (_, idx) => (
            <div
              key={idx}
              className={`rounded-2xl overflow-hidden bg-white border border-[#E5D7C5] shadow-[0_6px_20px_rgba(42,25,14,0.12)] ${
                rendering ? 'hidden' : 'block'
              }`}
            >
              <canvas
                ref={(el) => {
                  canvasRefs.current[idx] = el;
                }}
                className="block max-w-full h-auto"
              />
            </div>
          ))}
        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 bg-[#FFFDFB] border-t border-[#EFE4D4] space-y-2.5">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[#756252]">
            <Sparkles className="w-3.5 h-3.5 text-[#B86F2C]" />
            <span>Live text will be sent to Groq AI for real-time ATS scoring</span>
          </div>

          <button
            type="button"
            onClick={() => onContinue(file)}
            disabled={isAnalyzing}
            className="w-full py-3 rounded-full bg-gradient-to-b from-[#C07735] to-[#8C4D19] text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(140,77,25,0.35)] active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Resume Live...</span>
              </>
            ) : (
              <>
                <span>Continue &amp; Analyze</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
