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
    rightContent?: React.ReactNode;
    className?: string;
    variant?: TabsVariant;
}

const Tabs: React.FC<TabsProps> = ({
    tabs,
    activeTab,
    onTabChange,
    rightContent,
    className,
    variant = 'underline',
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
            <div className={cn("flex", isPill ? "gap-3 flex-wrap" : "gap-8")}>
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;

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
                                        "rounded-xl border-2 border-primary px-5 py-1.5 text-sm font-medium",
                                        isActive
                                            ? "bg-primary-100 text-black"
                                            : "bg-white text-black hover:bg-primary-100/40"
                                    )
                                    : cn(
                                        "pb-3 text-base font-semibold border-b-4 mb-[-4px]",
                                        isActive
                                            ? "text-black border-b-primary!"
                                            : "border-transparent text-grey-400 hover:text-black"
                                    )
                            )}
                        >
                            {tab.label}
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className={cn(
                                    "px-1.5 py-0.5 rounded-full h-5 min-w-5 flex items-center justify-center text-[10px] font-semibold",
                                    tab.badgeClassName ||
                                    (isPill
                                        ? isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-primary-100 text-black"
                                        : "bg-tertiary-200 text-black")
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
