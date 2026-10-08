import React from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Eye, Loader2 } from 'lucide-react';
import { formatAed } from '../../utils/money';
import type { DocumentInvoice, InvoiceSummary } from '../../utils/invoiceSummary';
import SummaryPanel, { type SummaryRow } from '../SummaryPanel/SummaryPanel';

/** A receipt line — still the record's own field, until receipts get a summary of their own. */
export interface ReceiptLine {
    receiptNo: string;
    /** Absent for a receipt that is only a stored file — it renders as `--`. */
    amount?: number;
    /** Present when the receipt is a stored file the row can open. */
    fileId?: number | string;
}

export interface InvoiceSummaryPanelProps {
    /** `invoiceSummary` off the detail read — its `invoices` are what the panel lists. */
    summary?: InvoiceSummary;
    receipts?: ReceiptLine[];
    /**
     * Dates arrive formatted BY THE CALLER, as on the Track timeline: admin is English-only
     * (`formatDisplayDate`), the customer portal is bilingual (`useDisplayDate`). A component
     * that formatted them would have to know which portal it is in.
     */
    formatDate: (value?: string) => string;
    /** The document being fetched — an invoice id, or `'pack'` — so only that row spins. */
    busyKey?: string | null;
    onViewInvoice: (invoice: DocumentInvoice) => void;
    onDownloadInvoice: (invoice: DocumentInvoice) => void;
    /** The whole pack (`summary.documentUrl`); offered when there is more than one invoice. */
    onDownloadAll?: () => void;
    /** A receipt row's click, when the receipt carries a file. */
    onOpenReceipt?: (receipt: ReceiptLine) => void;
    /** Forwarded to `SummaryPanel` — the customer portal draws it on `--primary-light`. */
    userType?: 'customer' | 'admin';
}

/** Whether the panel has anything to show — callers use it to lay out the bottom row. */
export const hasInvoiceLedger = (summary?: InvoiceSummary, receipts?: ReceiptLine[]): boolean =>
    Boolean(summary?.invoices.length || receipts?.length);

/** The key a row spins on — the invoice id, else its number. */
export const invoiceKey = (invoice: DocumentInvoice): string =>
    invoice.invoiceId ?? invoice.invoiceNumber ?? '';

/**
 * The **Tax Invoices** a contract or quotation raised — the panel at the bottom of a detail
 * screen, beside its Charges. One component, both portals.
 *
 * **It is drawn with `SummaryPanel`**, the same card as Charges beside it — no look of its own.
 * Each invoice is a row (number + date/status on the left, amount + view/download on the right),
 * "Download all" sits in the panel's `actions` slot, and Receipts are a second `SummaryPanel`.
 * A hand-rolled ledger card here is how the bottom row came to show two different panels.
 *
 * It appears from **Awaiting Payment** on — exactly when the Proforma Invoice button goes —
 * listing `invoiceSummary.invoices`: two for a General contract (the charges and the
 * attestation, each posting to its own Sales Account), one for a quotation.
 *
 * - **Every row opens its own PDF**, view or download; "Download all" is the contract's pack.
 * - **Nothing invented.** No invoices and no receipts = no panel.
 * - **It renders, the caller fetches.** Requests need the portal's own axios instance, so the
 *   actions and `busyKey` come in as props.
 */
const InvoiceSummaryPanel: React.FC<InvoiceSummaryPanelProps> = ({
    summary,
    receipts,
    formatDate,
    busyKey,
    onViewInvoice,
    onDownloadInvoice,
    onDownloadAll,
    onOpenReceipt,
    userType = 'admin',
}) => {
    const { t } = useTranslation('common');
    const invoices = summary?.invoices ?? [];

    if (!hasInvoiceLedger(summary, receipts)) return null;

    const iconTint =
        userType === 'customer'
            ? 'bg-foreground/10 hover:bg-foreground/20'
            : 'bg-primary-foreground/15 hover:bg-primary-foreground/30';
    const iconButton = `flex h-8 w-8 items-center justify-center rounded-md ${iconTint} transition-colors disabled:opacity-60 cursor-pointer`;

    const downloadAll =
        onDownloadAll && summary?.documentUrl && invoices.length > 1 ? (
            <button
                type="button"
                className="flex items-center gap-1.5 text-sm font-semibold underline-offset-2 hover:underline disabled:opacity-60 cursor-pointer"
                disabled={busyKey === 'pack'}
                onClick={onDownloadAll}
            >
                {busyKey === 'pack' ? (
                    <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                ) : (
                    <Download size={16} aria-hidden="true" />
                )}
                {t('documents.downloadAll')}
            </button>
        ) : undefined;

    const invoiceRows: SummaryRow[] = invoices.map((invoice) => {
        const number = invoice.invoiceNumber ?? t('documents.noInvoiceNumber');
        const key = invoiceKey(invoice);
        const busy = busyKey === key;
        const meta = [formatDate(invoice.invoiceDate), invoice.statusName].filter(Boolean).join(' · ');
        return {
            key,
            label: (
                <>
                    {/* An invoice number is an identifier: LTR in an Arabic page. */}
                    <span className="block font-semibold break-all" dir="ltr">{number}</span>
                    {meta && <span className="block text-xs opacity-90">{meta}</span>}
                </>
            ),
            value: (
                <span className="flex items-center gap-2">
                    <span className="font-bold" dir="ltr">{formatAed(invoice.totalNet)}</span>
                    {invoice.documentUrl && (
                        <>
                            <button
                                type="button"
                                className={iconButton}
                                disabled={busy}
                                aria-label={t('documents.viewInvoice', { number })}
                                title={t('documents.viewInvoice', { number })}
                                onClick={() => onViewInvoice(invoice)}
                            >
                                {busy ? (
                                    <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                                ) : (
                                    <Eye size={16} aria-hidden="true" />
                                )}
                            </button>
                            <button
                                type="button"
                                className={iconButton}
                                disabled={busy}
                                aria-label={t('documents.downloadInvoice', { number })}
                                title={t('documents.downloadInvoice', { number })}
                                onClick={() => onDownloadInvoice(invoice)}
                            >
                                <Download size={16} aria-hidden="true" />
                            </button>
                        </>
                    )}
                </span>
            ),
        };
    });

    const receiptRows: SummaryRow[] = (receipts ?? []).map((receipt) => ({
        key: String(receipt.fileId ?? receipt.receiptNo),
        label:
            onOpenReceipt && receipt.fileId != null ? (
                <button
                    type="button"
                    className="font-semibold underline-offset-2 hover:underline cursor-pointer"
                    onClick={() => onOpenReceipt(receipt)}
                >
                    {receipt.receiptNo}
                </button>
            ) : (
                <span className="font-semibold">{receipt.receiptNo}</span>
            ),
        value: <span className="font-bold" dir="ltr">{formatAed(receipt.amount)}</span>,
    }));

    return (
        <div className="space-y-4">
            {invoiceRows.length > 0 && (
                <SummaryPanel title={t('documents.taxInvoices')} actions={downloadAll} rows={invoiceRows} userType={userType} />
            )}
            {receiptRows.length > 0 && (
                <SummaryPanel title={t('documents.receipts')} rows={receiptRows} userType={userType} />
            )}
        </div>
    );
};

export default InvoiceSummaryPanel;
