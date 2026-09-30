import React, { useId } from 'react';
import { COMPACTOR_TRUCK_ART } from './compactorTruckArt';

export interface CompactorTruckIconProps
    extends Omit<React.SVGProps<SVGSVGElement>, 'width' | 'height'> {
    /** Rendered box, in px. Named `size` so call sites read like the lucide icons around them. */
    size?: number | string;
}

/**
 * **The compactor truck** — the vehicle a Compactable workflow is driven by.
 *
 * Use it wherever the thing depicted is a COMPACTOR. It is not a generic lorry: this platform
 * dispatches four kinds of vehicle (`6WL`, `2XL`, `SKL`, `CMP`) and they are not
 * interchangeable — a compactable bin is emptied in place by a compactor, and no other kind can
 * service one. The Compactable screens drew lucide's `Truck`, a flatbed, over work only a
 * compactor does.
 *
 * **It is not a replacement for every truck icon.** The Skip Loader and 6 Wheel / 2XL boards
 * depict *their* vehicles and keep their own icons; reaching for this one there would say the
 * wrong thing just as loudly.
 *
 * ## It takes its colour from the caller
 *
 * The source asset paints a hardcoded `#BF9F54` — the ADMIN gold — which would be wrong in the
 * customer portal, whose accent is green. So the tint is `currentColor`, and a call site sets it
 * exactly as it set the lucide icon this replaces:
 *
 * ```tsx
 * <CompactorTruckIcon size={22} className="text-primary" />
 * ```
 *
 * ## Why the artwork is inlined rather than `<img src={…}>`
 *
 * `DirhamIcon` and its siblings render an `<img>`, which cannot be recoloured — the file's own
 * fill is final. This asset is a raster masked by its own alpha and painted through, so keeping
 * the mask in the DOM is what makes `currentColor` possible at all. The cost is ~5 KB of base64;
 * the alternative is a gold icon on a green screen.
 *
 * The mask and pattern ids are per-instance (`useId`): two of these on one page sharing an id
 * would both resolve to whichever `<mask>` the browser parsed last, and one would vanish.
 */
const CompactorTruckIcon: React.FC<CompactorTruckIconProps> = ({ size = 24, ...props }) => {
    const id = useId();
    const maskId = `compactor-truck-mask-${id}`;
    const patternId = `compactor-truck-pattern-${id}`;
    const imageId = `compactor-truck-image-${id}`;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            /* Decorative by default — every call site labels the thing beside it. A caller that
               needs it announced passes its own `role` and `aria-label`, which wins below. */
            aria-hidden={props['aria-label'] ? undefined : true}
            focusable="false"
            {...props}
        >
            <mask
                id={maskId}
                style={{ maskType: 'alpha' }}
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="24"
                height="24"
            >
                <rect width="24" height="24" fill={`url(#${patternId})`} />
            </mask>
            <g mask={`url(#${maskId})`}>
                {/* The artwork's alpha is the stencil; THIS is what the icon is coloured by. */}
                <rect width="24" height="24" fill="currentColor" />
            </g>
            <defs>
                <pattern
                    id={patternId}
                    patternContentUnits="objectBoundingBox"
                    width="1"
                    height="1"
                >
                    <use xlinkHref={`#${imageId}`} transform="scale(0.0078125)" />
                </pattern>
                <image
                    id={imageId}
                    width="128"
                    height="128"
                    preserveAspectRatio="none"
                    xlinkHref={COMPACTOR_TRUCK_ART}
                />
            </defs>
        </svg>
    );
};

export default CompactorTruckIcon;
