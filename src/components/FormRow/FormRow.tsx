import React from 'react';

/**
 * Column counts, per breakpoint, as LITERAL class strings.
 *
 * Tailwind scans source text — a dynamic `md:grid-cols-${n}` is never emitted and the row
 * silently collapses to one column. Every class this component can produce is written out here.
 */
const MD: Record<1 | 2 | 3 | 4, string> = {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
};
const LG: Record<1 | 2 | 3 | 4, string> = {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
};
const XL: Record<1 | 2 | 3 | 4, string> = {
    1: 'xl:grid-cols-1',
    2: 'xl:grid-cols-2',
    3: 'xl:grid-cols-3',
    4: 'xl:grid-cols-4',
};
const GAP: Record<4 | 5 | 6, string> = {
    4: 'gap-4',
    5: 'gap-5',
    6: 'gap-6',
};

/**
 * The default ladders — a wide row STEPS UP rather than jumping to its full count (KP1-I217).
 *
 * `md` is 768px and the dashboard shell spends ~306px of it on the sidebar before the section's
 * own padding, so `md:grid-cols-4` hands each field ~137px and `md:grid-cols-3` about 190px: a
 * legal but unusable phone number. Four across only has room from roughly 1400px of content
 * width, which is `xl` once the sidebar is counted. The design's four-across is preserved where
 * the design lives — a wide desktop — and below that the row halves rather than clipping.
 *
 * `from="lg"` is the more conservative ladder the read-only review screens use, where the row
 * stays single-column until `lg`.
 */
const LADDER: Record<'md' | 'lg', Record<2 | 3 | 4, string>> = {
    md: {
        2: 'md:grid-cols-2',
        3: 'md:grid-cols-2 lg:grid-cols-3',
        4: 'md:grid-cols-2 xl:grid-cols-4',
    },
    lg: {
        2: 'lg:grid-cols-2',
        3: 'lg:grid-cols-2 xl:grid-cols-3',
        4: 'lg:grid-cols-2 xl:grid-cols-4',
    },
};

export interface FormRowProps {
    /**
     * How many fields the DESIGN puts on this row. Drives the default ladder above.
     *
     * There is no `cols={1}`: a one-field row is rendered without a grid, so the field keeps
     * its own width instead of being stretched across the row.
     */
    cols: 2 | 3 | 4;
    /** Which breakpoint the row starts splitting at. Default `md`. Ignored when md/lg/xl are given. */
    from?: 'md' | 'lg';
    /**
     * Explicit per-breakpoint column counts, for a row the ladder doesn't suit. Giving ANY of
     * these replaces the ladder entirely, so state every step the row needs — the base is
     * always one column.
     */
    md?: 1 | 2 | 3 | 4;
    lg?: 1 | 2 | 3 | 4;
    xl?: 1 | 2 | 3 | 4;
    /** Gutter between fields. Default 5 (`gap-5`), the form standard. */
    gap?: 4 | 5 | 6;
    /** Extra classes on the row itself, e.g. a top margin. */
    className?: string;
    children: React.ReactNode;
}

/**
 * A single row of form fields.
 *
 * One `grid` per row is the house layout for variable columns (POC Info 3/3/4, General Details
 * 4/2/1): each row declares its own count rather than fields flowing through one long grid, so a
 * row that renders fewer fields than the design shows does not pull the next row's fields up
 * into it.
 *
 * `empty:hidden` keeps a row whose fields are all conditionally absent from leaving a gap.
 *
 * Promoted to ui-kit from the identical `Row` + `COLS` helper that was duplicated in the admin
 * portal's `ContractForm` and `CancellationReviewSections` (which had drifted onto a different
 * ladder — hence `from`).
 *
 * ```tsx
 * import FormRow from '@khadamat/ui-kit/components/FormRow/FormRow';
 *
 * <FormRow cols={3}>…</FormRow>              // 1 → 2 (md) → 3 (lg)
 * <FormRow cols={4} from="lg">…</FormRow>    // 1 → 2 (lg) → 4 (xl)
 * <FormRow cols={3} md={2} lg={3}>…</FormRow>// explicit, ladder ignored
 * ```
 */
const FormRow: React.FC<FormRowProps> = ({
    cols,
    from = 'md',
    md,
    lg,
    xl,
    gap = 5,
    className,
    children,
}) => {
    const explicit = md !== undefined || lg !== undefined || xl !== undefined;
    const columns = explicit
        ? [md && MD[md], lg && LG[lg], xl && XL[xl]].filter(Boolean).join(' ')
        : LADDER[from][cols];

    return (
        <div className={`grid grid-cols-1 ${GAP[gap]} empty:hidden ${columns}${className ? ` ${className}` : ''}`}>
            {children}
        </div>
    );
};

export default FormRow;
