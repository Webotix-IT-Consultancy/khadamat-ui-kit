import React from 'react';
import { cn } from '../../lib/utils';

export interface TabItem {
    id: string;
    label: string;
    count?: number;
    badgeClassName?: string;
}

interface TabsProps {
    tabs: TabItem[];
    activeTab: string;
    onTabChange: (id: any) => void;
    rightContent?: React.ReactNode;
    className?: string;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange, rightContent, className }) => {
    return (
        <div className={cn("flex justify-between items-center border-b-4 border-grey-100 pb-0", className)}>
            <div className="flex gap-8">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={cn(
                            "pb-3 text-base font-semibold transition-colors cursor-pointer border-b-4 mb-[-4px] flex items-center gap-2",
                            activeTab === tab.id
                                ? "text-black border-b-primary!" // Active state
                                : "border-transparent text-grey-400 hover:text-black" // Inactive state
                        )}
                    >
                        {tab.label}
                        {tab.count !== undefined && tab.count > 0 && (
                            <span className={cn(
                                "px-1.5 py-0.5 rounded-full h-5 min-w-5 flex items-center justify-center text-[10px]",
                                tab.badgeClassName || "bg-grey-200 text-black"
                            )}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>
            {rightContent && (
                <div className="text-xs text-grey-400 hidden sm:block">
                    {rightContent}
                </div>
            )}
        </div>
    );
};

export default Tabs;
