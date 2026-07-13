import React, { useState } from 'react';
import {
    TextField,
    InputAdornment,
    Box,
    Menu,
    MenuItem,
} from '@mui/material';
import { Search, ChevronDown, Filter as FilterIcon } from 'lucide-react';
import ActionButton from '../Shared/ActionButton';
import { ExportType } from '../../utils/exportTable';
import { useTranslation } from 'react-i18next';

interface TableActionMenuProps {
    rowsPerPage: number;
    onRowsPerPageChange: (newRows: number) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onFilterClick?: () => void;
    onExport?: (type: ExportType) => void;
    showExport?: boolean;
    actionChildren?: React.ReactNode;
}

const TableActionMenu: React.FC<TableActionMenuProps> = ({
    rowsPerPage,
    onRowsPerPageChange,
    searchQuery,
    onSearchChange,
    onFilterClick,
    onExport,
    showExport = true,
    actionChildren
}) => {
    const { t } = useTranslation('common');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
    const openSortMenu = Boolean(anchorEl);
    const openExportMenu = Boolean(exportAnchorEl);

    const handleSortButtonClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleSortMenuClose = () => {
        setAnchorEl(null);
    };

    const handleRowsPerPageSelect = (option: number) => {
        onRowsPerPageChange(option);
        handleSortMenuClose();
    }

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onSearchChange(event.target.value);
    };

    const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
        setExportAnchorEl(event.currentTarget);
    };

    const handleExportClose = () => {
        setExportAnchorEl(null);
    };

    const handleExportSelect = (type: ExportType) => {
        if (onExport) {
            onExport(type);
        }
        handleExportClose();
    };


    return (
        <Box className="table-actions flex flex-wrap gap-2 w-full font-poppins">
            <Box
                component="button"
                className="action-btn btn-sort btn btn-small btn-grey flex items-center justify-center gap-2 flex-1 md:flex-none "
                onClick={handleSortButtonClick}
                size="small"
                fullWidth
            >
                <span>{t('table.rowsPerPage', { count: rowsPerPage })}</span>
                <ChevronDown size={24} />
            </Box>
            <TextField
                placeholder={t('table.searchPlaceholder')}
                variant="outlined"
                size="small"
                className="mui-search-field flex-1 min-w-[200px]!"
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search size={20} color="hsl(var(--primary))" />
                        </InputAdornment>
                    ),
                }}
            />

            <Menu
                anchorEl={anchorEl}
                open={openSortMenu}
                onClose={handleSortMenuClose}
                className="sort-menu"
                PaperProps={{ className: 'sort-menu-paper' }}
            >
                {[5, 10, 25, 50].map((option) => (
                    <MenuItem
                        key={option}
                        onClick={() => handleRowsPerPageSelect(option)}
                        selected={rowsPerPage === option}
                        className="sort-menu-item"
                    >
                        {t('table.rowCount', { count: option })}
                    </MenuItem>
                ))}
            </Menu>

            {showExport && onExport && (
                <>
                    <ActionButton
                        type="export"
                        label={t('buttons.export')}
                        onClick={handleExportClick}
                        variant='primary'
                        className="btn-small ms-auto action-btn btn-export flex-1 md:flex-none text-small"
                        size="small"
                    />
                    <Menu
                        anchorEl={exportAnchorEl}
                        open={openExportMenu}
                        onClose={handleExportClose}
                        className="sort-menu"
                        PaperProps={{ className: 'sort-menu-paper' }}
                    >
                        <MenuItem onClick={() => handleExportSelect('excel')} className="sort-menu-item">Excel</MenuItem>
                        <MenuItem onClick={() => handleExportSelect('pdf')} className="sort-menu-item">PDF</MenuItem>
                        <MenuItem onClick={() => handleExportSelect('csv')} className="sort-menu-item">CSV</MenuItem>
                    </Menu>
                </>
            )}

            {actionChildren && (
                <div className="flex-1 md:flex-none">
                    {actionChildren}
                </div>
            )}

            {onFilterClick && (
                <Box
                    component="button"
                    className="action-btn btn-filter btn-small flex items-center justify-center gap-2 flex-1 md:flex-none"
                    onClick={onFilterClick}
                >
                    <span>{t('buttons.filter')}</span>
                    <FilterIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </Box>
            )}
        </Box>
    );
};

export default TableActionMenu;

