import React from 'react';
import { useHostel } from '../../context/HostelContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const NotificationToasts: React.FC = () => {
  const { toasts, removeToast } = useHostel();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        let Icon = CheckCircle2;
        let colorClass = 'text-emerald-500 border-emerald-500/20';

        if (toast.type === 'error') {
          Icon = AlertCircle;
          colorClass = 'text-rose-500 border-rose-500/20';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          colorClass = 'text-amber-500 border-amber-500/20';
        } else if (toast.type === 'info') {
          Icon = Info;
          colorClass = 'text-blue-500 border-blue-500/20';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 bg-white dark:bg-slate-900 border ${colorClass} rounded-xl shadow-lg animate-in slide-in-from-bottom-2 duration-150`}
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                {toast.title}
              </h4>
              {toast.message && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
