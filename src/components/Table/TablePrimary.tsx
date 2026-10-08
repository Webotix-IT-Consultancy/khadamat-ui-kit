import React, { useMemo, useState } from 'react';
import {
    Checkbox,
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
    useMediaQuery,
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
     * Pins the FIRST column to the leading edge while the table scrolls horizontally —
     * the mirror of `stickyLastColumn`, and subject to the same test: it is the column's
     * JOB that decides, not the module.
     *
     * It exists for the `selection` tick column. A selectable list is a list with a bulk
     * action, which means the scheduler ticks rows, scrolls right to read a column they are
     * deciding on, and has to scroll back to tick the next one — the same defect KP1-I50
     * fixed at the other edge, where the row actions were.
     *
     * **Do not set it on a table whose first column is data.** A pinned SL No. or Account
     * Name floats over the row on scroll and buys nothing; only a CONTROL earns the edge.
     */
    stickyFirstColumn?: boolean;
    /**
     * A leading checkbox column — opt-in, and absent unless this prop is passed.
     *
     * Off by default because a tick column is only meaningful where the screen has a BULK
     * action to spend the selection on; every other list in both portals passes nothing and
     * is unchanged.
     *
     * It cannot be expressed as a `ColumnDefinition`: `label` is a `string`, and the header
     * cell of this column is itself a control (select-all / clear-all).
     *
     * **The ids are the caller's own `rowKey`s**, so the parent compares like with like and
     * this component never has to know which field identifies a row.
     */
    selection?: {
        /** Row keys currently ticked. */
        selectedIds: Array<string | number>;
        /** One row toggled. */
        onToggleRow: (id: string | number) => void;
        /**
         * The header box. `next` is what it is asking for: true = tick every row ON THIS
         * PAGE, false = clear them. Whether that means "all pages" is the caller's policy,
         * not this component's.
         */
        onToggleAll: (next: boolean) => void;
        /** Accessible names. Required — this portal ships no English defaults here. */
        labels: { selectRow: string; selectAll: string };
    };
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
    /**
     * The read behind `data` is in flight.
     *
     * - **No rows yet** (the first load): skeleton rows in the table's own shape, instead of
     *   a "No records found" that a not-yet-answered request has no right to claim.
     * - **Rows on screen** (a refetch — a search, a tab, a page): the table STAYS MOUNTED
     *   (KP1-I280), its rows dim and a thin bar runs above it, so the page visibly reacts to
     *   the change instead of looking frozen until the new rows replace the old ones.
     *
     * Opt-in: a screen that still renders its own first-load spinner is unaffected.
     */
    loading?: boolean;
    /**
     * Give the table its own scroll area, capped to the viewport, so the header row STAYS
     * VISIBLE while a long list is scrolled. `stickyHeader` was always set, but the wrapper
     * only scrolled sideways — the PAGE scrolled vertically, which a sticky header inside the
     * table cannot follow, so on a 50-row page the column names were gone after ten rows.
     *
     * `true` reserves 260px for what sits around the table (page header, tabs, search row,
     * pagination); pass a CSS length to reserve a different amount. The pinned first / last
     * columns keep working — their header cells already outrank both sticky axes.
     */
    fillViewport?: boolean | string;
    /**
     * Below the `md` breakpoint (768px), render each row as a CARD instead of a table row —
     * a 12-column table scrolled sideways on a phone is barely usable.
     *
     * - `true` builds the card from the columns themselves: the first data column is the
     *   title, the rest are label / value pairs, and — when `stickyLastColumn` marks the last
     *   column as the row's actions — those buttons sit at the card's foot. `slNo` is skipped.
     *   Every `format` is reused, so a status chip or an amount reads the same in both layouts.
     * - A function renders the card yourself, for a screen that deserves a designed one.
     *
     * Pagination, the empty state and `loading` behave identically in both layouts.
     */
    mobileCards?: boolean | ((row: T, index: number) => React.ReactNode);
}

/** Skeleton rows on a first load — enough to read as a table, never a page of them. */
const SKELETON_ROWS = 6;
/** What `fillViewport={true}` reserves for the page around the table. */
const FILL_VIEWPORT_OFFSET = '260px';
/** Columns that are an ordinal, not data — dropped from an auto-built card. */
const ORDINAL_KEYS = new Set(['slNo', 'sl', 'serialNo', 'index']);

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
    stickyFirstColumn = false,
    emptyMessage,
    selection,
    loading = false,
    fillViewport = false,
    mobileCards = false,
}: TablePrimaryProps<T>) => {
    const { t } = useTranslation('common');

    const isNarrow = useMediaQuery('(max-width: 767.98px)', { noSsr: true });
    const asCards = Boolean(mobileCards) && isNarrow;
    const firstLoad = loading && data.length === 0;
    const refetching = loading && data.length > 0;

    /** One cell's content, formatted exactly as the table row renders it. */
    const cellValue = (column: ColumnDefinition<T>, row: T, index: number): React.ReactNode => {
        const raw = row[column.key];
        const content = column.format ? column.format(raw, row, index) : raw;
        return isBlank(content) ? emptyPlaceholder : content;
    };

    /* The auto-built card: title, label/value pairs, then the row's actions. */
    const actionColumn = stickyLastColumn ? columns[columns.length - 1] : undefined;
    const cardColumns = columns.filter(
        (column) => column !== actionColumn && !ORDINAL_KEYS.has(column.key as string),
    );
    const renderCard = (row: T, index: number): React.ReactNode => {
        if (typeof mobileCards === 'function') return mobileCards(row, index);
        const [titleColumn, ...detailColumns] = cardColumns;
        return (
            <>
                {titleColumn && (
                    <div className="table-primary-card-title">{cellValue(titleColumn, row, index)}</div>
                )}
                <dl className="table-primary-card-fields">
                    {detailColumns.map((column) => (
                        <div key={column.key as string} className="table-primary-card-field">
                            <dt>{column.label}</dt>
                            <dd>{cellValue(column, row, index)}</dd>
                        </div>
                    ))}
                </dl>
                {actionColumn && (
                    <div className="table-primary-card-actions">{cellValue(actionColumn, row, index)}</div>
                )}
            </>
        );
    };

    const progressBar = refetching ? (
        // A thin indeterminate bar ABOVE the table: the refetch is visible without the rows
        // being replaced by a spinner (KP1-I280 keeps the table mounted).
        <div className="table-primary-progress" role="progressbar" aria-label={t('messages.loading')} />
    ) : null;

    // Built here, RETURNED below the remaining hooks — an early return above a hook would
    // change the hook order the moment the viewport crosses the breakpoint.
    const cardsView = asCards ? (
        <Box className="table-primary-container">
            {progressBar}
            <ul
                className={`table-primary-cards${refetching ? ' table-primary-busy' : ''}`}
                aria-busy={loading || undefined}
            >
                {firstLoad ? (
                    Array.from({ length: 3 }, (_, i) => (
                        <li key={`skeleton-${i}`} className="table-primary-card" aria-hidden="true">
                            <span className="table-primary-skeleton table-primary-skeleton-title" />
                            <span className="table-primary-skeleton" />
                            <span className="table-primary-skeleton" />
                        </li>
                    ))
                ) : data.length === 0 ? (
                    <li className="table-primary-card table-primary-card-empty">
                        {emptyMessage ?? t('table.noRecords')}
                    </li>
                ) : (
                    data.map((row, index) => (
                        <li key={rowKey(row)} className="table-primary-card">
                            {renderCard(row, index)}
                        </li>
                    ))
                )}
            </ul>
            <Box className="table-primary-pagination-container">
                <Box className="table-primary-pagination-info text-xs!">
                    {t('table.paginationInfo', {
                        count: totalCount,
                        from: totalCount > 0 ? page * rowsPerPage + 1 : 0,
                        to: totalCount > 0 ? Math.min((page + 1) * rowsPerPage, totalCount) : 0,
                    })}
                </Box>
                <Pagination
                    count={Math.ceil(totalCount / rowsPerPage)}
                    page={page + 1}
                    onChange={(event, value) => onPageChange(event, value - 1)}
                    shape="rounded"
                    size="small"
                    className="table-primary-numeric-pagination"
                />
            </Box>
        </Box>
    ) : null;

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

    /*
     * The header box reflects THIS PAGE, not the whole selection.
     *
     * A parent may legitimately hold ticks for rows that are not on screen — page 2, or a
     * row the current filter hides — and a header box driven by the total would then read
     * as "all selected" over a page where nothing is ticked.
     */
    const selectedIdSet = useMemo(
        () => new Set(selection?.selectedIds ?? []),
        [selection?.selectedIds],
    );
    const selectedOnPage = data.filter((row) => selectedIdSet.has(rowKey(row))).length;
    const allOnPageSelected = data.length > 0 && selectedOnPage === data.length;
    const someOnPageSelected = selectedOnPage > 0;

    if (cardsView) return cardsView;

    return (
        <Box className="table-primary-container">
            {progressBar}
            <TableContainer
                component={Paper}
                className="table-primary-wrapper"
                style={
                    fillViewport
                        ? {
                              maxHeight: `calc(100vh - ${
                                  typeof fillViewport === 'string' ? fillViewport : FILL_VIEWPORT_OFFSET
                              })`,
                              overflowY: 'auto',
                          }
                        : undefined
                }
            >
                <Table
                    stickyHeader
                    aria-busy={loading || undefined}
                    className={`transaction-table${stickyLastColumn ? ' table-primary-sticky-last' : ''}${
                        stickyFirstColumn ? ' table-primary-sticky-first' : ''
                    }${refetching ? ' table-primary-busy' : ''}`}
                >
                    <TableHead className="table-primary-head">
                        <TableRow>
                            {selection && (
                                <TableCell
                                    padding="checkbox"
                                    className="table-primary-header-cell table-primary-select-cell"
                                >
                                    {/*
                                      * Indeterminate when SOME of the page is ticked, so the
                                      * box distinguishes "none", "some" and "all" — a plain
                                      * checked/unchecked box claims the whole page is selected
                                      * the moment one row is.
                                      */}
                                    <Checkbox
                                        size="small"
                                        checked={allOnPageSelected}
                                        indeterminate={someOnPageSelected && !allOnPageSelected}
                                        onChange={(event) =>
                                            selection.onToggleAll(event.target.checked)
                                        }
                                        inputProps={{ 'aria-label': selection.labels.selectAll }}
                                        className="table-primary-checkbox"
                                    />
                                </TableCell>
                            )}
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
                        {firstLoad ? (
                            /* Skeleton rows in the table's own column shape — a first load is
                               "not answered yet", which "No records found" would misstate. */
                            Array.from({ length: Math.min(rowsPerPage || SKELETON_ROWS, SKELETON_ROWS) }, (_, i) => (
                                <TableRow key={`skeleton-${i}`} className="table-primary-row" aria-hidden="true">
                                    {selection && <TableCell padding="checkbox" className="table-primary-cell" />}
                                    {columns.map((column) => (
                                        <TableCell key={column.key as string} className="table-primary-cell">
                                            <span className="table-primary-skeleton" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : data.length === 0 ? (
                            <TableRow className="table-primary-row">
                                <TableCell
                                    colSpan={columns.length + (selection ? 1 : 0)}
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
                                {selection && (
                                    <TableCell padding="checkbox" className="table-primary-cell table-primary-select-cell">
                                        <Checkbox
                                            size="small"
                                            checked={selectedIdSet.has(rowKey(row))}
                                            onChange={() => selection.onToggleRow(rowKey(row))}
                                            inputProps={{ 'aria-label': selection.labels.selectRow }}
                                            className="table-primary-checkbox"
                                        />
                                    </TableCell>
                                )}
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
