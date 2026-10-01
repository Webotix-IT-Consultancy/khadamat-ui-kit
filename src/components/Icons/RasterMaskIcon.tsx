import React, { useId } from 'react';

export interface RasterMaskIconProps
    extends Omit<React.SVGProps<SVGSVGElement>, 'width' | 'height'> {
    /** Rendered box, in px. Named `size` so call sites read like the lucide icons around it. */
    size?: number | string;
}

interface Props extends RasterMaskIconProps {
    /** The `data:image/png;base64,…` URI the source asset carries. */
    art: string;
    /**
     * The art box from the source SVG, which becomes the viewBox — see the note below.
     *
     * Named `box*` rather than `x`/`y`/`width`/`height` because the last two are also
     * SVG element attributes: with those names the spread below widened them back to
     * `string | number` and every caller failed to typecheck. They are not the rendered
     * size either — that is `size`.
     */
    boxX: number;
    boxY: number;
    boxWidth: number;
    boxHeight: number;
    /** Used to build per-instance ids. Kebab-case, e.g. `skip-loader-truck`. */
    slug: string;
}

/**
 * **A raster icon painted in `currentColor`** — the machinery behind every icon in this
 * folder whose source asset is a PNG rather than a path.
 *
 * ## Why these are not `<img src={…}>`
 *
 * `DirhamIcon` and its siblings render an `<img>`, and an `<img>` cannot be recoloured — the
 * file's own pixels are final. Every one of these assets is a raster painted a hardcoded
 * **`#BF9F54`**, the ADMIN gold, which is wrong in the customer portal (green) and wrong
 * again on a selected sidebar item (white on green). So the artwork is inlined as a
 * **mask**: its alpha is the stencil, and a plain `<rect fill="currentColor">` is painted
 * through it. Keeping the mask in the DOM is what makes the tint possible at all.
 *
 * The cost is a few KB of base64 per icon, which is why each one keeps its data URI in its
 * own `art/` module — a reviewer scrolling a component should see its structure, not its
 * pixels.
 *
 * ## The viewBox is the ART BOX, not the asset box
 *
 * Figma exports these on a 40×40 canvas with the drawing inset — 24×24 at (8,8), or 26×26
 * at (7,7). Rendering that whole canvas at `size={24}` would draw the art at ~15px, visibly
 * smaller than the lucide icons beside it. Cropping the viewBox to the rect keeps the
 * designer's own artwork untouched while making the icon fill its box like its neighbours.
 *
 * ## The ids are PER-INSTANCE
 *
 * `useId`, because two of the same icon on one page sharing a mask id would both resolve to
 * whichever `<mask>` the browser parsed last — and one of them would simply vanish.
 *
 * ## Not exported from the package
 *
 * Call sites use the named icons. This is the shared body, kept separate so that adding the
 * fifth raster icon is an art file and six lines, not another copy of this.
 */
const RasterMaskIcon: React.FC<Props> = ({
    art,
    boxX,
    boxY,
    boxWidth,
    boxHeight,
    slug,
    size = 24,
    ...props
}) => {
    const id = useId();
    const maskId = `${slug}-mask-${id}`;
    const patternId = `${slug}-pattern-${id}`;
    const imageId = `${slug}-image-${id}`;

    return (
        <svg
            width={size}
            height={size}
            viewBox={`${boxX} ${boxY} ${boxWidth} ${boxHeight}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            /* Decorative by default — a sidebar item has its own label beside it. A caller
               that needs it announced passes `aria-label`, which wins through the spread. */
            aria-hidden={props['aria-label'] ? undefined : true}
            focusable="false"
            {...props}
        >
            <mask
                id={maskId}
                style={{ maskType: 'alpha' }}
                maskUnits="userSpaceOnUse"
                x={boxX}
                y={boxY}
                width={boxWidth}
                height={boxHeight}
            >
                <rect x={boxX} y={boxY} width={boxWidth} height={boxHeight} fill={`url(#${patternId})`} />
            </mask>
            <g mask={`url(#${maskId})`}>
                {/* The artwork's alpha is the stencil; THIS is what the icon is coloured by. */}
                <rect x={boxX} y={boxY} width={boxWidth} height={boxHeight} fill="currentColor" />
            </g>
            <defs>
                <pattern id={patternId} patternContentUnits="objectBoundingBox" width="1" height="1">
                    {/* 1/128 — the source images are all 128px square. */}
                    <use xlinkHref={`#${imageId}`} transform="scale(0.0078125)" />
                </pattern>
                <image
                    id={imageId}
                    width="128"
                    height="128"
                    preserveAspectRatio="none"
                    xlinkHref={art}
                />
            </defs>
        </svg>
    );
};

export default RasterMaskIcon;
