import { useTranslation } from 'react-i18next';
import 'dayjs/locale/ar';

/**
 * KP1-I198 — the date/time pickers speak the UI's language.
 *
 * **The defect.** Every `LocalizationProvider` in this package was built as
 * `<LocalizationProvider dateAdapter={AdapterDayjs}>` with no `adapterLocale`, and
 * `AdapterDayjs` with no locale is dayjs's default — English. So the calendar popup rendered
 * `September 2026` with `S M T W T F S` above it on a fully Arabic, right-to-left screen:
 * the ticket ("Month name is not localized in the filter date picker"). It is not a missing
 * translation key — MUI takes those names from the ADAPTER, so no `ar/` bundle can reach
 * them. Same shape as KP1-I95, where the absent adapter locale also chose MM/DD/YYYY, and
 * KP1-I234, where a date was pinned to `en-GB` inside `Intl`.
 *
 * **The side-effect import is the other half of the fix.** `adapterLocale="ar"` names a
 * locale dayjs only knows once `dayjs/locale/ar` has been loaded; without it dayjs silently
 * falls back to English and the bug survives the prop. Importing it here means no component
 * and no portal can forget.
 *
 * **Digits stay Latin, which is what this product wants.** dayjs's `ar` locale carries
 * `preparse` / `postformat` maps that rewrite `16/07/2026` as `١٦/٠٧/٢٠٢٦` — but they are
 * moment-era fields that **dayjs never calls**: not in `format()`, not in the
 * `customParseFormat` plugin, and not in MUI's `AdapterDayjs` (grep any of the three). So the
 * picker prints Arabic month names over Western digits, exactly matching every date the
 * tables already render through `lib/date.ts`'s `ar-AE-u-nu-latn` (KP1-I234) — and
 * `FilterPanel`'s `date.format('DD/MM/YYYY')`, which becomes a query parameter, is untouched.
 * If a future dayjs starts honouring them, this is the line that has to change: register a
 * derived locale with the two keys deleted rather than reaching for `ar` directly.
 *
 * **Admin is unaffected**: English-only, `dir="ltr"` pinned, so `i18n.language` is always
 * `en` and this resolves to the same English locale the pickers used before.
 *
 * **Known gap, deliberately not papered over:** `@mui/x-date-pickers` ships NO Arabic
 * `localeText` bundle (its `locales/` has `faIR`, `heIL`, `urPK`, and nothing `ar*`), so the
 * picker's own strings — the toolbar, the mobile variant's `Cancel`/`OK`, the aria labels —
 * stay English. Everything this ticket is about (month name, year, weekday initials) comes
 * from the adapter locale and is fixed; the rest needs a hand-written `localeText`, which is
 * a separate piece of copy and should be raised as its own ticket.
 */
export const ARABIC_PICKER_LOCALE = 'ar';

/** The `adapterLocale` for a UI language. Anything that is not Arabic keeps dayjs's `en`. */
export const pickerLocale = (language?: string): string =>
    language?.toLowerCase().startsWith('ar') ? ARABIC_PICKER_LOCALE : 'en';

/**
 * Resolved at RENDER, from `i18n.language`, so the language switcher re-renders the picker
 * into the other language instead of freezing whatever was current when it first mounted.
 */
const usePickerLocale = (): string => {
    const { i18n } = useTranslation();
    return pickerLocale(i18n.language);
};

export default usePickerLocale;
