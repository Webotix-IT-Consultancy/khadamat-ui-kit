import React from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField } from '@mui/material';
import '../FormField.css';
import dayjs, { Dayjs } from 'dayjs';
import { Calendar } from 'lucide-react';
import ValidationMessage from '../../ValidationMessage/ValidationMessage';

interface MUIDatePickerProps {
    value: string | null;
    onChange: (value: string | null) => void;
    label?: string;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    minDate?: Dayjs;
    helperText?: string;
}

const MUIDatePicker: React.FC<MUIDatePickerProps> = ({
    value,
    onChange,
    label,
    error,
    disabled = false,
    required = false,
    minDate,
    helperText
}) => {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className={`form-field ${error ? 'has-error' : ''}`}>
                {label && (
                    // `input-label` alongside `field-label` (KP1-I107/I108): both are styled
                    // identically now, but carrying the pair keeps this label matching
                    // MUIAutocomplete's markup exactly.
                    <div className="field-label input-label">
                        <label>{label}</label>
                        {required && <span className="required-mark">*</span>}
                    </div>
                )}
                <DatePicker
                    value={value ? dayjs(value) : null}
                    onChange={(newValue) => onChange(newValue ? newValue.format('YYYY-MM-DD') : null)}
                    // KP1-I95: without `format`, MUI X takes its display pattern from the
                    // adapter's locale — and AdapterDayjs with no `adapterLocale` is dayjs's
                    // default `en`, i.e. MM/DD/YYYY. Every date field in both portals rendered
                    // 12/21/2026 while the placeholder below promised DD/MM/YYYY and
                    // FilterPanel (which does pass `format`) showed the same date the other
                    // way round. DISPLAY only — `onChange` still emits YYYY-MM-DD for the API.
                    format="DD/MM/YYYY"
                    disabled={disabled}
                    minDate={minDate}
                    slots={{
                        // KP1-I109: was the literal #016937 — `:root --primary`, i.e. the
                        // CUSTOMER portal's green — so this icon stayed green inside the
                        // admin portal's gold theme. Same token InputField's icons use.
                        openPickerIcon: () => <Calendar size={20} color="hsl(var(--primary))" />,
                    }}
                    slotProps={{
                        textField: {
                            fullWidth: true,
                            error: !!error,
                            placeholder: 'DD/MM/YYYY',
                            /**
                             * KP1-I109: every colour here was a literal, and they were the
                             * WRONG literals — `#CCC9C4` at rest where the InputField beside
                             * it uses `hsl(var(--primary))`, and `#016937` (which is `:root
                             * --primary`, the customer portal's green) on hover and focus, so
                             * in the admin portal's gold theme this one field went green.
                             *
                             * Mirrors `.input-wrapper` in InputField.css token for token —
                             * that is the "adjacent Trade License input field" the ticket says
                             * this must match, and tokens are what make it follow the theme.
                             */
                            sx: {
                                '& .MuiOutlinedInput-root': {
                                    // KP1-I107/I108: MUI sizes its own control (~56px at
                                    // size="medium"), so a date picker stood 4px taller than
                                    // the InputField and PhoneInput beside it in the same row.
                                    height: 'var(--input-large-height)',
                                    borderRadius: 'var(--radius-r-10)',
                                    // #EEEEEE is InputField.css's read-only surface (the
                                    // `:has(:read-only)` rule); PhoneInput matches it too.
                                    backgroundColor: disabled ? '#EEEEEE' : 'hsl(var(--background))',
                                    '& fieldset': {
                                        borderColor: error
                                            ? 'hsl(var(--destructive))'
                                            : disabled
                                                ? 'transparent'
                                                : 'hsl(var(--primary))',
                                        borderWidth: '2px',
                                    },
                                    '&:hover:not(.Mui-disabled) fieldset': {
                                        borderColor: error
                                            ? 'hsl(var(--destructive))'
                                            : 'hsl(var(--primary))',
                                        borderWidth: '2px',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: error
                                            ? 'hsl(var(--destructive))'
                                            : 'hsl(var(--primary))',
                                        borderWidth: '2px',
                                    },
                                    // The focus ring the other controls show (InputField via
                                    // `focus-within:ring-4`, MUIAutocomplete via this same
                                    // boxShadow). Its absence was part of "overall appearance".
                                    '&.Mui-focused': {
                                        boxShadow: error
                                            ? '0 0 0 4px hsl(var(--destructive) / 0.3)'
                                            : '0 0 0 4px hsl(var(--primary-light))',
                                    },
                                },
                                '& .MuiInputBase-input': {
                                    fontSize: '16px',
                                    fontFamily: "'Poppins', sans-serif",
                                    color: '#000',
                                }
                            }
                        },
                    }}
                />
                {helperText && !error && <p className="helper-text">{helperText}</p>}
                <ValidationMessage error={error} />
            </div>
        </LocalizationProvider>
    );
};

export default MUIDatePicker;
