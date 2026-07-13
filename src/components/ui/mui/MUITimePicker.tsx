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
                        {required && <span className="required-indicator">*</span>}
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
                            sx: {
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px',
                                    backgroundColor: disabled ? '#ECECEC' : '#fff',
                                    '& fieldset': {
                                        borderColor: error ? '#FF3232' : '#CCC9C4',
                                        borderWidth: '2px',
                                    },
                                    '&:hover:not(.Mui-disabled) fieldset': {
                                        borderColor: error ? '#FF3232' : '#016937 !important',
                                        borderWidth: '2px',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#016937 !important',
                                        borderWidth: '2px',
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
