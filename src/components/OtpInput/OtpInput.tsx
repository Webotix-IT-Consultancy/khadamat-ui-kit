import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import './OtpInput.css';

/**
 * Shared one-time-code input — the row of single-digit boxes used by the OTP
 * verification screens in both portals.
 *
 * Controlled on a string array (`['', '', '', '']`) because that is the shape both
 * portals already hold: the admin screen keeps it in local state, the customer
 * screen keeps it in `AuthContext`. The box count is derived from `value.length`,
 * so a 6-digit code needs no change here.
 *
 * Colours come from the design tokens, so the same component renders gold under
 * `body.admin-theme` and green in the customer portal. Box geometry is driven by
 * the CSS custom properties documented in `OtpInput.css` — a caller that needs
 * different dimensions overrides them on `className` rather than restyling the
 * boxes.
 */
export type OtpInputHandle = {
    /** Move focus to the first box — callers use this after a resend clears the code. */
    focusFirst: () => void;
};

export interface OtpInputProps {
    value: string[];
    onChange?: (next: string[]) => void;
    /** Renders the boxes in the destructive colour (wrong-code state). */
    error?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    /** Focus the first box on mount. Defaults to true; pass false for read-only mirrors. */
    autoFocus?: boolean;
    /** Fired once the last empty box is filled, with the joined code. */
    onComplete?: (code: string) => void;
    className?: string;
    'aria-label'?: string;
}

/** True only when every box holds a digit — what callers gate their submit button on. */
export const isOtpComplete = (value: string[]) =>
    Array.isArray(value) && value.length > 0 && value.every((digit) => digit !== '' && digit != null);

const OtpInput = forwardRef<OtpInputHandle, OtpInputProps>(({
    value,
    onChange,
    error = false,
    disabled = false,
    readOnly = false,
    autoFocus = true,
    onComplete,
    className = '',
    'aria-label': ariaLabel = 'One-time code',
}, ref) => {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useImperativeHandle(ref, () => ({
        focusFirst: () => inputRefs.current[0]?.focus(),
    }));

    const commit = (next: string[]) => {
        onChange?.(next);
        if (onComplete && isOtpComplete(next)) onComplete(next.join(''));
    };

    const handleChange = (index: number, raw: string) => {
        // Digits only — keep the last numeric char typed so a letter can't wipe an
        // existing digit, and typing over a filled box replaces it.
        const digit = raw.replace(/\D/g, '').slice(-1);
        if (raw !== '' && digit === '') return;

        const next = [...value];
        next[index] = digit;
        commit(next);

        if (digit && index < value.length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !value[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowLeft' && index > 0) {
            e.preventDefault();
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < value.length - 1) {
            e.preventDefault();
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Pasting a full code fills the remaining boxes instead of dropping all but one digit.
    const handlePaste = (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
        const digits = e.clipboardData.getData('text').replace(/\D/g, '');
        if (!digits) return;
        e.preventDefault();

        const next = [...value];
        for (let i = 0; i < digits.length && index + i < value.length; i++) {
            next[index + i] = digits[i];
        }
        commit(next);
        inputRefs.current[Math.min(index + digits.length, value.length - 1)]?.focus();
    };

    return (
        <div className={`kw-otp ${className}`} role="group" aria-label={ariaLabel}>
            {value.map((digit, index) => (
                <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    className={`kw-otp__box${error ? ' kw-otp__box--error' : ''}`}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={(e) => handlePaste(index, e)}
                    onFocus={(e) => e.target.select()}
                    disabled={disabled}
                    readOnly={readOnly}
                    autoFocus={autoFocus && index === 0}
                    aria-label={`${ariaLabel} digit ${index + 1}`}
                />
            ))}
        </div>
    );
});

OtpInput.displayName = 'OtpInput';

export default OtpInput;
