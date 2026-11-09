import React, { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import DashboardPanel from './DashboardPanel';
import { compactNumber } from './chartFormat';

export interface BarSeries {
    key: string;
    label: string;
    /** A data colour — keep it the same as this series' slice in any doughnut on the screen. */
    color: string;
}

export interface BarCategory {
    key: string;
    /** The x-axis label (a month, a week, an area) — already translated / formatted. */
    label: string;
    /** One value per `BarSeries.key`. A missing key draws no bar for that series. */
    values: Record<string, number>;
}

interface GroupedBarChartProps {
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    categories: BarCategory[];
    series: BarSeries[];
    /**
     * Show a tick box per series so the user can hide some. Off = every series is always drawn
     * and no legend controls render.
     */
    toggleable?: boolean;
    /** Series ticked on first paint. Defaults to all of them. Ignored unless `toggleable`. */
    defaultVisibleKeys?: string[];
    /** The tooltip's figure — pass `formatAed` for money. */
    formatValue?: (value: number) => string;
    /** Y-axis ticks. Defaults to `compactNumber` (`800k`). */
    formatAxis?: (value: number) => string;
    /** Chart area height in px. */
    height?: number;
    /**
     * Mirror the chart for an RTL page: categories run right-to-left and the value axis moves to
     * the right edge. recharts lays out in SVG coordinates and does not read `dir`, so the
     * customer portal passes this in Arabic.
     */
    rtl?: boolean;
    /**
     * Makes each bar a control: called with the bar's category key and series key (a dashboard
     * drilling into the filtered list). Omit it and the bars are read-only, as before.
     */
    onBarClick?: (categoryKey: string, seriesKey: string) => void;
    /** Layout only. */
    className?: string;
}

/**
 * Grouped (side-by-side) bars: several series per category, e.g. revenue per contract type per
 * month. Rendered INSIDE its own `DashboardPanel`, because its series toggles sit in the panel's
 * heading — the caller supplies the title and subtitle.
 *
 * - The value axis is not clamped at zero: a negative category value (a month that only had a
 *   refund) draws below the zero line, which is marked.
 * - Every series stays in the toggle row even when all its values are zero, so the controls do
 *   not move between periods.
 * - The caller translates and formats every label and passes the colours; nothing is resolved
 *   here, so the same component serves both portals.
 */
const GroupedBarChart: React.FC<GroupedBarChartProps> = ({
    title,
    subtitle,
    categories,
    series,
    toggleable = false,
    defaultVisibleKeys,
    formatValue = (value) => String(value),
    formatAxis = compactNumber,
    height = 288,
    rtl = false,
    onBarClick,
    className,
}) => {
    const [visible, setVisible] = useState<string[] | null>(defaultVisibleKeys ?? null);
    /** `null` = never touched and no default given: everything shows, including series added later. */
    const isVisible = (key: string) => !toggleable || visible === null || visible.includes(key);

    const toggle = (key: string) =>
        setVisible((prev) => {
            const current = prev ?? series.map((s) => s.key);
            return current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
        });

    const data = useMemo(
        () => categories.map((category) => ({ __label: category.label, __key: category.key, ...category.values })),
        [categories],
    );

    const toggles = toggleable
        ? series.map((s) => {
              const on = isVisible(s.key);
              return (
                  <label
                      key={s.key}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm text-foreground ${
                          on ? 'border-primary' : 'border-border'
                      }`}
                  >
                      <span className="h-3 w-3 rounded" style={{ backgroundColor: s.color }} aria-hidden="true" />
                      <input
                          type="checkbox"
                          className="accent-[hsl(var(--primary))]"
                          checked={on}
                          onChange={() => toggle(s.key)}
                      />
                      {s.label}
                  </label>
              );
          })
        : undefined;

    return (
        <DashboardPanel title={title} subtitle={subtitle} actions={toggles} className={className}>
            <div className="w-full" style={{ height }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={4}>
                        <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="__label" tickLine={false} axisLine={false} reversed={rtl} />
                        <YAxis
                            tickFormatter={formatAxis}
                            tickLine={false}
                            axisLine={false}
                            width={48}
                            orientation={rtl ? 'right' : 'left'}
                        />
                        <ReferenceLine y={0} stroke="hsl(var(--border))" />
                        <Tooltip
                            formatter={(value: number) => formatValue(value)}
                            cursor={{ fill: 'hsl(var(--primary-light))' }}
                        />
                        {series.filter((s) => isVisible(s.key)).map((s) => (
                            <Bar
                                key={s.key}
                                dataKey={s.key}
                                name={s.label}
                                fill={s.color}
                                radius={[3, 3, 0, 0]}
                                maxBarSize={22}
                                onClick={
                                    onBarClick
                                        ? (entry: { payload?: { __key?: string } }) => {
                                              const categoryKey = entry?.payload?.__key;
                                              if (categoryKey != null) onBarClick(categoryKey, s.key);
                                          }
                                        : undefined
                                }
                                cursor={onBarClick ? 'pointer' : undefined}
                            />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </DashboardPanel>
    );
};

export default GroupedBarChart;
