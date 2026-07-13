import React from 'react';
// import './TransactionCard.css';
import { cn } from '../../lib/utils';

interface TransactionCardProps {
  type: 'wallet' | 'invoice' | 'service';
  title: string;
  date: string;
  amount: number;
  balance: number;
}

const TransactionCard: React.FC<TransactionCardProps> = ({
  type,
  title,
  date,
  amount,
  balance
}) => {
  const getIcon = () => {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="stroke-primary-vibrant">
        <path d="M16.5 14H16.51M3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V9C21 7.89543 20.1046 7 19 7L5 7C3.89543 7 3 6.10457 3 5ZM3 5C3 3.89543 3.89543 3 5 3H17M17 14C17 14.2761 16.7761 14.5 16.5 14.5C16.2239 14.5 16 14.2761 16 14C16 13.7239 16.2239 13.5 16.5 13.5C16.7761 13.5 17 13.7239 17 14Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );

    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="stroke-secondary-400">
        <path d="M22 10H2M11 14H6M2 8.2L2 15.8C2 16.9201 2 17.4802 2.21799 17.908C2.40973 18.2843 2.71569 18.5903 3.09202 18.782C3.51984 19 4.07989 19 5.2 19L18.8 19C19.9201 19 20.4802 19 20.908 18.782C21.2843 18.5903 21.5903 18.2843 21.782 17.908C22 17.4802 22 16.9201 22 15.8V8.2C22 7.0799 22 6.51984 21.782 6.09202C21.5903 5.7157 21.2843 5.40974 20.908 5.21799C20.4802 5 19.9201 5 18.8 5L5.2 5C4.0799 5 3.51984 5 3.09202 5.21799C2.7157 5.40973 2.40973 5.71569 2.21799 6.09202C2 6.51984 2 7.07989 2 8.2Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  const iconBgClass = type === 'wallet' ? 'transaction-icon-wallet bg-primary-100' : 'transaction-icon-invoice bg-primary-200';

  return (
    <div className={cn(
      "transaction-card flex flex-row items-center justify-between gap-1.5 sm:gap-3 self-stretch p-1 sm:p-2 rounded-lg transition-all duration-200 hover:bg-grey-100/30 font-poppins",
      "max-sm:p-1 max-sm:gap-1"
    )}>
      <div className="transaction-info flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1">
        <div className={cn(
          "transaction-icon shrink-0 flex items-center justify-center w-8 h-8 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl",
          iconBgClass
        )}>
          {getIcon()}
        </div>
        <div className="transaction-details flex flex-col min-w-0 overflow-hidden">
          <div className="transaction-title text-[12px] sm:text-base font-semibold text-black truncate whitespace-nowrap">
            {title}
          </div>
          <div className="transaction-date text-[9px] sm:text-[16px] font-normal text-grey-400 truncate whitespace-nowrap leading-tight">
            {date}
          </div>
        </div>
      </div>

      <div className="transaction-amounts flex flex-col items-end shrink-0 ml-1 sm:ml-2">
        <div className="transaction-amount text-[11px] sm:text-base font-semibold text-primary-vibrant whitespace-nowrap">
          + AED {amount.toFixed(2)}
        </div>
        <div className="transaction-balance text-[9px] sm:text-[16px] font-normal text-grey-400 whitespace-nowrap leading-tight">
          Bal. {balance.toFixed(2)}
        </div>
      </div>
    </div>
  );
};

export default TransactionCard;
