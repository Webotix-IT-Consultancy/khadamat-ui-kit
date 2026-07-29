import React from 'react';
import { Download, Eye, FileText, Trash2 } from 'lucide-react';

interface FileChipProps {
    /** Shown next to the icon; falls back to a generic label. */
    fileName?: string;
    /**
     * Thumbnail for an image file, in place of the document icon. Must be a URL the browser
     * can load unauthenticated (a `blob:`/`data:` URL) — an API path would render broken.
     */
    previewUrl?: string;
    /** Preview the file. Omit to hide the eye button. */
    onView?: () => void;
    /** Save the file. Omit to hide the download button. */
    onDownload?: () => void;
    /** Clear the file. Omit to hide the bin (view screens pass nothing). */
    onRemove?: () => void;
    /** Disables every action — use while a fetch is in flight. */
    busy?: boolean;
    viewLabel?: string;
    downloadLabel?: string;
    removeLabel?: string;
    className?: string;
}

/**
 * The uploaded-file chip: document tile (or image thumbnail), the file name, and whichever of
 * view / download / remove the caller wires up.
 *
 * **Presentational only** — it never fetches anything. Attachments live behind an authenticated
 * endpoint (`GET /files/{id}/download`), and each portal has its own axios instance, so the
 * portal passes `onView` / `onDownload` that fetch the bytes and hand them to the browser. That
 * keeps one chip for the customer portal, the admin portal, view screens and the uploader alike
 * (`FileUpload` renders this same component).
 */
const FileChip: React.FC<FileChipProps> = ({
    fileName,
    previewUrl,
    onView,
    onDownload,
    onRemove,
    busy = false,
    viewLabel = 'View',
    downloadLabel = 'Download',
    removeLabel = 'Remove',
    className = '',
}) => {
    const name = fileName || 'Uploaded file';
    const tile =
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-10 bg-tertiary-100 text-black transition-colors';
    const actionTile = `${tile} hover:bg-tertiary disabled:opacity-40 disabled:cursor-not-allowed`;

    // The buttons stop propagation so a chip sitting inside a clickable dropzone doesn't also
    // re-open the file picker.
    const handle = (action?: () => void) => (event: React.MouseEvent) => {
        event.stopPropagation();
        action?.();
    };

    return (
        <div className={`inline-flex max-w-full items-center gap-3 rounded-xl bg-primary-light p-2 ${className}`}>
            <span className={tile}>
                {previewUrl ? (
                    <img src={previewUrl} alt={name} className="h-full w-full rounded-10 object-cover" />
                ) : (
                    <FileText size={20} />
                )}
            </span>

            <span className="truncate max-w-[280px] font-semibold text-black">{name}</span>

            {onView && (
                <button
                    type="button"
                    onClick={handle(onView)}
                    disabled={busy}
                    aria-label={`${viewLabel} ${name}`}
                    title={viewLabel}
                    className={actionTile}
                >
                    <Eye size={20} />
                </button>
            )}

            {onDownload && (
                <button
                    type="button"
                    onClick={handle(onDownload)}
                    disabled={busy}
                    aria-label={`${downloadLabel} ${name}`}
                    title={downloadLabel}
                    className={actionTile}
                >
                    <Download size={20} />
                </button>
            )}

            {onRemove && (
                <button
                    type="button"
                    onClick={handle(onRemove)}
                    disabled={busy}
                    aria-label={`${removeLabel} ${name}`}
                    title={removeLabel}
                    className={actionTile}
                >
                    <Trash2 size={20} />
                </button>
            )}
        </div>
    );
};

export default FileChip;
