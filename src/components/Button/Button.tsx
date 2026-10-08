import React from 'react';
import { Loader2 } from 'lucide-react';
import './Button.css';

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  type?: 'button' | 'submit' | 'reset';
  variant?: string;
  size?: string;
  fullWidth?: boolean;
  /** Disables the button and shows a spinner beside the label while a request is in flight. */
  isLoading?: boolean;
  /**
   * Alias of `isLoading`. 27 forms were written with `loading={…}` while this component
   * read only `isLoading`, and because its props were typed `any` nothing flagged it: those
   * Save buttons disabled themselves but never showed a spinner. Both spellings now work,
   * and the props are typed, so a THIRD spelling fails `tsc` instead of failing silently.
   */
  loading?: boolean;
}

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  isLoading = false,
  loading = false,
  className = '',
  ...rest
}: ButtonProps) => {
  const busy = isLoading || loading;
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      className={`btn btn-${variant} btn-${size} ${className} ${fullWidth ? 'btn-full-width' : ''} ${busy ? 'btn-loading-state' : ''} `}
    >
      {busy && <Loader2 className="btn-icon-spinner" size={20} aria-hidden="true" />}
      {children}
    </button>
  );
};

export default Button;
