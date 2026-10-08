import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Download, Eye, Loader2 } from 'lucide-react';
import CollapsibleSection from '../CollapsibleSection/CollapsibleSection';

/** One linked document — a contract, quotation or invoice raised for an account. */
export interface RelatedRecordItem {
    id: string;
    /** The document's own reference (`KUATDG-CGW-00085-26`, `KHD/SI/2026/000001`). */
    reference: string;
    /** Already formatted by the caller (`16 Jul 2026` / `16 يوليو 2026`). */
    date?: string;
    /** Prose — a waste type, a source document. */
    description?: string;
    /** Already formatted by the caller (`formatAed`). */
    amount?: string;
    /** A rendered label or chip — pass the module's own `StatusBadge`, translated by the caller. */
    status?: React.ReactNode;
    /** Opens the record. Without it the row is plain text. */
    onOpen?: () => void;
    /**
     * View + Download buttons for a row that IS a document (a Tax Invoice). Each spins while its
     * own fetch is in flight, and both are disabled until it lands.
     */
    documentActions?: RelatedDocumentActions;
}

export interface RelatedDocumentActions {
    onView: () => void;
    onDownload: () => void;
    viewing?: boolean;
    downloading?: boolean;
}

export interface RelatedRecordSection {
    key: string;
    title: string;
    records: RelatedRecordItem[];
    /** Overrides `common:table.noRecords` for this section. */
    emptyMessage?: string;
}

interface RelatedRecordsProps {
    sections: RelatedRecordSection[];
    loading?: boolean;
    /** Open every section on first render. Default: collapsed, so a long account reads as an index. */
    defaultOpen?: boolean;
    className?: string;
}

const iconButton =
    'flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors hover:bg-primary/20 disabled:opacity-60 cursor-pointer';

const DocumentButtons: React.FC<{ reference: string; actions: RelatedDocumentActions }> = ({ reference, actions }) => {
    const { t } = useTranslation('common');
    const busy = Boolean(actions.viewing || actions.downloading);
    const viewLabel = t('documents.viewInvoice', { number: reference });
    const downloadLabel = t('documents.downloadInvoice', { number: reference });
    return (
        <span className="flex items-center gap-2">
            <button type="button" className={iconButton} disabled={busy} aria-label={viewLabel} title={viewLabel} onClick={actions.onView}>
                {actions.viewing ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
            </button>
            <button type="button" className={iconButton} disabled={busy} aria-label={downloadLabel} title={downloadLabel} onClick={actions.onDownload}>
                {actions.downloading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Download size={16} aria-hidden="true" />}
            </button>
        </span>
    );
};

const Row: React.FC<{ record: RelatedRecordItem }> = ({ record }) => {
    const body = (
        <>
            <span className="min-w-0 flex-1">
                {/* A reference is an identifier: never truncated, LTR on an Arabic page. */}
                <span className="block font-semibold text-foreground break-all" dir="ltr">
                    {record.reference}
                </span>
                {(record.date || record.description) && (
                    <span className="block text-xs text-grey-600">
                        {[record.date, record.description].filter(Boolean).join(' · ')}
                    </span>
                )}
            </span>
            {record.amount && (
                <span className="text-sm font-semibold text-foreground" dir="ltr">
                    {record.amount}
                </span>
            )}
            {record.status && <span className="text-sm">{record.status}</span>}
            {record.onOpen && !record.documentActions && (
                <ChevronRight size={18} className="shrink-0 text-muted-foreground rtl:rotate-180" aria-hidden="true" />
            )}
        </>
    );

    const rowClass =
        'flex w-full flex-wrap items-center gap-x-4 gap-y-1 rounded-md border border-[hsl(var(--border))] bg-background px-4 py-3 text-start';

    /* A row with its own buttons is a plain container: a <button> cannot hold buttons. */
    if (record.documentActions) {
        return (
            <div className={rowClass}>
                {body}
                <DocumentButtons reference={record.reference} actions={record.documentActions} />
            </div>
        );
    }

    return record.onOpen ? (
        <button
            type="button"
            onClick={record.onOpen}
            className={`${rowClass} cursor-pointer transition-colors hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary/50`}
        >
            {body}
        </button>
    ) : (
        <div className={rowClass}>{body}</div>
    );
};

/**
 * The documents linked to an account — Contracts, Quotations, Invoices — as one accordion
 * section each. Used by the admin Customer 360 view and the customer portal's My Profile, so
 * both portals draw the same thing.
 *
 * Built on `CollapsibleSection`, the section chrome every view screen already uses. Every
 * section is ALWAYS rendered, with its count in the title and "No records found" inside when
 * empty: a missing section cannot be told apart from a failed load.
 *
 * **The caller resolves, the component renders** — as with Track and `InvoiceSummaryPanel`:
 * titles, dates, amounts and status labels arrive translated and formatted, because the admin
 * portal is English-only and the customer portal is bilingual.
 */
const RelatedRecords: React.FC<RelatedRecordsProps> = ({ sections, loading, defaultOpen = false, className = '' }) => {
    const { t } = useTranslation('common');

    return (
        <div className={`space-y-3 ${className}`}>
            {sections.map((section) => (
                <CollapsibleSection
                    key={section.key}
                    title={loading ? section.title : `${section.title} (${section.records.length})`}
                    defaultOpen={defaultOpen}
                >
                    {loading ? (
                        <p className="text-sm text-muted-foreground">{t('messages.loading')}</p>
                    ) : section.records.length ? (
                        <div className="space-y-2">
                            {section.records.map((record) => (
                                <Row key={record.id} record={record} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            {section.emptyMessage || t('table.noRecords')}
                        </p>
                    )}
                </CollapsibleSection>
            ))}
        </div>
    );
};

export default RelatedRecords;
