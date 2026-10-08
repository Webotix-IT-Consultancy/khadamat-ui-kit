/**
 * A contract's or quotation's invoices, as the detail read publishes them — `invoiceSummary`
 * (`DocumentInvoiceSummaryDto`) on `ContractDto` and `QuotationDto`, served to staff
 * (`/contracts/{id}`) and to the customer (`/contracts/my/{id}`) alike.
 *
 * ## The one rule it encodes: Proforma BEFORE Awaiting Payment, Tax Invoice FROM it
 *
 * | stage | the server publishes | the screen shows |
 * |---|---|---|
 * | before Awaiting Payment | `isProformaAvailable: true`, a `proformaDocumentUrl` | the **Proforma Invoice** button |
 * | Awaiting Payment onward | `hasInvoice: true`, `invoices[]`, a `documentUrl` | the **Tax Invoices** panel |
 *
 * **The server decides which applies, from the record's status** — swagger: "the caller cannot
 * choose", and from Awaiting Payment the proforma route answers **409
 * `Invoice.ProformaNotAvailable`**. So the button follows `isProformaAvailable`, never a status
 * literal; a record with nothing to bill (a C&D Open contract) is `false` before Awaiting
 * Payment too, which no status rule could know.
 *
 * Pure — no request is made here. Fetching a document needs the PORTAL's own axios instance
 * (its token, its refresh), so each portal keeps a `fetchDocumentPdf` beside its `api.ts`.
 */

/** One Tax Invoice the record raised at Awaiting Payment (`DocumentInvoiceDto`). */
export interface DocumentInvoice {
    /** What `GET /invoices/{id}` takes. */
    invoiceId?: string;
    /** `KHD/SI/yyyy/nnnnnn`. */
    invoiceNumber?: string;
    /** The Focus ERP number, once posted. */
    erpDocumentNumber?: string;
    invoiceTitle?: string;
    invoiceDate?: string;
    /** The amount payable, VAT included. */
    totalNet?: number;
    /** The payment status — Unpaid / Partially Paid / Paid — or a return status. */
    statusName?: string;
    paymentStatusCode?: string;
    /** The route that returns THIS invoice's PDF — `/api/v1/invoices/{id}/document`. */
    documentUrl?: string;
}

export interface InvoiceSummary {
    /** `Proforma` before Awaiting Payment, `Tax` from then on. */
    invoiceType?: string;
    /** The gate for the Proforma Invoice button. Always false from Awaiting Payment on. */
    isProformaAvailable: boolean;
    /** Why no proforma is offered, when it is not — the server's own sentence. */
    proformaUnavailableReason?: string;
    proformaDocumentUrl?: string;
    /** Whether a Tax Invoice has been raised. */
    hasInvoice: boolean;
    /**
     * The whole record's Tax Invoice as ONE PDF — for a contract, the charges and the
     * attestation invoice together (a pack: it has no number and cannot be paid against).
     */
    documentUrl?: string;
    /** The Tax Invoices, in number order. Empty before Awaiting Payment. */
    invoices: DocumentInvoice[];
}

const str = (value: unknown): string | undefined =>
    typeof value === 'string' && value.trim() ? value : undefined;

const toDocumentInvoice = (dto: any): DocumentInvoice => ({
    invoiceId: str(dto?.invoiceId),
    invoiceNumber: str(dto?.invoiceNumber),
    erpDocumentNumber: str(dto?.erpDocumentNumber),
    invoiceTitle: str(dto?.invoiceTitle),
    invoiceDate: str(dto?.invoiceDate),
    totalNet: dto?.totalNet != null ? Number(dto.totalNet) : undefined,
    statusName: str(dto?.statusName) ?? str(dto?.paymentStatusName),
    paymentStatusCode: str(dto?.paymentStatusCode),
    documentUrl: str(dto?.documentUrl),
});

/** `invoiceSummary` → the domain shape; `undefined` when the response carries none. */
export const toInvoiceSummary = (dto: any): InvoiceSummary | undefined => {
    if (!dto || typeof dto !== 'object') return undefined;
    return {
        invoiceType: str(dto.invoiceType),
        isProformaAvailable: Boolean(dto.isProformaAvailable),
        proformaUnavailableReason: str(dto.proformaUnavailableReason),
        proformaDocumentUrl: str(dto.proformaDocumentUrl),
        hasInvoice: Boolean(dto.hasInvoice),
        documentUrl: str(dto.documentUrl),
        invoices: Array.isArray(dto.invoices)
            // A Proforma row is never a stored invoice; if one ever appears in this list it must
            // not be offered as a Tax Invoice to settle.
            ? dto.invoices.map(toDocumentInvoice).filter((row: DocumentInvoice) => row.invoiceId)
            : [],
    };
};

/**
 * Whether the Proforma Invoice button applies — the SERVER's flag when the response carries
 * one; the status rule only for a response that predates `invoiceSummary`. That fallback covers
 * Awaiting Payment AND beyond (Awaiting Signature, Live, Completed), where the endpoint refuses.
 */
export const proformaApplies = (
    summary: InvoiceSummary | undefined,
    statusAtOrAfterAwaitingPayment: boolean,
): boolean => (summary ? summary.isProformaAvailable : !statusAtOrAfterAwaitingPayment);

/**
 * A server document route → the path for a portal axios instance whose base already ends in
 * `/api/v1`: the routes come back absolute from the API root, so the prefix is stripped rather
 * than doubled.
 */
export const documentPath = (route: string): string => route.replace(/^\/?api\/v1(?=\/)/i, '');

/** A file name from a document number: `KHD/SI/2026/000021` → `KHD-SI-2026-000021.pdf`. */
export const pdfName = (label: string | undefined, fallback: string): string =>
    `${(label || fallback).replace(/[\\/:*?"<>|\s]+/g, '-')}.pdf`;
