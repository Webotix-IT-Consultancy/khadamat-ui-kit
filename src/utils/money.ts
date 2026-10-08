/**
 * Money is written ONE way in both portals: thousand separators and exactly two decimals —
 * `12,500.00`, `AED 12,500.00`.
 *
 * Why it is one function and not a habit: amounts were formatted at least six different
 * ways side by side — `toFixed(2)` with no separators (`AED 12500.00`), `toLocaleString()`
 * with no fixed decimals (`AED 12,500.5`), `toLocaleString(undefined, …)` which follows the
 * BROWSER's locale (a German Windows renders `12.500,00`), and four private `formatAmount`
 * copies in the admin portal that each disagreed about what a missing value shows.
 *
 * - **Digits are Western in both languages**, by explicit `en-US`, never `undefined`. A
 *   figure must read the same on every machine; the surrounding words are what translate.
 *   (The customer portal's Invoice / Receipt tables deliberately render Arabic-Indic digits
 *   in Arabic through their own call — that is a per-screen choice, not this helper's.)
 * - **Display only.** A value bound to an `<input>` stays a plain `toFixed(2)` string: a
 *   separator in a number box is not a number the browser will parse back.
 * - **Absent is not zero.** `null`, `undefined`, `''` and anything non-numeric render as
 *   `empty` (default `--`, the tables' placeholder). A caller that genuinely means "zero
 *   when missing" says so with `value ?? 0`.
 */

const MONEY = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

export interface MoneyFormatOptions {
    /** What an absent or non-numeric value renders as. Default `--`. */
    empty?: string;
}

const toFiniteNumber = (value: unknown): number | null => {
    if (value === null || value === undefined || value === '') return null;
    const n = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(n) ? n : null;
};

/** `12500` -> `12,500.00`. */
export const formatMoney = (value: unknown, { empty = '--' }: MoneyFormatOptions = {}): string => {
    const n = toFiniteNumber(value);
    return n === null ? empty : MONEY.format(n);
};

/** `12500` -> `AED 12,500.00`. */
export const formatAed = (value: unknown, options: MoneyFormatOptions = {}): string => {
    const n = toFiniteNumber(value);
    return n === null ? options.empty ?? '--' : `AED ${MONEY.format(n)}`;
};

/** `-250` -> `- AED 250.00`, `250` -> `+ AED 250.00` — a ledger movement with its direction. */
export const formatSignedAed = (value: unknown, options: MoneyFormatOptions = {}): string => {
    const n = toFiniteNumber(value);
    if (n === null) return options.empty ?? '--';
    return `${n < 0 ? '-' : '+'} AED ${MONEY.format(Math.abs(n))}`;
};
