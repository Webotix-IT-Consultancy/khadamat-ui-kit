import React from 'react';

interface WarningIconProps {
    variant?: 'default' | 'success' | 'error' | 'info' | 'warning';
    size?: 'sm' | 'md' | 'lg';
    type?: 'outline' | 'filled';
}

const WarningIcon: React.FC<WarningIconProps> = ({ 
    className = '',
    variant = 'filled', 
    size = 'md',
}) => {
    // Size mapping
    const sizeMap = {
        sm: 'w-4 h-4 sm:w-5 sm:h-5',
        md: 'w-5 h-5 sm:w-6 sm:h-6',
        lg: 'w-6 h-6 sm:w-8 sm:h-8',
    };

    // Filled version - solid warning icon
    const FilledIcon = () => (
        <svg
            className={`${sizeMap[size]} ${className} fill-current`}
            viewBox="0 0 24 24"
        >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
    );

    // Outline version - hollow warning icon
    const OutlineIcon = () => (
        <svg
            className={`${sizeMap[size]} ${className} stroke-current fill-none`}
            viewBox="0 0 24 24"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    );

    return variant === 'outline' ? <OutlineIcon /> : <FilledIcon />;
};

export default WarningIcon;