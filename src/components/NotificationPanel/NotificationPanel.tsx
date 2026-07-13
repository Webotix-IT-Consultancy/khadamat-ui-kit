import React from 'react';
import './NotificationPanel.css';
import { format, isToday, isYesterday, isAfter, subDays, parseISO } from 'date-fns';

export interface NotificationPanelItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  requestNumber?: string;
  location?: string;
  timestamp: string;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications?: NotificationPanelItem[];
  loading?: boolean;
  onViewMore?: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose, notifications = [], loading = false, onViewMore }) => {
  const handleViewMore = () => {
    onClose();
    onViewMore?.();
  };

  const getIcon = (type: string, requestNumber?: string) => {
    switch (type) {
      case 'request':
        return (
          <div className="notification-item-badge badge-green">
            {requestNumber ? (
              <>
                #{requestNumber.split('-')[0].replace('#', '')}{'\n'}
                {requestNumber.split('-').slice(1).join('-')}
              </>
            ) : '#RQN'}
          </div>
        );
      case 'pickup':
        return (
          <div className="notification-item-icon icon-success">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M7.5 12L10.5 15L16.5 9M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#016937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        );
      case 'download':
        return (
          <div className="notification-item-icon icon-success">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M21 21H4.6C4.03995 21 3.75992 21 3.54601 20.891C3.35785 20.7951 3.20487 20.6422 3.10899 20.454C3 20.2401 3 19.9601 3 19.4V3M20 8L16.0811 12.1827C15.9326 12.3412 15.8584 12.4204 15.7688 12.4614C15.6897 12.4976 15.6026 12.5125 15.516 12.5047C15.4179 12.4958 15.3215 12.4458 15.1287 12.3457L11.8713 10.6543C11.6785 10.5542 11.5821 10.5042 11.484 10.4953C11.3974 10.4875 11.3103 10.5024 11.2312 10.5386C11.1416 10.5796 11.0674 10.6588 10.9189 10.8173L7 15" stroke="#016937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        );
      case 'scheduled':
        return (
          <div className="notification-item-icon icon-success">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14M15 9H15.01M9 9H9.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM15.5 9C15.5 9.27614 15.2761 9.5 15 9.5C14.7239 9.5 14.5 9.27614 14.5 9C14.5 8.72386 14.7239 8.5 15 8.5C15.2761 8.5 15.5 8.72386 15.5 9ZM9.5 9C9.5 9.27614 9.27614 9.5 9 9.5C8.72386 9.5 8.5 9.27614 8.5 9C8.5 8.72386 8.72386 8.5 9 8.5C9.27614 8.5 9.5 8.72386 9.5 9Z" stroke="#016937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const categorizeNotifications = () => {
    const today: NotificationPanelItem[] = [];
    const yesterday: NotificationPanelItem[] = [];
    const last30Days: NotificationPanelItem[] = [];

    notifications.forEach((notification) => {
      const date = parseISO(notification.timestamp);
      if (isToday(date)) {
        today.push(notification);
      } else if (isYesterday(date)) {
        yesterday.push(notification);
      } else if (isAfter(date, subDays(new Date(), 30))) {
        last30Days.push(notification);
      }
    });

    return { today, yesterday, last30Days };
  };

  const { today, yesterday, last30Days } = categorizeNotifications();

  if (!isOpen) return null;

  return (
    <div className="notification-panel-overlay" onClick={onClose}>
      <div className="notification-panel" onClick={(e) => e.stopPropagation()}>
        <div className="notification-panel-header">
          <button className="close-button" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="notification-panel-content">
          <div className="notification-header-row">
            <h3 className="notification-title">Notification</h3>
            <button className="clear-button">Clear</button>
          </div>

          {loading ? (
            <div className="loading-state">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="empty-state">No new notifications</div>
          ) : (
            <>
              {/* Today */}
              {today.length > 0 && (
                <div className="notification-section">
                  <h4 className="section-label">Today</h4>
                  {today.map((notification) => (
                    <div key={notification.id} className="notification-item">
                      {getIcon(notification.type, notification.requestNumber)}
                      <div className="notification-content">
                        <div className="notification-item-title">{notification.title}</div>
                        {notification.requestNumber && (
                          <div className="notification-meta">{notification.requestNumber}</div>
                        )}
                        {notification.description && (
                          <div className="notification-meta">{notification.description}</div>
                        )}
                        {notification.location && (
                          <div className="notification-meta">{notification.location}</div>
                        )}
                        <div className="notification-time">{format(parseISO(notification.timestamp), 'h:mm a')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Yesterday */}
              {yesterday.length > 0 && (
                <div className="notification-section">
                  <h4 className="section-label">Yesterday</h4>
                  {yesterday.map((notification) => (
                    <div key={notification.id} className="notification-item">
                      {getIcon(notification.type, notification.requestNumber)}
                      <div className="notification-content">
                        <div className="notification-item-title">{notification.title}</div>
                        {notification.description && (
                          <div className="notification-meta">{notification.description}</div>
                        )}
                        {notification.location && (
                          <div className="notification-meta">{notification.location}</div>
                        )}
                        <div className="notification-time">{format(parseISO(notification.timestamp), 'h:mm a')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Last 30 days */}
              {last30Days.length > 0 && (
                <div className="notification-section">
                  <h4 className="section-label">Last 30 days</h4>
                  {last30Days.map((notification) => (
                    <div key={notification.id} className="notification-item">
                      {getIcon(notification.type, notification.requestNumber)}
                      <div className="notification-content">
                        <div className="notification-item-title">{notification.title}</div>
                        {notification.description && (
                          <div className="notification-meta">{notification.description}</div>
                        )}
                        {notification.location && (
                          <div className="notification-meta">{notification.location}</div>
                        )}
                        <div className="notification-time">{format(parseISO(notification.timestamp), 'd MMM yyyy at h:mm a')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* View More Button */}
          {notifications.length > 0 && (
            <div className="view-more-container">
              <button className="view-more-button" onClick={handleViewMore}>
                View More
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;
