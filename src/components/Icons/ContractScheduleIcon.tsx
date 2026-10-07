import React from 'react';

export interface ContractScheduleIconProps
    extends Omit<React.SVGProps<SVGSVGElement>, 'width' | 'height'> {
    /** Rendered box, in px. Named `size` so call sites read like the lucide icons around it. */
    size?: number | string;
}

/**
 * **Contract Schedule** — the briefcase the sidebar draws for the schedule look-up
 * (FR-SCH-CSL-01).
 *
 * ## The only one of the four sidebar assets that is a REAL vector
 *
 * `contract-schedule-icon.svg` is a single stroked path, so it needs none of
 * `RasterMaskIcon`'s mask machinery — the path is inlined and its `stroke` is simply
 * `currentColor`. The source paints `stroke="black"`, which would be wrong on a selected
 * sidebar item (white on green) and wrong again in the customer portal.
 *
 * Its three siblings — Skip Master, Skip Loader and 6 Wheel / 2XL — are PNGs in an `<svg>`
 * wrapper and go through `RasterMaskIcon` instead. If this asset is ever re-exported as a
 * raster, this file changes shape; if the other three are ever re-exported as paths, they
 * should come to look like this one, which is the better of the two.
 *
 * ```tsx
 * <ContractScheduleIcon size={24} className="text-primary" />
 * ```
 */
const ContractScheduleIcon: React.FC<ContractScheduleIconProps> = ({ size = 24, ...props }) => (
    <svg
        width={size}
        height={size}
        /* Cropped to the artwork, as `RasterMaskIcon` explains: the asset is drawn on a
           40x40 canvas with the icon inset, and rendering the whole canvas would draw it
           visibly smaller than the lucide icons beside it. */
        viewBox="8 8 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden={props['aria-label'] ? undefined : true}
        focusable="false"
        {...props}
    >
        <path
            d="M24 29V13C24 12.4696 23.7893 11.9609 23.4142 11.5858C23.0391 11.2107 22.5304 11 22 11H18C17.4696 11 16.9609 11.2107 16.5858 11.5858C16.2107 11.9609 16 12.4696 16 13V29M12 15H28C29.1046 15 30 15.8954 30 17V27C30 28.1046 29.1046 29 28 29H12C10.8954 29 10 28.1046 10 27V17C10 15.8954 10.8954 15 12 15Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export default ContractScheduleIcon;
