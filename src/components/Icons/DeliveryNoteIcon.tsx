import React from 'react';

export interface DeliveryNoteIconProps
    extends Omit<React.SVGProps<SVGSVGElement>, 'width' | 'height'> {
    /** Rendered box, in px. Named `size` so call sites read like the lucide icons around it. */
    size?: number | string;
}

/**
 * **Delivery Note** — the page-with-a-plus the sidebar draws for the Documents group
 * (FRD S5.11).
 *
 * ## A real vector, like Contract Schedule and unlike its own neighbour
 *
 * `file-plus-icon.svg` is a single stroked path, so it needs none of `RasterMaskIcon`'s mask
 * machinery: the path is inlined and its `stroke` is simply `currentColor`. The source paints
 * `stroke="black"`, which would be wrong on a selected sidebar item (white on green) and
 * wrong again in the customer portal — so the literal is replaced rather than carried over.
 *
 * Its partner in the same group, `DisposalSlipIcon`, IS a raster and goes through
 * `RasterMaskIcon`. Two assets, two shapes, for the reason documented there.
 *
 * **The viewBox is the source's own `0 0 24 24`**, not the `8 8 24 24` crop the four older
 * sidebar icons use: those were exported on a 40x40 canvas with the artwork inset, and this
 * one is not. Cropping it would clip the path.
 *
 * ```tsx
 * <DeliveryNoteIcon size={24} className="text-primary" />
 * ```
 */
const DeliveryNoteIcon: React.FC<DeliveryNoteIconProps> = ({ size = 24, ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden={props['aria-label'] ? undefined : true}
        focusable="false"
        {...props}
    >
        <path
            d="M20 8L14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8ZM14 2L14 8H20M12 18V12M9 15H15"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export default DeliveryNoteIcon;
