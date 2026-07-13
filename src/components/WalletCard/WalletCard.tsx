import React from 'react';
import { useNavigate } from 'react-router-dom';
// import './WalletCard.css';
import DirhamIcon from '../Icons/DirhamIcon';
import Button from '../Button/Button';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';

interface WalletCardProps {
  userName: string;
  balance: number;
  lastRechargeAmount: number;
  lastRechargeDate: string;
  isLowBalance?: boolean;
}

const WalletCard: React.FC<WalletCardProps> = ({
  userName,
  balance,
  lastRechargeAmount,
  lastRechargeDate,
  isLowBalance = false
}) => {
  const { t } = useTranslation(['dashboard', 'common']);
  const navigate = useNavigate();

  const handleRechargeClick = () => {
    navigate('/dashboard/recharge');
  };

  return (
    <div className="wallet-card-wrapper flex flex-col items-center gap-4 p-[0.4375rem_0.625rem] rounded-[22px] bg-primary-100/30 font-poppins">
      <div className={cn(
        "wallet-card flex flex-col justify-between items-start self-stretch p-6 sm:p-[1.5rem_1.8125rem] rounded-[22px] relative overflow-hidden gap-4",
        isLowBalance ? 'wallet-card-warning bg-warning' : 'wallet-card-normal bg-primary-600'
      )}>
        <h2 className={cn(
          "wallet-user-name self-stretch font-semibold m-0 text-lg sm:text-[18px]",
          isLowBalance ? 'text-warning-foreground' : 'text-white'
        )}>{userName}</h2>

        <div className="wallet-balance-section flex flex-col items-center gap-[-0.4375rem] self-stretch">
          <div className={cn(
            "balance-label font-normal text-sm sm:text-[19px]",
            isLowBalance ? 'text-warning-foreground' : 'text-white'
          )}>{t('dashboard:wallet.balance')}</div>
          <div className="balance-amount flex justify-center items-center gap-4 self-stretch">
            <div className="currency-icon w-[31px] h-[27px]">
              <DirhamIcon />
            </div>
            <span className={cn(
              "balance-value font-semibold text-2xl sm:text-[39px]",
              isLowBalance ? 'text-warning-foreground' : 'text-white'
            )}>{balance.toFixed(2)}</span>
          </div>
        </div>

        <div className={cn(
          "last-recharge-info flex flex-col justify-between self-stretch font-normal text-sm sm:text-[16px]",
          isLowBalance ? 'text-warning-foreground' : 'text-white'
        )}>
          <span>{t('dashboard:wallet.lastRecharge')} <strong>{t('common:currency')} {lastRechargeAmount.toFixed(2)}</strong></span>
          <span className="recharge-date text-xs sm:text-[13px]">{t('common:on')} {lastRechargeDate}</span>
        </div>
      </div>

      {isLowBalance ? (
        <div className="wallet-warning-banner flex  p-2 sm:p-[0.5rem_0.875rem] justify-center items-center gap-[0.625rem] rounded-xl bg-warning-banner">
          <svg className="warning-icon w-7 shrink-0" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" className="text-warning-banner-foreground" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="warning-content flex flex-col justify-center items-start gap-[0.625rem] flex-1">
            <p className="warning-text self-stretch text-warning-banner-foreground text-[13px] font-normal m-0">{t('dashboard:wallet.lowBalanceMessage')}</p>
            <Button type="button" onClick={handleRechargeClick}>
              {t('common:buttons.rechargeNow')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="wallet-info-banner flex p-2 sm:p-[0.5rem_0.3125rem] justify-center items-center gap-[0.625rem] rounded-xl bg-green-light">
          <p className="info-text flex-1 text-primary text-[13px] font-normal m-0">{t('dashboard:wallet.minRechargeInfo')}</p>
          <Button type="button" onClick={() => navigate('/dashboard/wallet')}>
            {t('common:buttons.rechargeNow')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default WalletCard;
