import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import './InlineAlert.css';

/**
 * The tone decides the colour, the default icon AND the ARIA role — see `ROLE_OF` below.
 * It is deliberately named for the MESSAGE's severity, not for a colour: a caller that
 * reaches for `tone="danger"` because it wants red on a success message is misusing it,
 * and the role it silently gets would then interrupt a screen reader for good news.
 */
export type InlineAlertTone = 'danger' | 'warning' | 'success' | 'info';

export interface InlineAlertProps {
    /** The message. Nothing renders when this is empty — call sites need no `&&` guard of their own. */
    children?: React.ReactNode;
    /** Severity: colour + default icon + ARIA role. Defaults to `danger`, the reason this exists. */
    tone?: InlineAlertTone;
    /**
     * Override the tone's icon, or pass `false` to drop it.
     *
     * The icon is part of the alert, not decoration: colour alone does not carry meaning to a
     * user who cannot distinguish red from amber (WCAG 1.4.1), so removing it should be a
     * deliberate choice for a dense row, never the default.
     */
    icon?: React.ReactNode | false;
    /** Optional bold lead-in above the message, for an alert that needs a heading. */
    title?: string;
    className?: string;
}

const ICON_OF: Record<InlineAlertTone, React.ReactNode> = {
    danger: <AlertCircle size={18} />,
    warning: <AlertTriangle size={18} />,
    success: <CheckCircle2 size={18} />,
    info: <Info size={18} />,
};

/**
 * `alert` INTERRUPTS a screen reader; `status` waits for a pause. A problem the user has to act
 * on earns the interruption, an outcome they merely need to know does not — so the role follows
 * the tone rather than being a prop every call site would have to get right (KP1-I494: the
 * duplicate-request notice shipped as `role="status"`, which is the polite one, for the single
 * message standing between the user and a duplicate request).
 */
const ROLE_OF: Record<InlineAlertTone, 'alert' | 'status'> = {
    danger: 'alert',
    warning: 'alert',
    success: 'status',
    info: 'status',
};

/**
 * The STATIC alert — one block message, sitting in the page where the thing it is about is.
 *
 * It is the standing counterpart of the `Toast`: a toast is transient and lives at the edge of
 * the screen, so it cannot be re-read and cannot point at anything. Where a message must stay
 * until the user has dealt with it — a duplicate-request warning beside the form that would
 * create the duplicate, a server refusal inside the dialog that was refused — this is the
 * element, and it is the SAME element in both portals.
 *
 * Its four tones are built on `--destructive`, `--warning-*`, `--success*` and `--foreground`,
 * none of which `body.admin-theme` overrides, so an alert looks identical in the admin portal
 * and the customer portal. That is the point: `--primary` is the portals' brand and differs
 * between them; a warning is not brand, and a red that changed per portal would make the same
 * message read as two different levels of seriousness.
 *
 * NOT for a field's own validation message (that is `ValidationMessage`, under the input), and
 * NOT for a summary of server field errors above the actions — see the portals' CLAUDE.md,
 * "Server validation errors are inline — no banner".
 */
const InlineAlert: React.FC<InlineAlertProps> = ({
    children,
    tone = 'danger',
    icon,
    title,
    className = '',
}) => {
    // Same contract as `ValidationMessage`: no message, no element — so a call site can pass a
    // possibly-empty string straight in without wrapping it in a conditional.
    if (children == null || children === false || children === '') return null;

    const resolvedIcon = icon === undefined ? ICON_OF[tone] : icon;

    return (
        <div className={`inline-alert inline-alert-${tone} ${className}`} role={ROLE_OF[tone]}>
            {resolvedIcon !== false && (
                // `aria-hidden`: the icon repeats what the tone and the text already say, and a
                // screen reader announcing "alert, image, warning" before the message is noise.
                <span className="inline-alert-icon" aria-hidden="true">
                    {resolvedIcon}
                </span>
            )}
            <div className="inline-alert-body">
                {title && <span className="inline-alert-title">{title}</span>}
                {/*
                    `dir="auto"` for the same reason every field carries it (KP1-I200): the admin
                    portal is English-only but its DATA is not, and a server message quoting an
                    Arabic account name would otherwise be laid out against the page's direction.
                */}
                <span dir="auto">{children}</span>
            </div>
        </div>
    );
};

export default InlineAlert;
