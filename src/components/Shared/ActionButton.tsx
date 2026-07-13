import React from 'react';
import { Download, Printer, Mail, FileSpreadsheet, Eye } from 'lucide-react';
import Button from '../Button/Button';
import * as XLSX from 'xlsx';

export type ActionType = 'export' | 'print' | 'download' | 'email' | 'view';

interface ActionButtonProps {
    iconPosition?: 'left' | 'right';
    type: ActionType;
    label?: string;
    data?: any[];
    fileName?: string;
    onClick?: (event?: React.MouseEvent<HTMLElement>) => void;
    className?: string;
    variant?: 'primary' | 'outline' | 'secondary' | 'danger' | 'tertiary';
    fullWidth?: boolean;
    size?: 'small' | 'medium' | 'large';
}

const ActionButton: React.FC<ActionButtonProps> = ({
    iconPosition = 'left',
    type,
    label,
    data,
    fileName = 'document',
    onClick,
    className = '',
    variant = 'primary',
    fullWidth = false,
    size = 'medium',
}) => {
    const handleAction = (event: React.MouseEvent<HTMLElement>) => {
        if (onClick) {
            onClick(event);
        }

        switch (type) {
            case 'export':
                if (data && data.length > 0) {
                    const worksheet = XLSX.utils.json_to_sheet(data);
                    const workbook = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
                    XLSX.writeFile(workbook, `${fileName}.xlsx`);
                }
                break;
            case 'print':
                window.print();
                break;
            case 'download':
                // Logic for download can be added here if needed
                // For now, it might just trigger the onClick passed from parent
                break;
            case 'email':
                window.location.href = `mailto:?subject=${encodeURIComponent(fileName)}&body=Please find attached the ${fileName}`;
                break;
            default:
                break;
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'export': return <FileSpreadsheet className='w-5 h-5 sm:w-6 sm:h-6'/>;
            case 'print': return <Printer className='w-5 h-5 sm:w-6 sm:h-6'/>;
            case 'download': return <Download className='w-5 h-5 sm:w-6 sm:h-6'/>;
            case 'email': return <Mail className='w-5 h-5 sm:w-6 sm:h-6'/>;
            case 'view': return <Eye className='w-5 h-5 sm:w-6 sm:h-6'/>;
            default: return null;
        }
    };

    const getDefaultLabel = () => {
        switch (type) {
            case 'export': return 'Export to Excel';
            case 'print': return 'Print';
            case 'download': return 'Download';
            case 'email': return 'Send to Email';
            case 'view': return 'View Details';
            default: return '';
        }
    };

    return (
        <Button
            variant={variant}
            className={`flex items-center gap-2 ${className}`}
            onClick={handleAction}
            fullWidth={fullWidth}
            size={size}
        >
            {iconPosition === 'left' && getIcon()} {label || getDefaultLabel()} {iconPosition === 'right' && getIcon()} 
        </Button>
    );
};

export default ActionButton;
