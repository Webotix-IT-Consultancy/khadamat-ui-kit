import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import ConfirmPopup from '../popups/ConfirmPopup';
import { cn } from '../../lib/utils';

export interface PageBackButtonProps {
    /** Where "back" goes. Prefer this over the history fallback — see the note below. */
    to?: string;
    /**
     * Full control of leaving. When the page already owns a cancel handler (a form with its
     * own discard confirmation), pass THAT handler here so the top arrow and the footer
     * Cancel run the same code — one exit path per screen, not two that can drift.
     * Takes precedence over `to`.
     */
    onBack?: () => void;
    /** Defaults to the shared `common:buttons.back` ("Back" / "رجوع"). */
    label?: string;
    /** Icon only — for narrow toolbars. The accessible name is still the label. */
    iconOnly?: boolean;
    /**
     * Ask before leaving. Only for screens that hold unsaved input and do NOT already have
     * their own confirmation; if they do, route through `onBack` instead of turning this on,
     * or the user gets asked twice.
     */
    confirm?: boolean;
    confirmTitle?: string;
    confirmMessage?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    className?: string;
    /**
     * The screen's page-level controls — a status chip, action icons — pinned to the TOP RIGHT,
     * on this same line, opposite the back arrow.
     *
     * They belong here rather than in the form body. Placed inside the first row of fields (as
     * the contract, quotation, and both customer-portal view screens used to do) a status chip
     * sits in a field's column, aligned to a field's baseline, and reads as that field's VALUE —
     * testers took it for an input. On the back-arrow line there is no field for it to be
     * mistaken for: that line is chrome, not content.
     *
     * Rendering is unchanged when this is omitted, so the existing call sites keep their exact
     * layout — the flex row only appears when a screen actually has actions to place.
     */
    actions?: React.ReactNode;
}

/**
 * KP1-I81: detail/create/edit screens had no in-application way back — the only exit was the
 * Cancel/Back pair at the very bottom of a long form, so testers were using the browser's
 * Back button. This is that missing control, sitting at the top of the page content where it
 * is reachable without scrolling.
 *
 * `navigate(-1)` is the LAST resort, not the default: browser history can point outside the
 * app (a deep link, a fresh tab), and "back" would then leave the portal entirely. Callers
 * pass an explicit `to`, or an `onBack` that already knows where the screen exits to.
 */
const PageBackButton: React.FC<PageBackButtonProps> = ({
    to,
    onBack,
    label,
    iconOnly = false,
    confirm = false,
    confirmTitle,
    confirmMessage,
    confirmLabel,
    cancelLabel,
    className,
    actions,
}) => {
    const { t, i18n } = useTranslation('common');
    const navigate = useNavigate();
    const [asking, setAsking] = useState(false);

    // The arrow points the way the reader travels: leading edge in LTR, trailing edge in RTL.
    // Admin pins itself to English, so this only ever flips in the customer portal.
    const isRTL = i18n.language === 'ar';
    const Arrow = isRTL ? ArrowRight : ArrowLeft;

    const text = label ?? t('buttons.back', { defaultValue: 'Back' });

    const leave = () => {
        if (onBack) return onBack();
        if (to) return navigate(to);
        navigate(-1);
    };

    const button = (
        <button
            type="button"
            onClick={() => (confirm ? setAsking(true) : leave())}
            aria-label={text}
            className={cn(
                'inline-flex items-center gap-2 h-9 rounded-xl border-none cursor-pointer',
                'bg-primary-light text-primary hover:bg-primary/25 transition-colors',
                'font-poppins text-sm font-medium',
                // Without `actions` the button owns the gap below it, exactly as before. With
                // them, the row owns it — otherwise the margin would sit under the arrow only
                // and the two sides of the row would not share a baseline.
                actions ? '' : 'mb-3',
                iconOnly ? 'w-9 justify-center px-0' : 'px-3',
                className
            )}
        >
            <Arrow size={18} />
            {!iconOnly && <span>{text}</span>}
        </button>
    );

    return (
        <>
            {actions ? (
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    {button}
                    {/* `ms-auto` keeps the actions hard right even if the button is hidden or the
                        row wraps — `justify-between` alone would centre a lone child. */}
                    <div className="ms-auto flex flex-wrap items-center gap-3">{actions}</div>
                </div>
            ) : (
                button
            )}

            {confirm && (
                <ConfirmPopup
                    open={asking}
                    onClose={() => setAsking(false)}
                    onConfirm={() => {
                        setAsking(false);
                        leave();
                    }}
                    title={confirmTitle ?? t('confirmLeave.title', { defaultValue: 'Do you really want to exit this page?' })}
                    message={confirmMessage}
                    confirmLabel={confirmLabel ?? t('confirmLeave.yes', { defaultValue: 'Yes' })}
                    cancelLabel={cancelLabel ?? t('confirmLeave.no', { defaultValue: 'No' })}
                />
            )}
        </>
    );
};

export default PageBackButton;
