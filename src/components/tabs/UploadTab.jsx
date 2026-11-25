import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { extractResumeText } from '../../services/pdfParserService';
import PdfGlimpseModal from '../ui/PdfGlimpseModal';

const PROJECT_SUBMITTERS = [
  { name: 'Juber', serialNo: '10' },
  { name: 'Vani', serialNo: '27' },
  { name: 'Saksham', serialNo: '57' },
  { name: 'Vidhi', serialNo: '58' },
  { name: 'Bilal', serialNo: '70' },
];

export default function UploadTab({ onAnalyze, isLoading, error }) {
  const [activeInputMode, setActiveInputMode] = useState('upload'); // 'upload' | 'paste'
  const [rawText, setRawText] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [glimpseFile, setGlimpseFile] = useState(null);
  const [loadingDemoPdf, setLoadingDemoPdf] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (file) => {
    if (!file) return;
    try {
      setSelectedFileName(file.name);
      const extracted = await extractResumeText(file);
      onAnalyze(extracted, file.name);
    } catch (err) {
      alert(err.message || 'Failed to read resume file.');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Fetch vidhi_singh_resume.pdf and show a visual PDF glimpse before real-time AI scoring
  const handleDemoResume = async () => {
    setLoadingDemoPdf(true);
    try {
      const response = await fetch('/vidhi_singh_resume.pdf');
      if (!response.ok) {
        throw new Error('Could not load demo resume PDF.');
      }
      const blob = await response.blob();
      const file = new File([blob], 'vidhi_singh_resume.pdf', { type: 'application/pdf' });
      setGlimpseFile(file);
    } catch (err) {
      alert(err.message || 'Failed to load vidhi_singh_resume.pdf.');
    } finally {
      setLoadingDemoPdf(false);
    }
  };

  const handleContinueFromGlimpse = async (file) => {
    try {
      setSelectedFileName(file.name);
      const extracted = await extractResumeText(file);
      await onAnalyze(extracted, file.name);
      setGlimpseFile(null);
    } catch (err) {
      alert(err.message || 'Failed to extract or analyze resume PDF.');
      setGlimpseFile(null);
    }
  };

  return (
    <div className="space-y-4 pb-6 px-1 relative">
      {/* Top Left Organic Fluid Shape Accent */}
      <div 
        className="absolute -top-10 -left-10 w-36 h-36 rounded-full bg-[#EADBCE]/50 blur-2xl pointer-events-none" 
        aria-hidden="true" 
      />

      {/* Hero 3D Illustration & Curved Title matching reference UI */}
      <div className="text-center pt-0 relative select-none">
        <div className="relative inline-block mx-auto">
          <img 
            src="/hero_art.png" 
            alt="Resume Analyzer Illustration" 
            className="w-56 h-auto mx-auto object-contain drop-shadow-[0_8px_16px_rgba(180,140,110,0.18)]"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>

        <h1 className="text-3xl font-black italic tracking-tight text-[#231815] text-center mt-1">
          Resume{' '}
          <span className="text-[#A76E3E] relative inline-block">
            Analyzer
            <svg 
              className="absolute -bottom-1 left-0 w-full" 
              height="6" 
              viewBox="0 0 100 6" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M2 3.5C32 1.2 68 1.2 98 3.5" 
                stroke="#A76E3E" 
                strokeWidth="3.2" 
                strokeLinecap="round" 
              />
            </svg>
          </span>
        </h1>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-2.5 text-amber-900 text-xs shadow-sm">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Mode Switch Pill: Upload Resume / Paste Text matching reference UI */}
      <div className="p-1 rounded-full bg-[#F3E8DC] border border-[#E5D7C5] flex shadow-inner">
        <button
          type="button"
          onClick={() => setActiveInputMode('upload')}
          className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-full transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
            activeInputMode === 'upload'
              ? 'bg-gradient-to-b from-[#C07735] to-[#8C4D19] text-white shadow-[0_4px_12px_rgba(140,77,25,0.32)]'
              : 'text-[#5C4533] hover:text-[#231815]'
          }`}
        >
          <UploadCloud className="w-4 h-4 text-inherit" />
          <span>Upload Resume</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveInputMode('paste')}
          className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-full transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
            activeInputMode === 'paste'
              ? 'bg-gradient-to-b from-[#C07735] to-[#8C4D19] text-white shadow-[0_4px_12px_rgba(140,77,25,0.32)]'
              : 'text-[#5C4533] hover:text-[#231815]'
          }`}
        >
          <FileText className="w-4 h-4 text-inherit" />
          <span>Paste Text</span>
        </button>
      </div>

      {/* Upload Box matching reference UI */}
      {activeInputMode === 'upload' ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative p-8 rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center bg-[#FFFDFC]/90 shadow-[0_4px_20px_rgba(180,150,120,0.08)] overflow-hidden ${
            dragActive
              ? 'border-[#8C5730] bg-[#FAF3EA]'
              : 'border-[#C5A88E] hover:border-[#8C5730] hover:bg-[#FAF6EF]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt"
            onChange={(e) => handleFileChange(e.target.files[0])}
            className="hidden"
          />

          {/* Faded Document Graphics & Corner Ambient Blobs */}
          <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-[#E5D2BF]/35 blur-md pointer-events-none" />
          <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-[#E5D2BF]/35 blur-md pointer-events-none" />

          {/* Center Upload Button */}
          <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-b from-[#FFFDF9] to-[#F5ECE0] border border-[#EAE0D0] shadow-[0_6px_16px_rgba(180,140,110,0.18)] flex items-center justify-center mb-3">
            {isLoading ? (
              <Loader2 className="w-8 h-8 text-[#8C5730] animate-spin" />
            ) : (
              <UploadCloud className="w-8 h-8 text-[#8C5730]" />
            )}
          </div>

          <h3 className="relative z-10 text-sm font-bold text-[#231815]">
            {isLoading ? 'Analyzing Resume Intelligence...' : 'Tap to Upload or Drag & Drop'}
          </h3>
          <p className="relative z-10 text-xs text-[#8C7A6B] mt-1 font-medium">
            PDF & TXT formats supported
          </p>

          {selectedFileName && (
            <div className="relative z-10 mt-3 px-3.5 py-1 rounded-full bg-[#F5ECE0] border border-[#DECBB8] text-[11px] font-bold text-[#8C5730]">
              📄 {selectedFileName}
            </div>
          )}
        </div>
      ) : (
        /* Paste Mode Area */
        <div className="p-4 rounded-3xl bg-[#FFFDFC] border border-[#E8DEC9] shadow-[0_4px_20px_rgba(180,150,120,0.08)] space-y-3">
          <textarea
            rows={7}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste your raw resume text here (experience, projects, skills, education)..."
            className="w-full bg-[#FAF7F2] text-[#231815] placeholder-[#9E8E7E] text-xs rounded-2xl p-3.5 border border-[#E4D8C8] focus:outline-none focus:border-[#8C5730] transition-all resize-none font-medium leading-relaxed"
          />

          <button
            type="button"
            disabled={!rawText.trim() || isLoading}
            onClick={() => onAnalyze(rawText, 'Pasted Resume')}
            className="w-full py-3 rounded-full bg-gradient-to-b from-[#C07735] to-[#8C4D19] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(140,77,25,0.32)] cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Evaluating ATS Readiness...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run Full ATS Analysis</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Single Pill Button: "Demo resume" (Strictly following user instruction) */}
      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={handleDemoResume}
          disabled={isLoading || loadingDemoPdf}
          className="px-7 py-3 rounded-full bg-gradient-to-b from-[#FFFDF9] to-[#F5ECE0] border border-[#DECBB8] hover:border-[#8C5730] shadow-[3px_5px_15px_rgba(180,150,120,0.18),-2px_-2px_6px_rgba(255,255,255,0.9)] flex items-center gap-2.5 text-xs font-bold text-[#4A3828] hover:text-[#8C5730] active:scale-95 transition-all cursor-pointer group disabled:opacity-60"
          title="Preview & Analyze vidhi_singh_resume.pdf"
        >
          {loadingDemoPdf ? (
            <Loader2 className="w-4 h-4 text-[#8C5730] animate-spin flex-shrink-0" />
          ) : (
            <Sparkles className="w-4 h-4 text-[#8C5730] group-hover:scale-110 transition-transform flex-shrink-0" />
          )}
          <span className="tracking-wide">Demo resume</span>
        </button>
      </div>

      {/* PDF Glimpse Preview Modal */}
      <PdfGlimpseModal
        file={glimpseFile}
        isAnalyzing={isLoading}
        onContinue={handleContinueFromGlimpse}
        onClose={() => setGlimpseFile(null)}
      />

      {/* Project Submitted By Table */}
      <div className="mt-4 rounded-3xl bg-[#FFFDFC]/95 border border-[#E8DEC9] shadow-[0_4px_20px_rgba(180,150,120,0.08)] overflow-hidden">
        <div className="px-4 py-2.5 bg-gradient-to-r from-[#F5ECE0] to-[#FAF3EA] border-b border-[#E8DEC9]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#8C5730] text-center">
            Project Submitted By
          </h2>
        </div>

        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-[#FAF7F2] text-[#5C4533] border-b border-[#EAE0D0]">
              <th className="py-2.5 px-4 font-bold">Name</th>
              <th className="py-2.5 px-4 font-bold text-right">Serial No.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0E7DA]">
            {PROJECT_SUBMITTERS.map((member) => (
              <tr
                key={member.serialNo}
                className="hover:bg-[#FAF6EF] transition-colors text-[#231815]"
              >
                <td className="py-2.5 px-4 font-semibold">{member.name}</td>
                <td className="py-2.5 px-4 font-bold text-right text-[#8C5730]">
                  {member.serialNo}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom Right Organic Fluid Accent */}
      <div 
        className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-[#EADBCE]/40 blur-2xl pointer-events-none" 
        aria-hidden="true" 
      />
    </div>
  );
}
