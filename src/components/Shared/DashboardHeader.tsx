import React, { useState } from 'react';
import LogoutConfirmation from '../popups/LogoutConfirmation';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import userProfileImage from '../../assets/images/avatar/user-demo.png';
import { usePageStore } from '../../store/usePageStore';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardHeaderProps {
    onNotificationClick: () => void;
    notificationCount?: number;
    user?: any;
    onLogout: () => void;
    userType: 'customer' | 'admin';
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    onNotificationClick,
    notificationCount = 32,
    user,
    onLogout: handleLogout,
    userType
}) => {
    const { t } = useTranslation('common');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Extracting first name for the welcome message
    const firstName = user?.companyName?.split(' ')[0] || 'User';

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

    const { title, breadcrumbs } = usePageStore();

    return (
        <div className="flex justify-between items-center w-full h-full">
            <div className="flex items-center gap-2 md:gap-3">
                {title ? (
                    <div className="hidden md:flex flex-col">
                        {breadcrumbs.length > 0 && (
                            <div className="flex items-center gap-1 text-[13px] text-gray-500 font-poppins mb-0.5">
                                {breadcrumbs.map((bc, index) => (
                                    <React.Fragment key={index}>
                                        {bc.path ? (
                                            <Link to={bc.path} className="hover:text-[#016937] transition-colors">
                                                {bc.label}
                                            </Link>
                                        ) : (
                                            <span>{bc.label}</span>
                                        )}
                                        {index < breadcrumbs.length - 1 && <ChevronRight className="w-3.5 h-3.5" />}
                                    </React.Fragment>
                                ))}
                            </div>
                        )}
                        <h1 className="text-lg md:text-[23px] font-semibold text-black font-poppins whitespace-nowrap">
                            {title}
                        </h1>
                    </div>
                ) : (
                    <>
                        <span className="text-lg md:text-[23px] font-normal text-black font-poppins">
                            {t('header.welcomeBack')}
                        </span>
                        <span className="text-lg md:text-[23px] font-semibold text-black font-poppins">
                            {firstName}
                        </span>
                        <span className="text-base md:text-[16px]">👋</span>
                    </>
                )}
            </div>

            <div className="flex items-center gap-2 md:gap-3">
                {/* User Info - Hidden on mobile */}
                <div className="hidden sm:flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <div className="text-sm md:text-[16px] font-semibold text-black font-poppins">
                            {user?.companyName || 'User'}
                        </div>
                        <div className="text-[11px] md:text-[13px] font-normal text-black font-poppins">
                            {t('header.id')} {user?.id || 'Unknown'}
                        </div>
                    </div>
                    <div className="w-10 h-10 md:w-11 md:h-11 rounded-full overflow-hidden bg-[#d9d9d9] shrink-0">
                        <img
                            src={userProfileImage}
                            alt="User avatar"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Notifications */}
                <button
                    className="flex justify-center items-center w-10 h-10 md:w-12 md:h-12 rounded-[10px] text-primary bg-primary-light border-none cursor-pointer relative hover:bg-primary/25 transition-colors"
                    onClick={onNotificationClick}
                    aria-label="View notifications"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M9.35395 21C10.0591 21.6224 10.9853 22 11.9998 22C13.0142 22 13.9405 21.6224 14.6456 21M17.9998 8C17.9998 6.4087 17.3676 4.88258 16.2424 3.75736C15.1172 2.63214 13.5911 2 11.9998 2C10.4085 2 8.88235 2.63214 7.75713 3.75736C6.63192 4.88258 5.99977 6.4087 5.99977 8C5.99977 11.0902 5.22024 13.206 4.34944 14.6054C3.6149 15.7859 3.24763 16.3761 3.2611 16.5408C3.27601 16.7231 3.31463 16.7926 3.46155 16.9016C3.59423 17 4.19237 17 5.38863 17H18.6109C19.8072 17 20.4053 17 20.538 16.9016C20.6849 16.7926 20.7235 16.7231 20.7384 16.5408C20.7519 16.3761 20.3846 15.7859 19.6501 14.6054C18.7793 13.206 17.9998 11.0902 17.9998 8Z" 
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="absolute top-0.5 right-0.5 flex justify-center items-center px-1 min-w-[18px] h-[18px] rounded-full bg-[#ff3232] text-white font-poppins text-[10px] font-semibold shadow-sm">
                        {notificationCount}
                    </span>
                </button>

                {/* Logout */}
                <button
                    className="flex justify-center items-center w-10 h-10 md:w-12 md:h-12 rounded-[10px] text-primary bg-primary-light border-none cursor-pointer hover:bg-primary/25 transition-colors"
                    aria-label="Logout"
                    onClick={handleLogoutClick}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M18 8L22 12M22 12L18 16M22 12H9M15 4.20404C13.7252 3.43827 12.2452 3 10.6667 3C5.8802 3 2 7.02944 2 12C2 16.9706 5.8802 21 10.6667 21C12.2452 21 13.7252 20.5617 15 19.796"
                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>

            {/* Logout Confirmation Modal */}
            <LogoutConfirmation
                open={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={handleLogout}
                isLoading={isLoggingOut}
            />
        </div>
    );
};

export default DashboardHeader;
