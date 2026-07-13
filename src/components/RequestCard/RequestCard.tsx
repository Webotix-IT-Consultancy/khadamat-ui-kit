import React from 'react';
import StatusBadge from '../StatusBadge/StatusBadge';
import './RequestCard.css';
import { cn } from '../../lib/utils';

interface RequestCardProps {
  requestNumber: string;
  title: string;
  timestamp: string;
  status: 'in-progress' | 'scheduled' | 'completed';
}

const RequestCard: React.FC<RequestCardProps> = ({
  requestNumber,
  title,
  timestamp,
  status
}) => {
  const badgeBgUtility = status === 'in-progress' ? 'bg-primary-200' : 'bg-grey-100';
  const isActive = status === 'in-progress';

  return (
    <div className={cn(
      "request-card flex flex-row items-center gap-2 sm:gap-3.5 self-stretch p-1 sm:p-2.5 rounded-lg transition-all duration-200 hover:bg-grey-100/30",
      isActive ? "request-card-active bg-primary-50" : "bg-white",
      "max-sm:gap-2 max-sm:p-1"
    )}>
      <div className={cn(
        "request-badge flex flex-col items-center justify-center w-12 h-10 sm:w-16 sm:h-14 rounded-lg text-black font-semibold text-[11px] sm:text-[13px] shrink-0 transition-colors",
        badgeBgUtility
      )}>
        {requestNumber}
      </div>

      <div className="request-info flex flex-col justify-center min-w-0 flex-1">
        <div className="request-title self-stretch text-black font-semibold text-[12px] sm:text-[13px] truncate">
          {title}
        </div>
        <div className={cn(
          "request-timestamp text-[11px] sm:text-[13px] font-normal transition-colors",
          isActive ? "text-primary-base" : "text-black"
        )}>
          {timestamp}
        </div>
      </div>

      <div className="shrink-0 scale-90 sm:scale-100">
        <StatusBadge status={status} label={status} />
      </div>
    </div>
  );
};

export default RequestCard;
