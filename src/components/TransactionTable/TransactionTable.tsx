import React, { useState, useMemo } from 'react';
import {
  Box,
} from '@mui/material';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import TablePrimary, { ColumnDefinition } from '../Table/TablePrimary';
import TableActionMenu from '../Table/TableActionMenu';
import StatusBadge from '../StatusBadge/StatusBadge';
import { ExportType } from '../../utils/exportTable';
import ActionButton from '../Shared/ActionButton';
import { useTranslation } from 'react-i18next';
// import './TransactionTable.css';

interface Transaction {
  id: string;
  slNo?: number;
  dateTime: string;
  transactionId: string;
  description: string;
  serviceName: string;
  type: string;
  recharge: number;
  paid: string;
  balance: number;
  paymentMode: string;
}

export type Order = 'asc' | 'desc';

interface TransactionTableProps {
  transactions: Transaction[];
  onFilterClick?: () => void;
  // Managed state from parent
  page: number;
  rowsPerPage: number;
  totalCount: number;
  order: Order;
  orderBy: keyof Transaction;
  searchQuery: string;
  loading?: boolean;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRows: number) => void;
  onSortChange: (property: keyof Transaction, order: Order) => void;
  onSearchChange: (query: string) => void;
  onExport?: (type: ExportType) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
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
  const { t } = useTranslation(['transactions', 'common']);

  const handleRequestSort = (property: keyof Transaction) => {
    const isAsc = orderBy === property && order === 'asc';
    const newOrder = isAsc ? 'desc' : 'asc';
    onSortChange(property, newOrder);
  };

  const handleMuiPageChange = (event: unknown, newPage: number) => {
    onPageChange(newPage);
  };


  const handleExportToExcel = (type: ExportType) => {
    if (onExport) {
      onExport(type);
      return;
    }

    // Fallback for local data export
    const dataToExport = transactions.map((t_row, index) => ({
      [t('common:table.slNo')]: (page * rowsPerPage) + index + 1,
      [t('common:table.dateTime')]: t_row.dateTime,
      [t('common:table.description')]: t_row.description,
      [t('common:table.serviceName')]: t_row.serviceName,
      [t('common:table.type')]: t_row.type,
      [t('common:table.rechargeAmount')]: t_row.recharge,
      [t('common:table.paid')]: t_row.paid,
      [t('common:table.balance')]: t_row.balance,
      [t('common:table.paymentMode')]: t_row.paymentMode,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, t('transactions:export.sheetName'));
    XLSX.writeFile(workbook, `${t('transactions:export.filename')}.xlsx`);
  };

  const columns: ColumnDefinition<Transaction>[] = [
    {
      key: 'slNo',
      label: t('common:table.slNo'),
      sortable: true,
      format: (_, __, index) => (page * rowsPerPage) + (index ?? 0) + 1
    },
    { key: 'dateTime', label: t('common:table.dateTime'), sortable: true },
    { key: 'transactionId', label: t('common:table.transactionId'), sortable: true },
    {
      key: 'description',
      label: t('common:table.description'),
      sortable: true,
      maxWidth: '200px'
    },
    { key: 'serviceName', label: t('common:table.serviceName'), sortable: true },
    { key: 'type', label: t('common:table.type'), sortable: true },
    {
      key: 'recharge',
      label: t('common:table.rechargeAmount'),
      sortable: true,
      format: (val: number) => val.toFixed(2)
    },
    {
      key: 'paid', label: t('common:table.paid'),
      sortable: true,
      format: (val: string) => (
        <StatusBadge variant="light" status={val?.toLowerCase() === "paid" ? "paid" : "pending"} label={val} />
      )
    },
    {
      key: 'balance',
      label: t('common:table.balance'),
      sortable: true,
      format: (val: number) => `${t('common:currency')} ${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    { key: 'paymentMode', label: t('common:table.paymentMode'), sortable: true }
  ];

  return (
    <Box className="transaction-table-container table-container">
      <Box className="transaction-controls-row table-controls-row">


        <TableActionMenu
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={onRowsPerPageChange}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onFilterClick={onFilterClick}
          onExport={handleExportToExcel}
          showExport={true}
        />
      </Box>

      <TablePrimary
        columns={columns}
        data={transactions}
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

export default TransactionTable;
