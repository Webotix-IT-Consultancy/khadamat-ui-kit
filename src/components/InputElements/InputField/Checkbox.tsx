import React from 'react';
import './Checkbox.css';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: React.ReactNode;
    error?: string;
    required?: boolean;
    size?: 'sm' | 'md' | 'lg';
    verticalAlign?: 'top' | 'center' | 'bottom';
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({
    label,
    size = 'md',
    error,
    required,
    id,
    className = '',
    verticalAlign='',
    ...props
}, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className={`checkbox-field ${className}`}>
            <div className={`checkbox-wrapper items-${verticalAlign}`} >
                <input
                    type="checkbox"
                    id={checkboxId}
                    ref={ref}
                    {...props}

                    className={`checkbox-input ${size === 'lg' ? 'checkbox-input-lg' : size === 'md' ? 'checkbox-input-md' : 'checkbox-input-sm'}`}
                />
                {label && (
                    <label htmlFor={checkboxId} className={`checkbox-label ${error ? 'label-error' : ''}`}>
                        {label}
                        {required && <span className="required-mark">*</span>}
                    </label>
                )}
            </div>
            {error && (
                <p className="checkbox-error-message">{error}</p>
            )}
        </div>
    );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
