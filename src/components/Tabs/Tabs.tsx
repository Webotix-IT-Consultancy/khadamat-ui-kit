import React from 'react';
import { cn } from '../../lib/utils';

export interface TabItem {
    id: string;
    label: string;
    count?: number;
    badgeClassName?: string;
}

/**
 * `underline` is the original look (bottom rule + active border).
 * `pill` renders each tab as a bordered, rounded capsule with an inline count
 * badge — the Enquiry list design. Opt in; `underline` stays the default so
 * existing pages are untouched.
 */
export type TabsVariant = 'underline' | 'pill';

interface TabsProps {
    tabs: TabItem[];
    activeTab: string;
    onTabChange: (id: any) => void;
    /** Rendered at the far end of the row (e.g. a "last updated" note). */
    rightContent?: React.ReactNode;
    /**
     * Rendered BEFORE the first tab, inside the row so it sits on the same baseline and
     * the underline rule spans it. The Quotation list uses it for its "Status:" caption —
     * putting that caption outside the component would leave the rule starting after it.
     */
    leftContent?: React.ReactNode;
    className?: string;
    variant?: TabsVariant;
    /**
     * Render the count badge when the count is exactly 0.
     *
     * Default `false` keeps the original behaviour: a 0 badge is noise on tabs whose count
     * is incidental (Notifications' read/unread). Status-filter tabs are the opposite case —
     * "Lost 0" is the answer to the question the tab asks, and hiding it reads as "no data
     * available" rather than "none". The customer portal's list screens pass `true`.
     *
     * Opt-in rather than a behaviour change, so existing callers are untouched.
     */
    showZeroCounts?: boolean;
}

const Tabs: React.FC<TabsProps> = ({
    tabs,
    activeTab,
    onTabChange,
    rightContent,
    leftContent,
    className,
    variant = 'underline',
    showZeroCounts = false,
}) => {
    const isPill = variant === 'pill';

    return (
        <div
            className={cn(
                "flex justify-between items-center gap-4 flex-wrap",
                !isPill && "border-b-4 border-grey-100 pb-0",
                className
            )}
        >
            <div className={cn("flex items-center", isPill ? "gap-3 flex-wrap" : "gap-8")}>
                {leftContent && (
                    <span className={cn("text-base text-grey-400", !isPill && "pb-3")}>
                        {leftContent}
                    </span>
                )}
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    // A tab with no `count` never shows a badge; one with 0 shows it only
                    // when the caller asked for zeroes (see `showZeroCounts`).
                    const showBadge =
                        tab.count !== undefined && (tab.count > 0 || showZeroCounts);

                    return (
                        <button
                            key={tab.id}
                            type="button"
                            aria-pressed={isActive}
                            onClick={() => onTabChange(tab.id)}
                            className={cn(
                                "flex items-center gap-2 transition-colors cursor-pointer",
                                isPill
                                    ? cn(
                                        "rounded-xl border-2 border-primary px-2 py-1.5 text-sm font-medium",
                                        isActive
                                            ? "bg-primary-100 text-black"
                                            : "bg-white text-black hover:bg-primary-100/40"
                                    )
                                    : cn(
                                        "pb-3 text-sm font-medium border-b-4 mb-[-4px]",
                                        isActive
                                            ? "text-black border-b-primary!"
                                            : "border-transparent text-grey-400 hover:text-black"
                                    )
                            )}
                        >
                            {tab.label}
                            {showBadge && (
                                <span className={cn(
                                    "px-1.5 py-0.5 rounded-full h-5 min-w-5 flex items-center justify-center text-[10px] font-semibold",
                                    tab.badgeClassName ||
                                    (isPill
                                        ? isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-primary-100 text-black"
                                        : "bg-primary text-black")
                                )}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
            {rightContent && (
                <div className={cn(isPill ? "hidden sm:block" : "text-xs text-grey-400 hidden sm:block")}>
                    {rightContent}
                </div>
            )}
        </div>
    );
};

export default Tabs;
