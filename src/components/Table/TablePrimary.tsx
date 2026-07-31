import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Paper,
    Box,
    Pagination,
} from '@mui/material';
import './TablePrimary.css';
import './TableControls.css';
import { useTranslation } from 'react-i18next';

export interface ColumnDefinition<T> {
    key: keyof T;
    label: string;
    sortable?: boolean;
    maxWidth?: string;
    format?: (value: any, row: T, index: number) => React.ReactNode;
}

interface TablePrimaryProps<T> {
    columns: ColumnDefinition<T>[];
    data: T[];
    order: 'asc' | 'desc';
    orderBy: keyof T;
    onSort: (property: keyof T) => void;
    page: number;
    rowsPerPage: number;
    totalCount: number;
    onPageChange: (event: unknown, newPage: number) => void;
    rowKey: (row: T) => string | number;
    /**
     * Shown instead of an empty cell, so "no value" reads as absent data rather than
     * a rendering bug (KP1-I48). Pass `''` to keep cells blank.
     */
    emptyPlaceholder?: React.ReactNode;
    /**
     * Pins the last column to the right edge while the table scrolls horizontally
     * (KP1-I50). Opt-in: it only makes sense when that column is the row's actions,
     * so a table whose last column is data (a balance, a status) leaves it off.
     */
    stickyLastColumn?: boolean;
}

/**
 * A cell is blank only when there is genuinely nothing to show. A numeric 0 and a
 * `false` are data — the same trap `DetailField`'s `hideWhenEmpty` avoids.
 */
const isBlank = (value: React.ReactNode) =>
    value === null || value === undefined || (typeof value === 'string' && value.trim() === '');

const TablePrimary = <T extends Record<string, any>>({
    columns,
    data,
    order,
    orderBy,
    onSort,
    page,
    rowsPerPage,
    totalCount,
    onPageChange,
    rowKey,
    emptyPlaceholder = '-',
    stickyLastColumn = false,
}: TablePrimaryProps<T>) => {
    const { t } = useTranslation('common');

    return (
        <Box className="table-primary-container">
            <TableContainer component={Paper} className="table-primary-wrapper">
                <Table
                    stickyHeader
                    className={`transaction-table${stickyLastColumn ? ' table-primary-sticky-last' : ''}`}
                >
                    <TableHead className="table-primary-head">
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell
                                    key={column.key as string}
                                    sortDirection={orderBy === column.key ? order : false}
                                    className="table-primary-header-cell text-xs! sm:text-sm! lg:text-base!"
                                >
                                    {column.sortable !== false ? (
                                        <TableSortLabel
                                            active={orderBy === column.key}
                                            direction={orderBy === column.key ? order : 'asc'}
                                            onClick={() => onSort(column.key)}
                                            className="table-primary-sort-label"
                                            classes={{ icon: 'table-primary-sort-icon' }}
                                        >
                                            {column.label}
                                        </TableSortLabel>
                                    ) : (
                                        column.label
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((row, index) => (
                            <TableRow
                                hover
                                key={rowKey(row)}
                                className={`table-primary-row ${index % 2 === 1 ? 'table-primary-row-alternate' : ''}`}
                            >
                                {columns.map((column) => {
                                    const raw = row[column.key];
                                    const content = column.format ? column.format(raw, row, index) : raw;

                                    return (
                                        <TableCell
                                            key={column.key as string}
                                            className="table-primary-cell text-xs! sm:text-sm! lg:text-sm!"
                                            style={{
                                                maxWidth: column.maxWidth,
                                                overflow: column.maxWidth ? 'hidden' : 'visible',
                                                textOverflow: column.maxWidth ? 'ellipsis' : 'clip',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {isBlank(content) ? emptyPlaceholder : content}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box className="table-primary-pagination-container">
                <Box className="table-primary-pagination-info text-xs! sm:text-sm! lg:text-base!">
                    {totalCount > 0 ? (
                        <>
                            {t('table.paginationInfo', {
                                count: totalCount,
                                from: page * rowsPerPage + 1,
                                to: Math.min((page + 1) * rowsPerPage, totalCount)
                            })}
                        </>
                    ) : (
                        t('table.paginationInfo', { count: 0, from: 0, to: 0 })
                    )}
                </Box>
                <Pagination
                    count={Math.ceil(totalCount / rowsPerPage)}
                    page={page + 1}
                    onChange={(event, value) => onPageChange(event, value - 1)}
                    shape="rounded"
                    className="table-primary-numeric-pagination [&_.MuiPaginationItem-root]:text-xs! [&_.MuiPaginationItem-root]:sm:text-sm! [&_.MuiPaginationItem-root]:lg:text-base!"
                />
            </Box>
        </Box>
    );
};

export default TablePrimary;
