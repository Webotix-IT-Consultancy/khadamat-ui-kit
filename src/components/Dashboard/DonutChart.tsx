import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { formatPercent } from './chartFormat';

export interface DonutSlice {
    key: string;
    label: React.ReactNode;
    /**
     * What the slice is drawn from, 0-100. Pass the SERVER's share where it publishes one:
     * recomputing from amounts can leave rounded slices adding to 99.99.
     */
    percentage: number;
    /** The figure printed under the label in the legend — formatted by the caller. */
    valueLabel: React.ReactNode;
    /** A data colour, not a token: a series keeps its hue across every chart on the screen. */
    color: string;
}

interface DonutChartProps {
    slices: DonutSlice[];
    /** Small caption in the hole — "Total AED". */
    centerLabel?: React.ReactNode;
    /** The headline in the hole — the formatted total. */
    centerValue?: React.ReactNode;
    /** How a share prints in the legend chip. Defaults to one decimal. */
    formatShare?: (percentage: number) => string;
    /**
     * Makes every slice AND its legend row a control: clicking either calls this with the
     * slice's `key` (a dashboard drilling into the filtered list). Omit it and the chart is
     * read-only, exactly as before. The legend row becomes a real `<button>`, so the drill-down
     * is reachable by keyboard; the ring's click is the pointer shortcut to the same thing.
     */
    onSelect?: (key: string) => void;
}

/** The ring an all-zero set draws, so an empty period keeps the panel's shape. */
const EMPTY_RING = [{ key: '__empty', percentage: 1, color: 'hsl(var(--border))' }];

/**
 * A doughnut with its legend beside it (stacked under it on a narrow screen).
 *
 * Every slice stays in the LEGEND even at zero, so the legend does not jump when a period has no
 * data for one series; only the ring drops zero slices, which recharts would otherwise draw as a
 * hairline. The caller formats, translates and colours every slice — nothing is resolved here.
 */
const DonutChart: React.FC<DonutChartProps> = ({ slices, centerLabel, centerValue, formatShare = formatPercent, onSelect }) => {
    const hasData = slices.some((s) => s.percentage > 0);
    const ring = hasData ? slices.filter((s) => s.percentage > 0) : EMPTY_RING;

    return (
        <div className="flex flex-col items-center gap-6 sm:flex-row">
            <div className="relative h-52 w-52 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={ring}
                            dataKey="percentage"
                            nameKey="key"
                            innerRadius="68%"
                            outerRadius="100%"
                            paddingAngle={hasData ? 1 : 0}
                            stroke="none"
                            isAnimationActive={false}
                        >
                            {ring.map((slice) => (
                                <Cell
                                    key={slice.key}
                                    fill={slice.color}
                                    // The empty ring is a placeholder, not a slice — nothing to open.
                                    onClick={onSelect && hasData ? () => onSelect(slice.key) : undefined}
                                    style={onSelect && hasData ? { cursor: 'pointer', outline: 'none' } : undefined}
                                />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                {(centerLabel || centerValue) && (
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                        {centerLabel && <span className="text-xs text-foreground/50">{centerLabel}</span>}
                        {centerValue && (
                            <span className="max-w-[8rem] break-words text-base font-semibold text-foreground">{centerValue}</span>
                        )}
                    </div>
                )}
            </div>

            <ul className="w-full min-w-0 flex-1 divide-y divide-border">
                {slices.map((slice) => {
                    const content = (
                        <>
                            <div className="flex min-w-0 items-center gap-2">
                                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: slice.color }} />
                                <div className="min-w-0">
                                    <p className="truncate text-xs text-foreground/70">{slice.label}</p>
                                    <p className="text-sm font-semibold text-foreground">{slice.valueLabel}</p>
                                </div>
                            </div>
                            <span className="shrink-0 rounded-full border-2 border-primary bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                                {formatShare(slice.percentage)}
                            </span>
                        </>
                    );
                    return (
                        <li key={slice.key}>
                            {onSelect ? (
                                <button
                                    type="button"
                                    onClick={() => onSelect(slice.key)}
                                    className="flex w-full items-center justify-between gap-3 rounded-lg px-1 py-2 text-start hover:bg-[hsl(var(--primary-light))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                                >
                                    {content}
                                </button>
                            ) : (
                                <div className="flex items-center justify-between gap-3 py-2">{content}</div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default DonutChart;
