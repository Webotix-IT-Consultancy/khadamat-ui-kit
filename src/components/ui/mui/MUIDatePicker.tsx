import React from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField } from '@mui/material';
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
                    <div className="field-label">
                        <label>{label}</label>
                        {required && <span className="required-indicator">*</span>}
                    </div>
                )}
                <DatePicker
                    value={value ? dayjs(value) : null}
                    onChange={(newValue) => onChange(newValue ? newValue.format('YYYY-MM-DD') : null)}
                    disabled={disabled}
                    minDate={minDate}
                    slots={{
                        openPickerIcon: () => <Calendar size={20} color="#016937" />,
                    }}
                    slotProps={{
                        textField: {
                            fullWidth: true,
                            error: !!error,
                            placeholder: 'DD/MM/YYYY',
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

export default MUIDatePicker;
