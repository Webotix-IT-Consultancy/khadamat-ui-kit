import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import ValidationMessage from '../../ValidationMessage/ValidationMessage';

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
                    <div className="flex items-center gap-3 w-full justify-center">
                        {value.startsWith('data:image') ? (
                            <img src={value} alt={fileName || 'attachment'} className="h-16 w-16 object-cover rounded-lg" />
                        ) : (
                            <div className="h-16 w-16 rounded-lg bg-primary-light flex items-center justify-center text-primary text-xs font-medium">
                                FILE
                            </div>
                        )}
                        <span className="text-sm text-black truncate max-w-[200px]">{fileName || 'Uploaded file'}</span>
                        <button
                            type="button"
                            onClick={handleRemove}
                            aria-label="Remove file"
                            className="h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                        >
                            <X size={14} />
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
