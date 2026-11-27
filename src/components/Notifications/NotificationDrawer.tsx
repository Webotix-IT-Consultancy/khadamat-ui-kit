import React, { useEffect, useRef } from 'react';
import { ArrowRight, CheckCheck, X } from 'lucide-react';
import NotificationFeed, { type NotificationFeedGroup } from './NotificationFeed';
import './Notifications.css';

export interface NotificationDrawerLabels {
    title: string;
    close: string;
    markAllRead: string;
    viewAll: string;
    empty: string;
}

export interface NotificationDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    groups: NotificationFeedGroup[];
    loading?: boolean;
    /** Rendered above the list — the portal passes `<LoadError … />` here. */
    error?: React.ReactNode;
    labels: NotificationDrawerLabels;
    /** Omit to hide the action; `markAllDisabled` greys it when nothing is unread. */
    onMarkAllRead?: () => void;
    markAllDisabled?: boolean;
    onViewAll?: () => void;
}

/**
 * The bell's drawer — the latest notifications, "Mark all as read", and a way to the full
 * page. It replaces the old `NotificationPanel`, whose "Clear" button did nothing and whose
 * rows could neither be opened nor marked read.
 *
 * Presence of `isOpen` is the whole state; Escape and a backdrop click both close it.
 */
const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
    isOpen,
    onClose,
    groups,
    loading,
    error,
    labels,
    onMarkAllRead,
    markAllDisabled,
    onViewAll,
}) => {
    const closeRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        closeRef.current?.focus();
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <>
            <div className="notification-drawer-backdrop" onClick={onClose} aria-hidden="true" />
            <aside className="notification-drawer" role="dialog" aria-modal="true" aria-label={labels.title}>
                <div className="notification-drawer-header">
                    <h2 className="notification-drawer-title">{labels.title}</h2>
                    <div className="notification-drawer-header-actions">
                        {onMarkAllRead && (
                            <button
                                type="button"
                                className="notification-link-button"
                                onClick={onMarkAllRead}
                                disabled={markAllDisabled}
                            >
                                <CheckCheck size={16} aria-hidden="true" />
                                {labels.markAllRead}
                            </button>
                        )}
                        <button
                            ref={closeRef}
                            type="button"
                            className="notification-icon-button"
                            onClick={onClose}
                            aria-label={labels.close}
                        >
                            <X size={18} aria-hidden="true" />
                        </button>
                    </div>
                </div>

                <div className="notification-drawer-content">
                    {error}
                    <NotificationFeed groups={groups} loading={loading} emptyLabel={labels.empty} skeletonRows={5} />
                </div>

                {onViewAll && (
                    <div className="notification-drawer-footer">
                        <button type="button" className="notification-link-button" onClick={onViewAll}>
                            {labels.viewAll}
                            <ArrowRight size={16} className="notification-flip-rtl" aria-hidden="true" />
                        </button>
                    </div>
                )}
            </aside>
        </>
    );
};

export default NotificationDrawer;
