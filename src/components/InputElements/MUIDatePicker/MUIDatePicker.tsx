import React from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import '../FormField.css';
import dayjs, { Dayjs } from 'dayjs';
import { Calendar } from 'lucide-react';
import ValidationMessage from '../../ValidationMessage/ValidationMessage';
import useExclusivePicker from '../../../hooks/useExclusivePicker';
import pickerFieldSx from '../pickerFieldSx';

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
    // KP1-I77: one picker popup on screen at a time — see the hook for why MUI's own
    // click-away cannot be relied on for this.
    const picker = useExclusivePicker();

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
                    open={picker.open}
                    onOpen={picker.onOpen}
                    onClose={picker.onClose}
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
                            /**
                             * KP1-I152: this block used to spell out the whole look against
                             * `.MuiOutlinedInput-root` / `.MuiInputBase-input` — classes
                             * `@mui/x-date-pickers` v8 no longer renders, so none of it
                             * applied and the field fell back to MUI's stock 56px/4px/Roboto
                             * outline. It now shares one definition with MUITimePicker;
                             * `pickerFieldSx` documents the DOM change and mirrors
                             * `.input-wrapper` in InputField.css (KP1-I99, I107/I108, I109).
                             *
                             * The old `placeholder: 'DD/MM/YYYY'` went with it: the accessible
                             * field has no <input> to carry a placeholder, and the empty
                             * sections already render the `format` above — DD/MM/YYYY — which
                             * is what was actually on screen the whole time.
                             */
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

export default MUIDatePicker;
