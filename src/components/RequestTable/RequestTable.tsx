import React from 'react';
import {
    Box,
} from '@mui/material';
import TablePrimary, { ColumnDefinition } from '../Table/TablePrimary';
import TableActionMenu from '../Table/TableActionMenu';
import StatusBadge from '../StatusBadge/StatusBadge';
import { OnCallRequest } from '../../services/onCallRequests.service';
import { useNavigate } from 'react-router-dom';
import { ExportType } from '../../utils/exportTable';
import { Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type Order = 'asc' | 'desc';

interface RequestTableProps {
    requests: OnCallRequest[];
    onFilterClick?: () => void;
    // Managed state from parent
    page: number;
    rowsPerPage: number;
    totalCount: number;
    order: Order;
    orderBy: keyof OnCallRequest;
    searchQuery: string;
    loading?: boolean;
    onPageChange: (newPage: number) => void;
    onRowsPerPageChange: (newRows: number) => void;
    onSortChange: (property: keyof OnCallRequest, order: Order) => void;
    onSearchChange: (query: string) => void;
    onExport?: (type: ExportType) => void;
}

const RequestTable: React.FC<RequestTableProps> = ({
    requests,
    onFilterClick,
    page,
    rowsPerPage,
    totalCount,
    order,
    orderBy,
    searchQuery,
    // loading = false,
    onPageChange,
    onRowsPerPageChange,
    onSortChange,
    onSearchChange,
    onExport
}) => {
    const { t } = useTranslation(['onCallService', 'common']);
    const navigate = useNavigate();

    const handleRequestSort = (property: keyof OnCallRequest) => {
        const isAsc = orderBy === property && order === 'asc';
        const newOrder = isAsc ? 'desc' : 'asc';
        onSortChange(property, newOrder);
    };

    const handleMuiPageChange = (event: unknown, newPage: number) => {
        onPageChange(newPage);
    };


    const columns: ColumnDefinition<OnCallRequest>[] = [
        {
            key: 'id',
            label: t('common:table.slNo'),
            sortable: false,
            format: (_, __, index) => (page * rowsPerPage) + (index ?? 0) + 1
        },
        { key: 'requestNumber', label: t('common:table.requestId'), sortable: true },
        { key: 'contract', label: t('onCallService:table.contract'), sortable: true },
        { key: 'plotNo', label: t('onCallService:table.plotNo'), sortable: true },
        { key: 'contactName', label: t('onCallService:table.contactName'), sortable: true },
        { key: 'preferredDate', label: t('onCallService:table.preferredDate'), sortable: true },
        { key: 'preferredTime', label: t('onCallService:table.preferredTime'), sortable: true },
        { key: 'numberOfCollections', label: t('onCallService:table.numberOfCollections'), sortable: true },
        {
            key: 'status', label: t('common:table.status'),
            sortable: true,
            format: (val: string) => (
                <StatusBadge
                    variant="light"
                    status={val.toLowerCase() === "completed" ? "completed" : (val.toLowerCase() === "in-progress" ? "in-progress" : "pending")}
                    label={val}
                />
            )
        },
        {
            key: 'id',
            label: t('common:table.action'),
            sortable: false,
            format: (_, row) => (
                <Eye
                    size={20}
                    className="action-icon view-icon mx-auto"
                    onClick={() => navigate(`/dashboard/on-call-requests/${row.id}`)}
                />

            )
        }
    ];

    return (
        <Box className="on-call-service-request-table-container table-container">
            <Box className="on-call-service-request-controls-row table-controls-row">
                <TableActionMenu
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={onRowsPerPageChange}
                    searchQuery={searchQuery}
                    onSearchChange={onSearchChange}
                    onFilterClick={onFilterClick}
                    onExport={onExport}
                    showExport={!!onExport}
                />
            </Box>

            <TablePrimary
                columns={columns}
                data={requests}
                order={order}
                orderBy={orderBy}
                onSort={handleRequestSort}
                page={page}
                rowsPerPage={rowsPerPage}
                totalCount={totalCount}
                onPageChange={handleMuiPageChange}
                rowKey={(row) => row.id || row.requestNumber}
            />
        </Box>
    );
};

export default RequestTable;
