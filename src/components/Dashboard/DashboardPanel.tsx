import React from 'react';

interface DashboardPanelProps {
    /** Bold heading. Omit for a bare card. */
    title?: React.ReactNode;
    /** One line under the title — what the panel measures. */
    subtitle?: React.ReactNode;
    /** Controls on the heading's far side (series toggles, a period chip). Wraps under the title on narrow screens. */
    actions?: React.ReactNode;
    /** Layout only — widths, margins, grid placement. Never colour. */
    className?: string;
    children?: React.ReactNode;
}

/**
 * The white card every dashboard panel sits in — the chrome, and nothing else.
 *
 * It exists so the panels on a dashboard share ONE surface, radius, padding and heading style,
 * rather than each chart restating `rounded-2xl bg-card p-5 shadow-sm` and drifting (the same
 * failure the Track timeline and `InlineAlert` were promoted to stop). The CALLER supplies every
 * word, already translated; nothing here resolves a string, so it serves both portals.
 *
 * Logical spacing throughout, so the actions sit on the trailing side in an RTL page too.
 */
const DashboardPanel: React.FC<DashboardPanelProps> = ({ title, subtitle, actions, className = '', children }) => (
    <section className={`rounded-2xl bg-card p-5 shadow-sm ${className}`}>
        {(title || subtitle || actions) && (
            <header className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                    {title && <h3 className="text-base font-semibold text-foreground">{title}</h3>}
                    {subtitle && <p className="text-xs text-foreground/70">{subtitle}</p>}
                </div>
                {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
            </header>
        )}
        {children}
    </section>
);

export default DashboardPanel;
