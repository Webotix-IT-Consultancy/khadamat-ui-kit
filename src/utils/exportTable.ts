import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export type ExportType = 'excel' | 'pdf' | 'csv';

export interface ExportColumn {
    header: string;
    key: string; // Key in the data object
    format?: (value: any) => string; // Optional formatter
}

interface ExportTableOptions {
    data: any[];
    columns: ExportColumn[];
    fileName: string;
    exportType: ExportType;
    sheetName?: string; // For Excel
    title?: string; // For PDF
}

/**
 * Reusable helper function to export table data.
 */
export const exportTable = ({
    data,
    columns,
    fileName,
    exportType,
    sheetName = 'Sheet1',
    title = 'Report'
}: ExportTableOptions) => {

    if (exportType === 'excel' || exportType === 'csv') {
        const formattedData = data.map(item => {
            const row: Record<string, any> = {};
            columns.forEach(col => {
                const value = item[col.key];
                row[col.header] = col.format ? col.format(value) : value;
            });
            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        const finalFileName = fileName.endsWith(`.${exportType === 'excel' ? 'xlsx' : 'csv'}`)
            ? fileName
            : `${fileName}.${exportType === 'excel' ? 'xlsx' : 'csv'}`;

        XLSX.writeFile(workbook, finalFileName);
    }
    else if (exportType === 'pdf') {
        // For PDF using jspdf and jspdf-autotable
        const doc = new jsPDF();

        const headers = columns.map(col => col.header);
        const rows = data.map(item => {
            return columns.map(col => {
                const value = item[col.key];
                return col.format ? col.format(value) : (value != null ? String(value) : '');
            });
        });

        if (title) {
            doc.text(title, 14, 20); // Simple title
        }

        autoTable(doc, {
            head: [headers],
            body: rows,
            startY: title ? 25 : 10,
        });

        const finalFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
        doc.save(finalFileName);
    }
};
