import React from 'react';
import RasterMaskIcon, { type RasterMaskIconProps } from './RasterMaskIcon';
import { DISPOSAL_SLIP_ART } from './art/disposalSlipArt';

export type DisposalSlipIconProps = RasterMaskIconProps;

/**
 * **The disposal slip** — the docket the driver photographs at the RDF site or the Libsa
 * counter (FRD S5.12), drawn beside Delivery Note in the sidebar's Documents group.
 *
 * ## It takes its colour from the caller
 *
 * ```tsx
 * <DisposalSlipIcon size={24} className="text-primary" />
 * ```
 *
 * `slip-icon.svg` is a PNG in an `<svg>` wrapper — a raster masked by its own alpha — so it
 * goes through `RasterMaskIcon`, which keeps the mask in the DOM and fills it with
 * `currentColor`. That is what lets the sidebar tint it white when the item is selected and
 * the customer portal tint it green; an `<img>` could do neither.
 *
 * **Its box is the source's own `0 0 24 24`.** The four older sidebar rasters are cropped to
 * `8 8 24 24` because they were exported on a 40x40 canvas with the artwork inset; this asset
 * is not, so cropping it would cut the slip in half. Its partner `DeliveryNoteIcon` is a true
 * vector and needs none of this.
 */
const DisposalSlipIcon: React.FC<DisposalSlipIconProps> = (props) => (
    <RasterMaskIcon
        art={DISPOSAL_SLIP_ART}
        boxX={0}
        boxY={0}
        boxWidth={24}
        boxHeight={24}
        slug="disposal-slip"
        {...props}
    />
);

export default DisposalSlipIcon;
