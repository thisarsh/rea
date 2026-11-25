import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-bounce-short">
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAF7F2] border border-[#EAE3D6] shadow-[4px_7px_18px_rgba(180,155,130,0.25),-2px_-2px_6px_rgba(255,255,255,0.95)]">
        {type === 'success' ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        ) : (
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        )}
        <span className="text-xs font-semibold text-[#221A15] whitespace-nowrap">
          {message}
        </span>
      </div>
    </div>
  );
}
