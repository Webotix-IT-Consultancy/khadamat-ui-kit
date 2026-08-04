import React from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Clock } from 'lucide-react';
import ValidationMessage from '../../ValidationMessage/ValidationMessage';

dayjs.extend(customParseFormat);

interface MUITimePickerProps {
    value: string | null;
    onChange: (value: string | null) => void;
    label?: string;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    helperText?: string;
}

const MUITimePicker: React.FC<MUITimePickerProps> = ({
    value,
    onChange,
    label,
    error,
    disabled = false,
    required = false,
    helperText
}) => {
    // Handle time value string "HH:mm" to Dayjs object
    const timeValue = value ? dayjs(value, 'HH:mm') : null;

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className={`form-field ${error ? 'has-error' : ''}`}>
                {label && (
                    <div className="field-label">
                        <label>{label}</label>
                        {required && <span className="required-mark">*</span>}
                    </div>
                )}
                <TimePicker
                    value={timeValue}
                    onChange={(newValue) => onChange(newValue ? newValue.format('HH:mm') : null)}
                    disabled={disabled}
                    slots={{
                        openPickerIcon: () => <Clock size={20} color="#000" />,
                    }}
                    slotProps={{
                        textField: {
                            fullWidth: true,
                            error: !!error,
                            placeholder: 'Select Time',
                            // Same treatment as MUIDatePicker (KP1-I109): this carried the
                            // identical hardcoded palette — `#CCC9C4` at rest and `#016937`
                            // (the customer portal's green) on hover/focus — so it went green
                            // inside the admin portal's gold theme too. Tokens now, matching
                            // `.input-wrapper` in InputField.css.
                            sx: {
                                '& .MuiOutlinedInput-root': {
                                    height: 'var(--input-large-height)',
                                    borderRadius: 'var(--radius-r-10)',
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

export default MUITimePicker;
