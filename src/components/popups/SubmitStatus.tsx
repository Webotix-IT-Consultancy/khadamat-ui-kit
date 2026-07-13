import React from 'react';
import { Dialog, DialogContent, IconButton, Alert } from '@mui/material';
import { X } from 'lucide-react';
import Button from '../Button/Button';
import ActionButton from '../Shared/ActionButton';
import successIcon from '../../assets/images/icons/animated/success-icon.gif';

interface TransactionDetails {
    transactionId: string;
    date: string;
    amount: number;
    processingFee: number;
    paymentMethod: string;
    previousBalance?: number;
}

interface OnCallServiceDetails {
    requestNumber: string;
    dateTime: string;
}

interface DetailItem {
    label: string;
    value: string | number;
}

interface SubmitStatusProps {
    open: boolean;
    onClose: () => void;
    status?: 'success' | 'error';
    title?: string;
    subtitle?: string;
    type?: 'wallet' | 'service'; // Type of submission
    transactionDetails?: TransactionDetails;
    serviceDetails?: OnCallServiceDetails;
    userEmail?: string;
    onDownloadReceipt?: () => void;
}

// Reusable Detail Item Component
const DetailRow: React.FC<{ items: DetailItem[]; isLarge?: boolean }> = ({ items, isLarge = false }) => {
    return (
        <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-1 w-full">
            {items.map((item, idx) => (
                <React.Fragment key={idx}>
                    <div className="flex flex-1 flex-col gap-2 sm:gap-1">
                        <div className={`text-black font-poppins font-normal ${
                            isLarge ? 'text-xs sm:text-sm' : 'text-xs sm:text-sm'
                        }`}>
                            {item.label}
                        </div>
                        <div className={`text-black font-poppins font-semibold ${
                            isLarge ? 'text-sm sm:text-base md:text-lg' : 'text-xs sm:text-sm'
                        }`}>
                            {item.value}
                        </div>
                    </div>
                   
                </React.Fragment>
            ))}
        </div>
    );
};

// Reusable Label-Value Pair
const DetailItem: React.FC<{ label: string; value: string | React.ReactNode; isGray?: boolean }> = ({ 
    label, 
    value, 
    isGray = false 
}) => (
    <div className="flex flex-col gap-2 flex-1">
        <div className={`text-xs sm:text-sm font-poppins font-normal ${
            isGray ? 'text-gray-600' : 'text-black'
        }`}>
            {label}
        </div>
        <div className="text-sm sm:text-base md:text-lg font-poppins font-semibold text-black">
            {value}
        </div>
    </div>
);

const SubmitStatus: React.FC<SubmitStatusProps> = ({
    open,
    onClose,
    status = 'success',
    title = 'Recharge Successful',
    subtitle = '',
    type,
    transactionDetails,
    serviceDetails,
    userEmail = '',
    onDownloadReceipt,
}) => {
    const isSuccess = status === 'success';
    const isWalletType = type === 'wallet';
    const isServiceType = type === 'service';

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                elevation: 0,
                sx: {
                    borderRadius: '23px',
                    maxWidth: '690px',
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

               

                <div className="flex flex-col justify-center items-center gap-4 sm:gap-5 w-full relative z-10">
                    {/* Status Icon */}
                    <img
                        src={successIcon}
                        alt={status}
                        className="w-28 h-28 sm:w-32 sm:h-32 md:w-32 md:h-32 flex-shrink-0 object-contain"
                    />

                    {/* Message */}
                    <div className="flex flex-col justify-center items-center gap-1 text-center">
                        <h2 className="text-black font-poppins text-xl sm:text-2xl md:text-3xl font-medium m-0">{title}</h2>
                        <p className="text-black font-poppins text-sm sm:text-base md:text-base font-normal m-0">{subtitle}</p>
                    </div>

                    {/* Transaction Details - Wallet Type */}
                    {isWalletType && transactionDetails && (
                        <div className="flex flex-col items-center gap-3 sm:gap-4 w-full mt-3 sm:mt-4">
                            <DetailRow 
                                items={[
                                    { label: 'Transaction ID', value: transactionDetails.transactionId },
                                    { label: 'Date & Time', value: transactionDetails.date }
                                ]} 
                            />
                            <DetailRow 
                                items={[
                                    { label: 'Recharge Amount', value: `AED ${(transactionDetails.amount - transactionDetails.processingFee).toFixed(2)}` },
                                    { label: 'Processing Fee', value: `AED ${transactionDetails.processingFee.toFixed(2)}` }
                                ]} 
                            />
                            <DetailRow 
                                items={[
                                    { label: 'Payment Method', value: transactionDetails.paymentMethod }
                                ]} 
                            />
                        </div>
                    )}

                    {/* Service Request Details - Service Type */}
                    {isServiceType && serviceDetails && (
                        <div className="flex flex-col items-center gap-3 sm:gap-4 w-full mt-3 sm:mt-4">
                            <DetailRow 
                                items={[
                                    { label: 'Request No.', value: serviceDetails.requestNumber },
                                    { label: 'Date & Time', value: serviceDetails.dateTime }
                                ]}
                                // isLarge
                            />
                        </div>
                    )}

                    <div className="w-full h-px bg-gray-300"></div>

                    {/* Wallet Balance Update - Only for wallet type */}
                    {isWalletType && transactionDetails && (
                        <div className="w-full flex flex-col gap-2 sm:gap-3">
                            <div className="w-full text-black font-poppins text-xs sm:text-sm font-normal text-left">Updated Wallet balance</div>
                            <div className="flex w-full p-2 sm:p-3 flex-col gap-3 sm:gap-4 rounded-2xl bg-orange-50">
                                <div className="flex justify-between items-start w-full">
                                    <div className="text-black font-poppins text-lg sm:text-xl font-semibold">Total Amount</div>
                                    <div className="flex flex-col justify-center items-end gap-0 sm:gap-1">
                                        <div className="text-black font-poppins text-sm sm:text-base font-medium">Previous Balance AED {transactionDetails.previousBalance?.toFixed(2)}</div>
                                        <div className="text-black font-poppins text-lg sm:text-xl font-semibold">Added AED {transactionDetails.amount.toFixed(2)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Confirmation Message - Only for service type */}
                    {isServiceType && (
                        <Alert 
                            severity="info" 
                            className="w-full p-4 sm:p-5 !rounded-lg !bg-quaternary-light !text-tertiary-400 items-center text-xs sm:text-sm [&_.MuiAlert-icon]:!text-tertiary-400 font-poppins font-normal"
                        >
                            A confirmation has been sent to your registered email. You will receive update about your service request via email and push notification
                        </Alert>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full mt-4 sm:mt-6">
                        <Button
                            type="button"
                            onClick={onClose}
                            className="w-full sm:flex-1"
                            fullWidth
                        >
                            {isWalletType ? 'Back to Dashboard' : 'Close'}
                        </Button>
                        {isWalletType && onDownloadReceipt && (
                            <ActionButton
                                type="download"
                                label="Download Receipt"
                                variant="tertiary"
                                onClick={onDownloadReceipt}
                                fullWidth
                                className="w-full sm:flex-1"
                            />
                        )}
                    </div>

                </div>
            </div>
        </Dialog>
    );
};

export default SubmitStatus;
