import React from 'react';
import { Dialog, IconButton } from '@mui/material';
import { X, CheckCircle } from 'lucide-react';
import Button from '../Button/Button';
import successIcon from '../../assets/images/icons/animated/success-icon.gif';

interface OnCallServiceSubmitStatusProps {
    open: boolean;
    onClose: () => void;
    requestNumber?: string;
    dateTime?: string;
    userEmail?: string;
}

const OnCallServiceSubmitStatus: React.FC<OnCallServiceSubmitStatusProps> = ({
    open,
    onClose,
    requestNumber = '-',
    dateTime = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }),
    userEmail = '',
}) => {
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
                    maxHeight: '100vh',
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

            <div className="flex flex-col items-center p-4 sm:p-6 md:p-8 bg-white relative overflow-y-auto max-h-[calc(90vh-32px)] flex-1">
                {/* Success Icon */}
                <div className="flex items-center justify-center mb-4 sm:mb-6">
                    <img
                        src={successIcon}
                        alt="Success"
                        className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
                    />
                </div>

                {/* Title */}
                <h2 className="text-xl sm:text-2xl md:text-2xl font-poppins font-semibold text-black text-center mb-2 sm:mb-3">
                    Request submitted successfully
                </h2>

                {/* Subtitle */}
                <p className="text-xs sm:text-sm md:text-sm font-poppins font-normal text-gray-600 text-center mb-6 sm:mb-8">
                    Your On call service request has been successfully submitted
                </p>

                {/* Request Details */}
                <div className="w-full flex flex-col gap-4 sm:gap-6 mb-6 sm:mb-8">
                    {/* Request Number and Date/Time Row */}
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 w-full">
                        {/* Request Number */}
                        <div className="flex flex-col gap-2 flex-1">
                            <div className="text-xs sm:text-sm font-poppins font-normal text-gray-600">
                                Request No.
                            </div>
                            <div className="text-sm sm:text-base md:text-lg font-poppins font-semibold text-black">
                                {requestNumber}
                            </div>
                        </div>

                        {/* Vertical Divider */}
                        <div className="hidden sm:block w-px bg-gray-300 self-center h-12"></div>

                        {/* Date & Time */}
                        <div className="flex flex-col gap-2 flex-1">
                            <div className="text-xs sm:text-sm font-poppins font-normal text-gray-600">
                                Date & Time
                            </div>
                            <div className="text-sm sm:text-base md:text-lg font-poppins font-semibold text-black">
                                {dateTime}
                            </div>
                        </div>
                    </div>

                    {/* Horizontal Divider - Mobile */}
                    <div className="sm:hidden w-full h-px bg-gray-300"></div>
                </div>

                {/* Confirmation Message Box */}
                <div className="w-full bg-amber-50 border border-amber-200 rounded-lg p-4 sm:p-5 mb-6 sm:mb-8">
                    <div className="flex gap-3 sm:gap-4">
                        <div className="flex-shrink-0 mt-1">
                            <svg
                                className="w-5 h-5 sm:w-6 sm:h-6 text-amber-700"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                            </svg>
                        </div>
                        <p className="text-xs sm:text-sm font-poppins font-normal text-amber-900">
                            A confirmation has been sent to your registered email. You will receive update about your service request via email and push notification
                        </p>
                    </div>
                </div>

                {/* Close Button */}
                <Button
                    type="button"
                    onClick={onClose}
                    className="w-full"
                    fullWidth
                >
                    Close
                </Button>

                {/* Support Link */}
                <div className="border-t border-gray-200 pt-4 sm:pt-5 mt-6 sm:mt-8 w-full">
                    <p className="text-xs sm:text-sm font-poppins font-normal text-gray-600 text-center">
                        Need help? Contact Support at{' '}
                        <a
                            href="mailto:support@khadamat.ae"
                            className="text-green-700 font-semibold hover:underline"
                        >
                            support@khadamat.ae
                        </a>
                    </p>
                </div>
            </div>
        </Dialog>
    );
};

export default OnCallServiceSubmitStatus;
