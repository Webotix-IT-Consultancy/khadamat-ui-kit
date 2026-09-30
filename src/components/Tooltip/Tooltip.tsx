import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '../../lib/utils';
import './Tooltip.css';

export type TooltipTone = 'neutral' | 'danger';

export interface TooltipProps {
    /**
     * The bubble's text. **Empty means no tooltip at all** — the trigger renders bare, with no
     * wrapper and no hover behaviour, so a caller can hand this a value that may not exist
     * without branching around the whole component.
     */
    content?: React.ReactNode;
    /**
     * A dimmed second line, for what pressing the trigger DOES ("Click for full details").
     *
     * Its own prop rather than something the caller composes into `content`, because the
     * styling is the point: a hint that looked like the content would read as more content.
     */
    hint?: React.ReactNode;
    /** The element the tooltip describes. Cloned via Radix `asChild`, so it must take a ref. */
    children: React.ReactElement;
    tone?: TooltipTone;
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
    /** Milliseconds of hover before it opens. */
    delayDuration?: number;
    sideOffset?: number;
    className?: string;
}

/**
 * The shared hover bubble — one tooltip for both portals.
 *
 * ## Why this exists beside `components/ui/tooltip`
 *
 * That file is the raw shadcn/Radix PRIMITIVE: four unstyled parts (`Provider`, `Root`,
 * `Trigger`, `Content`) that every caller has to assemble and skin itself, with a hardcoded
 * dark `bg-primary` body and `z-50`. Assembling it per screen is how two screens come to hover
 * differently, and `z-50` sits UNDER MUI's portalled poppers (1300).
 *
 * This is the COMPONENT: one element, a tone, and a bubble already drawn to the design
 * (`design-reference/skip loader/Tooltip-popover.png`). The primitive stays for anything that
 * genuinely needs to drive the parts by hand.
 *
 * ```tsx
 * import Tooltip from '@khadamat/ui-kit/components/Tooltip/Tooltip';
 *
 * <Tooltip content={reason} hint={t('list.rejectionViewDetails')} tone="danger" side="top" align="start">
 *     <button type="button" onClick={open}>{chip}</button>
 * </Tooltip>
 * ```
 *
 * ## Things it settles once, so no caller has to
 *
 *  - **No `TooltipProvider` to remember.** It carries its own. Radix allows nested providers
 *    and the provider holds only timing, so a table can render one per cell without a shared
 *    ancestor — which a `format()` callback inside a table body does not have.
 *  - **Hover AND focus.** Radix opens on both, so the keyboard path gets the same preview; a
 *    hand-rolled `onMouseEnter` div does not.
 *  - **It is a TOOLTIP, not a popover.** The bubble is `pointer-events: none` by Radix default
 *    on hover-open, is never focus-trapped, and holds no controls. Anything the user must be
 *    able to click, select or read at length belongs in a popup — on the dispatch boards that
 *    is exactly the split: hover previews the reason, the click opens `RejectReasonPopup`.
 *  - **Deep-path import only** (`@khadamat/ui-kit/components/Tooltip/Tooltip`). Not added to
 *    the root barrel, per the workspace rule — the barrel is in `optimizeDeps.exclude` and a
 *    new edge there can make Vite re-optimize mid-session.
 */
const Tooltip: React.FC<TooltipProps> = ({
    content,
    hint,
    children,
    tone = 'neutral',
    side = 'top',
    align = 'center',
    delayDuration = 150,
    sideOffset = 6,
    className,
}) => {
    // Nothing to say — hand back the trigger untouched. See `content`.
    if (content == null || content === '' || content === false) return children;

    return (
        <TooltipPrimitive.Provider delayDuration={delayDuration}>
            <TooltipPrimitive.Root>
                <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
                <TooltipPrimitive.Portal>
                    <TooltipPrimitive.Content
                        side={side}
                        align={align}
                        sideOffset={sideOffset}
                        /* Keeps the bubble on screen near the edges of a wide, scrolled table. */
                        collisionPadding={12}
                        className={cn('tooltip-bubble', `tooltip-${tone}`, className)}
                    >
                        {content}
                        {hint ? <span className="tooltip-hint">{hint}</span> : null}
                        {/* The design's tail. Radix keeps it under the trigger as the bubble
                            flips or shifts, so it cannot drift away from what it points at. */}
                        <TooltipPrimitive.Arrow className="tooltip-arrow" width={14} height={7} />
                    </TooltipPrimitive.Content>
                </TooltipPrimitive.Portal>
            </TooltipPrimitive.Root>
        </TooltipPrimitive.Provider>
    );
};

export default Tooltip;
