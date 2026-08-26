import React from 'react';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

export const SecurityBadge: React.FC = () => {
  return (
    <footer className="mt-12 pt-6 border-t border-stone-200 text-stone-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-800" />
          <span className="font-medium text-stone-700">MirrorTrace Security Architecture</span>
        </div>

        <div className="flex items-center gap-4 flex-wrap text-[11px]">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Owner-Bound UID Path Isolation
          </span>
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-amber-700" />
            Server-Side Gemini Credentials
          </span>
        </div>
      </div>
    </footer>
  );
};
