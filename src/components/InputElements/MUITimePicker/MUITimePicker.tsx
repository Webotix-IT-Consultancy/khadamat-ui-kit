import React from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Clock } from 'lucide-react';
import ValidationMessage from '../../ValidationMessage/ValidationMessage';
<<<<<<< Updated upstream
=======
import useExclusivePicker from '../../../hooks/useExclusivePicker';
import usePickerLocale from '../../../hooks/usePickerLocale';
import pickerFieldSx from '../pickerFieldSx';
import pickerCalendarSx, { pickerPopperProps } from '../pickerCalendarSx';
>>>>>>> Stashed changes

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
                    /*
                     * KP1-I532 — this is NOT a taste decision, it is what makes the rule above work.
                     *
                     * MUI X opens the popup with a Grow transition, i.e. a CSS `scale` that starts near
                     * zero. Popper.js positions the popup on the frame it opens, measures it MID-SCALE
                     * (189px against a real 336px here), finds no overflow, and never runs again — so the
                     * full-size calendar ends up hanging off the bottom of the screen with its correction
                     * already skipped. `reduceAnimations` swaps Grow for Fade: opacity only, no transform,
                     * so the box popper measures is the box the user sees.
                     */
                    reduceAnimations
                    slotProps={{
                        /*
                         * KP1-I532: the clock list is tall too, and it sits in the same
                         * dialogs and filter drawers the calendar does. Same rule, one
                         * definition — see `pickerPopperProps`.
                         */
                        popper: pickerPopperProps,
                        desktopPaper: { sx: pickerCalendarSx },
                        mobilePaper: { sx: pickerCalendarSx },
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
