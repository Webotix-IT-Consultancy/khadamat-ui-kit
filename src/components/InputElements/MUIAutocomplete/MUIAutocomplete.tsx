import React from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import '../FormField.css';
import ValidationMessage from '../../ValidationMessage/ValidationMessage';

interface Option {
    label: string;
    value: string | number;
    /**
     * Secondary line under the label in the dropdown (a code, a reference…). Use it when
     * labels can repeat — e.g. two customers with the same Account Name are only tellable
     * apart by their Customer Code. Also searchable, so typing the code finds the row.
     */
    description?: string;
}

interface MUIAutocompleteProps {
    options: Option[];
    value: string | number | null;
    onChange: (value: string | number | null) => void;
    label?: string;
    placeholder?: string;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    className?: string;
    name?: string;
    /**
     * KP1-I91: what the dropdown says when the typed text matches nothing.
     *
     * Defaults to the shared "No matches found". Override only when a field can say
     * something more useful than that — not to restate the field's own name, which the
     * label directly above the box already gives.
     */
    noOptionsText?: React.ReactNode;
}

const MUIAutocomplete: React.FC<MUIAutocompleteProps> = ({
    options,
    value,
    onChange,
    className,
    label,
    placeholder,
    error,
    disabled = false,
    required = false,
    name,
    noOptionsText,
}) => {
    const { t } = useTranslation(['common']);
    const selectedOption = options.find((opt) => opt.value === value) || null;
    const hasDescriptions = options.some((opt) => !!opt.description);

    /**
     * KP1-I91: MUI's own default is the bare "No options", which reads as though the
     * dropdown is broken or empty rather than as an answer to what was typed. A search that
     * matches nothing — including one containing characters no area or account name has —
     * now says so.
     *
     * This is the tester's second suggestion rather than the first: silently stripping
     * "invalid" characters from the query would answer a question the user did not ask, and
     * these lists hold real names with `&`, `-`, `(`, `.` in them. The field cannot accept a
     * typed non-value in any case — no Autocomplete here is `freeSolo`, so MUI restores the
     * last valid selection on blur.
     *
     * The literal is passed as i18next's defaultValue, not left to the key existing: a
     * missing key in this package fails silently as visible raw text, and a dropdown reading
     * `common:emptyStates.noMatches` would be worse than the bug (KP1-I56).
     */
    const emptyText = noOptionsText ?? t('common:emptyStates.noMatches', 'No matches found');

    return (
        <div className={`form-field ${className || ''} ${error ? 'has-error' : ''}`}>
            {label && (
                <div className="field-label input-label">
                    <label htmlFor={name}>{label}</label>
                    {required && <span className="required-mark">*</span>}
                </div>
            )}
            <Autocomplete
                id={name}
                options={options}
                getOptionLabel={(option) => option.label}
                // Options are usually rebuilt on each render, so identity comparison would
                // drop the selection; and repeated labels make `value` the only safe key.
                isOptionEqualToValue={(option, selected) => option.value === selected.value}
                value={selectedOption}
                onChange={(_, newValue) => {
                    onChange(newValue ? newValue.value : null);
                }}
                disabled={disabled}
                noOptionsText={emptyText}
                // Only overridden when descriptions are in play — with duplicate labels the
                // code is what the user actually searches on. `undefined` keeps MUI's own
                // filter (accent-insensitive) for every other dropdown.
                filterOptions={
                    hasDescriptions
                        ? (opts, state) => {
                            const query = state.inputValue.trim().toLowerCase();
                            if (!query) return opts;
                            return opts.filter(
                                (o) =>
                                    o.label.toLowerCase().includes(query) ||
                                    (o.description ?? '').toLowerCase().includes(query),
                            );
                        }
                        : undefined
                }
                renderOption={(props, option) => {
                    // MUI puts `key` inside the spread props; React warns unless it is passed
                    // separately, and repeated labels make `value` the only stable key.
                    const { key: _key, ...liProps } = props as React.HTMLAttributes<HTMLLIElement> & {
                        key?: React.Key;
                    };
                    return (
                        <li key={String(option.value)} {...liProps}>
                            {option.description ? (
                                <span className="flex flex-col">
                                    <span>{option.label}</span>
                                    <span className="text-xs text-grey-500">{option.description}</span>
                                </span>
                            ) : (
                                option.label
                            )}
                        </li>
                    );
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder={placeholder}
                        error={!!error}
                        variant="outlined"
                        size="medium"
                        fullWidth
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                // KP1-I107/I108: MUI sizes its own control (~56px at
                                // size="medium"), so a dropdown stood taller than the
                                // InputField and PhoneInput beside it in the same row. Same
                                // token as `.input-wrapper` in InputField.css.
                                height: 'var(--input-large-height)',
                                // KP1-I109: tokens, so the surface follows the theme and the
                                // disabled grey matches InputField.css's read-only `#EEEEEE`.
                                borderRadius: 'var(--radius-r-10)',
                                backgroundColor: disabled ? '#EEEEEE' : 'hsl(var(--background))',
                                '& fieldset': {
                                    borderColor: error ? 'hsl(var(--destructive))' : 'hsl(var(--primary))',
                                    borderWidth: '2px',

                                },
                                '&:hover fieldset': {
                                    borderColor: error ? 'hsl(var(--destructive))' : 'hsl(var(--primary))',

                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'hsl(var(--primary))',
                                    boxShadow: '0 0 0 4px hsl(var(--primary-light))',

                                },
                            },
                            '& .MuiInputBase-input': {
                                // KP1-I99: a literal 16px cannot answer a media query, and
                                // this is the control the ticket was filed against — at
                                // 1200px the selected "United Arab Emirates (UAE)" needed
                                // ~216px in a column that offered ~224px, so MUI's
                                // `text-overflow: ellipsis` cut it. The token drops to 14px
                                // below `xl`, where the columns are narrow.
                                fontSize: 'var(--input-font-size)',
                                fontFamily: "'Poppins', sans-serif",
                                color: '#000',
                            }
                        }}
                    />
                )}
                sx={{
                    width: '100%',
                }}
                popupIcon={
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9L12 15L18 9" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                }
            />
            <ValidationMessage error={error} />
        </div>
    );
};

export default MUIAutocomplete;
