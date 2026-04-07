import React, { useState, useCallback } from 'react';

interface ConfirmState {
  open: boolean;
  title: string;
  body: string;
  resolve: ((v: boolean) => void) | null;
}

interface ConfirmContextValue {
  showConfirm: (title: string, body: string) => Promise<boolean>;
}

const ConfirmContext = React.createContext<ConfirmContextValue>({
  showConfirm: async () => false,
});

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConfirmState>({
    open: false, title: '', body: '', resolve: null,
  });

  const showConfirm = useCallback((title: string, body: string): Promise<boolean> => {
    return new Promise(resolve => {
      setState({ open: true, title, body, resolve });
    });
  }, []);

  const handleOk = () => {
    setState(prev => { prev.resolve?.(true); return { ...prev, open: false, resolve: null }; });
  };

  const handleCancel = () => {
    setState(prev => { prev.resolve?.(false); return { ...prev, open: false, resolve: null }; });
  };

  return (
    <ConfirmContext.Provider value={{ showConfirm }}>
      {children}
      {state.open && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={handleCancel}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-gray-900 mb-2">{state.title}</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">{state.body}</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleOk}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmContextValue {
  return React.useContext(ConfirmContext);
}
