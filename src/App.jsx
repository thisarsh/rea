import React, { useState } from 'react';
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import UploadTab from './components/tabs/UploadTab';
import ScorecardTab from './components/tabs/ScorecardTab';
import JobMatchTab from './components/tabs/JobMatchTab';
import BulletOptimizerTab from './components/tabs/BulletOptimizerTab';
import InterviewPrepTab from './components/tabs/InterviewPrepTab';
import Toast from './components/ui/Toast';
import { analyzeResume } from './services/aiService';

export default function App() {
  const [activeTab, setActiveTab] = useState('upload');
  const [resumeText, setResumeText] = useState('');
  const [resumeName, setResumeName] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const handleAnalyze = async (text, name = 'Resume') => {
    setIsLoading(true);
    setError(null);
    setResumeText(text);
    setResumeName(name);

    try {
      const result = await analyzeResume(text);
      setAnalysisResult(result);
      setActiveTab('score');
      showToast('AI Analysis Complete!');
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setResumeText('');
    setResumeName('');
    setActiveTab('upload');
    setError(null);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="w-full h-full min-h-screen bg-[#FBF4EB] text-[#2A190E] font-sans flex justify-center selection:bg-[#9C5A25] selection:text-white relative overflow-hidden">
      {/* Main Container Frame */}
      <div className="dilwali-app-container relative z-10 !bg-[#FBF4EB]">
        {/* Organic Cream Wave Accents matching all reference screens */}
        <div
          className="absolute -top-6 -right-12 w-72 h-44 rounded-full bg-[#F1E2D0]/65 blur-2xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-20 -left-16 w-64 h-64 rounded-full bg-[#EFE0CD]/50 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <Header
          onReset={handleReset}
          hasData={Boolean(analysisResult)}
          aiModel={analysisResult?.engine}
        />

        <Toast message={toastMessage} />

        <main className="dilwali-main-scroll px-3.5 pt-1 relative z-10">
          {activeTab === 'upload' && (
            <UploadTab
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              error={error}
            />
          )}

          {(activeTab === 'score' || activeTab === 'scorecard') && (
            <ScorecardTab data={analysisResult} />
          )}

          {activeTab === 'jobs' && (
            <JobMatchTab data={analysisResult} />
          )}

          {activeTab === 'bullets' && (
            <BulletOptimizerTab
              data={analysisResult}
              onCopy={(msg) => showToast(msg)}
            />
          )}

          {activeTab === 'interview' && (
            <InterviewPrepTab
              data={analysisResult}
              onCopy={(msg) => showToast(msg)}
            />
          )}
        </main>

        <BottomNav
          activeTab={activeTab}
          onChangeTab={(tabId) => setActiveTab(tabId)}
          hasData={Boolean(analysisResult)}
          onNeedResume={() => showToast('Upload a resume or tap Demo resume first!')}
        />
      </div>
    </div>
  );
}
