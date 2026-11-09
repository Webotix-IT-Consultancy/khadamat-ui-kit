import React from 'react';

export interface StatBreakdownItem {
    key: string;
    label: React.ReactNode;
    value: React.ReactNode;
}

interface StatCardProps {
    label: React.ReactNode;
    /** Already formatted by the caller (`formatAed`, a count…). */
    value: React.ReactNode;
    /**
     * `danger` for a figure that is bad news by its sign — a negative balance. The caller decides;
     * the card never inspects the value, which may be a formatted string.
     */
    tone?: 'default' | 'danger';
    /** A chip beside the label — a `StatusBadge`, typically. */
    badge?: React.ReactNode;
    /**
     * The card's icon (a lucide icon, an `Icons/*` component), tinted `--primary`. On a plain card
     * it sits in a tile on the leading side, with the label and value stacked beside it; on a
     * card with a `breakdown` there is no room for the tile, so it sits inline before the label.
     */
    icon?: React.ReactNode;
    /**
     * Sub-figures under the main one — e.g. Total Customers split Prepaid / Postpaid. When
     * present the value moves onto the label's line so the split has room.
     */
    breakdown?: StatBreakdownItem[];
    /** Layout only. */
    className?: string;
}

/**
 * A single headline figure — the tile across the top of a dashboard.
 *
 * Tinted with `--primary-light`, so it is gold in admin and green in the customer portal with no
 * per-portal code. The caller formats the value and translates the label; the card only lays
 * them out. Lay several out with a plain grid at the call site — a row of cards is a layout, not
 * a component.
 */
const StatCard: React.FC<StatCardProps> = ({ label, value, tone = 'default', badge, icon, breakdown, className = '' }) => {
    const valueClass = `font-semibold ${tone === 'danger' ? 'text-[hsl(var(--destructive))]' : 'text-foreground'}`;
    const hasBreakdown = Boolean(breakdown?.length);

    if (hasBreakdown) {
        return (
            <div className={`rounded-2xl bg-[hsl(var(--primary-light))] p-4 ${className}`}>
                <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                        {icon && (
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary" aria-hidden="true">
                                {icon}
                            </span>
                        )}
                        <p className="text-xs font-medium text-foreground/70">{label}</p>
                    </div>
                    <p className={`text-lg ${valueClass}`}>{value}</p>
                </div>
                <dl className="mt-2 grid grid-cols-2 gap-2">
                    {breakdown!.map((item) => (
                        <div key={item.key} className="flex items-center justify-between rounded-full bg-card px-3 py-1 text-xs">
                            <dt className="text-foreground/70">{item.label}</dt>
                            <dd className="font-semibold text-foreground">{item.value}</dd>
                        </div>
                    ))}
                </dl>
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-3 rounded-2xl bg-[hsl(var(--primary-light))] p-4 ${className}`}>
            {/* Decorative — the label beside it already says what the figure is. */}
            {icon && (
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary" aria-hidden="true">
                    {icon}
                </span>
            )}
            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <p className="text-xs text-foreground/70">{label}</p>
                    {badge}
                </div>
                <p className={`mt-1 text-lg ${valueClass}`}>{value}</p>
            </div>
        </div>
    );
};

export default StatCard;
