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
import {
    BIDI_MARK,
    dominantTextDirection,
    stripBidiMarks,
    type TextDirection,
} from '../../utils/bidi';

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

/**
 * KP1-I186 — a clipped cell shows its full value in a hover tooltip.
 *
 * A `maxWidth` column ellipsises whatever will not fit, and for years it did so **silently**:
 * the row showed `Requesting a skip for the north compound ca…` and there was no way to read
 * the rest without opening the record. The ticket was filed against the customer portal's
 * Enquiry list, but nothing about that column is special — every `maxWidth` column in both
 * portals behaved the same way, which is why the fix is here and not on a screen.
 *
 * ## Why it is measured on hover instead of always set
 *
 * A `title` on every clipped-capable cell would also land on `slNo` and on the short codes
 * that never actually overflow, giving a tooltip that just repeats what is already legible.
 * `scrollWidth > clientWidth` is the only honest test of "this is truncated", and it can only
 * be asked of a laid-out element — so it is asked at the moment it matters. The native tooltip
 * is read from the attribute when it pops (after the browser's own hover delay), so setting it
 * in `mouseenter` is in time.
 *
 * It is re-evaluated on every enter rather than cached, so a column that stops overflowing
 * after a resize stops offering a tooltip.
 *
 * ## What it deliberately does NOT touch
 *
 * - **A cell whose content already carries a `title`** — the admin portal's `capped()` formatter
 *   puts one on its own span. Two titles for one value is how they drift apart.
 * - **A `wrap` column.** It is not clipped; the value is all on screen already.
 * - **A cell that fits.** Including the `-` placeholder and every short code — nothing that
 *   fits can overflow, so the measurement excludes them without needing a rule of its own.
 *   This also covers a column whose `maxWidth` the table never had to enforce: `max-width` on
 *   a `<td>` is a hint in an auto-layout table, and where it is not applied there is nothing
 *   hidden and therefore nothing to reveal.
 *
 * `textContent` is used rather than the raw value so a formatted cell tooltips what the user can
 * actually see — and so a cell rendering elements (a chip, the Action buttons) contributes only
 * its readable text, or nothing.
 *
 * **Known limit, and not a reason to revert to a custom popup:** a native `title` is unreachable
 * on touch. It is the mechanism this codebase already standardised on (`capped()`), so it stays
 * the one mechanism; identifiers are exempt from clipping entirely for exactly that reason.
 */
const showTooltipIfClipped = (event: React.MouseEvent<HTMLElement>) => {
    const cell = event.currentTarget;
    // A formatter owns the tooltip for this cell — leave it alone.
    if (cell.querySelector('[title]')) return;

    // The bidi mark is ours, not the value; a tooltip must not carry it. See `plainText`.
    const text = stripBidiMarks(cell.textContent ?? '');
    const clipped = cell.scrollWidth > cell.clientWidth;

    if (clipped && text) cell.title = text;
    else cell.removeAttribute('title');
};

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
    /**
     * KP1-I203 — what a table says when it has no rows.
     *
     * Defaults to `common:table.noRecords` ("No records found" / "لا توجد سجلات"). Pass a node
     * to say something more useful — but say SOMETHING: a table that renders a header and then
     * nothing reads as a screen that failed to load, and the ticket was filed because a search
     * that matched nothing looked exactly like a broken page.
     *
     * The header and the pagination line stay on screen deliberately. When the emptiness is the
     * result of a SEARCH — which is the reported case — the controls that caused it are what the
     * user needs next; replacing the whole table with a panel hides the search box that has to
     * be cleared.
     */
    emptyMessage?: React.ReactNode;
}

/**
 * A cell is blank only when there is genuinely nothing to show. A numeric 0 and a
 * `false` are data — the same trap `DetailField`'s `hideWhenEmpty` avoids.
 */
const isBlank = (value: React.ReactNode) =>
    value === null || value === undefined || (typeof value === 'string' && value.trim() === '');

/**
 * KP1-I195 — a cell that holds WORDS reads in its own direction, not the page's.
 *
 * `text-align: start` (see the CSS) put every value back under its Arabic header, which is
 * most of that ticket. What it cannot fix is a cell whose text is ENGLISH: under the page's
 * `dir="rtl"` that run is still laid out right-to-left, so a `maxWidth` column truncates it
 * at the wrong end — the Arabic Enquiries list showed `…f Skips: 1 | Skip Size: 8 CBM`, the
 * BEGINNING of the sentence hidden behind the ellipsis, which is the "Description values are
 * misaligned" half of the report.
 *
 * `unicode-bidi: plaintext` takes the paragraph direction from the cell's own content, so
 * English reads (and truncates) left-to-right and Arabic reads right-to-left — one rule, both
 * languages, nothing for a call site to opt into. **Which content decides changed with
 * KP1-I200:** plaintext's own answer is the first strong character, which mis-reads a mostly
 * Arabic value that opens with a Latin fragment, so the direction is computed from the
 * dominant script and handed to plaintext as a leading bidi mark. See `readsOwnDirection`.
 *
 * **Why not `dir="auto"`**, which resolves the same way: it also changes the computed
 * `direction`, and `direction` is what `inset-inline-end` pins the sticky Action column by
 * (KP1-I50) and what orders the flex row of row-action buttons. `plaintext` re-bases only the
 * text and leaves `direction` alone, so neither of those moves.
 *
 * Applied to a CONSTRAINED cell whose rendered content is plain text containing a LETTER.
 * Each of those three narrowings is load-bearing:
 *
 * - **Constrained (`maxWidth` / `wrap`) only.** An unclipped run of English is ALREADY laid
 *   out left-to-right inside the RTL row — Latin letters are strong, the bidi algorithm gets
 *   them right, and re-basing the paragraph would change nothing but the alignment. That is
 *   a straight loss: it walks a name out from under its own Arabic header, which is the
 *   complaint this ticket opens with. Only a cell with a width to overflow reads wrong.
 * - **No letter, nothing to decide.** A `-` placeholder, a serial number, `+971 52...`,
 *   `25.13, 55.23` are digits and bidi-NEUTRALS; UAX #9 P3 would default them to LTR and drag
 *   a column of dashes to the far side of its own header for no gain. Their reading order is
 *   already handled where it actually matters, by `dir="ltr"` on the value (KP1-I238).
 * - **JSX is not text.** A status badge, or an actions cell, keeps the row's direction.
 */
/**
 * KP1-I195 / KP1-I200 — the rule itself lives in `utils/bidi`.
 *
 * It has to, because the admin portal's `capped()` formatter clips inside its OWN span and must
 * make the identical decision — and a `format` returning JSX is skipped here by design ("JSX is
 * not text", below). That gap is what KP1-I200 actually was: the table got the rule and the
 * formatter did not, so an Arabic description in the admin Enquiries list still truncated on the
 * right. A shared helper is the only way both surfaces can agree.
 *
 * The three narrowings are still this component's, and each is load-bearing:
 *
 * - **Constrained (`maxWidth` / `wrap`) only.** An unclipped run of English is ALREADY laid
 *   out left-to-right inside the RTL row — Latin letters are strong, the bidi algorithm gets
 *   them right, and re-basing the paragraph would change nothing but the alignment. That is
 *   a straight loss: it walks a name out from under its own Arabic header, which is the
 *   complaint KP1-I195 opens with. Only a cell with a width to overflow reads wrong.
 * - **No letter, nothing to decide** — `dominantTextDirection` returns `null`; see its doc.
 * - **JSX is not text.** A status badge or an actions cell keeps the row's direction. A
 *   formatter that clips text is responsible for its own call to `withTextDirection`.
 */
const readsOwnDirection = (
    content: React.ReactNode,
    constrained: boolean,
): TextDirection | null =>
    constrained && typeof content === 'string' ? dominantTextDirection(content) : null;

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
    emptyMessage,
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
                        {/*
                          * KP1-I203 — an empty table SAYS it is empty.
                          *
                          * `data.map` over an empty array rendered nothing, so a search that
                          * matched no rows left a header above blank space, which reads as a
                          * page that failed rather than a query that found nothing. Reported
                          * against Enquiry and Customer 360; it was every list without a
                          * hand-rolled empty state of its own.
                          *
                          * Its own class, NOT `table-primary-cell`: `stickyLastColumn` pins
                          * `td.table-primary-cell:last-child`, and this cell spans the whole
                          * row — pinning it would float the message over the table on scroll.
                          */}
                        {data.length === 0 ? (
                            <TableRow className="table-primary-row">
                                <TableCell
                                    colSpan={columns.length}
                                    className="table-primary-empty-cell"
                                >
                                    {emptyMessage ?? t('table.noRecords')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((row, index) => (
                            <TableRow
                                hover
                                key={rowKey(row)}
                                className={`table-primary-row ${index % 2 === 1 ? 'table-primary-row-alternate' : ''}`}
                            >
                                {columns.map((column) => {
                                    const raw = row[column.key];
                                    const content = column.format ? column.format(raw, row, index) : raw;
                                    // KP1-I195 — decided on what is actually RENDERED, so the
                                    // `-` placeholder is judged too, not the raw value it stood in for.
                                    const rendered = isBlank(content) ? emptyPlaceholder : content;

                                    /*
                                     * KP1-I195 / KP1-I200 — decided on what is actually
                                     * RENDERED, so the `-` placeholder is judged too, not the
                                     * raw value it stood in for. `null` = keep the row's
                                     * direction; otherwise the value's dominant script wins and
                                     * an invisible mark carries it to `unicode-bidi: plaintext`.
                                     */
                                    const textDirection = readsOwnDirection(
                                        rendered,
                                        Boolean(column.maxWidth || column.wrap)
                                    );
                                    const cellContent = textDirection
                                        ? `${BIDI_MARK[textDirection]}${rendered as string}`
                                        : rendered;

                                    return (
                                        <TableCell
                                            key={column.key as string}
                                            className={`table-primary-cell text-xs! sm:text-sm! lg:text-sm!${
                                                column.wrap ? ' table-primary-cell-wrap' : ''
                                            }${textDirection ? ' table-primary-cell-auto-bidi' : ''}`}
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
                                            /*
                                             * KP1-I186 — the full value on hover, but only where
                                             * the cell actually clips it. A wrapping column shows
                                             * everything already, so it is not a candidate.
                                             * See `showTooltipIfClipped`.
                                             */
                                            onMouseEnter={
                                                column.maxWidth && !column.wrap
                                                    ? showTooltipIfClipped
                                                    : undefined
                                            }
                                        >
                                            {cellContent}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                            ))
                        )}
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
