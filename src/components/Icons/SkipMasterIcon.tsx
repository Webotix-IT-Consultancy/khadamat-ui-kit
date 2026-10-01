import React from 'react';
import RasterMaskIcon, { type RasterMaskIconProps } from './RasterMaskIcon';
import { SKIP_MASTER_ART } from './art/skipMasterArt';

export type SkipMasterIconProps = RasterMaskIconProps;

/**
 * **The skip.**
 *
 * The container itself — the Skip Master register.
 *
 * **It is a Skip, never a "Bin"** (KP1-I257). The noun matters in copy and it matters
 * here too: this depicts the physical container the register tracks.
 *
 * ## It takes its colour from the caller
 *
 * ```tsx
 * <SkipMasterIcon size={24} className="text-primary" />
 * ```
 *
 * The source asset paints the admin gold. `RasterMaskIcon` masks it and fills with
 * `currentColor`, so the sidebar can tint it white when the item is selected and the
 * customer portal can tint it green — neither of which an `<img>` could do.
 */
const SkipMasterIcon: React.FC<SkipMasterIconProps> = (props) => (
    <RasterMaskIcon
        art={SKIP_MASTER_ART}
        boxX={8}
        boxY={8}
        boxWidth={24}
        boxHeight={24}
        slug="skip-master"
        {...props}
    />
);

export default SkipMasterIcon;
