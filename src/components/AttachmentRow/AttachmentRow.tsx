import React from 'react';
import { Download, Eye, CheckCircle2, AlertCircle } from 'lucide-react';

interface AttachmentRowProps {
    label: string;
    /** Marks the document mandatory (asterisk + red missing icon). */
    mandatory?: boolean;
    /** Whether the document has been uploaded. */
    present: boolean;
    /** Show a view (eye) button — opens/previews the document. */
    onView?: () => void;
    onDownload?: () => void;
    /** Uploader control (e.g. FileUpload) shown when the doc is missing and editing is allowed. */
    uploader?: React.ReactNode;
    downloadLabel?: string;
    viewLabel?: string;
    /** Hide the leading present/missing status icon. */
    hideStatusIcon?: boolean;
    /** Render the view/download buttons even when the document is absent. */
    alwaysShowActions?: boolean;
    /** Override the row surface (default a translucent white pill). */
    rowClassName?: string;
    /** Colour classes for the action buttons; shape/padding are always applied. */
    actionClassName?: string;
    className?: string;
}

/**
 * A document row for the Attachments panel on view / detail screens: an optional present/missing
 * status icon, the label with an optional mandatory asterisk, view (eye) and/or download buttons,
 * and an optional uploader slot when missing. The row surface and button colours are themeable so
 * it can sit on a light card or a solid-gold panel.
 */
const AttachmentRow: React.FC<AttachmentRowProps> = ({
    label,
    mandatory = false,
    present,
    onView,
    onDownload,
    uploader,
    downloadLabel = 'Download',
    viewLabel = 'View',
    hideStatusIcon = false,
    alwaysShowActions = false,
    rowClassName,
    actionClassName,
    className = '',
}) => {
    const showActions = present || alwaysShowActions;
    const actionBase = 'flex items-center justify-center rounded-lg p-2 transition-colors';
    const actionColours = actionClassName ?? 'text-gray-600 hover:bg-black/5 hover:text-black';

    return (
        <div
            className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 ${rowClassName ?? 'bg-white/90'} ${className}`}
        >
            <div className="flex min-w-0 items-center gap-2">
                {!hideStatusIcon &&
                    (present ? (
                        <CheckCircle2 size={16} className="shrink-0 text-green-600" />
                    ) : (
                        <AlertCircle size={16} className={`shrink-0 ${mandatory ? 'text-red-500' : 'text-gray-400'}`} />
                    ))}
                <span className="truncate text-sm font-medium text-foreground">
                    {label}
                    {mandatory && <span className="ms-1 text-red-500">*</span>}
                </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
                {showActions && onView && (
                    <button
                        type="button"
                        onClick={onView}
                        title={viewLabel}
                        aria-label={viewLabel}
                        className={`${actionBase} ${actionColours}`}
                    >
                        <Eye size={18} />
                    </button>
                )}
                {showActions && onDownload && (
                    <button
                        type="button"
                        onClick={onDownload}
                        title={downloadLabel}
                        aria-label={downloadLabel}
                        className={`${actionBase} ${actionColours}`}
                    >
                        <Download size={18} />
                    </button>
                )}
                {!showActions && uploader}
            </div>
        </div>
    );
};

export default AttachmentRow;
