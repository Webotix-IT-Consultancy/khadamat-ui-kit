import React from 'react';
import '../FormField.css';
import './TextArea.css';
import ValidationMessage from '../../ValidationMessage/ValidationMessage';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    required?: boolean;
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(({
    label,
    error,
    required = false,
    className,
    ...props
}, ref) => {
    return (
        <div className={`textarea-field ${className || ''}`}>
            {label && (
                <div className="textarea-label">
                    {/* KP1-I82: default label colour on error; the wrapper border and the
                        ValidationMessage carry it. */}
                    <label>{label}</label>
                    {required && <span className="required-mark">*</span>}
                </div>
            )}
            <div className={`textarea-wrapper ${error ? 'textarea-wrapper-error' : ''}`}>
                <textarea
                    {...props}
                    ref={ref}
                    className="textarea-element"
                />
            </div>
            <ValidationMessage error={error} />
        </div>
    );
});

TextArea.displayName = 'TextArea';

export default TextArea;
