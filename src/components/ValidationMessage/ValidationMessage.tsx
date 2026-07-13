import React from 'react';
import './ValidationMessage.css';

interface ValidationMessageProps {
    error?: string;
    className?: string;
}

const ValidationMessage: React.FC<ValidationMessageProps> = ({ error, className = '' }) => {
    if (!error) return null;

    return (
        <p className={`validation-message error-message ${className}`} >
            {error}
        </p>
    );
};

export default ValidationMessage;
