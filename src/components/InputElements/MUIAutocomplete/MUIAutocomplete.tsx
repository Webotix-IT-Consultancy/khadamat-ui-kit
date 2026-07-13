import React from 'react';
import { Autocomplete, TextField } from '@mui/material';
import ValidationMessage from '../../ValidationMessage/ValidationMessage';

interface Option {
    label: string;
    value: string | number;
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
    name?: string;
}

const MUIAutocomplete: React.FC<MUIAutocompleteProps> = ({
    options,
    value,
    onChange,
    label,
    placeholder,
    error,
    disabled = false,
    required = false,
    name,
}) => {
    const selectedOption = options.find((opt) => opt.value === value) || null;

    return (
        <div className={`form-field ${error ? 'has-error' : ''}`}>
            {label && (
                <div className="field-label input-label">
                    <label htmlFor={name}>{label}</label>
                    {required && <span className="required-indicator">*</span>}
                </div>
            )}
            <Autocomplete
                id={name}
                options={options}
                getOptionLabel={(option) => option.label}
                value={selectedOption}
                onChange={(_, newValue) => {
                    onChange(newValue ? newValue.value : null);
                }}
                disabled={disabled}
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
