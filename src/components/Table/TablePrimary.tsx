import React, { useState } from 'react';
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
    /**
     * KP1-I121 — let a long value WRAP onto a second line instead of being clipped.
     *
     * Every cell is `white-space: nowrap` by default, which is right for the codes, dates
     * and statuses that make up most of a row: wrapping those would make the table ragged
     * for no gain. It is wrong for a NAME. A long account or parent name has nowhere to
     * go, so with a `maxWidth` it is cut off mid-word behind an ellipsis and with none it
     * pushes the row wider and the columns out of alignment — which is the ticket.
     *
     * Opt in per column, and **always with a `maxWidth`**: wrapping is only meaningful
     * once there is a width to wrap against. The cell then keeps its column alignment and
     * the row grows taller, which is what the tester asked for ("the remaining names
     * should continue on the next line").
     *
     * `break-word` rather than plain wrapping, so a single unbroken string — a pasted
     * reference, an email — still yields instead of overflowing the column it is in.
     */
    wrap?: boolean;
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

    /**
     * KP1-I93: a column is marked as sorted only once the USER has sorted it.
     *
     * Every list here seeds an `orderBy` so the first page arrives in a sensible order
     * (Enquiry by Date Raised, Contract by Created On, and twelve more across the two
     * portals). MUI's `TableSortLabel` renders `active` as a selection — darker label plus a
     * permanent arrow — so each of those lists opened with one column already looking
     * clicked, which is what the ticket reports against Date Raised.
     *
     * The distinction is between the default order (an implementation choice) and a sort the
     * user asked for. The DATA still arrives in the default order; only the marker waits.
     *
     * Held here rather than threaded through a prop because the click already passes through
     * this component — so all 23 call sites are fixed without touching one of them, and a
     * list added later cannot forget. Remounting resets it, which is right: a fresh page
     * load is not a user sort.
     */
    const [userSorted, setUserSorted] = useState(false);
    const sortedColumn = userSorted ? orderBy : undefined;

    const handleSort = (key: keyof T) => {
        setUserSorted(true);
        onSort(key);
    };

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
                                    sortDirection={sortedColumn === column.key ? order : false}
                                    className="table-primary-header-cell text-xs! sm:text-sm! lg:text-base!"
                                >
                                    {column.sortable !== false ? (
                                        <TableSortLabel
                                            active={sortedColumn === column.key}
                                            direction={sortedColumn === column.key ? order : 'asc'}
                                            onClick={() => handleSort(column.key)}
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
                                            className={`table-primary-cell text-xs! sm:text-sm! lg:text-sm!${
                                                column.wrap ? ' table-primary-cell-wrap' : ''
                                            }`}
                                            style={{
                                                maxWidth: column.maxWidth,
                                                /*
                                                 * KP1-I121 — a wrapping column keeps its
                                                 * width but drops the clip: an ellipsis and
                                                 * a second line are alternatives, and
                                                 * `overflow: hidden` would cut the wrapped
                                                 * lines off at the cell height instead.
                                                 */
                                                overflow:
                                                    column.maxWidth && !column.wrap ? 'hidden' : 'visible',
                                                textOverflow:
                                                    column.maxWidth && !column.wrap ? 'ellipsis' : 'clip',
                                                whiteSpace: column.wrap ? 'normal' : 'nowrap',
                                                overflowWrap: column.wrap ? 'break-word' : undefined,
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
