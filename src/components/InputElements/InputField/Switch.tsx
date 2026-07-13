import React from 'react';
import './Switch.css';

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
    label?: React.ReactNode;
    error?: string;
    required?: boolean;
    size?: 'sm' | 'md' | 'lg';
    /** Position of the label relative to the switch */
    labelPosition?: 'left' | 'right';
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(({
    label,
    size = 'md',
    error,
    required,
    disabled,
    checked,
    id,
    className = '',
    labelPosition = 'right',
    onChange,
    ...props
}, ref) => {
    const switchId = id || `switch-${Math.random().toString(36).substr(2, 9)}`;
    const isChecked = checked ?? false;

    const trackSizeClass = `switch-track-${size}`;
    const thumbSizeClass = `switch-thumb-${size}`;
    const trackStateClass = isChecked ? 'switch-track-checked' : 'switch-track-unchecked';
    const thumbStateClass = isChecked ? 'switch-thumb-checked' : 'switch-thumb-unchecked';

    const labelElement = label && (
        <label
            htmlFor={switchId}
            className={`switch-label ${error ? 'switch-label-error' : ''} ${disabled ? 'switch-label-disabled' : ''}`}
        >
            {label}
            {required && <span className="switch-required-mark">*</span>}
        </label>
    );

    return (
        <div className={`switch-field ${className}`}>
            <div className="switch-wrapper">
                {labelPosition === 'left' && labelElement}

                <div className="switch-container">
                    <input
                        type="checkbox"
                        role="switch"
                        id={switchId}
                        ref={ref}
                        checked={isChecked}
                        disabled={disabled}
                        onChange={onChange}
                        className="switch-input"
                        aria-checked={isChecked}
                        {...props}
                    />
                    <span
                        className={`switch-track ${trackSizeClass} ${trackStateClass}`}
                        aria-hidden="true"
                    >
                        <span className={`switch-thumb ${thumbSizeClass} ${thumbStateClass}`} />
                    </span>
                </div>

                {labelPosition === 'right' && labelElement}
            </div>
            {error && (
                <p className="switch-error-message">{error}</p>
            )}
        </div>
    );
});

Switch.displayName = 'Switch';

export default Switch;
