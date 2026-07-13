import React from 'react';
import { Loader2 } from 'lucide-react';
import './Button.css';


const Button = ({
  children,
  type = 'button',
  onClick,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  isLoading = false,
  className = '',
}: any) => {
  // console.log(className,variant);
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`btn btn-${variant} btn-${size} ${className} ${fullWidth ? 'btn-full-width' : ''} ${isLoading ? 'btn-loading-state' : ''} `}
    >
      {isLoading && <Loader2 className="btn-icon-spinner" size={20} />}
      {children}
    </button>
  );
};

export default Button;
