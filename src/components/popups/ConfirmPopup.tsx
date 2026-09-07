import React from 'react';
import { Dialog, IconButton } from '@mui/material';
import { X, Info } from 'lucide-react';
import Button from '../Button/Button';

interface ConfirmPopupProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isLoading?: boolean;
}

const ConfirmPopup: React.FC<ConfirmPopupProps> = ({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Yes',
    cancelLabel = 'No',
    isLoading = false,
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
                {/* KP1-I113: the icon was `text-primary` on `bg-primary-light`, so this read as
                    an ordinary informational prompt in the theme's own colour. The design calls
                    for a RED information icon — this dialog always asks about discarding work.
                    Tokens, not literals, so it stays correct in both portals' themes. */}
                <div className="mb-4 sm:mb-6 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full text-white bg-[hsl(var(--destructive))]">
                    <Info size={32} className=" sm:w-10 sm:h-10" strokeWidth={1.5} />
                </div>

                <h2 className="text-xl sm:text-xl md:text-xl font-poppins font-semibold text-black text-center mb-2 sm:mb-3">
                    {title}
                </h2>

                {message && (
                    <p className="text-xs sm:text-sm md:text-sm font-poppins font-normal text-gray-600 text-center mb-6 sm:mb-8 px-2">
                        {message}
                    </p>
                )}

                {/*
                  * KP1-I113: the buttons rendered confirm-then-cancel, so "Yes" sat on the LEFT
                  * and "No" on the right — the reverse of the design, and the reverse of every
                  * form footer in this product (Cancel outline on the left, Save solid on the
                  * right). Order and emphasis now follow that same convention: the dismissive
                  * action is the outline one on the left, the affirmative action is solid on
                  * the right.
                  *
                  * On a narrow screen the row stacks, and `flex-col-reverse` keeps "Yes"
                  * closest to the thumb while "No" stays first in the DOM — so keyboard and
                  * screen-reader order still reaches the safe choice first.
                  */}
                <div className="flex justify-center flex-col-reverse sm:flex-row gap-4 sm:gap-4 w-full mb-2">
                    <Button
                        type="button"
                        variant="outline-primary"
                        onClick={onClose}
                        disabled={isLoading}
                        className="w-full sm:flex-1"
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        type="button"
                        onClick={onConfirm}
                        isLoading={isLoading}
                        className="w-full sm:flex-1"
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </Dialog>
    );
};

export default ConfirmPopup;
