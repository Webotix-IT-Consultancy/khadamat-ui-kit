import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

export interface DocumentUploadRowProps {
    /** The document's name, shown to the left of the dropzone. */
    label: string;
    /** Adds the red asterisk. Purely presentational — the caller enforces the requirement. */
    required?: boolean;
    /** Small caption inside the dropzone: the formats/size rule, or a slot-specific note. */
    hint?: string;
    /**
     * The dropzone's own caption ("Drag & drop files here or click to browse").
     *
     * A REQUIRED prop, not a default: one portal is bilingual with RTL and the other is
     * English-only, so a string baked in here would be untranslatable on the customer side.
     * ui-kit ships no user-facing copy.
     */
    browseLabel: string;
    /** `accept` for the native input, e.g. `'application/pdf,image/jpeg,image/png'`. */
    accept?: string;
    /** Allow several files per row. On by default: most of these documents run to several pages. */
    multiple?: boolean;
    disabled?: boolean;
    /** Validation message, shown under the row; also turns the dropzone border red. */
    error?: string;
    /**
     * The files the user just picked or dropped, in pick order.
     *
     * **Raw `File` objects, and nothing is validated here.** Type/size rules and their messages
     * are portal-local and translated (`lib/fileRules` in both portals), and a multipart command
     * needs the bytes — a `FileReader` pass in this component would both duplicate the rule and
     * force megabytes of base64 into somebody's state. The caller partitions, reports and stores.
     */
    onSelect: (files: File[]) => void;
    /**
     * Chips or tiles for what the row already holds.
     *
     * A slot rather than a built-in list: rendering a stored file means fetching it through the
     * portal's own authenticated client (`AttachmentChip` -> `lib/files`), which ui-kit has no
     * access to. Each portal passes its own chip and gets view / download / thumbnail behaviour
     * with it.
     */
    children?: React.ReactNode;
    /** Extra content under the label — e.g. a "Download template" link. */
    labelExtra?: React.ReactNode;
    className?: string;
}

/**
 * One document row of an upload set: the label on the left, a compact dropzone and the picked
 * files' chips on the right.
 *
 * Extracted from the admin portal's Cancel Contract popup when the customer portal's cancellation
 * request needed the same rows ("promote on second use"). It is deliberately NOT `FileUpload`:
 * that control is a 147px stacked block, this is the redesign's compact 76px variant with the
 * label beside the dropzone. Same multi-file behaviour, different layout.
 *
 * The component is presentational and stateless apart from the drag highlight — it owns no file
 * list, no validation and no copy, so both portals can drive it from whatever shape their command
 * needs (the admin's data URLs, the customer's raw `File`s for its multipart POST).
 */
const DocumentUploadRow: React.FC<DocumentUploadRowProps> = ({
    label,
    required = false,
    hint,
    browseLabel,
    accept,
    multiple = true,
    disabled = false,
    error,
    onSelect,
    children,
    labelExtra,
    className = '',
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const openPicker = () => {
        if (!disabled) inputRef.current?.click();
    };

    const emit = (list: FileList | null) => {
        const picked = Array.from(list ?? []);
        if (picked.length) onSelect(picked);
    };

    return (
        <div
            className={`grid grid-cols-1 gap-3 rounded-xl bg-gray-50 p-4 sm:grid-cols-[128px_1fr] sm:items-start ${className}`}
        >
            <div className="pt-1">
                <span className="text-sm font-semibold text-foreground">
                    {label}
                    {/* Logical margin, so the asterisk sits after the label in RTL too. */}
                    {required && <span className="ms-0.5 text-red-500">*</span>}
                </span>
                {labelExtra}
            </div>

            <div>
                <div
                    role="button"
                    tabIndex={disabled ? -1 : 0}
                    aria-disabled={disabled || undefined}
                    onClick={openPicker}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            openPicker();
                        }
                    }}
                    onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        if (!disabled) emit(e.dataTransfer.files);
                    }}
                    onDragOver={(e) => {
                        e.preventDefault();
                        if (!disabled) setIsDragging(true);
                    }}
                    onDragLeave={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                    }}
                    className={`flex min-h-[76px] flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed bg-white px-3 py-3 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                    } ${
                        isDragging
                            ? 'border-primary bg-primary-light'
                            : error
                              ? 'border-red-400'
                              : 'border-primary/30'
                    }`}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept={accept}
                        /* Without this the OS picker only ever allows ONE file, whatever the
                           handler then does with the list. */
                        multiple={multiple}
                        disabled={disabled}
                        className="hidden"
                        aria-label={label}
                        onChange={(e) => {
                            emit(e.target.files);
                            // Cleared so re-picking the SAME file still fires a change event.
                            e.target.value = '';
                        }}
                    />
                    <Upload size={18} className="text-primary" />
                    <span className="text-xs font-medium text-foreground">{browseLabel}</span>
                    {hint && <span className="text-[11px] leading-tight text-gray-400">{hint}</span>}
                </div>

                {children && <div className="mt-2 flex flex-wrap gap-2">{children}</div>}

                {error && (
                    <span className="validation-message mt-1 block text-xs text-red-500">{error}</span>
                )}
            </div>
        </div>
    );
};

export default DocumentUploadRow;
