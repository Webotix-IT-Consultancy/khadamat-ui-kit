import React from 'react';
import { Autocomplete, TextField } from '@mui/material';
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
}) => {
    const selectedOption = options.find((opt) => opt.value === value) || null;
    const hasDescriptions = options.some((opt) => !!opt.description);

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
                                fontSize: '16px',
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
