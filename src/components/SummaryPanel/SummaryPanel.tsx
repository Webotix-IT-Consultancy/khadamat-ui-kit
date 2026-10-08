import React from 'react';

export interface SummaryRow {
    label: React.ReactNode;
    value: React.ReactNode;
    /** A stable key when the rows are records (an invoice id) rather than fixed lines. */
    key?: React.Key;
}

interface SummaryPanelProps {
    title?: string;
    /** Header controls, opposite the title — e.g. the Tax Invoices panel's "Download all". */
    actions?: React.ReactNode;
    rows: SummaryRow[];
    /** A highlighted, bold total row separated from the rest by a divider. */
    total?: SummaryRow;
    className?: string;
    /** The customer portal draws the panel on the light `--primary-light` tint, not the solid fill. */
    userType?: 'customer' | 'admin';
}

/**
 * The solid-gold key/value summary card used by the view / detail screens (Contract Charges,
 * Contract Changes, quotation charges, and the Tax Invoices / Receipts ledger). Filled with the
 * portal's own `--primary` — gold in admin — or, with `userType="customer"`, the light
 * `--primary-light` tint with dark text. Promoted to ui-kit from the `chargesCard` markup that
 * was duplicated in ContractForm and QuotationForm.
 */
const SummaryPanel: React.FC<SummaryPanelProps> = ({ title, actions, rows, total, className = '', userType = 'admin' }) => {
    const isCustomer = userType === 'customer';
    const surface = isCustomer ? 'bg-primary-light text-foreground' : 'bg-primary text-primary-foreground';
    const divider = isCustomer ? 'border-foreground/20' : 'border-primary-foreground/30';

    return (
        <div className={`rounded-lg ${surface} p-5 space-y-2 ${className}`}>
            {(title || actions) && (
                <div className="flex items-center justify-between gap-3">
                    {title && <h3 className="text-base font-semibold">{title}</h3>}
                    {actions}
                </div>
            )}

            {rows.map((row, index) => (
                <div key={row.key ?? index} className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0">{row.label}</span>
                    <span className="font-medium">{row.value}</span>
                </div>
            ))}

            {total && (
                <div className={`flex items-center justify-between text-base font-semibold border-t ${divider} pt-2`}>
                    <span>{total.label}</span>
                    <span>{total.value}</span>
                </div>
            )}
        </div>
    );
};

export default SummaryPanel;
