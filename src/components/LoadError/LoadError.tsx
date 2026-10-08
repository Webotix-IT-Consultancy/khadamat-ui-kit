import React from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react';
import InlineAlert from '../InlineAlert/InlineAlert';
import Button from '../Button/Button';

/**
 * "This could not be loaded" — with a way to try again. The answer to the SILENT failure.
 *
 * About 160 catch blocks across the two portals did nothing but `console.error` when a read
 * failed. The screen then rendered the empty state it would show for no data at all: a list
 * read "No records found", a detail page read "Not found". A network blip, a 500 or an expired
 * permission was indistinguishable from an empty table, and the user had no reason to retry.
 *
 * ```tsx
 * const { rows, error, reload } = useThings();
 * <LoadError error={error} onRetry={reload} />      // renders nothing while error is null
 * <TablePrimary … />
 * ```
 *
 * - **Renders nothing without an error**, so it needs no `&&` guard at the call site.
 * - **The server's own sentence first** (`error.title` on the portals' `ApiError`), then the
 *   generic one — the same order every toast in both portals uses.
 * - Built on `InlineAlert tone="danger"` so its look and ARIA role are the house alert's; the
 *   Retry button sits inside it, next to the sentence it answers.
 * - A FAILED read only. A 404 on a detail page is not a failure — it is "Not found", and the
 *   page says so (see `isNotFoundError`).
 */
export interface LoadErrorProps {
    error: unknown;
    onRetry?: () => void;
    /** Layout only (margins/width) — never colour; see InlineAlert. */
    className?: string;
}

/** The sentence for a failed read: the API's own, else the shared generic. */
export const loadErrorMessage = (error: unknown, fallback: string): string => {
    const title = (error as any)?.title;
    return typeof title === 'string' && title.trim() ? title : fallback;
};

/**
 * True when a detail read failed because the record does not exist (or is not yours —
 * this API answers 404 for both). Anything else is a FAILURE and must not be shown as
 * "Not found", or a dropped connection tells the user their record has disappeared.
 */
export const isNotFoundError = (error: unknown): boolean => (error as any)?.status === 404;

const LoadError: React.FC<LoadErrorProps> = ({ error, onRetry, className = '' }) => {
    const { t } = useTranslation('common');
    if (!error) return null;

    return (
        <InlineAlert tone="danger" className={className}>
            <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span>{loadErrorMessage(error, t('messages.loadFailed'))}</span>
                {onRetry && (
                    <Button variant="outline-dark" className="ms-auto" size="small" onClick={onRetry}>
                        <RefreshCw size={14} aria-hidden="true" />
                        {t('buttons.retry')}
                    </Button>
                )}
            </span>
        </InlineAlert>
    );
};

export default LoadError;
