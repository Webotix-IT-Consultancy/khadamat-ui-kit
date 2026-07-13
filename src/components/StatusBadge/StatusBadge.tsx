import React from 'react';
import './StatusBadge.css';

interface StatusBadgeProps {
  variant?: 'light' | 'filled';
  status: 'in-progress' | 'scheduled' | 'completed' | 'paid' | 'pending' | 'failed' | 'orange' | 'primary' | 'success' | 'active' | 'secured' | 'lost';
  label?: string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ variant = "filled", status, label, className }) => {
  const getStatusLabel = () => {
    if (label) return label;

    const labels: Record<string, string> = {
      'in-progress': 'In Progress',
      'scheduled': 'Scheduled',
      'completed': 'Completed',
      'paid': 'Paid',
      'pending': 'Pending',
      'failed': 'Failed',
      'orange': 'Orange',
      'primary': 'Primary',
      'active': 'Active',
      'secured': 'Secured',
      'lost': 'Lost'
    };

    return labels[status] || status;
  };

  return (
    <div className={`status-badge status-badge-${variant} status-badge-${status} ${className}`}>
      {getStatusLabel()}
    </div>
  );
};

export default StatusBadge;
