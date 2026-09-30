import React from 'react';

export interface SkipBinIconProps
    extends Omit<React.SVGProps<SVGSVGElement>, 'width' | 'height'> {
    /** Rendered box, in px. Named `size` so call sites read like the lucide icons around them. */
    size?: number | string;
}

/**
 * **A skip** — the container itself, not the truck that moves it.
 *
 * Drawn wherever a stop, a pin or a legend entry stands for a BIN to service: the route strip
 * and the route map both mark their `Bin` stops with it, so a scheduler reading either can tell
 * the work apart from the places the run merely passes through (the yard, the tipping site).
 *
 * The sibling of `CompactorTruckIcon`, and the division of labour is the point — that one is the
 * VEHICLE, this one is the CONTAINER. A screen showing both should not draw one glyph for two
 * different things.
 *
 * ## A real vector, unlike its sibling
 *
 * `CompactorTruckIcon` wraps a supplied raster and has to carry ~5 KB of base64. There was no
 * supplied artwork for the skip, so this is drawn: a few hundred bytes, crisp at any size, and
 * tinted by `currentColor` the same way.
 *
 * ```tsx
 * <SkipBinIcon size={18} className="text-primary" />
 * ```
 *
 * The silhouette is the standard open skip — a tapered body, wider at the rim than the floor,
 * with the lip and the lifting rail that make it readable at 16px, where detail turns to mud.
 */
const SkipBinIcon: React.FC<SkipBinIconProps> = ({ size = 24, ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        /* Decorative by default — the stop it marks is labelled beside it. A caller that needs
           it announced passes its own `aria-label`, which wins through the spread below. */
        aria-hidden={props['aria-label'] ? undefined : true}
        focusable="false"
        {...props}
    >
        {/* The body: rim wider than the floor, which is what reads as "skip" rather than "box". */}
        <path
            d="M2.6 7.5h18.8l-2.2 9.6a1.6 1.6 0 0 1-1.6 1.2H6.4a1.6 1.6 0 0 1-1.6-1.2L2.6 7.5Z"
            fill="currentColor"
        />
        {/* The lip, a shade proud of the body so the two do not merge into one blob when small. */}
        <rect x="1.4" y="5.6" width="21.2" height="2.4" rx="0.8" fill="currentColor" />
        {/* The lifting rail down the flank — the detail that says "this one gets hoisted". */}
        <path
            d="M7.6 9.8 6.6 16m9.8-6.2 1 6.2"
            stroke="#FFFFFF"
            strokeWidth="1.1"
            strokeLinecap="round"
            /* White rather than a token: it is a cut-out THROUGH the filled body, so it has to
               contrast with `currentColor` whatever the caller set it to. */
            opacity="0.55"
        />
    </svg>
);

export default SkipBinIcon;
