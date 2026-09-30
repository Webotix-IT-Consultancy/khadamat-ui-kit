import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
}

interface ToastContextType {
    showToast: (message: string, type: Toast['type']) => void;
    toasts: Toast[];
    removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Per-type surface, accent and icon.
 *
 * Success is deliberately built from the theme tokens rather than a fixed
 * green, so it reads as part of the host portal's palette — cream + gold in the
 * admin theme, mint + green in the customer one. Error/warning stay
 * conventionally coloured, since those must not blend into the page.
 */
const TOAST_STYLES: Record<Toast['type'], { box: string; icon: React.ElementType; iconClass: string }> = {
    success: {
        box: 'bg-primary-light border-primary text-black',
        icon: CheckCircle2,
        iconClass: 'text-primary',
    },
    error: {
        box: 'bg-red-50 border-red-500 text-red-900',
        icon: XCircle,
        iconClass: 'text-red-600',
    },
    warning: {
        box: 'bg-amber-50 border-amber-500 text-amber-900',
        icon: AlertTriangle,
        iconClass: 'text-amber-600',
    },
    info: {
        box: 'bg-white border-primary text-black',
        icon: Info,
        iconClass: 'text-primary',
    },
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [nextId, setNextId] = useState(1);

    const showToast = (message: string, type: Toast['type'] = 'info') => {
        const id = nextId;
        setNextId(id + 1);
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            removeToast(id);
        }, 5000);
    };

    const removeToast = (id: number) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast, toasts, removeToast }}>
            {children}
            <div
                className="toast-container pointer-events-none fixed top-4 end-4 z-[9999] flex flex-col gap-2"
                role="status"
                aria-live="polite"
            >
                {toasts.map((toast) => {
                    const { box, icon: Icon, iconClass } = TOAST_STYLES[toast.type] ?? TOAST_STYLES.info;
                    return (
                        <div
                            key={toast.id}
                            className={`toast toast-${toast.type} pointer-events-auto flex min-w-[280px] max-w-[380px] items-center gap-3 rounded-xl border shadow-lg ps-4 pe-2 py-3 ${box}`}
                        >
                            <Icon size={20} className={`shrink-0 ${iconClass}`} />
                            <span className="flex-1 text-sm font-medium">{toast.message}</span>
                            <button
                                type="button"
                                onClick={() => removeToast(toast.id)}
                                aria-label="Dismiss"
                                className="shrink-0 rounded-lg p-1 opacity-60 transition-opacity hover:opacity-100"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
