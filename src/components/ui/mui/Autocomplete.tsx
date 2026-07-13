import React from 'react';
import { Autocomplete as MuiAutocomplete, TextField, CircularProgress, InputAdornment } from '@mui/material';
import ValidationMessage from '../../ValidationMessage/ValidationMessage';

interface Option {
    label: string;
    value: string | number;
}

interface AutocompleteProps<T = Option> {
    options: T[];
    value: string | number | null;
    onChange: (value: string | number | null) => void;
    getOptionLabel?: (option: T) => string;
    getOptionValue?: (option: T) => string | number;
    label?: string;
    placeholder?: string;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    name?: string;
    icon?: React.ReactNode; // Left icon
    suffixIcon?: React.ReactNode; // Suffix icon
    loading?: boolean;
    onBlur?: () => void;
    className?: string;
}

const AutocompleteInput = <T extends any>({
    options,
    value,
    onChange,
    getOptionLabel = (option: any) => option.label,
    getOptionValue = (option: any) => option.value,
    label,
    placeholder,
    error,
    disabled = false,
    required = false,
    name,
    icon,
    suffixIcon,
    loading = false,
    onBlur,
    className = '',
}: AutocompleteProps<T>) => {
    // Find selected option based on value
    const selectedOption = options.find((opt) => getOptionValue(opt) === value) || null;

    return (
        <div className={`input-field ${className} ${error ? 'has-error' : ''}`}>
            {label && (
                <div className="input-label">
                    <label className={error ? 'label-error' : ''} htmlFor={name}>{label}</label>
                    {required && <span className="required-mark">*</span>}
                </div>
            )}
            <MuiAutocomplete
                id={name}
                options={options}
                getOptionLabel={getOptionLabel}
                value={selectedOption}
                onChange={(_, newValue) => {
                    onChange(newValue ? getOptionValue(newValue) : null);
                }}
                disabled={disabled}
                loading={loading}
                onBlur={onBlur}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder={placeholder}
                        error={!!error}
                        variant="outlined"
                        size="medium"
                        fullWidth
                        InputProps={{
                            ...params.InputProps,
                            startAdornment: icon ? (
                                <InputAdornment position="start" sx={{ ml: 1 }}>
                                    {icon}
                                </InputAdornment>
                            ) : null,
                            endAdornment: (
                                <React.Fragment>
                                    {suffixIcon}
                                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                    {params.InputProps.endAdornment}
                                </React.Fragment>
                            ),
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '10px',
                                backgroundColor: disabled ? '#ECECEC' : '#fff',
                                '& fieldset': {
                                    borderColor: error ? '#FF3232' : 'hsl(var(--primary))',
                                    borderWidth: '2px',
                                },
                                '&:hover fieldset': {
                                    borderColor: error ? '#FF3232' : 'hsl(var(--primary))',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'hsl(var(--primary))',
                                    boxShadow: '0 0 0 3px hsla(var(--primary), 0.1)',
                                },
                            },
                            '& .MuiInputBase-input': {
                                fontSize: '14px',
                                fontFamily: "'Poppins', sans-serif",
                                color: 'hsl(var(--foreground))',
                                padding: icon ? '12px 14px 12px 0px !important' : '12px 14px !important',
                            }
                        }}
                    />
                )}
                sx={{
                    width: '100%',
                }}
                popupIcon={
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9L12 15L18 9" stroke="#016937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                }
            />
            <ValidationMessage error={error} />
        </div>
    );
};

export default AutocompleteInput;
