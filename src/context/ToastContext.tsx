import React, { createContext, useContext, useState, ReactNode } from 'react';

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
            <div className="toast-container" style={{
                position: 'fixed',
                top: '1rem',
                right: '1rem',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
            }}>
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`toast toast-${toast.type}`}
                        style={{
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            background: toast.type === 'success' ? '#10b981' : toast.type === 'error' ? '#ef4444' : '#3b82f6',
                            color: 'white',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            minWidth: '250px'
                        }}
                    >
                        {toast.message}
                    </div>
                ))}
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
