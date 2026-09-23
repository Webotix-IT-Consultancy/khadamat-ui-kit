/**
 * The shared field styling for the MUI X pickers (MUIDatePicker, MUITimePicker).
 *
 * KP1-I152 — "the Trade License Expiry field styling, spacing and overall layout differ
 * from the Figma design".
 *
 * ROOT CAUSE, and why this file exists at all: `@mui/x-date-pickers` v8 changed the DOM a
 * picker renders. It no longer composes a plain MUI `TextField`; by default it renders its
 * OWN accessible field structure — `.MuiPickersTextField-root` wrapping
 * `.MuiPickersOutlinedInput-root`, whose value lives in a `.MuiPickersSectionList-root` of
 * `<span>` sections (one per DD / MM / YYYY) rather than in an `<input>`, and whose outline
 * is `.MuiPickersOutlinedInput-notchedOutline`.
 *
 * Both pickers still styled themselves through `'& .MuiOutlinedInput-root'` and
 * `'& .MuiInputBase-input'`. Those classes are **not in the DOM any more**, so every rule
 * they carried — the 52px height, the 10px radius, the 2px `--primary` border, the white /
 * `#EEEEEE` surface, Poppins, the focus ring — silently matched nothing and the fields fell
 * back to MUI's stock look. Measured against the InputField beside it on Profile:
 *
 *              InputField (the design)   picker (before)
 *   height     52px                      56px
 *   border     2px hsl(var(--primary))   1px rgba(0,0,0,.23)
 *   radius     10px                      4px
 *   surface    #FFF / #EEEEEE disabled   transparent in BOTH states
 *   font       Poppins                   Roboto
 *   text inset 21px                      14px
 *
 * That is the whole ticket, and it was never specific to Profile — it is every date and
 * time field in both portals. A silent no-op is exactly how a wrong selector fails here:
 * `sx` cannot warn that nothing matched.
 *
 * The values below mirror `.input-wrapper` / `.input-element` in InputField.css token for
 * token — that file is the approved design, and tokens are what keep the control following
 * the admin portal's gold theme as well as the customer portal's green (KP1-I109).
 *
 * NOTE — `FilterPanel` does not use this. Its pickers opt out of the new DOM with
 * `enableAccessibleFieldDOMStructure={false}`, so they keep rendering a real
 * `.MuiOutlinedInput-root` and its `StyledTextField` still applies. That flag is deprecated
 * and goes away in MUI X v9; when it does, those three pickers break the same way this one
 * did and should move onto this helper (with their own 44px/14px sizing) rather than
 * growing a second copy of these selectors.
 */

export interface PickerFieldSxOptions {
    /** Renders the destructive border, matching `.input-wrapper-error`. */
    error?: boolean;
    /** Renders the read-only surface, matching InputField.css's `:disabled` rule. */
    disabled?: boolean;
}

/**
 * Pass to a picker's `slotProps.textField.sx` — it lands on `.MuiPickersTextField-root`,
 * so every selector here is a descendant of that root.
 */
export const pickerFieldSx = ({ error = false, disabled = false }: PickerFieldSxOptions) => {
    const borderColor = error
        ? 'hsl(var(--destructive))'
        : disabled
            ? 'transparent'
            : 'hsl(var(--primary))';

    return {
        '& .MuiPickersOutlinedInput-root': {
            // The counterpart of `.input-wrapper`. Height is the row's alignment contract
            // (KP1-I107/I108) and cannot live in CSS for a control that composes its own
            // DOM — keep it in step with `.input-wrapper` in InputField.css.
            height: 'var(--input-large-height)',
            borderRadius: 'var(--radius-r-10)',
            // KP1-I128: the shared read-only/disabled surface TOKEN, not a literal — this
            // field sits in a row with InputFields that read the same token, and the whole
            // Profile view screen renders `disabled`.
            backgroundColor: disabled ? 'hsl(var(--disabled-bg))' : 'hsl(var(--background))',
            // KP1-I99: the shared control scale, so the field keeps matching the InputField
            // beside it at every width. A literal 16px cannot answer the media query.
            fontFamily: "'Poppins', sans-serif",
            fontSize: 'var(--input-font-size)',
            color: 'hsl(var(--foreground))',
            // InputField puts its first glyph 21px in — 2px border + 10px `.input-wrapper`
            // padding + 9px `.input-element` padding. MUI's own default is 14px, which is
            // the "spacing" half of the ticket: the two fields in the Trade Licence row
            // started their text 7px apart. The notched outline is an absolutely
            // positioned overlay, so padding here is measured from the visible edge.
            //
            // LOGICAL, not `paddingLeft`/`paddingRight`. The customer portal runs the whole
            // dashboard under `dir="rtl"` in Arabic and MUI flips the picker button to the
            // other side with it; physical padding leaves the wide inset stranded on the
            // icon's side and the value crashes into the icon with no gap at all.
            // `.input-wrapper` never had to care because its padding is symmetric.
            paddingInlineStart: '21px',
            // Leaves the calendar/clock button the same 12px inset `.input-wrapper` gives
            // its suffix (10px padding + 2px border).
            paddingInlineEnd: '12px',

            '& .MuiPickersOutlinedInput-notchedOutline': {
                borderColor,
                borderWidth: '2px',
                borderRadius: 'var(--radius-r-10)',
            },
            '&:hover:not(.Mui-disabled) .MuiPickersOutlinedInput-notchedOutline': {
                borderColor: error ? 'hsl(var(--destructive))' : 'hsl(var(--primary))',
                borderWidth: '2px',
            },
            '&.Mui-focused .MuiPickersOutlinedInput-notchedOutline': {
                borderColor: error ? 'hsl(var(--destructive))' : 'hsl(var(--primary))',
                borderWidth: '2px',
            },
            // The ring the other controls show — InputField via `focus-within:ring-4`,
            // MUIAutocomplete via this same boxShadow.
            '&.Mui-focused': {
                boxShadow: error
                    ? '0 0 0 4px hsl(var(--destructive) / 0.3)'
                    : '0 0 0 4px hsl(var(--primary-light))',
            },
            // MUI greys disabled text to rgba(0,0,0,.26). `--disabled-fg` is the pinned
            // read-only text colour every other control uses (KP1-I128) — match it, or the
            // Profile view shows one field darker than the rest of the row.
            '&.Mui-disabled': {
                color: 'hsl(var(--disabled-fg))',
                WebkitTextFillColor: 'hsl(var(--disabled-fg))',
            },
            /*
             * KP1-I128 (second pass) — SPECIFICITY, the same trap MUIAutocomplete hit.
             * The `disabled ? 'transparent'` branch in `borderColor` above compiles to
             *   .MuiPickersOutlinedInput-root .MuiPickersOutlinedInput-notchedOutline  (0,2,0)
             * and MUI ships
             *   .MuiPickersOutlinedInput-root.Mui-disabled
             *     .MuiPickersOutlinedInput-notchedOutline                              (0,3,0)
             * so MUI's grey disabled outline won and a disabled date/time picker kept a
             * border while the InputFields beside it had none. Naming both classes here
             * takes it to (0,4,0) — no `!important` needed.
             */
            '&.Mui-disabled .MuiPickersOutlinedInput-notchedOutline': {
                borderColor: 'transparent',
                borderWidth: '2px',
            },
        },

        /*
         * KP1-I128: no calendar / clock button on a read-only field, for the same reason
         * MUIAutocomplete drops its chevron — the button is an affordance, so it keeps
         * saying "editable" after the border and surface have said otherwise. `visibility`
         * rather than `display: none` so the value box keeps its width and stays aligned
         * with the rest of the row.
         */
        '& .MuiInputAdornment-root': {
            visibility: disabled ? 'hidden' : 'visible',
        },

        // MUI pads the sections container 16.5px top and bottom to size the control itself.
        // With the height pinned above that padding only pushes the value off-centre.
        '& .MuiPickersInputBase-sectionsContainer': {
            padding: 0,
            justifyContent: 'flex-start',
        },

        /**
         * Arabic. The container above is a flex row that MUI pins to `direction: ltr` —
         * correctly, because 18/03/2027 has to read left-to-right in any locale. The side
         * effect is that its sections also PACK left, so under `dir="rtl"` the value sat at
         * the field's left edge jammed against the picker button (which MUI does mirror),
         * while the InputField beside it right-aligned as expected.
         *
         * Aligning the flex line to its end puts the digits at the field's inline-start
         * without touching the order of the sections themselves. `[dir="rtl"] &` matches the
         * portal's `<html dir="rtl">`, which `AppRoutes` sets from `useLanguageStore`.
         */
        '[dir="rtl"] & .MuiPickersInputBase-sectionsContainer': {
            justifyContent: 'flex-end',
        },

        // The empty field shows the format itself (DD/MM/YYYY) as its placeholder, dimmed
        // with opacity. `.input-element::placeholder` uses a flat --muted-foreground, so
        // spell the same colour out rather than letting MUI fade the foreground.
        '& .MuiPickersSectionList-root': {
            '& .MuiPickersInputBase-sectionBefore, & .MuiPickersInputBase-sectionAfter': {
                color: 'inherit',
            },
        },
    };
};

export default pickerFieldSx;
