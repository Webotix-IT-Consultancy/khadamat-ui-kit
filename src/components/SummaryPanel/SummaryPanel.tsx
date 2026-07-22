import React from 'react';

export interface SummaryRow {
    label: React.ReactNode;
    value: React.ReactNode;
}

interface SummaryPanelProps {
    title?: string;
    rows: SummaryRow[];
    /** A highlighted, bold total row separated from the rest by a divider. */
    total?: SummaryRow;
    className?: string;
}

/**
 * The solid-gold key/value summary card used by the admin view / detail screens (Contract
 * Charges, Contract Changes, quotation charges). Gold fill with white text to match the admin
 * theme. Promoted to ui-kit from the `chargesCard` markup that was duplicated in ContractForm
 * and QuotationForm.
 */
const SummaryPanel: React.FC<SummaryPanelProps> = ({ title, rows, total, className = '' }) => (
    <div className={`rounded-lg bg-primary text-primary-foreground p-5 space-y-2 ${className}`}>
        {title && <h3 className="text-base font-semibold">{title}</h3>}

        {rows.map((row, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
                <span>{row.label}</span>
                <span className="font-medium">{row.value}</span>
            </div>
        ))}

        {total && (
            <div className="flex items-center justify-between text-base font-semibold border-t border-primary-foreground/30 pt-2">
                <span>{total.label}</span>
                <span>{total.value}</span>
            </div>
        )}
    </div>
);

export default SummaryPanel;
