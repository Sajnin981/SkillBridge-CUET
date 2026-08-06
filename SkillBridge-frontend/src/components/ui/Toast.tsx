import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import type { Toast } from '@/lib/types';

interface ToastContextValue {
  toast: (t: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const variants = {
  success: { icon: CheckCircle2, ring: 'ring-success-500/20', bg: 'bg-success-50', color: 'text-success-600' },
  error: { icon: AlertCircle, ring: 'ring-danger-500/20', bg: 'bg-danger-50', color: 'text-danger-600' },
  info: { icon: Info, ring: 'ring-brand-500/20', bg: 'bg-brand-50', color: 'text-brand-600' },
  warning: { icon: AlertTriangle, ring: 'ring-warning-500/20', bg: 'bg-warning-50', color: 'text-warning-600' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const toast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => remove(id), 4000);
  }, [remove]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2.5">
        {toasts.map((t) => {
          const v = variants[t.variant];
          const Icon = v.icon;
          return (
            <div key={t.id} className={`flex items-start gap-3 rounded-xl ${v.bg} p-3.5 shadow-card ring-1 ${v.ring} animate-scale-in`}>
              <Icon className={`h-5 w-5 shrink-0 ${v.color}`} />
              <div className="flex-1 pt-0.5">
                <p className="text-sm font-semibold text-ink-800">{t.title}</p>
                {t.description && <p className="mt-0.5 text-xs text-ink-600">{t.description}</p>}
              </div>
              <button onClick={() => remove(t.id)} className="text-ink-400 transition hover:text-ink-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
