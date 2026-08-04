import React from 'react';
import { cn } from '../../lib/utils';

/**
 * The view / edit / download control in a listing table row. Shared by both portals.
 *
 * KP1-I49: the admin Customer List drew these as green chips
 * (`bg-secondary-light/40 text-secondary`) — the admin theme's secondary IS green, so
 * the customer portal's colour leaked into an all-gold screen. That was one symptom of
 * a bigger problem: every listing table hand-rolled its own icon button, so there were
 * six different looks across the two portals (`text-gray-500 hover:text-black`, a local
 * `iconClass`, three copies of a 34px chip, and two tables with no <button> at all —
 * bare clickable <Eye> icons that keyboard users could not reach).
 *
 * One component now, and the ONLY thing that differs between the portals is the theme:
 * `bg-primary-light` resolves to mint green in `:root` (customer) and #FBEFDC in
 * `body.admin-theme` (admin) — which is exactly the colour sampled out of the Figma
 * export's Action column. Never write a literal colour here, or the leak comes back.
 *
 * Corners are `rounded-10`, the shared `--radius-r-10` token used by inputs and buttons
 * — rounded, not a circle.
 */
export type RowActionVariant = 'default' | 'accent' | 'solid';

interface RowActionButtonProps {
    /** Accessible name; also the tooltip. Required — these buttons are icon-only. */
    label: string;
    onClick?: () => void;
    children: React.ReactNode;
    variant?: RowActionVariant;
    disabled?: boolean;
    className?: string;
}

const VARIANT: Record<RowActionVariant, string> = {
    /** The usual row action: dark icon on the theme's tint. */
    default: 'bg-primary-light text-foreground',
    /** Same tint, brand-coloured icon — used to set downloads apart from view/edit. */
    accent: 'bg-primary-light text-primary',
    /** Inverted, for the one destructive action per row (e.g. Cancel Contract). */
    solid: 'bg-foreground text-background',
};

const RowActionButton: React.FC<RowActionButtonProps> = ({
    label,
    onClick,
    children,
    variant = 'default',
    disabled = false,
    className,
}) => (
    <button
        type="button"
        aria-label={label}
        title={label}
        disabled={disabled}
        onClick={onClick}
        className={cn(
            'inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-10 transition-opacity',
            disabled
                ? 'bg-primary-light/50 text-foreground/40 cursor-not-allowed'
                : cn(VARIANT[variant], 'cursor-pointer hover:opacity-80'),
            className,
        )}
    >
        {children}
    </button>
);

export default RowActionButton;
