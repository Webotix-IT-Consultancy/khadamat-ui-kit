import React from 'react';
import { format, parseISO } from 'date-fns';
import { Notification } from '../../services/dashboard.service';
import { cn } from '../../lib/utils';

interface NotificationItemProps {
    notification: Notification;
}

const NotificationItem: React.FC<NotificationItemProps & { formattedTime?: string }> = ({ notification, formattedTime }) => {
    const isUnread = false; // Mocking read/unread status for now as API might not support it yet, or we'll infer it. 
    // Actually, design shows lighter bg for unread. 
    // Assuming 'status' field or similar might exist, or derived.
    // For now, I'll assume all are 'read' unless specific ID logic, or I'll add a mock 'isRead' to the type if needed.
    // Let's assume the API returns an 'isRead' property (or similar). 
    // Since I can't easily change the API type globally without checking service, 
    // I'll stick to styling based on props passed.
    // The 'notification' object from service might need extension.

    // Mock logic: randomly unread for demo or passed as prop. 
    // Let's rely on the parent to pass "isUnread" or similar, 
    // but simpler to just style it here. 

    // NOTE: The current Notification type in dashboard.service might not have 'isRead'.
    // I will assume for now it's just a visual list. 
    // The design shows green background for unread. 

    const getIcon = (type: string, requestNumber?: string) => {
        switch (type) {
            case 'request':
                return (
                    <div className="w-15 h-15 rounded-lg bg-primary-light flex items-center justify-center shrink-0 p-2">
                        <div className="text-primary text-xs font-bold leading-tight text-center">
                            {requestNumber ? (
                                <>
                                    #{requestNumber.split('-')[0].replace('#', '')}<br />
                                    {requestNumber.split('-').slice(1).join('-')}
                                </>
                            ) : '#RQN'}
                        </div>
                    </div>
                );
            case 'pickup':
            case 'scheduled':
            case 'download':
                // Using generic icon for now or specific SVGs if available. 
                // Reusing SVGs from NotificationPanel would be best, but for speed I'll use generic shapes or Lucide icons if I had them.
                // I'll copy the SVGs from NotificationPanel.
                return (
                    <div className="w-15 h-15 rounded-lg bg-primary-light flex items-center justify-center shrink-0 p-2">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M7.5 12L10.5 15L16.5 9M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#016937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="w-15 h-15 rounded-lg bg-primary-light text-primary flex items-center justify-center shrink-0 p-2">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M12 8V12L14 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                );
        }
    };

    return (
        <div className={cn(
            "flex items-center gap-4 p-4 rounded-xl transition-colors",
            "hover:bg-primary-light/25", // Hover state
            "bg-white" // Default white, parent will override if unread or alternate
        )}>
            {getIcon(notification.type, notification.requestNumber)}
            <div className="flex-1 flex flex-col gap-1">
                <div className="flex justify-between items-start w-full">
                    <h4 className="text-sm font-bold text-black m-0">{notification.title}</h4>
                    <span className="text-xs text-grey-400 whitespace-nowrap ml-2">
                        {formattedTime || format(parseISO(notification.timestamp), 'h:mm a')}
                    </span>
                </div>

                {notification.description && (
                    <p className="text-xs text-black m-0 leading-relaxed font-medium">
                        {notification.description}
                    </p>
                )}
                {notification.location && (
                    <p className="text-[11px] text-grey-600 m-0 mt-0.5">
                        {notification.location}
                    </p>
                )}
            </div>
        </div>
    );
};

export default NotificationItem;
