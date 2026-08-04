import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import FileChip from '../../FileChip/FileChip';
import '../FormField.css';
import ValidationMessage from '../../ValidationMessage/ValidationMessage';

/**
 * Opens an uploaded file in a new tab.
 *
 * Files picked here are held as `data:` URLs (FileReader), and Chrome refuses
 * top-level navigation to `data:` URLs — so they're converted to a blob URL
 * first. Remote URLs are opened directly.
 */
const openInNewTab = (url: string) => {
    if (!url || url === '#') return;

    if (!url.startsWith('data:')) {
        window.open(url, '_blank', 'noopener');
        return;
    }

    try {
        const [meta, base64] = url.split(',');
        const mime = /data:([^;]+)/.exec(meta)?.[1] || 'application/octet-stream';
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);

        const blobUrl = URL.createObjectURL(new Blob([bytes], { type: mime }));
        window.open(blobUrl, '_blank', 'noopener');
        // Released on a delay so the new tab has time to load it first.
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch (error) {
        console.error('Could not open attachment:', error);
    }
};

interface FileUploadProps {
    label?: string;
    required?: boolean;
    accept?: string;
    maxSizeMB?: number;
    value?: string;
    fileName?: string;
    onChange: (dataUrl: string, fileName: string) => void;
    onError?: (message: string) => void;
    error?: string;
    helperText?: string;
    /**
     * Takes over the eye button. Needed when the stored file must be fetched through an
     * authenticated API call rather than opened from `value` — a URL pointing at a protected
     * endpoint has no Authorization header when the browser navigates to it, so the tab 401s.
     * Without this prop the built-in `value`-opening behaviour is kept.
     */
    onView?: () => void;
    /** Adds a download button next to the eye. Same reasoning as `onView`. */
    onDownload?: () => void;
    /**
     * Thumbnail for the uploaded file, shown in place of the document icon. Must be loadable
     * without auth (`blob:` / `data:`) — the control cannot fetch one itself, so the caller
     * resolves it (in the admin portal: `useFileObjectUrl` from `@/lib/files`).
     */
    previewUrl?: string;
    /** Disables the chip's actions while the caller is fetching the file. */
    busy?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
    label,
    required = false,
    accept = 'image/jpeg,image/png,application/pdf',
    maxSizeMB = 10,
    value,
    fileName,
    onChange,
    onError,
    error,
    helperText,
    onView,
    onDownload,
    previewUrl,
    busy = false,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const acceptedTypes = accept.split(',').map((type) => type.trim());

    const processFile = (file: File) => {
        if (!acceptedTypes.includes(file.type)) {
            onError?.('Unsupported file format');
            return;
        }

        if (file.size > maxSizeMB * 1024 * 1024) {
            onError?.(`File size must be less than ${maxSizeMB} MB`);
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            onChange(reader.result as string, file.name);
        };
        reader.readAsDataURL(file);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
        e.target.value = '';
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    // FileChip stops propagation for all three, so these are plain callbacks.
    const handleRemove = () => onChange('', '');

    const handleView = () => {
        if (onView) {
            onView();
            return;
        }
        if (value) openInNewTab(value);
    };

    const handleDownload = () => onDownload?.();

    // Shared form shell (KP1-I107/I108) — this hand-rolled its label with a 6px gap and a
    // 12px asterisk where every other control uses 4px and 14px.
    return (
        <div className="input-field">
            {label && (
                <div className="input-label">
                    <label className={error ? 'label-error' : ''}>{label}</label>
                    {required && <span className="required-mark">*</span>}
                </div>
            )}
            <div
                onClick={() => inputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`w-full min-h-[147px] rounded-10 border-2 border-dashed flex flex-col items-center justify-center gap-2 px-4 py-4 cursor-pointer transition-colors bg-white ${
                    isDragging ? 'border-primary bg-primary-light' : error ? 'border-destructive' : 'border-primary-300'
                }`}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    className="hidden"
                    onChange={handleInputChange}
                    aria-label={label || 'Upload file'}
                />
                {value ? (
                    /* The same chip the view screens render, so an uploaded document looks and
                       behaves identically whether you are reading the record or editing it.
                       Its buttons stop propagation, so they don't also re-open the file picker
                       through the dropzone's onClick. */
                    <FileChip
                        fileName={fileName}
                        previewUrl={previewUrl}
                        onView={handleView}
                        onDownload={onDownload ? handleDownload : undefined}
                        onRemove={handleRemove}
                        busy={busy}
                    />
                ) : (
                    <>
                        <Upload className="text-primary" size={24} />
                        <p className="text-base text-black text-center">
                            Drag &amp; drop files here or click to browse
                        </p>
                        <p className="text-[11px] text-grey-200 text-center">
                            {helperText || 'Supported formats: PDF, JPG, PNG (Max 10 MB)'}
                        </p>
                    </>
                )}
            </div>
            <ValidationMessage error={error} />
        </div>
    );
};

export default FileUpload;
