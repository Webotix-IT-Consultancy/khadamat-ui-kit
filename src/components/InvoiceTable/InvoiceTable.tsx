import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Paper,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
} from '@mui/material';
import { Download, Eye } from 'lucide-react';
import * as XLSX from 'xlsx';
import TablePrimary, { ColumnDefinition } from '../Table/TablePrimary';
import TableActionMenu from '../Table/TableActionMenu';

import { InvoiceData } from '../../services/invoice.service';
import StatusBadge from '../StatusBadge/StatusBadge';
import { useTranslation } from 'react-i18next';
import { ExportType } from '../../utils/exportTable';

export type Order = 'asc' | 'desc';

interface InvoiceTableProps {
    invoices: InvoiceData[];
    onFilterClick?: () => void;
    page: number;
    rowsPerPage: number;
    totalCount: number;
    order: Order;
    orderBy: keyof InvoiceData;
    searchQuery: string;
    loading?: boolean;
    onPageChange: (newPage: number) => void;
    onRowsPerPageChange: (newRows: number) => void;
    onSortChange: (property: keyof InvoiceData, order: Order) => void;
    onSearchChange: (query: string) => void;
    onExport?: () => void;
}

const InvoiceTable: React.FC<InvoiceTableProps> = ({
    invoices,
    onFilterClick,
    page,
    rowsPerPage,
    totalCount,
    order,
    orderBy,
    searchQuery,
    loading = false,
    onPageChange,
    onRowsPerPageChange,
    onSortChange,
    onSearchChange,
    onExport
}) => {
    const { t } = useTranslation(['invoice', 'common']);
    const navigate = useNavigate();

    const handleRequestSort = (property: keyof InvoiceData) => {
        const isAsc = orderBy === property && order === 'asc';
        const newOrder = isAsc ? 'desc' : 'asc';
        onSortChange(property, newOrder);
    };

    const handleMuiPageChange = (event: unknown, newPage: number) => {
        onPageChange(newPage);
    };

    const handleExport = (type: ExportType) => {
        if (onExport) {
            onExport();
            return;
        }

        if (type === 'excel') {
            const dataToExport = invoices.map((inv, index) => ({
                [t('common:table.slNo')]: (page * rowsPerPage) + index + 1,
                [t('common:table.invoiceNo')]: inv.invoiceNumber,
                [t('common:table.date')]: inv.issueDate,
                [t('common:table.serviceName')]: inv.serviceName,
                [`${t('common:table.amount')} ${t('common:currency')}`]: inv.amount,
                [t('common:table.status')]: inv.status,
                [t('common:table.paymentMode')]: inv.paymentMethod,
            }));

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, t('invoice:export.sheetName'));
            XLSX.writeFile(workbook, `${t('invoice:export.filename')}.xlsx`);
        }
        // TODO: Implement PDF and CSV export if needed
    };

    const columns: ColumnDefinition<InvoiceData>[] = [
        {
            key: 'id',
            label: t('common:table.slNo'),
            sortable: false,
            format: (_, __, index) => (page * rowsPerPage) + (index ?? 0) + 1
        },
        { key: 'invoiceNumber', label: t('common:table.invoiceNo'), sortable: true },
        {
            key: 'issueDate',
            label: t('common:table.date'),
            sortable: true,
            format: (val: string) => new Date(val).toLocaleDateString('en-GB')
        },
        { key: 'serviceName', label: t('common:table.serviceName'), sortable: true },
        {
            key: 'amount',
            label: `${t('common:table.amount')} ${t('common:currency')}`,
            sortable: true,
            format: (val: number) => val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        },
        {
            key: 'status',
            label: t('common:table.status'),
            sortable: true,
            format: (val: string) => (
                <StatusBadge variant="light" status={val.toLowerCase() === "paid" ? "paid" : (val.toLowerCase() == "pending" ? "pending" : "pending")} label={val} />
            )
        },
        { key: 'paymentMethod', label: t('common:table.paymentMode'), sortable: true },
        {
            key: 'id',
            label: t('common:table.action'),
            format: (_, row) => (
                <div className="action-icons">
                    <Eye
                        size={20}
                        className="action-icon view-icon"
                        onClick={() => navigate(`/dashboard/invoices/${row.id}`)}
                    />
                    <Download size={20} className="action-icon download-icon" />
                </div>
            )
        }
    ];

    return (
        <Box className="invoice-table-container table-container">
            <Box className="invoice-controls-row table-controls-row">
                <TableActionMenu
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={onRowsPerPageChange}
                    searchQuery={searchQuery}
                    onSearchChange={onSearchChange}
                    onFilterClick={onFilterClick}
                    onExport={handleExport}
                />
            </Box>

            <TablePrimary
                columns={columns}
                data={invoices}
                order={order}
                orderBy={orderBy}
                onSort={handleRequestSort}
                page={page}
                rowsPerPage={rowsPerPage}
                totalCount={totalCount}
                onPageChange={handleMuiPageChange}
                rowKey={(row) => row.id}
            />
        </Box>
    );
};

export default InvoiceTable;
