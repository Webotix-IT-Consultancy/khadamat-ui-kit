import React from 'react';
import { cn } from '../../lib/utils';
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

export type BadgeStatus =
  | 'in-progress' | 'scheduled' | 'completed' | 'paid' | 'pending' | 'failed'
  | 'orange' | 'primary' | 'success' | 'active' | 'secured' | 'lost'
  | 'overdue' | 'open' | 'neutral'
  | LifecycleStatus;

/**
 * The fixed set of colours a badge can have — see StatusBadge.css. Statuses map onto
 * these; the status name itself never becomes a class, so adding a status costs one
 * line in STATUS_TONE and no CSS at all.
 */
type Tone =
  | 'success' | 'success-soft' | 'success-light'
  | 'warning' | 'warning-soft' | 'warning-light'
  | 'danger' | 'danger-soft' | 'danger-light'
  | 'info-soft' | 'violet-soft'
  | 'progress' | 'neutral' | 'gold'
  | 'orange-light' | 'primary-light';

interface StatusBadgeProps {
  variant?: 'light' | 'filled';
  status: BadgeStatus;
  label?: string;
  className?: string;
}

const STATUS_TONE: Record<BadgeStatus, Tone> = {
  /**
   * Gold — an enquiry nobody has closed out yet.
   *
   * `active` and `secured` were BOTH `success`, i.e. the same green chip, so the two states
   * an enquiry list exists to tell apart were indistinguishable at a glance. Green is right
   * for `secured` — it is the good terminal outcome — so `active` is the one that moved.
   *
   * Gold rather than amber: "open, being worked" is not a warning, and `warning` already
   * means "waiting on someone" for pending / scheduled / awaiting-payment.
   *
   * `active` is used ONLY by the enquiry module (both portals). Everything else that means
   * "active" — RoleAccessTable, UserProfile, the system-settings screens — passes `success`
   * directly, so none of them change.
   */
  'active': 'gold',

  // Green — a good terminal or healthy state.
  'secured': 'success',
  'paid': 'success',
  'success': 'success',
  'completed': 'success-soft',
  'live': 'success-soft',
  'in-progress': 'progress',

  // Amber — waiting on someone.
  'pending': 'warning',
  'scheduled': 'warning-soft',
  'awaiting-payment': 'warning-soft',

  // Red — failed, refused or late.
  'failed': 'danger',
  'lost': 'danger-soft',
  'cancelled': 'danger-soft',
  'overdue': 'danger-soft',

  // Blue / violet — in someone else's hands.
  'approved': 'info-soft',
  'open': 'info-soft',
  'awaiting-signatures': 'violet-soft',

  // Grey — nothing has happened yet, or there is nothing to say.
  'contract-in-progress': 'neutral',
  'neutral': 'neutral',

  // Tone-only statuses: callers that just want a colour, not a lifecycle state.
  'orange': 'orange-light',
  'primary': 'primary-light',
};

/**
 * Only these five have a distinct light treatment. Every other status under
 * `variant="light"` falls through to its filled tone — that is the existing behaviour
 * of the invoice / transaction / request tables, which pass `light` with `paid`,
 * `pending`, `completed` and `in-progress` and render the filled colour today.
 */
const LIGHT_TONE: Partial<Record<BadgeStatus, Tone>> = {
  'success': 'success-light',
  'pending': 'warning-light',
  'failed': 'danger-light',
  'orange': 'orange-light',
  'primary': 'primary-light',
};

const LABELS: Record<BadgeStatus, string> = {
  'in-progress': 'In Progress',
  'scheduled': 'Scheduled',
  'completed': 'Completed',
  'paid': 'Paid',
  'pending': 'Pending',
  'failed': 'Failed',
  'orange': 'Orange',
  'primary': 'Primary',
  'success': 'Success',
  'active': 'Active',
  'secured': 'Secured',
  'lost': 'Lost',
  'overdue': 'Overdue',
  'open': 'Open',
  'neutral': '',
  'contract-in-progress': 'In Progress',
  'approved': 'Approved',
  'awaiting-payment': 'Awaiting Payment',
  'awaiting-signatures': 'Awaiting Signatures',
  'live': 'Live',
  'cancelled': 'Cancelled',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ variant = 'filled', status, label, className }) => {
  // An unknown status gets the grey chip rather than an uncoloured one — a status the
  // API invents should still look like a badge.
  const tone = (variant === 'light' && LIGHT_TONE[status]) || STATUS_TONE[status] || 'neutral';

  return (
    <div className={cn('status-badge', `status-badge-${variant}`, `status-badge-${tone}`, className)}>
      {label || LABELS[status] || status}
    </div>
  );
};

export default StatusBadge;
