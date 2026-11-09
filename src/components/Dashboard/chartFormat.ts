/**
 * Axis-tick shorthand for dashboard charts: `800k`, `1.2M`, `-50k`.
 *
 * A TICK label, not a displayed amount — the full figure belongs in the tooltip or the legend,
 * through `utils/money`. Sign-safe, because a period's net figure can be negative (a month whose
 * only movement was a refund). Western digits in both languages, like `utils/money`.
 */
export const compactNumber = (value: number): string => {
    const n = Number(value);
    if (!Number.isFinite(n)) return '0';
    const abs = Math.abs(n);
    const sign = n < 0 ? '-' : '';
    if (abs >= 1_000_000) return `${sign}${Number((abs / 1_000_000).toFixed(1))}M`;
    if (abs >= 1_000) return `${sign}${Number((abs / 1_000).toFixed(1))}k`;
    return `${sign}${Math.round(abs)}`;
};

/** `12.4%` — one decimal. The value is a share the SERVER computed; this only prints it. */
export const formatPercent = (value: number, decimals = 1): string => `${Number(value || 0).toFixed(decimals)}%`;
