/**
 * The shared styling for the MUI X pickers' POPUP — the calendar itself, not the field.
 *
 * KP1-I532 — "the calendar opens when clicking preferred date, but the dates are displayed
 * in a disabled/greyed-out state, and a date cannot be selected".
 *
 * The dates the ticket was filed against genuinely are disabled: the On Hold preferred date
 * may not be in the past (KP1-I528), so on the 23rd of a 30-day month 23 of the 30 dates the
 * calendar opens on are out of bounds. What made that read as a broken control rather than as
 * a rule is that **MUI's stock day palette is the only thing distinguishing the two states**,
 * and it is far weaker than anything else in either portal:
 *
 *                     MUI stock                    the portals' own controls
 *   enabled day       rgba(0, 0, 0, 0.87)          hsl(var(--foreground))
 *   disabled day      rgba(0, 0, 0, 0.38)          hsl(var(--disabled-fg))
 *   selected day      #1565c0 — MUI's BLUE         hsl(var(--primary)) — gold / green
 *   today's ring      rgba(0, 0, 0, 0.23)          hsl(var(--primary))
 *
 * So the one affordance that says "these dates ARE selectable" — the brand colour on the day
 * under the pointer and on the day you pick — was a blue that appears nowhere else in either
 * portal, and a disabled day differed from an enabled one by opacity alone. Every calendar in
 * both portals had this; the On Hold field is simply the first screen where most of the month
 * is disabled at once, which is what made it visible.
 *
 * Colour alone still does not carry the rule (WCAG 1.4.1) — that is the call site's job, and
 * `ResolveJobPopup` states it in the field's `helperText`. This file makes the two states
 * unmistakable once the user is looking at them.
 *
 * Tokens, never literals: `--primary` is gold under `body.admin-theme` and green in the
 * customer portal, so one definition follows both themes — the same reason `pickerFieldSx`
 * beside it is written this way (KP1-I109).
 */

/**
 * Pass to a picker's `slotProps.desktopPaper.sx` **and** `slotProps.mobilePaper.sx` — it
 * lands on the popup surface, so every selector here is a descendant of that paper.
 *
 * Applied by `MUIDatePicker`, by `FilterPanel`'s three date fields — the only calendars
 * either portal renders — and by `MUITimePicker`, which has no day grid but shares the
 * popup surface, the viewport cap below and the Poppins/brand treatment of its list.
 */
export const pickerCalendarSx = {
    /*
     * The last resort when neither side of the field has room for the whole calendar —
     * a laptop at 100% zoom with a browser banner open is already close. Bounding it to
     * the viewport and letting it scroll means the popup is always fully reachable;
     * without it the bottom rows are simply unreachable, which is what KP1-I532 looked
     * like on a short window. `pickerPopperProps` below is what normally prevents it.
     */
    maxHeight: 'calc(100vh - 24px)',
    overflowY: 'auto',

    '& .MuiPickersDay-root, & .MuiPickersDay-dayWithMargin': {
        fontFamily: "'Poppins', sans-serif",
        color: 'hsl(var(--foreground))',

        // The hover affordance — the same low-alpha primary the tables and menus use, so a
        // selectable day announces itself before it is clicked.
        '&:hover, &:focus': {
            backgroundColor: 'hsl(var(--primary) / 0.15)',
        },

        // Today, when it is NOT the selected day: MUI draws a 1px rgba(0,0,0,.23) ring that
        // is invisible next to a disabled day. It is also frequently disabled here (a job
        // held until today is not a reschedule), so it must not read as "pick me".
        '&.MuiPickersDay-today:not(.Mui-selected)': {
            borderColor: 'hsl(var(--primary))',
        },

        '&.Mui-selected': {
            backgroundColor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))',
            '&:hover, &:focus': {
                backgroundColor: 'hsl(var(--primary))',
            },
        },

        /*
         * The disabled day. `--disabled-fg` is the pinned read-only text colour every other
         * control uses (KP1-I128), and it is quieter than MUI's 0.38 black — which is the
         * point: an out-of-bounds date should read as furniture, so the handful of dates that
         * ARE selectable stand out instead of being lost in a wall of near-identical greys.
         *
         * Last, and naming both classes, because MUI's own `.Mui-disabled` rule would
         * otherwise win on specificity — the trap `pickerFieldSx` documents.
         */
        '&.Mui-disabled, &.MuiPickersDay-root.Mui-disabled': {
            color: 'hsl(var(--disabled-fg))',
            backgroundColor: 'transparent',
        },
    },

    // The month / year switcher and the arrows, which are the way out of a month with nothing
    // selectable in it. Stock MUI leaves them the same near-black as an enabled day.
    '& .MuiPickersCalendarHeader-root, & .MuiPickersArrowSwitcher-root': {
        fontFamily: "'Poppins', sans-serif",
        '& .MuiIconButton-root:not(.Mui-disabled)': {
            color: 'hsl(var(--primary))',
        },
    },

    // The year list behind the header's caret — same two states, same reasoning.
    '& .MuiPickersYear-yearButton': {
        fontFamily: "'Poppins', sans-serif",
        '&:hover, &:focus': {
            backgroundColor: 'hsl(var(--primary) / 0.15)',
        },
        '&.Mui-selected': {
            backgroundColor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))',
            '&:hover, &:focus': {
                backgroundColor: 'hsl(var(--primary))',
            },
        },
        '&.Mui-disabled': {
            color: 'hsl(var(--disabled-fg))',
        },
    },
};

/**
 * Pass to a picker's `slotProps.popper` — it keeps the popup inside the VIEWPORT.
 *
 * **The defect (KP1-I532, second pass).** The calendar opened downwards inside the dispatch
 * Resolve dialog and ran off the bottom of the screen: only the first two week rows were
 * reachable. It happens wherever the field sits low enough that a ~336px calendar does not
 * fit under it — which the On Hold warning, by pushing Preferred Date down, guarantees.
 *
 * **The cause is one popper.js default: `preventOverflow.altAxis` is `false`.** For a
 * `bottom-*` placement popper's MAIN axis is the horizontal one, so out of the box it only
 * ever corrects sideways overflow. Vertical overflow — the entire problem here — is left
 * alone, and `flip` cannot rescue it either once the popup fits on neither side of the
 * field. `altAxis: true` is what lets it slide up onto the screen.
 *
 * `tether: false` is the other half. Tethered — the default — popper refuses to move the
 * popup past the field's own edge, so it stops short and the calendar loses its month
 * header and arrows off the TOP instead: the same defect with the ends swapped. Untethered
 * it may end up visually detached from the field on a very short window, which is the right
 * trade: a popup that is fully readable beats one that is prettily aligned and half
 * unreachable. Neither option does anything when there is no overflow to correct, so on a
 * normal screen nothing moves.
 *
 * **Do NOT add `altBoundary: true` here.** It reads as "measure against the other element"
 * and it was tried first for exactly that reason, but popper defines it the other way round
 * from what the name suggests: with the default `elementContext: 'popper'`, `altBoundary`
 * switches the measurement to the REFERENCE's clipping parents — i.e. to the dialog or
 * filter drawer the field sits in, the very box that is too short. Left alone, the boundary
 * is the popup's own clipping parents, and since MUI portals it to `document.body` those
 * are the viewport. The wrong setting looks like no fix at all: the numbers move nowhere.
 *
 * **It must go through `popperOptions`, not a `modifiers` prop.** MUI v5 dropped `modifiers`
 * from `Popper`; it builds its OWN `flip` and `preventOverflow` entries and then
 * concatenates ONLY `popperOptions.modifiers` after them. A `modifiers` prop type-checks,
 * reaches the component and does nothing. Popper merges by NAME, so being concatenated last
 * is what lets these override MUI's.
 */
export const pickerPopperProps = {
    popperOptions: {
        modifiers: [
            {
                name: 'flip',
                options: {
                    fallbackPlacements: ['top-start', 'bottom-end', 'top-end'],
                    padding: 8,
                },
            },
            {
                name: 'preventOverflow',
                options: { altAxis: true, tether: false, padding: 8 },
            },
        ],
    },
};

export default pickerCalendarSx;
