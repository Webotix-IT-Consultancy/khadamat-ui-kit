import React from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Clock } from 'lucide-react';
import '../FormField.css';
import ValidationMessage from '../../ValidationMessage/ValidationMessage';

import useExclusivePicker from '../../../hooks/useExclusivePicker';
import usePickerLocale from '../../../hooks/usePickerLocale';
import pickerFieldSx from '../pickerFieldSx';
import pickerCalendarSx, { pickerPopperProps } from '../pickerCalendarSx';
import useExclusivePicker from '../../../hooks/useExclusivePicker';
import usePickerLocale from '../../../hooks/usePickerLocale';
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
    /**
     * The earliest time this picker will accept (KP1-I489).
     *
     * Passed straight to MUI's `TimePicker`, which greys the hours and minutes before it rather
     * than letting them be chosen and refused afterwards. The caller decides when it applies —
     * on a "preferred date and time" pair it is only meaningful when the chosen DATE is today,
     * so passing `undefined` on any other day is the correct use, not a missing bound.
     */
    minTime?: Dayjs;
    /** The latest time, same contract. Unused today; here so the pair is not half a control. */
    maxTime?: Dayjs;
}

const MUITimePicker: React.FC<MUITimePickerProps> = ({
    value,
    onChange,
    label,
    error,
    disabled = false,
    required = false,
    helperText,
    minTime,
    maxTime
}) => {
    // Handle time value string "HH:mm" to Dayjs object
    const timeValue = value ? dayjs(value, 'HH:mm') : null;

    // KP1-I77: shares the slot with the date pickers — a clock popup and a calendar popup
    // are the same defect when both are on screen (On-Call Request has them side by side).
    const picker = useExclusivePicker();
    // KP1-I198: the clock's meridiem and labels come from the ADAPTER, not from a `t()` key.
    const pickerLocale = usePickerLocale();


    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={pickerLocale}>
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
                    minTime={minTime}
                    maxTime={maxTime}
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
