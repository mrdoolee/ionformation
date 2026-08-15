import React from 'react';
import { ToastNotification } from '../types';
import { CheckCircle2, AlertCircle, Info, Sparkles, X } from 'lucide-react';

interface ToastProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3">
      {toasts.map((t) => {
        let icon = <Info className="w-5 h-5 text-cyan-400 shrink-0" />;
        let borderClass = 'border-cyan-500/50 bg-slate-900/90';

        if (t.type === 'success' || t.type === 'celebration') {
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
          borderClass = 'border-emerald-500/40 bg-slate-900/95 shadow-emerald-500/20';
        } else if (t.type === 'warning') {
          icon = <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />;
          borderClass = 'border-amber-500/40 bg-slate-900/95 shadow-amber-500/20';
        } else {
          icon = <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />;
          borderClass = 'border-indigo-500/40 bg-slate-900/95 shadow-indigo-500/20';
        }

        return (
          <div
            key={t.id}
            className={`pointer-events-auto p-3.5 rounded-xl border backdrop-blur-2xl shadow-2xl flex items-start gap-3 transition-all duration-300 transform translate-y-0 text-slate-100 ${borderClass}`}
          >
            {icon}
            <div className="flex-1">
              <h4 className="text-xs font-bold leading-tight">{t.title}</h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-snug">{t.message}</p>
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
