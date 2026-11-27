import React, { useEffect, useRef, useState } from 'react';
import { CheckCheck, Search } from 'lucide-react';
import Tabs, { type TabItem } from '../Tabs/Tabs';
import './Notifications.css';

export interface NotificationsToolbarProps {
    tabs: TabItem[];
    activeTab: string;
    onTabChange: (id: string) => void;
    search: string;
    /** Reported once typing pauses (300 ms), at once on Enter or when the box is emptied. */
    onSearchChange: (term: string) => void;
    searchPlaceholder: string;
    /** "12 Notifications" — already counted and translated. */
    countLabel?: string;
    markAllLabel: string;
    onMarkAllRead: () => void;
    markAllDisabled?: boolean;
}

const SEARCH_DEBOUNCE_MS = 300;

/**
 * The Notifications page's header row, shared by both portals: All / Unread / Read tabs,
 * a debounced search box and "Mark all as read".
 */
const NotificationsToolbar: React.FC<NotificationsToolbarProps> = ({
    tabs,
    activeTab,
    onTabChange,
    search,
    onSearchChange,
    searchPlaceholder,
    countLabel,
    markAllLabel,
    onMarkAllRead,
    markAllDisabled,
}) => {
    // The box keeps its own draft so typing is instant (the TableActionMenu pattern); a term
    // changed from outside is adopted.
    const [draft, setDraft] = useState(search);
    const lastSent = useRef(search);
    const timer = useRef<number | undefined>(undefined);

    useEffect(() => {
        if (search !== lastSent.current) {
            lastSent.current = search;
            setDraft(search);
        }
    }, [search]);

    useEffect(() => () => window.clearTimeout(timer.current), []);

    const send = (term: string) => {
        window.clearTimeout(timer.current);
        if (term === lastSent.current) return;
        lastSent.current = term;
        onSearchChange(term);
    };

    const onChange = (value: string) => {
        setDraft(value);
        window.clearTimeout(timer.current);
        if (!value.trim()) send('');
        else timer.current = window.setTimeout(() => send(value.trim()), SEARCH_DEBOUNCE_MS);
    };

    return (
        <div className="flex flex-col gap-4">
            <Tabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} rightContent={countLabel} />
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <label className="relative flex-1 max-w-md">
                    <span className="sr-only">{searchPlaceholder}</span>
                    <Search
                        size={18}
                        aria-hidden="true"
                        className="absolute top-1/2 -translate-y-1/2 start-3 text-[hsl(var(--grey-600))] pointer-events-none"
                    />
                    <input
                        type="search"
                        dir="auto"
                        value={draft}
                        placeholder={searchPlaceholder}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') send(draft.trim());
                        }}
                        className="w-full h-10 rounded-lg border border-[hsl(var(--border))] bg-white ps-10 pe-3 text-sm outline-none focus:border-[hsl(var(--primary))]"
                    />
                </label>
                <button
                    type="button"
                    className="notification-link-button sm:ms-auto"
                    onClick={onMarkAllRead}
                    disabled={markAllDisabled}
                >
                    <CheckCheck size={16} aria-hidden="true" />
                    {markAllLabel}
                </button>
            </div>
        </div>
    );
};

export default NotificationsToolbar;
