import React from 'react';
import RasterMaskIcon, { type RasterMaskIconProps } from './RasterMaskIcon';
import { SKIP_LOADER_TRUCK_ART } from './art/skipLoaderTruckArt';

export type SkipLoaderTruckIconProps = RasterMaskIconProps;

/**
 * **The Skip Loader.**
 *
 * The truck that PLACES and collects a skip — `VEHICLE_TYPE.SKL`.
 *
 * Use it for the Skip Loader Jobs board. Not interchangeable with the compactor or the
 * 6 Wheel / 2XL: a compactable bin is emptied in place by a compactor, while the skip
 * itself is placed by one of these.
 *
 * ## It takes its colour from the caller
 *
 * ```tsx
 * <SkipLoaderTruckIcon size={24} className="text-primary" />
 * ```
 *
 * The source asset paints the admin gold. `RasterMaskIcon` masks it and fills with
 * `currentColor`, so the sidebar can tint it white when the item is selected and the
 * customer portal can tint it green — neither of which an `<img>` could do.
 */
const SkipLoaderTruckIcon: React.FC<SkipLoaderTruckIconProps> = (props) => (
    <RasterMaskIcon
        art={SKIP_LOADER_TRUCK_ART}
        boxX={7}
        boxY={7}
        boxWidth={26}
        boxHeight={26}
        slug="skip-loader-truck"
        {...props}
    />
);

export default SkipLoaderTruckIcon;
