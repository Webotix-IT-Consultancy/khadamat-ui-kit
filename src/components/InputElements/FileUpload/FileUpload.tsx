import React, { useRef, useState } from 'react';
import { Eye, FileText, Trash2, Upload } from 'lucide-react';
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

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('', '');
    };

    const handleView = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (value) openInNewTab(value);
    };

    const tile =
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-10 bg-tertiary-100 text-black transition-colors';
    const actionTile = `${tile} hover:bg-tertiary`;

    return (
        <div className="w-full">
            {label && (
                <div className="flex items-center gap-1 mb-1.5">
                    <label className={`text-sm capitalize ${error ? 'text-destructive' : 'text-black'}`}>{label}</label>
                    {required && <span className="text-destructive text-xs">*</span>}
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
                    /* Uploaded-file chip: tan document tile, file name, then tan
                       eye / trash tiles on a cream pill. The buttons stop
                       propagation so they don't also re-open the file picker
                       through the dropzone's onClick. */
                    <div className="inline-flex max-w-full items-center gap-3 rounded-xl bg-primary-light p-2">
                        <span className={tile}>
                            <FileText size={20} />
                        </span>

                        <span className="truncate font-semibold text-black">{fileName || 'Uploaded file'}</span>

                        <button
                            type="button"
                            onClick={handleView}
                            aria-label={`View ${fileName || 'file'}`}
                            className={actionTile}
                        >
                            <Eye size={20} />
                        </button>
                        <button
                            type="button"
                            onClick={handleRemove}
                            aria-label={`Remove ${fileName || 'file'}`}
                            className={actionTile}
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
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
