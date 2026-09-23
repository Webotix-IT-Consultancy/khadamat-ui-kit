import React from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { Calendar } from 'lucide-react';
import ValidationMessage from '../../ValidationMessage/ValidationMessage';
<<<<<<< Updated upstream
=======
import useExclusivePicker from '../../../hooks/useExclusivePicker';
import usePickerLocale from '../../../hooks/usePickerLocale';
import pickerFieldSx from '../pickerFieldSx';
import pickerCalendarSx, { pickerPopperProps } from '../pickerCalendarSx';
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
=======
                    // KP1-I95: without `format`, MUI X takes its display pattern from the
                    // adapter's locale — and AdapterDayjs with no `adapterLocale` is dayjs's
                    // default `en`, i.e. MM/DD/YYYY. Every date field in both portals rendered
                    // 12/21/2026 while the placeholder below promised DD/MM/YYYY and
                    // FilterPanel (which does pass `format`) showed the same date the other
                    // way round. DISPLAY only — `onChange` still emits YYYY-MM-DD for the API.
                    format="DD/MM/YYYY"
                    open={picker.open}
                    onOpen={picker.onOpen}
                    onClose={picker.onClose}
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
>>>>>>> Stashed changes
                    disabled={disabled}
                    minDate={minDate}
                    slots={{
                        openPickerIcon: () => <Calendar size={20} color="#016937" />,
                    }}
                    slotProps={{
                        /*
                         * KP1-I532: the calendar's own palette, on the design tokens.
                         * Stock MUI separates a selectable day from a disabled one by
                         * opacity alone and paints the chosen one in ITS blue, so a
                         * month that is mostly out of bounds — the On Hold preferred
                         * date, which may not be in the past — reads as a dead control.
                         * Both paper slots, because the popup is a Popper on desktop and
                         * a Dialog below the picker's own breakpoint.
                         */
                        /*
                         * KP1-I532: flip against the VIEWPORT, not against the dialog
                         * or drawer the field sits in — see `pickerPopperProps`.
                         */
                        popper: pickerPopperProps,
                        desktopPaper: { sx: pickerCalendarSx },
                        mobilePaper: { sx: pickerCalendarSx },
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
