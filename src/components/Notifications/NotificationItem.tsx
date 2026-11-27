import React from 'react';
import { AlertCircle, AlertTriangle, BellRing, CheckCircle2, Clock, Info } from 'lucide-react';
import type { NotificationTone } from '../../utils/notifications';
import { cn } from '../../lib/utils';
import './Notifications.css';

/**
 * One notification. The CALLER resolves every string — the title and body come rendered
 * from the server, `timeLabel` is formatted by the portal's own date formatter, and
 * `toneLabel` is translated — so this one component serves the English-only admin portal and
 * the bilingual customer portal alike (the Track rule).
 */
export interface NotificationItemProps {
    title: string;
    body?: string;
    tone: NotificationTone;
    /** The tone in words ("Action Required") — read by a screen reader, shown as a caption. */
    toneLabel?: string;
    timeLabel?: string;
    isRead: boolean;
    /** Spoken after the title for an unread item ("Unread"). */
    unreadLabel?: string;
    /** Makes the whole row a button. Omit for a row that opens nothing. */
    onClick?: () => void;
    className?: string;
}

const ICON_OF: Record<NotificationTone, React.ReactNode> = {
    success: <CheckCircle2 size={20} />,
    action: <BellRing size={20} />,
    alert: <AlertCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    reminder: <Clock size={20} />,
    info: <Info size={20} />,
};

const NotificationItem: React.FC<NotificationItemProps> = ({
    title,
    body,
    tone,
    toneLabel,
    timeLabel,
    isRead,
    unreadLabel,
    onClick,
    className,
}) => {
    const content = (
        <>
            {!isRead && <span className="notification-item-dot" aria-hidden="true" />}
            {/* The icon is meaning (WCAG 1.4.1 — colour alone does not carry the tone), but the
                tone is also spoken through `toneLabel`, so the glyph itself is hidden. */}
            <span className="notification-item-icon" aria-hidden="true">
                {ICON_OF[tone]}
            </span>
            <span className="notification-item-main">
                <span className="notification-item-head">
                    <span className="notification-item-title" dir="auto">
                        {title}
                        {!isRead && unreadLabel && <span className="sr-only"> ({unreadLabel})</span>}
                    </span>
                    {timeLabel && <span className="notification-item-time">{timeLabel}</span>}
                </span>
                {body && (
                    <span className="notification-item-body" dir="auto">
                        {body}
                    </span>
                )}
                {toneLabel && <span className="notification-item-tone">{toneLabel}</span>}
            </span>
        </>
    );

    const classes = cn(
        'notification-item',
        `notification-tone-${tone}`,
        !isRead && 'notification-item-unread',
        className,
    );

    return onClick ? (
        <button type="button" className={classes} onClick={onClick}>
            {content}
        </button>
    ) : (
        <div className={classes}>{content}</div>
    );
};

export default NotificationItem;
