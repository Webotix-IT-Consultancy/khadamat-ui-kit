import React, { useEffect, useRef, useState } from 'react';
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

/**
 * How long typing must pause before the search is sent. Every list hook refetches on each
 * change of its search term — usually the list PLUS its tab counts, so three requests — and
 * this box used to report every keystroke: "contract" typed at speed was 24 requests, and a
 * slow early response could land after a fast later one and show results for "con".
 */
const SEARCH_DEBOUNCE_MS = 300;

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

    /*
     * The box keeps its own draft so typing is instant, and reports to the list only once the
     * user pauses. Enter sends at once, and so does emptying the box — "show everything again"
     * should not wait. A term changed FROM OUTSIDE (a filter reset, a tab that clears the
     * search) is adopted into the draft; the list stays the single source of truth.
     */
    const [draft, setDraft] = useState(searchQuery ?? '');
    const lastSent = useRef(searchQuery ?? '');
    const timer = useRef<number | undefined>(undefined);
    const onSearchChangeRef = useRef(onSearchChange);
    onSearchChangeRef.current = onSearchChange;

    useEffect(() => {
        const external = searchQuery ?? '';
        if (external !== lastSent.current) {
            lastSent.current = external;
            setDraft(external);
        }
    }, [searchQuery]);

    useEffect(() => () => window.clearTimeout(timer.current), []);

    const sendSearch = (value: string) => {
        window.clearTimeout(timer.current);
        if (value === lastSent.current) return;
        lastSent.current = value;
        onSearchChangeRef.current(value);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setDraft(value);
        window.clearTimeout(timer.current);
        if (!value.trim()) {
            sendSearch(value);
            return;
        }
        timer.current = window.setTimeout(() => sendSearch(value), SEARCH_DEBOUNCE_MS);
    };

    const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') sendSearch(draft);
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
                value={draft}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                /* KP1-I200 — the box reads in the direction of what is typed. A list is
                   searched by the same Arabic the rows hold, and MUI renders its own
                   <input>, so `dir` has to be handed down through inputProps. */
                inputProps={{ dir: 'auto' }}
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

