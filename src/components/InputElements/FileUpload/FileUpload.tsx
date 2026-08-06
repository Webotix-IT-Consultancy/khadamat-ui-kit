import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
    /** Single-file selection. Optional only because `multiple` callers use `onFilesChange`. */
    onChange?: (dataUrl: string, fileName: string) => void;
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
    /**
     * Whether the chip offers a remove (×) button.
     *
     * Default `true` — every existing caller keeps its delete button. Set `false` where the
     * document is not the user's to DELETE but is still theirs to REPLACE: the customer
     * portal's profile documents (TRN, Trade Licence, Emirates ID) are compliance records, so
     * a customer may upload a newer one but must not be able to leave the slot empty.
     * Replacing still works, because that goes through `onChange` (pick/drop), not remove.
     *
     * Applies to both the single-file and `multiple` chips, so the prop means the same thing
     * whichever mode the control is in.
     */
    allowRemove?: boolean;
    /**
     * KP1-I122: accept several files from one pick or one drop.
     *
     * **Every upload slot in both portals now sets this** — the document slots (TRN, Trade
     * Licence, Emirates ID, the signed contract/quotation document, the cancellation
     * documents) were converted from one-document-per-slot to lists, which is why
     * `onViewFile` / `onDownloadFile` and the stored-file fields on `UploadedFile` exist.
     * The API always allowed it: `Files` / `FileCategoryIds` are parallel arrays on every
     * multipart command, so several files under one category was never the constraint.
     *
     * It stays off by DEFAULT regardless, because the flag also decides the shape the control
     * reports (`onChange` vs `onFilesChange`) — flipping the default would silently break any
     * caller still on the single-file contract. The one remaining single-file upload is the
     * admin User form's profile image, which is an avatar and does not use this control.
     */
    multiple?: boolean;
    /**
     * Multi-file counterpart to `onChange`, required when `multiple` is set. Reports the
     * WHOLE current selection, not the delta, so the caller's state is a straight assignment
     * — the control owns no list of its own.
     */
    onFilesChange?: (files: UploadedFile[]) => void;
    /**
     * The current selection when `multiple` is set. Same contract as `value`/`fileName` for
     * the single-file case: the caller owns it, the control only renders it.
     */
    files?: UploadedFile[];
    /**
     * Takes over the eye button on EVERY chip in `multiple` mode — the list counterpart of
     * `onView`, and needed for exactly the same reason.
     *
     * Without it a chip can only open its own `dataUrl`, which a freshly-picked file has and
     * an already-STORED one does not: stored documents live behind `GET /files/{id}/download`
     * and have to be fetched with the portal's bearer token. That was fine while `multiple`
     * only ever held new picks, but the document slots (TRN, Trade Licence, Emirates ID) show
     * previously-saved files in the same list, and those chips would have had a dead eye
     * button. When this is absent the built-in `dataUrl` behaviour is kept, and a file with
     * neither a handler nor a `dataUrl` simply shows no eye button rather than a broken one.
     */
    onViewFile?: (file: UploadedFile, index: number) => void;
    /** Adds a download button to every chip in `multiple` mode. Same reasoning as `onViewFile`. */
    onDownloadFile?: (file: UploadedFile, index: number) => void;
}

/** One picked file, in the shape the callers already keep in form state. */
export interface UploadedFile {
    /**
     * `data:` URL of a file picked in this session. **Empty for an already-stored file** —
     * those are identified by `id` and fetched through the portal's authenticated files API,
     * so there are no bytes in the browser to hold here. Every consumer that turns a selection
     * back into `File` objects already goes through a `dataUrlToFile` helper that returns null
     * for anything that is not a `data:` URL, so a stored entry is skipped rather than
     * re-uploaded — which is what an additive PUT needs.
     */
    dataUrl: string;
    name: string;
    /** Stored-file id, when this entry is a document the API already holds. */
    id?: number | string;
    /**
     * Thumbnail for a stored image, resolved by the caller (`blob:`/`data:` — the control
     * cannot fetch one itself). An image `dataUrl` is used when this is absent, so a freshly
     * picked photo still previews with nothing extra passed.
     */
    previewUrl?: string;
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
    allowRemove = true,
    multiple = false,
    onFilesChange,
    files,
    onViewFile,
    onDownloadFile,
}) => {
    /**
     * KP1-I161 — this component's own copy was four English string literals, so the Arabic
     * profile view showed an English dropzone and English rejection messages. Every OTHER
     * string on that screen comes from the portal, which is why only the upload area was
     * left behind.
     *
     * Resolved from the shared `common` namespace, which both portals load, with the English
     * text passed as i18next's `defaultValue` rather than relying on the key existing: a
     * missing key in this package fails silently as visible raw text, and a dropzone reading
     * `common:fileUpload.cta` would be worse than the bug (the same reasoning MUIAutocomplete
     * records under KP1-I56/I91). That default is also what keeps the English-only admin
     * portal rendering exactly as before.
     */
    const { t } = useTranslation('common');

    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const acceptedTypes = accept.split(',').map((type) => type.trim());
    const selected = files ?? [];

    // Both branches of the dropzone below render these, so they are built once here rather
    // than repeated — the English pair had already drifted into two copies.
    const cta = t('fileUpload.cta', { defaultValue: 'Drag & drop files here or click to browse' });
    const defaultHint = t('fileUpload.hint', {
        defaultValue: 'Supported formats: PDF, JPG, PNG (Max {{max}} MB)',
        max: maxSizeMB,
    });

    /** `''` when the file is acceptable, otherwise the reason. */
    const reject = (file: File): string => {
        if (!acceptedTypes.includes(file.type)) {
            return t('fileUpload.errors.format', { defaultValue: 'Unsupported file format' });
        }
        if (file.size > maxSizeMB * 1024 * 1024) {
            return t('fileUpload.errors.tooLarge', {
                defaultValue: 'File size must be less than {{max}} MB',
                max: maxSizeMB,
            });
        }
        return '';
    };

    const readDataUrl = (file: File) =>
        new Promise<UploadedFile>((resolve, reject_) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve({ dataUrl: reader.result as string, name: file.name });
            reader.onerror = () => reject_(reader.error);
            reader.readAsDataURL(file);
        });

    const processFile = (file: File) => {
        const reason = reject(file);
        if (reason) {
            onError?.(reason);
            return;
        }
        readDataUrl(file).then(({ dataUrl, name }) => onChange?.(dataUrl, name));
    };

    /**
     * KP1-I122: several files in one go.
     *
     * Each is judged on its own — a rejected file reports its reason and is dropped, while
     * the acceptable ones in the same selection are still added. Rejecting the whole batch
     * because one file was a .docx would make the user re-pick the good ones.
     *
     * They are read in parallel but appended in the order the user picked them, because the
     * command builder pairs `Files[i]` with `FileCategoryIds[i]` positionally — a reordered
     * list would categorise the wrong attachment.
     */
    const processFiles = (picked: File[]) => {
        const usable: File[] = [];
        for (const file of picked) {
            const reason = reject(file);
            if (reason) onError?.(`${file.name}: ${reason}`);
            else usable.push(file);
        }
        if (!usable.length) return;

        Promise.all(usable.map(readDataUrl)).then((read) => {
            // Appends to the caller's current selection, so a second pick adds rather than
            // replaces — the behaviour the Edit screen already had by picking repeatedly.
            onFilesChange?.([...selected, ...read]);
        });
    };

    const accept_ = (list: FileList | null | undefined) => {
        const picked = list ? Array.from(list) : [];
        if (!picked.length) return;
        if (multiple) processFiles(picked);
        else processFile(picked[0]);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        accept_(e.target.files);
        e.target.value = '';
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        accept_(e.dataTransfer.files);
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
    const handleRemove = () => onChange?.('', '');

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
                    {/* KP1-I82: default label colour on error; the dropzone border and the
                        ValidationMessage carry it. */}
                    <label>{label}</label>
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
                    /* KP1-I122: without this attribute the OS picker only ever lets ONE file
                       be selected, whatever the handler does with the list. */
                    multiple={multiple}
                    className="hidden"
                    onChange={handleInputChange}
                    aria-label={label || 'Upload file'}
                />
                {/*
                  * The dropzone now ALWAYS shows its prompt — the picked files no longer
                  * replace it. Two reasons:
                  *
                  *  - the drop target stops disappearing the moment the first file lands, so
                  *    adding a second one is still an obvious drag-or-click rather than
                  *    something you have to guess is possible;
                  *  - a chip rendered inside a 147px box that is itself a click target sat on
                  *    top of the control it belonged to. The thumbnails moved below the field
                  *    (see the list under this element).
                  */}
                <Upload className="text-primary" size={24} />
                <p className="text-base text-black text-center">{cta}</p>
                <p className="text-[11px] text-grey-200 text-center">
                    {helperText || defaultHint}
                </p>
            </div>

            {/*
              * Picked files, UNDER the dropzone rather than inside it.
              *
              * Both modes render through the same block so a single-document slot and a
              * multi-file one look identical — the only difference is how many chips there
              * can be. `FileChip` already stops propagation on its own buttons; out here that
              * is no longer load-bearing (they are outside the dropzone's onClick), but it
              * costs nothing and keeps the chip usable in either position.
              *
              * Left-aligned, not centred: the chips line up with the field's label and its
              * validation message rather than floating in the middle of the row.
              */}
            {multiple
                ? selected.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                          {selected.map((file, index) => {
                              // A stored file has no bytes here, so its own dataUrl can't open
                              // it — the caller's handler is the only way. With neither, the
                              // eye button is omitted rather than rendered dead.
                              const localUrl = file.dataUrl || '';
                              const onChipView = onViewFile
                                  ? () => onViewFile(file, index)
                                  : localUrl
                                    ? () => openInNewTab(localUrl)
                                    : undefined;

                              return (
                                  <FileChip
                                      key={file.id != null ? `id-${file.id}` : `${file.name}-${index}`}
                                      fileName={file.name}
                                      previewUrl={
                                          file.previewUrl ||
                                          (localUrl.startsWith('data:image/') ? localUrl : undefined)
                                      }
                                      onView={onChipView}
                                      onDownload={
                                          onDownloadFile ? () => onDownloadFile(file, index) : undefined
                                      }
                                      onRemove={
                                          allowRemove
                                              ? () => onFilesChange?.(selected.filter((_, i) => i !== index))
                                              : undefined
                                      }
                                      busy={busy}
                                  />
                              );
                          })}
                      </div>
                  )
                : Boolean(value) && (
                      <div className="mt-2 flex flex-wrap gap-2">
                          {/* The same chip the view screens render, so an uploaded document
                              looks and behaves identically whether you are reading the record
                              or editing it. */}
                          <FileChip
                              fileName={fileName}
                              previewUrl={previewUrl}
                              onView={handleView}
                              onDownload={onDownload ? handleDownload : undefined}
                              onRemove={allowRemove ? handleRemove : undefined}
                              busy={busy}
                          />
                      </div>
                  )}

            <ValidationMessage error={error} />
        </div>
    );
};

export default FileUpload;
