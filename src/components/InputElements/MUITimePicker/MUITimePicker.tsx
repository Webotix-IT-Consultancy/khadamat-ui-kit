import React from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Clock } from 'lucide-react';
import '../FormField.css';
import ValidationMessage from '../../ValidationMessage/ValidationMessage';
import useExclusivePicker from '../../../hooks/useExclusivePicker';
import pickerFieldSx from '../pickerFieldSx';

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

    // KP1-I77: shares the slot with the date pickers — a clock popup and a calendar popup
    // are the same defect when both are on screen (On-Call Request has them side by side).
    const picker = useExclusivePicker();

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
                    open={picker.open}
                    onOpen={picker.onOpen}
                    onClose={picker.onClose}
                    disabled={disabled}
                    slots={{
                        // KP1-I152: was a literal #000 while MUIDatePicker's calendar uses
                        // `hsl(var(--primary))` (KP1-I109) — the two pickers sit side by side
                        // on the On-Call Request form with one black icon and one themed one.
                        openPickerIcon: () => <Clock size={20} color="hsl(var(--primary))" />,
                    }}
                    slotProps={{
                        textField: {
                            fullWidth: true,
                            error: !!error,
                            // KP1-I152: carried the same dead `.MuiOutlinedInput-root` /
                            // `.MuiInputBase-input` selectors as MUIDatePicker and rendered
                            // just as unstyled — v8's TimePicker composes the same accessible
                            // field DOM. One shared definition now; see `pickerFieldSx`.
                            //
                            // `placeholder: 'Select Time'` is gone with it — the accessible
                            // field has no <input> to put it on, and the empty sections show
                            // the time format instead, as the date picker shows DD/MM/YYYY.
                            sx: pickerFieldSx({ error: !!error, disabled }),
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
