import React from 'react';
import { Dialog, IconButton } from '@mui/material';
import { X } from 'lucide-react';

interface PopupPrimaryProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    width?: 'sm' | 'md' | 'lg' | 'xl' | 'xs'; // Align with MUI breakpoints if needed, or custom string
    maxWidth?: string; // For custom max-width if needed
}

const PopupPrimary: React.FC<PopupPrimaryProps> = ({
    open,
    onClose,
    title,
    children,
    width = 'md',
}) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={width}
            fullWidth
            PaperProps={{
                className: 'rounded-2xl! bg-white p-0 relative overflow-hidden', // Tailwind classes for Paper
                elevation: 0,
            }}
            slotProps={{
                backdrop: {
                    className: 'bg-black/50 backdrop-blur-sm', // Tailwind for backdrop
                },
            }}
        >
            {/* Close Button */}
            <div className="absolute top-4 right-4 z-10">
                <IconButton
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    size="small"
                >
                    <X size={24} />
                </IconButton>
            </div>

            {/* Content Wrapper */}
            <div className="flex flex-col max-h-[90vh]">
                {title && (
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-200">
                        <h2 className="text-xl font-semibold text-dark dark:text-white text-center">
                            {title}
                        </h2>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    {children}
                </div>
            </div>
        </Dialog>
    );
};

export default PopupPrimary;
