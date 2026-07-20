import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import khadamatLogo from '../../../assets/images/khadamat-logo.png';
import webotixLogo from '../../../assets/images/webotix-logo-primary.png';
import LogoutConfirmation from '../../popups/LogoutConfirmation';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { useSidebarStore } from '../../../store/useSidebarStore';
import PhoneCallIcon from '../../../assets/images/icons/phone-call-icon.svg';
import enquiryAvatar from '../../../assets/images/avatar/enquiry.png';
import whatsappIcon from '../../../assets/images/icons/whatsapp-solid-icon.svg';
import { cn } from '../../../lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Phone,
  MessageSquare,
  Bell
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '../../ui/tooltip';
import Button from '../../../components/Button/Button';
import WhatsAppIcon from '../../../components/Icons/WhatsAppIcon';

export interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

interface DashboardSidebarProps {
  isMobile?: boolean;
  menuItems?: MenuItem[];
  onLogout: () => void;
  userType: 'customer' | 'admin';
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  isMobile = false,
  menuItems: propsMenuItems,
  onLogout: handleLogout,
  userType
}) => {
  const { t, i18n } = useTranslation('common');
  const location = useLocation();
  const isRTL = i18n.language === 'ar';

  const {
    isCollapsed,
    toggleCollapse,
    setCollapsed,
    setMobileOpen
  } = useSidebarStore();

  const actualCollapsed = isMobile ? false : isCollapsed;

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Initial responsive state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg
        // setCollapsed(false); // User wants expanded by default on lg
      } else if (window.innerWidth >= 768) { // md
        setCollapsed(true);
      }
    };

    handleResize(); // Run on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setCollapsed]);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      if (handleLogout) await handleLogout();
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  const defaultMenuItems: MenuItem[] = [
    {
      path: '/dashboard',
      label: t('sidebar.dashboard'),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M8.4 3H4.6C4.03995 3 3.75992 3 3.54601 3.10899C3.35785 3.20487 3.20487 3.35785 3.10899 3.54601C3 3.75992 3 4.03995 3 4.6V8.4C3 8.96005 3 9.24008 3.10899 9.45399C3.20487 9.64215 3.35785 9.79513 3.54601 9.89101C3.75992 10 4.03995 10 4.6 10H8.4C8.96005 10 9.24008 10 9.45399 9.89101C9.64215 9.79513 9.79513 9.64215 9.89101 9.45399C10 9.24008 10 8.96005 10 8.4V4.6C10 4.03995 10 3.75992 9.89101 3.54601C9.79513 3.35785 9.64215 3.20487 9.45399 3.10899C9.24008 3 8.96005 3 8.4 3Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M19.4 3H15.6C15.0399 3 14.7599 3 14.546 3.10899C14.3578 3.20487 14.2049 3.35785 14.109 3.54601C14 3.75992 14 4.03995 14 4.6V8.4C14 8.96005 14 9.24008 14.109 9.45399C14.2049 9.64215 14.3578 9.79513 14.546 9.89101C14.7599 10 15.0399 10 15.6 10H19.4C19.9601 10 20.2401 10 20.454 9.89101C20.6422 9.79513 20.7951 9.64215 20.891 9.45399C21 9.24008 21 8.96005 21 8.4V4.6C21 4.03995 21 3.75992 20.891 3.54601C20.7951 3.35785 20.6422 3.20487 20.454 3.10899C20.2401 3 19.9601 3 19.4 3Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M19.4 14H15.6C15.0399 14 14.7599 14 14.546 14.109C14.3578 14.2049 14.2049 14.3578 14.109 14.546C14 14.7599 14 15.0399 14 15.6V19.4C14 19.9601 14 20.2401 14.109 20.454C14.2049 20.6422 14.3578 20.7951 14.546 20.891C14.7599 21 15.0399 21 15.6 21H19.4C19.9601 21 20.2401 21 20.454 20.891C20.6422 20.7951 20.7951 20.6422 20.891 20.454C21 20.2401 21 19.9601 21 19.4V15.6C21 15.0399 21 14.7599 20.891 14.546C20.7951 14.3578 20.6422 14.2049 20.454 14.109C20.2401 14 19.9601 14 19.4 14Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8.4 14H4.6C4.03995 14 3.75992 14 3.54601 14.109C3.35785 14.2049 3.20487 14.3578 3.10899 14.546C3 14.7599 3 15.0399 3 15.6V19.4C3 19.9601 3 20.2401 3.10899 20.454C3.20487 20.6422 3.35785 20.7951 3.54601 20.891C3.75992 21 4.03995 21 4.6 21H8.4C8.96005 21 9.24008 21 9.45399 20.891C9.64215 20.7951 9.79513 20.6422 9.89101 20.454C10 20.2401 10 19.9601 10 19.4V15.6C10 15.0399 10 14.7599 9.89101 14.546C9.79513 14.3578 9.64215 14.2049 9.45399 14.109C9.24008 14 8.96005 14 8.4 14Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      path: '/notifications',
      label: t('sidebar.notifications'),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 21H10M18 8C18 6.4087 17.3679 4.88258 16.2427 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.8826 2.63214 7.75738 3.75736C6.63216 4.88258 6.00002 6.4087 6.00002 8C6.00002 11.0902 5.22049 13.206 4.34968 14.6054C3.61515 15.7859 3.24788 16.3761 3.26134 16.5408C3.27626 16.7231 3.31488 16.7926 3.46179 16.9016C3.59448 17 4.19261 17 5.38887 17H18.6112C19.8074 17 20.4056 17 20.5382 16.9016C20.6852 16.7926 20.7238 16.7231 20.7387 16.5408C20.7522 16.3761 20.3849 15.7859 19.6504 14.6054C18.7795 13.206 18 11.0902 18 8Z"
            stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      path: '/dashboard/profile',
      label: t('sidebar.account'),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M20 21C20 19.6044 20 18.9067 19.8278 18.3389C19.44 17.0605 18.4395 16.06 17.1611 15.6722C16.5933 15.5 15.8956 15.5 14.5 15.5H9.5C8.10444 15.5 7.40665 15.5 6.83886 15.6722C5.56045 16.06 4.56004 17.0605 4.17224 18.3389C4 18.9067 4 19.6044 4 21M16.5 7.5C16.5 9.98528 14.4853 12 12 12C9.51472 12 7.5 9.98528 7.5 7.5C7.5 5.01472 9.51472 3 12 3C14.4853 3 16.5 5.01472 16.5 7.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      path: '/dashboard/enquiries',
      label: t('sidebar.enquiries'),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9 12H15M9 16H12M17 21L12 17H7.2C6.0799 17 5.51984 17 5.09202 16.782C4.71569 16.5903 4.40973 16.2843 4.21799 15.908C4 15.4802 4 14.9201 4 13.8V7.2C4 6.0799 4 5.51984 4.21799 5.09202C4.40973 4.71569 4.71569 4.40973 5.09202 4.21799C5.51984 4 6.0799 4 7.2 4H16.8C17.9201 4 18.4802 4 18.908 4.21799C19.2843 4.40973 19.5903 4.71569 19.782 5.09202C20 5.51984 20 6.0799 20 7.2V13.8C20 14.9201 20 15.4802 19.782 15.908C19.5903 16.2843 19.2843 16.5903 18.908 16.782C18.4802 17 17.9201 17 16.8 17H17V21Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      path: '/dashboard/on-call-service',
      label: t('sidebar.onCallService'),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M14.0497 6C15.0264 6.19057 15.924 6.66826 16.6277 7.37194C17.3314 8.07561 17.8091 8.97326 17.9997 9.95M14.0497 2C16.0789 2.22544 17.9713 3.13417 19.4159 4.57701C20.8606 6.01984 21.7717 7.91101 21.9997 9.94M10.2266 13.8631C9.02506 12.6615 8.07627 11.3028 7.38028 9.85323C7.32041 9.72854 7.29048 9.66619 7.26748 9.5873C7.18576 9.30695 7.24446 8.96269 7.41447 8.72526C7.46231 8.65845 7.51947 8.60129 7.63378 8.48698C7.98338 8.13737 8.15819 7.96257 8.27247 7.78679C8.70347 7.1239 8.70347 6.26932 8.27247 5.60643C8.15819 5.43065 7.98338 5.25585 7.63378 4.90624L7.43891 4.71137C6.90747 4.17993 6.64174 3.91421 6.35636 3.76987C5.7888 3.4828 5.11854 3.4828 4.55098 3.76987C4.2656 3.91421 3.99987 4.17993 3.46843 4.71137L3.3108 4.86901C2.78117 5.39863 2.51636 5.66344 2.31411 6.02348C2.08969 6.42298 1.92833 7.04347 1.9297 7.5017C1.93092 7.91464 2.01103 8.19687 2.17124 8.76131C3.03221 11.7947 4.65668 14.6571 7.04466 17.045C9.43264 19.433 12.295 21.0575 15.3284 21.9185C15.8928 22.0787 16.1751 22.1588 16.588 22.16C17.0462 22.1614 17.6667 22 18.0662 21.7756C18.4263 21.5733 18.6911 21.3085 19.2207 20.7789L19.3783 20.6213C19.9098 20.0898 20.1755 19.8241 20.3198 19.5387C20.6069 18.9712 20.6069 18.3009 20.3198 17.7333C20.1755 17.448 19.9098 17.1822 19.3783 16.6508L19.1835 16.4559C18.8339 16.1063 18.6591 15.9315 18.4833 15.8172C17.8204 15.3862 16.9658 15.3862 16.3029 15.8172C16.1271 15.9315 15.9523 16.1063 15.6027 16.4559C15.4884 16.5702 15.4313 16.6274 15.3644 16.6752C15.127 16.8453 14.7828 16.904 14.5024 16.8222C14.4235 16.7992 14.3612 16.7693 14.2365 16.7094C12.7869 16.0134 11.4282 15.0646 10.2266 13.8631Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      path: '/dashboard/wallet',
      label: t('sidebar.wallet'),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M16.5 14H16.51M3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V9C21 7.89543 20.1046 7 19 7L5 7C3.89543 7 3 6.10457 3 5ZM3 5C3 3.89543 3.89543 3 5 3H17M17 14C17 14.2761 16.7761 14.5 16.5 14.5C16.2239 14.5 16 14.2761 16 14C16 13.7239 16.2239 13.5 16.5 13.5C16.7761 13.5 17 13.7239 17 14Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      path: '/dashboard/transactions',
      label: t('sidebar.transaction'),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M22 10H2M11 19L18.8 19C19.9201 19 20.4802 19 20.908 18.782C21.2843 18.5903 21.5903 18.2843 21.782 17.908C22 17.4802 22 16.9201 22 15.8V8.2C22 7.0799 22 6.51984 21.782 6.09202C21.5903 5.7157 21.2843 5.40974 20.908 5.21799C20.4802 5 19.9201 5 18.8 5H17M11 19L13 21M11 19L13 17M7 19H5.2C4.07989 19 3.51984 19 3.09202 18.782C2.71569 18.5903 2.40973 18.2843 2.21799 17.908C2 17.4802 2 16.9201 2 15.8V8.2C2 7.0799 2 6.51984 2.21799 6.09202C2.40973 5.71569 2.7157 5.40973 3.09202 5.21799C3.51984 5 4.0799 5 5.2 5H13M13 5L11 7M13 5L11 3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      path: '/dashboard/invoices',
      label: t('sidebar.invoice'),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9 10.5L11 12.5L15.5 8M20 21V7.8C20 6.11984 20 5.27976 19.673 4.63803C19.3854 4.07354 18.9265 3.6146 18.362 3.32698C17.7202 3 16.8802 3 15.2 3H8.8C7.11984 3 6.27976 3 5.63803 3.32698C5.07354 3.6146 4.6146 4.07354 4.32698 4.63803C4 5.27976 4 6.11984 4 7.8V21L6.75 19L9.25 21L12 19L14.75 21L17.25 19L20 21Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    }
  ];

  const menuItems = propsMenuItems || defaultMenuItems;

  const sidebarContent = (
    <div className={cn(
      "h-screen flex flex-col bg-primary-light-200 transition-all duration-300 ease-in-out relative group/sidebar border-e border-[#f1f0ef]",
      "md:sticky md:top-0 md:z-50",
      actualCollapsed ? "w-[80px]" : "w-[306px]",
      "p-3 md:p-4"
    )}>
      {/* Desktop Collapse Toggle */}
      <button
        onClick={toggleCollapse}
        className={cn(
          "absolute -right-3 top-[69px] z-50 hidden md:flex h-8 w-8 shadow-sm items-center justify-center rounded-sm bg-primary-light-200 text-primary transition-transform hover:bg-primary-light",
          isRTL ? "right-auto -left-3 rotate-180" : ""
        )}
        aria-label={actualCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {actualCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      {/* Logo Section */}
      <div className={cn(
        "flex items-center mb-6 overflow-hidden transition-all duration-300",
        actualCollapsed ? "justify-center h-16" : "justify-center h-32"
      )}>
        <img
          src={khadamatLogo}
          alt="Khadamat"
          className={cn(
            "transition-all duration-300 object-contain",
            actualCollapsed ? "w-10 h-10" : "max-w-full max-h-full"
          )}
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1.5 overflow-y-auto no-scrollbar">
        <TooltipProvider delayDuration={0}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;

            const LinkContent = (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2.5 h-12 p-1.5 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-primary-base text-white shadow-sm " + cn(userType === "admin" && "bg-secondary")
                    : "text-primary-base " + cn(userType === "admin" ? "text-secondary hover:bg-primary/25" : "hover:bg-primary-light"),
                  actualCollapsed ? "justify-center" : "justify-start"
                )}
                onClick={() => setMobileOpen(false)}
              >
                <div className="flex items-center justify-center w-10 h-10 shrink-0">
                  {item.icon}
                </div>
                {!actualCollapsed && (
                  <span className="text-base font-poppins font-normal truncate">
                    {item.label}
                  </span>
                )}
              </Link>
            );

            if (actualCollapsed) {
              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    {LinkContent}
                  </TooltipTrigger>
                  <TooltipContent side={isRTL ? "left" : "right"}>
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return LinkContent;
          })}
        </TooltipProvider>
      </nav>

     {
      userType === "customer" && (
        <>
         {/* Feedback item */}


      {!actualCollapsed && (
        <Link
          key={"feedback"}
          to={"/feedback"}
          className={cn(
            "flex items-center gap-2.5 h-12 px-1.5 rounded-lg bg-primary-base text-white my-1 transition-all duration-200",
            actualCollapsed ? "justify-center" : "justify-start"
          )}
          onClick={() => setMobileOpen(false)}
        >
          <div className="flex items-center justify-center w-10 h-10 shrink-0">
            <MessageSquare size={20} />
          </div>
          {!actualCollapsed && (
            <span className="text-base text-xs font-poppins font-normal truncate">
              {t('sidebar.feedback')}
            </span>
          )}
        </Link>
      )
      }
      {actualCollapsed && (
        <TooltipProvider delayDuration={0}>
          <Tooltip key={"feedback"}>
            <TooltipTrigger asChild>
              <Button variant="primary p-0! mt-auto! mb-4! h-12! w-full! rounded-lg! flex items-center justify-center ">
                <MessageSquare />
              </Button>
            </TooltipTrigger>
            <TooltipContent side={isRTL ? "left" : "right"}>
              {t('sidebar.feedback')}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Toll free */}

      {!actualCollapsed && (
        <Link
          key={"tollFree"}
          to={"tel:+971 293 4734 34"}
          className={cn(
            "flex items-center gap-2.5 h-12 px-1.5 rounded-lg bg-tertiary mb-1 transition-all duration-200",
            actualCollapsed ? "justify-center" : "justify-start"
          )}
          onClick={() => setMobileOpen(false)}
        >
          <div className="flex items-center justify-center w-10 h-10 shrink-0">
            <img width={20} height={20} src={PhoneCallIcon} alt="PhoneCallIcon" />
          </div>
          {!actualCollapsed && (
            <span className="text-xs font-poppins font-normal truncate">
              {t('sidebar.tollFree')}
            </span>
          )}
        </Link>
      )
      }
      {actualCollapsed && (
        <TooltipProvider delayDuration={0}>
          <Tooltip key={"feedback"}>
            <TooltipTrigger asChild>
              <Button variant="quaternary p-0! mt-auto! mb-4! h-12! w-full! rounded-lg! flex items-center justify-center ">
                <img width={20} height={20} src={PhoneCallIcon} alt="PhoneCallIcon" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side={isRTL ? "left" : "right"}>
              {t('sidebar.tollFree')}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}


      {/* Help/CTA Section - Hidden when collapsed */}
      {!actualCollapsed && (
        <div className="mt-auto p-3 rounded-2xl bg-[#016937] flex items-center gap-2 mb-3 transition-all duration-300 overflow-hidden cursor-pointer">
          <div className=" bg-primary-200 flex items-center justify-center rounded-lg w-10 h-10 shrink-0">
            <img width={38} height={38} src={enquiryAvatar} alt="Enquiry" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-white mb-1 truncate">
              {t('sidebar.enquiry')}
            </h4>
            <p className="text-[11px] text-white/90 leading-tight">
              {t('sidebar.enquiryDesc')}
            </p>
          </div>
          <button className="h-8 w-8 rounded-lg bg-transparent border-none flex items-center justify-center hover:bg-white/10 shrink-0">
            <WhatsAppIcon />
          </button>
        </div>
      )}

      {/* Compact CTA for collapsed state */}
      {actualCollapsed && (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="mt-auto mb-4 h-12 w-full rounded-lg bg-[#016937] flex items-center justify-center hover:bg-[#01522b] transition-colors">
                <WhatsAppIcon />
              </button>
            </TooltipTrigger>
            <TooltipContent side={isRTL ? "left" : "right"}>
              {t('sidebar.callOnServiceRequest')}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      </>
      )
     }

      {/* Language Switcher */}
      <div className={cn(
        " flex items-center overflow-hidden transition-all duration-200",
        actualCollapsed ? "justify-center" : "justify-between px-1.5"
      )}>
        {!actualCollapsed && (
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2C6.477 2 2 6.477 2 12Z" stroke="#016937" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12.9999 2.0498C12.9999 2.0498 15.9999 5.9998 15.9999 11.9998C15.9999 17.9998 12.9999 21.9498 12.9999 21.9498M10.9999 21.9498C10.9999 21.9498 7.99988 17.9998 7.99988 11.9998C7.99988 5.9998 10.9999 2.0498 10.9999 2.0498M2.62988 15.4998H21.3699M2.62988 8.4998H21.3699" stroke="#016937" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-base text-[#016937] font-poppins">{t('sidebar.language')}</span>
          </div>
        )}
        <div className={cn(actualCollapsed ? "scale-75 origin-center" : "")}>
          <LanguageSwitcher actualCollapsed={actualCollapsed} />
        </div>
      </div>

      {/* Logout */}
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={cn(
                "flex items-center gap-2.5 h-12 px-1.5 rounded-lg cursor-pointer text-[#016937]  transition-all duration-200 ",
                userType === "admin" ? "hover:bg-primary/25" : "hover:bg-primary-light",
                actualCollapsed ? "justify-center" : "justify-start"
              )}
              onClick={handleLogoutClick}
            >
              <div className="flex items-center justify-center w-10 h-10 shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 8L22 12M22 12L18 16M22 12H9M15 4.20404C13.7252 3.43827 12.2452 3 10.6667 3C5.8802 3 2 7.02944 2 12C2 16.9706 5.8802 21 10.6667 21C12.2452 21 13.7252 20.5617 15 19.796" stroke="#016937" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              {!actualCollapsed && (
                <span className="text-base font-poppins font-normal truncate">
                  {t('sidebar.logout')}
                </span>
              )}
            </button>
          </TooltipTrigger>
          {actualCollapsed && (
            <TooltipContent side={isRTL ? "left" : "right"}>
              {t('sidebar.logout')}
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      {/* Footer */}
      {!actualCollapsed && (
        <div className="flex items-center justify-center gap-2 pt-4 opacity-80 border-t border-[#f1f0ef]">
          <span className="text-[11px] text-[#016937] font-poppins font-normal">
            {t('sidebar.developedBy')}
          </span>
          <img src={webotixLogo} alt="Webotix" className="h-3 object-contain" />
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <LogoutConfirmation
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
      />
    </div>
  );

  return sidebarContent;
};

export default DashboardSidebar;
