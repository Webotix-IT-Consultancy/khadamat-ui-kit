import React, { useState } from 'react';
import './InputField.css';
import ValidationMessage from '../../ValidationMessage/ValidationMessage';

const InputField = React.forwardRef(({
  label,
  type = 'text',
  required = false,
  icon,
  prefix,
  suffix,
  placeholder,
  value,
  onChange,
  onBlur,
  showPasswordToggle = false,
  error,
  ...props
}: any, ref: any) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = showPasswordToggle && showPassword ? 'text' : type;

  const renderIcon = (iconName: any, isError = false) => {
    const strokeColor = isError ? 'hsl(var(--error))' : 'hsl(var(--primary))';
    const icons: any = {
      building: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 11V7M16 11V7M21 2H3V18H8V22L12 18H17L21 14V2Z" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      mail: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6M22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6M22 6L12 13L2 6" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      lock: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11M5 11H19C20.1046 11 21 11.8954 21 13V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V13C3 11.8954 3.89543 11 5 11Z" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    };
    return icons[iconName] || null;
  };

  const renderEyeIcon = (isVisible: boolean, isError = false) => {
    const strokeColor = isError ? '#FF3232' : 'hsl(var(--primary))';

    if (isVisible) {
      // Eye Off (Slash) Icon
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M1 1l22 22" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }

    // Eye Open Icon
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  return (
    <div className="input-field">
      {label && (
        <div className="input-label">
          <label className={error ? 'label-error' : ''}>{label}</label>
          {required && <span className="required-mark">*</span>}
        </div>
      )}
      <div className={`relative input-wrapper focus-within:ring-4 focus-within:ring-primary-light focus-within:border-primary ${error ? 'input-wrapper-error' : ''}`}>
        {prefix && <div className="input-prefix">{prefix}</div>}
        {icon && <div className="input-icon-left">{renderIcon(icon, error)}</div>}
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          {...props}
          ref={ref}
          className="input-element"
        />
        {suffix && <div className="input-suffix">{suffix}</div>}
        {showPasswordToggle && (
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
          >
            {renderEyeIcon(showPassword, error)}
          </button>
        )}
      </div>
      <ValidationMessage error={error} />
    </div>
  );
}
);

export default InputField;
