import React from 'react';
import RasterMaskIcon, { type RasterMaskIconProps } from './RasterMaskIcon';
import { SIX_WHEEL_2XL_TRUCK_ART } from './art/sixWheel2XLTruckArt';

export type SixWheel2XLTruckIconProps = RasterMaskIconProps;

/**
 * **The 6 Wheel / 2XL truck.**
 *
 * The tipper the 6 Wheel / 2XL board dispatches — `VEHICLE_TYPE` `6WL` and `2XL`.
 *
 * Use it for THAT board and the jobs on it. It is not a generic lorry: this platform
 * dispatches four kinds of vehicle and they are not interchangeable, which is the whole
 * point of the Skip Loader / compactor rules in the admin `CLAUDE.md`.
 *
 * ## It takes its colour from the caller
 *
 * ```tsx
 * <SixWheel2XLTruckIcon size={24} className="text-primary" />
 * ```
 *
 * The source asset paints the admin gold. `RasterMaskIcon` masks it and fills with
 * `currentColor`, so the sidebar can tint it white when the item is selected and the
 * customer portal can tint it green — neither of which an `<img>` could do.
 */
const SixWheel2XLTruckIcon: React.FC<SixWheel2XLTruckIconProps> = (props) => (
    <RasterMaskIcon
        art={SIX_WHEEL_2XL_TRUCK_ART}
        boxX={7}
        boxY={7}
        boxWidth={26}
        boxHeight={26}
        slug="six-wheel-2xl-truck"
        {...props}
    />
);

export default SixWheel2XLTruckIcon;
