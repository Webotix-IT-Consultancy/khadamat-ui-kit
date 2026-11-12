import React from 'react';

export interface BarSegment {
    key: string;
    label: React.ReactNode;
    /** Sizes the segment within its row. Negative values are drawn as zero. */
    value: number;
    /** Printed inside the segment, under its label — formatted by the caller. */
    valueLabel?: React.ReactNode;
    color: string;
}

export interface SegmentedBarRow {
    key: string;
    label: React.ReactNode;
    /**
     * What the row's bar LENGTH is scaled by, against the largest row. Pass the sum the segments
     * actually make up — a figure that includes something no segment draws makes the bar look
     * wrong for its number.
     */
    total: number;
    /** Printed at the end of the bar — formatted by the caller. */
    totalLabel: React.ReactNode;
    segments: BarSegment[];
    /** A muted line under the bar — e.g. "Waste collection 4.39M · Skip rental 637k". */
    caption?: React.ReactNode;
}

interface SegmentedBarListProps {
    rows: SegmentedBarRow[];
    /** Layout only. */
    className?: string;
}

/** Shortest a non-zero row is drawn, as a % of the widest, so a tiny figure stays visible. */
const MIN_ROW_WIDTH = 8;

/** Narrowest a segment is drawn, so its label stays readable; past that the row wraps. */
const MIN_SEGMENT_WIDTH = '6.5rem';

/**
 * A list of horizontal bars, one per row, each split into labelled segments — what a total is
 * made of (revenue streams per contract type, jobs per status per area…).
 *
 * Bar length compares the ROWS (scaled to the largest `total`); segment width shows the split
 * WITHIN a row. Chrome-free — wrap it in a `DashboardPanel`.
 *
 * Built from flex boxes rather than an SVG chart: the segments carry text, and flex lays out in
 * the page's own direction, so it mirrors under `dir="rtl"` with nothing to configure.
 */
const SegmentedBarList: React.FC<SegmentedBarListProps> = ({ rows, className = '' }) => {
    const widest = Math.max(0, ...rows.map((row) => row.total));

    return (
        <div className={`space-y-6 ${className}`}>
            {rows.map((row) => {
                const width = widest > 0 && row.total > 0 ? Math.max(MIN_ROW_WIDTH, (row.total / widest) * 100) : 0;
                return (
                    <div key={row.key} className="grid grid-cols-1 gap-2 md:grid-cols-[10rem_1fr_6rem] md:items-center">
                        <p className="text-sm font-medium text-foreground">{row.label}</p>

                        <div className="min-w-0">
                            {/* Wraps, so a segment too small for its share never clips its label —
                                the name is the point of the segment; the proportion is approximate
                                at the low end anyway. */}
                            <div
                                className="flex flex-wrap gap-3"
                                style={{ width: `${width}%`, minWidth: width > 0 ? `min(100%, ${MIN_SEGMENT_WIDTH})` : undefined }}
                            >
                                {row.segments.map((segment) => (
                                    <div
                                        key={segment.key}
                                        className="rounded-lg px-3 py-2 text-white"
                                        style={{
                                            flexGrow: Math.max(segment.value, 0) || 0.0001,
                                            flexBasis: 0,
                                            minWidth: MIN_SEGMENT_WIDTH,
                                            backgroundColor: segment.color,
                                        }}
                                        title={typeof segment.label === 'string' ? segment.label : undefined}
                                    >
                                        <p className="break-words text-xs font-medium leading-tight">{segment.label}</p>
                                        {segment.valueLabel != null && <p className="text-[11px] opacity-90">{segment.valueLabel}</p>}
                                    </div>
                                ))}
                            </div>
                            {row.caption && <p className="mt-1 text-xs text-grey-600">{row.caption}</p>}
                        </div>

                        <p className="text-sm font-semibold text-foreground md:text-end">{row.totalLabel}</p>
                    </div>
                );
            })}
        </div>
    );
};

export default SegmentedBarList;
