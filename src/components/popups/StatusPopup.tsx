import React, { useEffect, useRef } from 'react';
import { Check, X as XIcon } from 'lucide-react';
import PopupPrimary from './PopupPrimary';

/** How long the confirmation stays up before dismissing itself. */
const DEFAULT_AUTO_CLOSE_MS = 4000;

export interface StatusPopupProps {
    open: boolean;
    onClose: () => void;
    /** The outcome line, e.g. "Enquiry Saved Successfully!". */
    title: string;
    /** Optional second line under the title. */
    subtitle?: string;
    status?: 'success' | 'error';
    /**
     * The reference of the thing just created or changed — an Enquiry Code, a Customer
     * Code — shown in the status colour so the user can read it off the confirmation
     * rather than hunting for the record. Empty/absent hides the block.
     */
    highlight?: string | null;
    /** Caption above `highlight`, e.g. "Enquiry No." or "Assigned to". */
    highlightLabel?: string;
    /** A second highlighted line, for a confirmation that reports two things. */
    secondaryHighlight?: string | null;
    /** Caption above `secondaryHighlight`. */
    secondaryHighlightLabel?: string;
    /** Milliseconds before it closes itself; pass 0 to require a manual dismiss. */
    autoCloseMs?: number;
    /**
     * Accepted and ignored. `SubmitStatus` took this to hide its X; this popup has no
     * Close button at all, so callers migrating from it need no edit.
     */
    hideClose?: boolean;
}

/**
 * **The** alert popup (KP1-I124). A status icon, the outcome line, and an optional
 * highlighted reference beneath it — nothing else, and in that order.
 *
 * Every "saved / updated / failed" dialog in both portals used to be `SubmitStatus`, which
 * is really the wallet-recharge receipt: a 690px dialog with a horizontal divider and a
 * Close button, both rendered unconditionally. Telling a user "Enquiry Saved Successfully!"
 * through it meant a half-screen modal with a rule across it and a button to dismiss what
 * dismisses itself. The design asks for icon + message, so that is all this renders:
 *
 *  - **no horizontal divider**
 *  - **no Close button** — it closes itself after `autoCloseMs`, and the shell's X remains
 *    for anyone who wants out sooner
 *  - `width="xs"`, not the receipt's 690px
 *
 * `SubmitStatus` stays for what it was built for — the wallet, on-call and feedback
 * receipts, which genuinely have details, an emailed-confirmation notice and a download
 * action to show.
 *
 * Strings are passed in; this holds no copy of its own, so each portal keeps its own i18n
 * namespace (and the customer portal its Arabic).
 */
const StatusPopup: React.FC<StatusPopupProps> = ({
    open,
    onClose,
    title,
    subtitle,
    status = 'success',
    highlight,
    highlightLabel,
    secondaryHighlight,
    secondaryHighlightLabel,
    autoCloseMs = DEFAULT_AUTO_CLOSE_MS,
}) => {
    const isSuccess = status === 'success';
    // `--success` / `--destructive` rather than literals, so the icon follows each portal's
    // theme (the trap KP1-I109 hit: a hardcoded green inside the admin gold theme).
    const tone = isSuccess ? 'hsl(var(--success))' : 'hsl(var(--destructive))';

    // Held in a ref so an inline `onClose` (a new function every render) can't restart the
    // countdown — the timer depends only on the popup being open and for how long.
    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    });

    useEffect(() => {
        if (!open || !autoCloseMs) return;
        const timer = setTimeout(() => onCloseRef.current(), autoCloseMs);
        return () => clearTimeout(timer);
    }, [open, autoCloseMs]);

    const line = (value?: string | null, label?: string) =>
        value ? (
            <div className="flex flex-col items-center gap-2">
                {label && <p className="text-lg font-medium text-foreground">{label}</p>}
                <p className="text-sm font-semibold" style={{ color: tone }}>
                    {value}
                </p>
            </div>
        ) : null;

    return (
        <PopupPrimary open={open} onClose={onClose} width="xs">
            <div className="flex flex-col items-center gap-4 px-6 py-10">
                <span
                    className="flex h-16 w-16 items-center justify-center rounded-full text-white"
                    style={{ backgroundColor: tone }}
                >
                    {isSuccess ? (
                        <Check size={34} strokeWidth={3} />
                    ) : (
                        <XIcon size={34} strokeWidth={3} />
                    )}
                </span>

                {/**
                 * The OUTCOME leads, then the references beneath it.
                 *
                 * These were the other way round — highlight, secondary highlight, then the
                 * title — so a confirmation opened on "ENQ234 / John Smith" and only said what
                 * had happened to them underneath. The sentence has to come first: the codes
                 * mean nothing until the reader knows whether this is a save, an assignment or
                 * a failure.
                 *
                 * KP1-I118 is unaffected. It moved the record's reference OUT of the title and
                 * into a coloured block of its own, which is still exactly what happens; only
                 * the vertical order of the two changed.
                 */}
                <h2 className="text-center text-xl font-medium text-foreground">{title}</h2>
                {subtitle && (
                    <p className="text-center text-sm text-muted-foreground">{subtitle}</p>
                )}

                {/**
                 * Both references share ONE line, side by side — "Enquiry No." next to
                 * "Assigned to" — rather than stacking into a column that pushed the dialog
                 * tall. `flex-wrap` drops the second under the first on a narrow viewport, and
                 * with only one highlight (the Customer confirmations) this renders exactly as
                 * a single centred block, unchanged.
                 */}
                {(highlight || secondaryHighlight) && (
                    <div className="flex flex-wrap items-start justify-center gap-x-10 gap-y-4">
                        {line(highlight, highlightLabel)}
                        {line(secondaryHighlight, secondaryHighlightLabel)}
                    </div>
                )}
            </div>
        </PopupPrimary>
    );
};

export default StatusPopup;
