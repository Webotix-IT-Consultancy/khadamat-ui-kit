/**
 * A simple two-column document PDF — a titled sheet of label/value rows under optional
 * section headings, used wherever a portal has to RENDER a document the API does not serve.
 *
 * Promoted here on its second use (workspace CLAUDE.md — "promote on second use"): it was
 * written for the admin portal's contract / quotation sheets and the Delivery Note, and the
 * customer portal's Delivery Note needs exactly the same thing. A second copy would be two
 * documents that drift apart while claiming to be one.
 *
 * It is deliberately NOT a fallback for a server-rendered document. Where the API does render
 * one — the tax invoice, the bank receipt — that blob is what the screen shows; a local
 * look-alike has no document number, no ledger VAT, and hides server failures behind a
 * confident-looking sheet.
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PdfRow {
    label: string;
    value: string;
}

export interface PdfSection {
    heading: string;
    rows: PdfRow[];
}

export interface DocumentPdfInput {
    /** Big title line, e.g. "Contract" or "Proforma Invoice". */
    title: string;
    /** Reference/no. shown under the title, e.g. the contract/quotation number. */
    reference?: string;
    /** Header meta rows (account, dates) rendered before the sections. */
    meta?: PdfRow[];
    sections: PdfSection[];
    /** Optional gold charges summary rendered last. */
    charges?: PdfSection;
    /** File name without extension. */
    fileName: string;
}

// Admin gold, matching the portal's --primary token (hsl(41 53% 52%)) as RGB.
const GOLD: [number, number, number] = [193, 154, 74];
const DARK: [number, number, number] = [51, 51, 51];

const labelValueTable = (doc: jsPDF, rows: PdfRow[], startY: number): number => {
    autoTable(doc, {
        body: rows.map((r) => [r.label, r.value]),
        startY,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 1.5 },
        columnStyles: {
            0: { cellWidth: 70, textColor: [110, 110, 110] },
            1: { textColor: DARK, fontStyle: 'bold' },
        },
        margin: { left: 14, right: 14 },
    });
    // jspdf-autotable stashes the ending Y on the doc instance.
    return (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
};

/**
 * Build a simple, self-contained PDF for a Contract or Quotation — used by both the
 * Download action and the Proforma Invoice action (FRD §5.4: the Proforma is a non-posted
 * PDF of all charges that can be emailed or downloaded).
 *
 * Deliberately dependency-light (jsPDF + autotable, already in the portal) — no signature
 * overlay or company-logo stamping, which are Admin-Settings concerns out of this scope.
 *
 * Returns the document rather than writing it, so the same page can be SAVED or OPENED —
 * `downloadDocumentPdf` and `openDocumentPdf` below. KP1-I269 needed the second: the
 * Proforma is now viewed on click, and re-deriving the layout for a viewer would be two
 * copies of this to keep in step.
 */
const buildDocumentPdf = (input: DocumentPdfInput): jsPDF => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(18);
    doc.setTextColor(...DARK);
    doc.text(input.title, 14, 20);

    if (input.reference) {
        doc.setFontSize(11);
        doc.setTextColor(120, 120, 120);
        doc.text(input.reference, 14, 27);
    }

    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.8);
    doc.line(14, 31, pageWidth - 14, 31);

    let y = 37;
    if (input.meta && input.meta.length) {
        y = labelValueTable(doc, input.meta, y) + 4;
    }

    input.sections.forEach((section) => {
        if (!section.rows.length) return;
        doc.setFontSize(12);
        doc.setTextColor(...DARK);
        doc.text(section.heading, 14, y + 4);
        y = labelValueTable(doc, section.rows, y + 7) + 4;
    });

    if (input.charges && input.charges.rows.length) {
        doc.setFillColor(...GOLD);
        doc.rect(14, y + 2, pageWidth - 28, 8, 'F');
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.text(input.charges.heading, 18, y + 7.5);
        autoTable(doc, {
            body: input.charges.rows.map((r) => [r.label, r.value]),
            startY: y + 12,
            theme: 'plain',
            styles: { fontSize: 10, cellPadding: 1.5 },
            columnStyles: {
                0: { cellWidth: 90, textColor: [110, 110, 110] },
                1: { textColor: DARK, fontStyle: 'bold' },
            },
            margin: { left: 14, right: 14 },
        });
    }

    return doc;
};

/** Build the document and save it to disk as `<fileName>.pdf`. */
export const downloadDocumentPdf = (input: DocumentPdfInput): void => {
    buildDocumentPdf(input).save(`${input.fileName}.pdf`);
};

/**
 * KP1-I269: build the document and OPEN it in a new tab for viewing, instead of saving it.
 *
 * `bloburl` rather than jsPDF's own `doc.output('dataurlnewwindow')`: that helper writes an
 * `<iframe src="data:application/pdf…">` into a blank window, which Chrome refuses to render
 * for top-level data: URLs, so the tab comes up empty. A blob: URL is a real resource the
 * built-in viewer will display.
 *
 * The tab is opened FIRST and then pointed at the blob, so the `window.open` happens inside
 * the click's user gesture and is not treated as a pop-up — the same shape `lib/files.ts`
 * uses for stored files. It is not revoked on a timer: the object URL belongs to this
 * document and dies with the page, and revoking it early blanks a tab the user is reading.
 *
 * Returns false when the browser blocked the window, so the caller can say so.
 */
export const openDocumentPdf = (input: DocumentPdfInput): boolean => {
    const tab = window.open('', '_blank');
    if (tab) tab.opener = null;

    const url = buildDocumentPdf(input).output('bloburl') as unknown as string;
    if (tab) {
        tab.location.href = url;
        return true;
    }
    return !!window.open(url, '_blank', 'noopener');
};
