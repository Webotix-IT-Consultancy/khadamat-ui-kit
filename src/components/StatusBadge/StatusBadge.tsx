import React from 'react';
import './StatusBadge.css';

/**
 * Contract & Quotation lifecycle chips (FRD S4.1, palette per FR-CC-CON-01).
 *
 * `contract-in-progress` is grey and deliberately NOT the existing `in-progress`,
 * which is green and already means "work underway" for on-call requests
 * (RequestTable, RequestCard, dashboard). The two are different states that happen
 * to share a name in the FRD.
 *
 * S4.1 applies this model identically to Quotations, so these are named for the
 * lifecycle stage rather than the Contract module.
 */
type LifecycleStatus =
  | 'contract-in-progress'
  | 'approved'
  | 'awaiting-payment'
  | 'awaiting-signatures'
  | 'live'
  | 'cancelled';

interface StatusBadgeProps {
  variant?: 'light' | 'filled';
  status:
    | 'in-progress' | 'scheduled' | 'completed' | 'paid' | 'pending' | 'failed'
    | 'orange' | 'primary' | 'success' | 'active' | 'secured' | 'lost'
    | LifecycleStatus;
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
      'lost': 'Lost',
      'contract-in-progress': 'In Progress',
      'approved': 'Approved',
      'awaiting-payment': 'Awaiting Payment',
      'awaiting-signatures': 'Awaiting Signatures',
      'live': 'Live',
      'cancelled': 'Cancelled'
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
