import React from 'react';
import InputField from '../InputElements/InputField/InputField';

interface DetailFieldProps {
    label: string;
    value?: string | number | null;
    /**
     * When true, render nothing if the value is absent (undefined / null / blank string). A
     * numeric 0 still shows — it is a meaningful value, not "empty". Use on view screens so
     * they don't display empty boxes for fields that don't apply.
     */
    hideWhenEmpty?: boolean;
    /** Wrapper class, e.g. a grid col-span for a full-width field. */
    className?: string;
}

const isAbsent = (value: unknown): boolean =>
    value === undefined || value === null || (typeof value === 'string' && value.trim() === '');

/**
 * A read-only detail field for view / summary screens. Renders the shared InputField in its
 * read-only state (greys to #EEEEEE via InputField.css), so a view screen matches the
 * create/edit forms field-for-field. Promoted to ui-kit from the identical `readOnlyField`
 * helper that was duplicated in ContractForm and QuotationForm.
 */
const DetailField: React.FC<DetailFieldProps> = ({ label, value, hideWhenEmpty = false, className }) => {
    if (hideWhenEmpty && isAbsent(value)) return null;

    const field = <InputField label={label} value={value ?? ''} onChange={() => {}} readOnly disabled />;
    return className ? <div className={className}>{field}</div> : field;
};

export default DetailField;
