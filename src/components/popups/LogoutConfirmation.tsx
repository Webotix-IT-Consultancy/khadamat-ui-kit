import React from 'react';
import { Dialog, IconButton } from '@mui/material';
import { X, LogOut } from 'lucide-react';
import Button from '../Button/Button';
import { useTranslation } from 'react-i18next';

interface LogoutConfirmationProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading?: boolean;
}

const LogoutConfirmation: React.FC<LogoutConfirmationProps> = ({
    open,
    onClose,
    onConfirm,
    isLoading = false,
}) => {
    const { t } = useTranslation(['auth', 'common']);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                elevation: 0,
                sx: {
                    borderRadius: '23px',
                    maxWidth: '500px',
                    display: 'flex',
                    flexDirection: 'column',
                    margin: '1rem',
                }
            }}
        >
            <IconButton
                onClick={onClose}
                sx={{ position: 'absolute', right: 16, top: 16, color: '#666', zIndex: 10 }}
            >
                <X size={24} />
            </IconButton>

            <div className="flex flex-col items-center p-4 sm:p-6 md:p-8 bg-white relative">
                {/* Icon */}
                <div className="mb-4 sm:mb-6 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-50">
                    <LogOut size={32} className="text-red-600 sm:w-10 sm:h-10" strokeWidth={1.5} />
                </div>

                {/* Title */}
                <h2 className="text-xl sm:text-2xl md:text-2xl font-poppins font-semibold text-black text-center mb-2 sm:mb-3">
                    {t('auth:logout.title')}
                </h2>

                {/* Message */}
                <p className="text-xs sm:text-sm md:text-sm font-poppins font-normal text-gray-600 text-center mb-6 sm:mb-8 px-2">
                    {t('auth:logout.message')}
                </p>

                {/* Buttons */}
                <div className="flex justify-center flex-col sm:flex-row gap-4 sm:gap-4 w-full mb-6 sm:mb-8">
                    <Button
                        type="button"
                        variant="outline-primary"
                        onClick={onClose}
                        className="w-full sm:flex-1"
                        disabled={isLoading}
                    >
                        {t('common:buttons.cancel')}
                    </Button>
                    <Button
                        type="button"
                        onClick={onConfirm}
                        isLoading={isLoading}
                        className="w-full sm:flex-1"
                    >
                        {t('auth:logout.confirm')}
                    </Button>
                </div>
            </div>
        </Dialog>
    );
};

export default LogoutConfirmation;
