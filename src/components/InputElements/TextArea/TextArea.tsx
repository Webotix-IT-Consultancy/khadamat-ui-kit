import React from 'react';
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
                    <label className={error ? 'label-error' : ''}>{label}</label>
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
