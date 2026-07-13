import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../StatusBadge/StatusBadge';
// import './InvoiceCard.css';
import { cn } from '../../lib/utils';

interface InvoiceCardProps {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  amount: number;
  status: 'paid' | 'pending';
  onDownload?: () => void;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({
  id,
  invoiceNumber,
  issueDate,
  amount,
  status,
  onDownload
}) => {
  const navigate = useNavigate();

  // Use theme colors directly in Tailwind classes instead of dynamic background style where possible
  const iconBgUtility = status === 'paid' ? 'bg-primary-100' : 'bg-primary-200';

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking download button
    if ((e.target as HTMLElement).closest('.invoice-download-btn')) {
      return;
    }
    navigate(`/dashboard/invoices/${id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "invoice-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 self-stretch py-3 border-b border-grey-100 last:border-0 transition-all duration-200 hover:bg-grey-100/30 cursor-pointer",
        "max-sm:gap-4 pb-4 sm:pb-3"
      )}>
      <div className="invoice-info flex items-center gap-3 min-w-0 w-full sm:w-auto flex-1">
        <div className={cn(
          "invoice-icon shrink-0 flex items-center justify-center w-14 h-14 rounded-xl",
          "max-sm:w-11 max-sm:h-11 max-sm:rounded-lg",
          iconBgUtility
        )}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M16.5 14H16.51M3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V9C21 7.89543 20.1046 7 19 7L5 7C3.89543 7 3 6.10457 3 5ZM3 5C3 3.89543 3.89543 3 5 3H17M17 14C17 14.2761 16.7761 14.5 16.5 14.5C16.2239 14.5 16 14.2761 16 14C16 13.7239 16.2239 13.5 16.5 13.5C16.7761 13.5 17 13.7239 17 14Z" stroke="#016937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="invoice-details flex flex-col min-w-0 flex-1 ml-1 sm:ml-2">
          <div className="invoice-number text-base font-semibold text-black max-sm:text-sm whitespace-normal">
            {invoiceNumber}
          </div>
          <div className="invoice-date text-[16px] font-normal text-grey-400 max-sm:text-xs">
            Issue Date.{issueDate}
          </div>
        </div>
      </div>

      <div className="invoice-actions-container flex flex-row items-center justify-between sm:justify-end gap-4 w-full sm:w-auto shrink-0">
        <div className="invoice-amount-section flex flex-col items-satrt sm:items-end gap-1">
          <div className="invoice-amount text-base font-semibold text-black max-sm:text-[14px]">
            AED {amount.toFixed(2)}
          </div>
          <div className="scale-90 sm:scale-100 sm:origin-right origin-left">
            <StatusBadge status={status} label={status} />
          </div>
        </div>

        {status === 'paid' && (
          <button
            className="invoice-download-btn flex items-center justify-center w-10 h-10 rounded-full bg-[#04bc67] hover:bg-[#039957] transition-colors shrink-0 max-sm:w-9 max-sm:h-9"
            onClick={onDownload}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="max-sm:scale-90">
              <path d="M21 15V16.2C21 17.8802 21 18.7202 20.673 19.362C20.3854 19.9265 19.9265 20.3854 19.362 20.673C18.7202 21 17.8802 21 16.2 21H7.8C6.11984 21 5.27976 21 4.63803 20.673C4.07354 20.3854 3.6146 19.9265 3.32698 19.362C3 18.7202 3 17.8802 3 16.2V15M17 10L12 15M12 15L7 10M12 15V3" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default InvoiceCard;
