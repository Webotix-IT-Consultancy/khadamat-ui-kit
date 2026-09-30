import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface CollapsibleSectionProps {
    /** Section heading shown in the always-visible header bar. */
    title: string;
    /** Open on first render. Defaults to open so a view/create screen shows everything. */
    defaultOpen?: boolean;
    /**
     * Controlled open state. Pass it together with `onOpenChange` when something OUTSIDE the
     * header button has to open or close the section — the Contract create screen starts POC
     * Info and General Details collapsed and expands them once an enquiry is picked, which an
     * uncontrolled `defaultOpen` cannot express (it is read only on the first render).
     *
     * Omit both and the section stays uncontrolled, exactly as before.
     */
    open?: boolean;
    /** Called with the next state when the user clicks the header. Pair with `open`. */
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
    className?: string;
}

/**
 * The accordion section card used by the admin feature forms and view screens (Contract,
 * Quotation, Cancellation) to match the reference design: a gold-bordered rounded card with a
 * header button and a rotating chevron. Promoted to ui-kit so every view/detail screen shares
 * one section chrome instead of copy-pasting it per feature.
 */
const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
    title,
    defaultOpen = true,
    open: openProp,
    onOpenChange,
    children,
    className = '',
}) => {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);

    // Controlled when `open` is supplied; otherwise the internal state, as before.
    const isControlled = openProp !== undefined;
    const open = isControlled ? openProp : uncontrolledOpen;

    const toggle = () => {
        const next = !open;
        if (!isControlled) setUncontrolledOpen(next);
        onOpenChange?.(next);
    };

    return (
        <section className={`rounded-lg border border-[hsl(var(--border))] ${className}`}>
            <button
                type="button"
                onClick={toggle}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start"
            >
                <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                <ChevronDown
                    size={20}
                    className={`text-foreground transition-transform ${open ? 'rotate-180' : ''}`}
                />
            </button>

            {open && <div className="space-y-5 px-5 pb-5">{children}</div>}
        </section>
    );
};

export default CollapsibleSection;
