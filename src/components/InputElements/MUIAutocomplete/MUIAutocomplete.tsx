import React from 'react';
import { Autocomplete, CircularProgress, TextField, createFilterOptions } from '@mui/material';
import { useTranslation } from 'react-i18next';
import '../FormField.css';
import ValidationMessage from '../../ValidationMessage/ValidationMessage';
import {
    DEFAULT_OPTION_PAGE_SIZE,
    type PaginatedOptionsSource,
} from '../../../hooks/usePaginatedOptions';

interface Option {
    label: string;
    value: string | number;
    /**
     * Secondary line under the label in the dropdown (a code, a reference…). Use it when
     * labels can repeat — e.g. two customers with the same Account Name are only tellable
     * apart by their Customer Code. Also searchable, so typing the code finds the row.
     */
    description?: string;
}

interface MUIAutocompleteProps {
    /**
     * A fully-loaded list. It is NOT all rendered at once: the dropdown shows the first
     * `pageSize` matches and extends by another `pageSize` each time the listbox is
     * scrolled to the bottom (see `visibleCount`). Search still runs over the whole list.
     *
     * Optional only because `source` replaces it; give one or the other.
     */
    options?: Option[];
    /**
     * Server-paged alternative to `options`, from `usePaginatedOptions` — the first page
     * comes from the API, scrolling asks for the next, and typing re-queries the API
     * instead of filtering what happens to be loaded. Use it for every dropdown whose
     * endpoint takes `PageNumber`/`PageSize`/`SearchTerm`; `options` stays right for the
     * lookup endpoints that return one bare array.
     */
    source?: PaginatedOptionsSource<any>;
    value: string | number | null;
    onChange: (value: string | number | null) => void;
    label?: string;
    placeholder?: string;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    className?: string;
    name?: string;
    /**
     * How many rows to reveal at a time (both modes). 25 matches the API's page and the
     * list screens.
     */
    pageSize?: number;
    /**
     * The saved selection, for `source` mode in EDIT screens: the record's value is set
     * before the dropdown has fetched anything, and page 1 need not contain it. Without
     * this the field would render blank until the user opened it and scrolled to their own
     * row. Ignored once the value is present in the loaded options.
     */
    selectedOption?: Option | null;
    /**
     * KP1-I91: what the dropdown says when the typed text matches nothing.
     *
     * Defaults to the shared "No matches found". Override only when a field can say
     * something more useful than that — not to restate the field's own name, which the
     * label directly above the box already gives.
     */
    noOptionsText?: React.ReactNode;
}

/** Matches on the label AND the description, so typing a code finds its row. */
const filterByLabelAndDescription = createFilterOptions<Option>({
    stringify: (option) => `${option.label} ${option.description ?? ''}`,
});

/** How close to the bottom (px) counts as "scrolled to the end". */
const SCROLL_THRESHOLD = 32;

const MUIAutocomplete: React.FC<MUIAutocompleteProps> = ({
    options = [],
    source,
    value,
    onChange,
    className,
    label,
    placeholder,
    error,
    disabled = false,
    required = false,
    name,
    pageSize = DEFAULT_OPTION_PAGE_SIZE,
    selectedOption: selectedOptionProp,
    noOptionsText,
}) => {
    const { t } = useTranslation(['common']);

    const listOptions = source ? source.options : options;

    /**
     * How many of the MATCHING rows are rendered. Reset whenever the list can change under
     * the user (open, close, a new query), so a fresh search always starts at the top.
     */
    const [visibleCount, setVisibleCount] = React.useState(pageSize);
    /** Set by `filterOptions` below — how many rows the current query matched in full. */
    const matchCountRef = React.useRef(listOptions.length);

    /**
     * The last option the user picked, so the input keeps showing it after the option list
     * moves on (a server search, or a page that no longer includes it). `source.pin` does
     * the same for the list itself; this covers the input in plain `options` mode too.
     */
    const lastPickedRef = React.useRef<Option | null>(null);

    const fromList = listOptions.find((opt) => opt.value === value);
    const fallback =
        selectedOptionProp && selectedOptionProp.value === value
            ? selectedOptionProp
            : lastPickedRef.current && lastPickedRef.current.value === value
                ? lastPickedRef.current
                : null;
    const selectedOption = fromList ?? (value === null || value === '' ? null : fallback);

    const hasDescriptions = listOptions.some((opt) => !!opt.description);

    /**
     * In edit mode the saved option is the only thing that can name the current value until
     * the first page arrives; pinning it also keeps it selectable in the open list.
     *
     * Keyed on `source.pin` — which is stable — rather than on `source`, which is a fresh
     * object on every render of the owning hook.
     */
    const pin = source?.pin;
    React.useEffect(() => {
        if (pin && selectedOptionProp && selectedOptionProp.value === value) pin(selectedOptionProp);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pin, selectedOptionProp?.value, selectedOptionProp?.label, value]);

    const handleScroll = (event: React.UIEvent<HTMLElement>) => {
        const list = event.currentTarget;
        if (list.scrollTop + list.clientHeight < list.scrollHeight - SCROLL_THRESHOLD) return;
        if (source) {
            source.loadMore();
            return;
        }
        setVisibleCount((current) => (current < matchCountRef.current ? current + pageSize : current));
    };

    const loadingMoreText = t('common:messages.loading', 'Loading...');

    /**
     * Server mode only: the same `ul` MUI renders, with a "Loading…" line under the last
     * row while the next page is on its way — so an infinite scroll that pauses looks like
     * work in progress rather than the end of the list.
     *
     * The footer carries no `role="option"` / `data-option-index`, so MUI's keyboard
     * navigation ignores it.
     *
     * The component identity is fixed for the life of the field (`useMemo(…, [])`) and the
     * footer's state is read from refs at render time. Deriving the component from
     * `loadingMore` instead would give React a NEW component type the moment a page lands,
     * which unmounts the list and scrolls it back to the top — precisely when the user is
     * at the bottom reading the rows that just arrived. The refs are still live because the
     * parent re-renders (new `children`) whenever `loadingMore` changes.
     */
    const loadingMoreRef = React.useRef(false);
    loadingMoreRef.current = !!source?.loadingMore;
    const loadingTextRef = React.useRef(loadingMoreText);
    loadingTextRef.current = loadingMoreText;

    const ListboxWithFooter = React.useMemo(
        () =>
            React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLElement>>(
                function ListboxWithFooter({ children, ...listboxProps }, ref) {
                    return (
                        <ul ref={ref} {...listboxProps}>
                            {children}
                            {loadingMoreRef.current && (
                                <li className="mui-autocomplete-loading-more" aria-live="polite">
                                    {loadingTextRef.current}
                                </li>
                            )}
                        </ul>
                    );
                },
            ),
        [],
    );

    /**
     * KP1-I91: MUI's own default is the bare "No options", which reads as though the
     * dropdown is broken or empty rather than as an answer to what was typed. A search that
     * matches nothing — including one containing characters no area or account name has —
     * now says so.
     *
     * This is the tester's second suggestion rather than the first: silently stripping
     * "invalid" characters from the query would answer a question the user did not ask, and
     * these lists hold real names with `&`, `-`, `(`, `.` in them. The field cannot accept a
     * typed non-value in any case — no Autocomplete here is `freeSolo`, so MUI restores the
     * last valid selection on blur.
     *
     * The literal is passed as i18next's defaultValue, not left to the key existing: a
     * missing key in this package fails silently as visible raw text, and a dropdown reading
     * `common:emptyStates.noMatches` would be worse than the bug (KP1-I56).
     */
    const emptyText = noOptionsText ?? t('common:emptyStates.noMatches', 'No matches found');

    return (
        <div className={`form-field ${className || ''} ${error ? 'has-error' : ''}`}>
            {label && (
                <div className="field-label input-label">
                    <label htmlFor={name}>{label}</label>
                    {required && <span className="required-mark">*</span>}
                </div>
            )}
            <Autocomplete
                id={name}
                options={listOptions}
                getOptionLabel={(option) => option.label}
                // Options are usually rebuilt on each render, so identity comparison would
                // drop the selection; and repeated labels make `value` the only safe key.
                isOptionEqualToValue={(option, selected) => option.value === selected.value}
                value={selectedOption}
                onChange={(_, newValue) => {
                    lastPickedRef.current = newValue;
                    // Keeps the chosen row in the list after the query moves on; harmless
                    // no-op in plain `options` mode.
                    source?.pin(newValue);
                    onChange(newValue ? newValue.value : null);
                }}
                onOpen={() => {
                    setVisibleCount(pageSize);
                    source?.onOpen();
                }}
                onClose={() => {
                    setVisibleCount(pageSize);
                    source?.onClose();
                }}
                onInputChange={(_, text, reason) => {
                    // 'input' is typing and 'clear' is the ✕ button — both change what the
                    // user is asking for. 'reset' is MUI writing the selected label back into
                    // the input; searching on that would re-query for their own selection.
                    if (reason !== 'input' && reason !== 'clear') return;
                    setVisibleCount(pageSize);
                    source?.onSearch(reason === 'clear' ? '' : text);
                }}
                // The server already filtered and is still fetching the rest; filtering the
                // loaded page again would hide rows that legitimately matched.
                filterOptions={
                    source
                        ? (opts) => opts
                        : (opts, state) => {
                            const matches = hasDescriptions
                                ? filterByLabelAndDescription(opts, state)
                                : createFilterOptions<Option>()(opts, state);
                            matchCountRef.current = matches.length;
                            // Only `visibleCount` rows are handed to MUI — a 2 000-row
                            // master list would otherwise mount 2 000 <li>s on open.
                            return matches.slice(0, visibleCount);
                        }
                }
                loading={!!source?.loading}
                loadingText={loadingMoreText}
                slots={source ? { listbox: ListboxWithFooter } : undefined}
                slotProps={{
                    listbox: {
                        onScroll: handleScroll,
                    },
                }}
                disabled={disabled}
                noOptionsText={emptyText}
                renderOption={(props, option) => {
                    // MUI puts `key` inside the spread props; React warns unless it is passed
                    // separately, and repeated labels make `value` the only stable key.
                    const { key: _key, ...liProps } = props as React.HTMLAttributes<HTMLLIElement> & {
                        key?: React.Key;
                    };
                    return (
                        <li key={String(option.value)} {...liProps}>
                            {option.description ? (
                                <span className="flex flex-col">
                                    <span>{option.label}</span>
                                    <span className="text-xs text-grey-500">{option.description}</span>
                                </span>
                            ) : (
                                option.label
                            )}
                        </li>
                    );
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder={placeholder}
                        error={!!error}
                        variant="outlined"
                        size="medium"
                        fullWidth
                        slotProps={{
                            input: {
                                ...params.InputProps,
                                // A search that goes to the server has latency the user has
                                // to see; the spinner sits beside the chevron, which is why
                                // the existing adornment is kept rather than replaced.
                                endAdornment: (
                                    <>
                                        {source?.loading && (
                                            <CircularProgress
                                                size={16}
                                                sx={{ color: 'hsl(var(--primary))', mr: 0.5 }}
                                            />
                                        )}
                                        {params.InputProps.endAdornment}
                                    </>
                                ),
                            },
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                // KP1-I107/I108: MUI sizes its own control (~56px at
                                // size="medium"), so a dropdown stood taller than the
                                // InputField and PhoneInput beside it in the same row. Same
                                // token as `.input-wrapper` in InputField.css.
                                height: 'var(--input-large-height)',
                                // KP1-I109: tokens, so the surface follows the theme; KP1-I128
                                // makes the disabled grey THE shared token rather than a
                                // literal copy of InputField.css's value.
                                borderRadius: 'var(--radius-r-10)',
                                backgroundColor: disabled ? 'hsl(var(--disabled-bg))' : 'hsl(var(--background))',
                                /*
                                 * KP1-I128 — a disabled dropdown must lose its border too.
                                 *
                                 * The surface already greyed, but this fieldset kept the 2px
                                 * `--primary` outline in every state, so on a view screen the
                                 * dropdowns were the only fields still wearing a gold border
                                 * while the InputFields beside them had gone borderless
                                 * (InputField.css's `:disabled` rule). That contrast is what
                                 * the tester read as "some fields are highlighted / editable" —
                                 * the Enquiry view carries three of these.
                                 *
                                 * Hover is excluded for the same reason: MUI still matches
                                 * `:hover` on a disabled control, so without the guard the
                                 * border came back the moment the pointer crossed it.
                                 */
                                '& fieldset': {
                                    borderColor: error
                                        ? 'hsl(var(--destructive))'
                                        : disabled
                                            ? 'transparent'
                                            : 'hsl(var(--primary))',
                                    borderWidth: '2px',

                                },
                                '&:hover:not(.Mui-disabled) fieldset': {
                                    borderColor: error ? 'hsl(var(--destructive))' : 'hsl(var(--primary))',

                                },
                                /*
                                 * KP1-I128 (second pass) — SPECIFICITY. The `& fieldset` rule
                                 * above is not enough on its own: it compiles to
                                 *   .css-hash .MuiOutlinedInput-root fieldset            (0,2,1)
                                 * while MUI ships
                                 *   .MuiOutlinedInput-root.Mui-disabled
                                 *     .MuiOutlinedInput-notchedOutline                   (0,3,0)
                                 * which is HIGHER, so MUI's own disabled outline —
                                 * `rgba(0,0,0,0.26)`, a grey — kept winning and the searchable
                                 * dropdowns still drew a border on the view screens.
                                 *
                                 * Naming both classes in one compound selector gives
                                 *   .css-hash .MuiOutlinedInput-root.Mui-disabled
                                 *     .MuiOutlinedInput-notchedOutline                   (0,4,0)
                                 * which beats it without `!important`. Keep the 2px width so
                                 * the control does not change size between modes.
                                 */
                                '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'transparent',
                                    borderWidth: '2px',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'hsl(var(--primary))',
                                    boxShadow: '0 0 0 4px hsl(var(--primary-light))',

                                },
                            },
                            '& .MuiInputBase-input': {
                                // KP1-I99: a literal 16px cannot answer a media query, and
                                // this is the control the ticket was filed against — at
                                // 1200px the selected "United Arab Emirates (UAE)" needed
                                // ~216px in a column that offered ~224px, so MUI's
                                // `text-overflow: ellipsis` cut it. The token drops to 14px
                                // below `xl`, where the columns are narrow.
                                fontSize: 'var(--input-font-size)',
                                fontFamily: "'Poppins', sans-serif",
                                color: '#000',
                                // KP1-I128: MUI fades a disabled value to rgba(0,0,0,.38);
                                // `--disabled-fg` is what every other read-only control
                                // shows, so the row stays one colour.
                                '&.Mui-disabled': {
                                    color: 'hsl(var(--disabled-fg))',
                                    WebkitTextFillColor: 'hsl(var(--disabled-fg))',
                                },
                            }
                        }}
                    />
                )}
                sx={{
                    width: '100%',
                    /*
                     * KP1-I128: no chevron on a read-only field. A dropdown arrow is an
                     * affordance — it advertises "there are other values to pick" — so on a
                     * view screen it reads as editable even once the border is gone, and it
                     * is the last thing distinguishing these boxes from the plain value
                     * boxes beside them. `visibility` rather than `display: none` so the
                     * value keeps the same width and stays aligned with the row.
                     */
                    '& .MuiAutocomplete-endAdornment': {
                        visibility: disabled ? 'hidden' : 'visible',
                    },
                }}
                popupIcon={
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9L12 15L18 9" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                }
            />
            <ValidationMessage error={error} />
        </div>
    );
};

export default MUIAutocomplete;
