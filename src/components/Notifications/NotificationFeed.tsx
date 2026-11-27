import React from 'react';
import Button from '../Button/Button';
import NotificationItem, { type NotificationItemProps } from './NotificationItem';
import './Notifications.css';

export interface NotificationFeedEntry extends NotificationItemProps {
    id: string;
}

export interface NotificationFeedGroup {
    key: string;
    /** Already translated / formatted by the caller ("Today", "12 Nov 2026"). */
    label: string;
    items: NotificationFeedEntry[];
}

export interface NotificationFeedProps {
    groups: NotificationFeedGroup[];
    /** True while a read is in flight. With no rows yet it draws skeletons, never "empty". */
    loading?: boolean;
    emptyLabel: string;
    /** Offer "Load more" — the feed is paged, not windowed. */
    hasMore?: boolean;
    loadMoreLabel?: string;
    onLoadMore?: () => void;
    /** How many skeleton rows the first load draws. */
    skeletonRows?: number;
    className?: string;
}

/**
 * The day-grouped notification list, used by the bell drawer and by both portals'
 * Notifications page. Presentational only: grouping keys come from `groupByDay`
 * (`utils/notifications`) and the caller labels them.
 */
const NotificationFeed: React.FC<NotificationFeedProps> = ({
    groups,
    loading = false,
    emptyLabel,
    hasMore = false,
    loadMoreLabel,
    onLoadMore,
    skeletonRows = 4,
    className,
}) => {
    const hasRows = groups.some((group) => group.items.length > 0);

    // First load: skeletons. An empty array mid-fetch means "not loaded yet", and saying
    // "no notifications" before the server has answered is a claim we cannot make (KP1-I203).
    if (!hasRows && loading) {
        return (
            <div className={`notification-feed ${className ?? ''}`} aria-busy="true">
                <div className="notification-feed-list">
                    {Array.from({ length: skeletonRows }, (_, i) => (
                        <div key={i} className="notification-feed-skeleton" />
                    ))}
                </div>
            </div>
        );
    }

    if (!hasRows) {
        return <div className={`notification-feed-empty ${className ?? ''}`}>{emptyLabel}</div>;
    }

    return (
        <div className={`notification-feed ${className ?? ''}`} aria-busy={loading || undefined}>
            {groups.map((group) =>
                group.items.length ? (
                    <section key={group.key} className="notification-feed-group">
                        <h3 className="notification-feed-group-label">{group.label}</h3>
                        <ul className="notification-feed-list">
                            {group.items.map(({ id, ...item }) => (
                                <li key={id}>
                                    <NotificationItem {...item} />
                                </li>
                            ))}
                        </ul>
                    </section>
                ) : null,
            )}
            {hasMore && onLoadMore && (
                <div className="notification-feed-more">
                    <Button variant="primary" size="small" onClick={onLoadMore} isLoading={loading}>
                        {loadMoreLabel}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default NotificationFeed;
