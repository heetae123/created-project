import React, { useState, useCallback, useEffect, useRef } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  msg: string;
  type: ToastType;
  leaving: boolean;
}

interface ToastContextValue {
  showToast: (msg: string, type?: ToastType) => void;
}

const ToastContext = React.createContext<ToastContextValue>({ showToast: () => {} });

let _counter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((msg: string, type: ToastType = 'success') => {
    const id = ++_counter;
    setToasts(prev => [...prev, { id, msg, type, leaving: false }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 300);
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <ToastBubble key={t.id} toast={t} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastBubble({ toast }: { toast: ToastItem; key?: number }) {
  const icons: Record<ToastType, React.ReactNode> = {
    success: (
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    error: (
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
    info: (
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  };

  const borderColor: Record<ToastType, string> = {
    success: 'border-l-emerald-500',
    error: 'border-l-red-500',
    info: 'border-l-blue-500',
  };

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 bg-white border border-gray-200 border-l-4 ${borderColor[toast.type]} rounded-xl px-4 py-3 shadow-lg min-w-[260px] max-w-sm transition-all duration-300 ${toast.leaving ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}
    >
      {icons[toast.type]}
      <span className="text-sm text-gray-800 font-medium">{toast.msg}</span>
    </div>
  );
}

export function useToast(): ToastContextValue {
  return React.useContext(ToastContext);
}
