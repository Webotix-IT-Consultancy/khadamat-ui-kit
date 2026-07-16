import React, { useId } from 'react';
import { cn } from '../../../lib/utils';
import './RadioGroup.css';

export interface RadioOption<T extends string = string> {
    value: T;
    label: string;
    disabled?: boolean;
}

interface RadioGroupProps<T extends string = string> {
    /** Radio `name`; auto-generated when omitted so two groups can't collide. */
    name?: string;
    options: RadioOption<T>[];
    value: T;
    onChange: (value: T) => void;
    /** Accessible group label. Rendered visually only when `showLegend`. */
    legend?: string;
    showLegend?: boolean;
    orientation?: 'horizontal' | 'vertical';
    className?: string;
}

function RadioGroup<T extends string = string>({
    name,
    options,
    value,
    onChange,
    legend,
    showLegend = false,
    orientation = 'horizontal',
    className,
}: RadioGroupProps<T>) {
    const generatedName = useId();
    const groupName = name || generatedName;

    return (
        <fieldset
            className={cn(
                'radio-group',
                orientation === 'vertical' && 'radio-group--vertical',
                className
            )}
        >
            {legend && <legend className={showLegend ? 'radio-group-legend' : 'sr-only'}>{legend}</legend>}
            {options.map((option) => (
                <label
                    key={option.value}
                    className={cn('radio-option', option.disabled && 'radio-option--disabled')}
                >
                    <input
                        type="radio"
                        className="radio-option-input"
                        name={groupName}
                        value={option.value}
                        checked={value === option.value}
                        disabled={option.disabled}
                        onChange={() => onChange(option.value)}
                    />
                    <span className="radio-option-control" aria-hidden="true" />
                    <span className="radio-option-label">{option.label}</span>
                </label>
            ))}
        </fieldset>
    );
}

export default RadioGroup;
