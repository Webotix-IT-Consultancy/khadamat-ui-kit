import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import {
    defaultCountries,
    CountryIso2
} from "react-international-phone";

import { cn } from "../../../lib/utils";
import "../../InputElements/FormField.css";
import ValidationMessage from "../../ValidationMessage/ValidationMessage";
import { UAE_MOBILE_EXAMPLE } from "../../../utils/phone";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../popover";

type PhoneInputProps = Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "value"
> & {
    onChange?: (value: string) => void;
    value?: string;
    label?: string;
    required?: boolean;
    error?: string;
    defaultCountry?: string;
};

// Helper function to parse phone number and extract country/local number
const parsePhoneNumber = (phoneValue: string, countries: typeof defaultCountries) => {
    if (!phoneValue) return { countryIso2: null, localNumber: '' };

    // Clean the phone number - remove spaces and dashes
    const cleanValue = phoneValue.replace(/[\s\-\(\)]/g, '');

    if (cleanValue.startsWith('+')) {
        // Sort countries by dial code length (descending) to match longer codes first
        // This ensures +1868 (Trinidad) matches before +1 (US)
        const sortedCountries = [...countries].sort((a, b) => {
            return (b[2] as string).length - (a[2] as string).length;
        });

        for (const c of sortedCountries) {
            const dialCode = c[2] as string;
            if (cleanValue.startsWith(`+${dialCode}`)) {
                const localNumber = cleanValue.slice(dialCode.length + 1); // +1 for the +
                return {
                    countryIso2: c[1] as CountryIso2,
                    localNumber
                };
            }
        }
    }

    return { countryIso2: null, localNumber: cleanValue };
};

/**
 * A real national number per country, used to fill the placeholder mask below. Only
 * countries we actually validate need an entry — everything else falls back to the
 * mask's own shape, which is still honest about length and grouping.
 */
const EXAMPLE_NATIONAL: Record<string, string> = {
    ae: UAE_MOBILE_EXAMPLE,
};

/**
 * The country's display format from react-international-phone's own country data, e.g.
 * UAE `.. ... ....`. Newer entries carry an object keyed by prefix regex plus a
 * `default`; older ones are a bare string.
 */
const countryMask = (iso2: CountryIso2): string | undefined => {
    const format = defaultCountries.find((c) => c[1] === iso2)?.[3] as
        | string
        | { default?: string }
        | undefined;

    if (!format) return undefined;
    return typeof format === "string" ? format : format.default;
};

/**
 * KP1-I85: the placeholder was a hardcoded `ex.5663 3723 323` — eleven digits and no
 * country — displayed next to a selector reading +971, and contradicting the 9-digit
 * rule `utils/phone.ts` enforces on the very same value.
 *
 * It is derived from the selected country now, so it cannot drift from the dial code
 * again: the shape comes from the country data this file already imports, and the
 * digits from a real example where we hold one (UAE -> `eg. 50 123 4567`).
 */
const examplePlaceholder = (iso2: CountryIso2): string => {
    const mask = countryMask(iso2);
    const digits = EXAMPLE_NATIONAL[iso2] ?? "";

    if (!mask) return digits ? `eg. ${digits}` : "";

    let i = 0;
    const filled = mask.replace(/\./g, () => {
        // Past the end of a known example (or with none at all) keep counting 1-9, so
        // the length and grouping still read correctly for that country.
        const digit = digits[i] ?? String((i % 9) + 1);
        i += 1;
        return digit;
    });

    return `eg. ${filled}`;
};

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
    ({ className, onChange, value, label, required, error, disabled, defaultCountry = "ae", placeholder, ...props }, ref) => {

        // Parse the initial value to extract country and local number
        const parsedValue = React.useMemo(() => {
            return parsePhoneNumber(value || '', defaultCountries);
        }, [value]);

        // Local state for the displayed phone number (without dial code)
        const [localPhone, setLocalPhone] = React.useState(parsedValue.localNumber);
        const [currentCountry, setCurrentCountry] = React.useState<CountryIso2>(
            parsedValue.countryIso2 || (defaultCountry?.toLowerCase() as CountryIso2)
        );

        // Sync local state when value prop changes (for edit mode)
        React.useEffect(() => {
            const parsed = parsePhoneNumber(value || '', defaultCountries);
            setLocalPhone(parsed.localNumber);
            if (parsed.countryIso2) {
                setCurrentCountry(parsed.countryIso2);
            }
        }, [value]);

        const inputRef = React.useRef<HTMLInputElement>(null);

        // Sync local ref with the input ref
        React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

        // Parse country data for the selector
        const options = React.useMemo(() => {
            return defaultCountries.map((c) => {
                const [name, iso2, dialCode] = c;
                return { label: name as string, value: iso2 as CountryIso2, dialCode: dialCode as string };
            });
        }, []);

        const selectedCountry = options.find((opt) => opt.value === currentCountry);

        // Follows the country selector, including after the user changes it.
        const countryPlaceholder = React.useMemo(
            () => examplePlaceholder(currentCountry),
            [currentCountry]
        );

        // Handle phone input change
        const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newLocalPhone = e.target.value;
            setLocalPhone(newLocalPhone);

            // Construct full phone number with dial code
            const fullPhone = selectedCountry ? `+${selectedCountry.dialCode}${newLocalPhone.replace(/[\s\-]/g, '')}` : newLocalPhone;
            onChange?.(fullPhone);
        };

        // Handle country change
        const handleCountryChange = (newCountry: CountryIso2) => {
            setCurrentCountry(newCountry);
            const newCountryData = options.find((opt) => opt.value === newCountry);
            if (newCountryData && localPhone) {
                const fullPhone = `+${newCountryData.dialCode}${localPhone.replace(/[\s\-]/g, '')}`;
                onChange?.(fullPhone);
            }
        };



        // KP1-I107/I108: this shared none of the form shell — a bare `w-full` div and a
        // Tailwind label with a 6px gap where every other control uses 4px, and no
        // `capitalize`. So a Tel No. sat a couple of pixels off the text field beside it in
        // the same row. Same classes as InputField now (../FormField.css).
        return (
            <div className="input-field">
                {label && (
                    <div className="input-label">
                        {/* KP1-I82: default label colour on error; the field border and the
                            ValidationMessage carry it. */}
                        <label>{label}</label>
                        {required && <span className="required-mark">*</span>}
                    </div>
                )}
                <div
                    className={cn(
                        "flex items-center rounded-10 border-2 border-primary bg-background h-[var(--input-large-height)] overflow-hidden",
                        "focus-within:ring-4 focus-within:ring-primary-light focus-within:border-primary",
                        error && "border-destructive focus-within:border-destructive focus-within:ring-destructive/30",
                        // Match InputField's read-only surface, so a disabled phone field reads as
                        // disabled next to the text fields on a view screen instead of looking
                        // editable. `disabled` used to reach only the inner <input> through
                        // `...props`, and every visible style lives out here.
                        // KP1-I128: `bg-disabled` is the shared token; it was a literal #EEEEEE.
                        disabled && "bg-disabled border-transparent focus-within:ring-0 focus-within:border-transparent",
                        className
                    )}
                >
                    <CountrySelect
                        value={currentCountry}
                        onChange={handleCountryChange}
                        options={options}
                        selectedDialCode={selectedCountry?.dialCode || ""}
                        // Without this the flag/dial-code dropdown stayed live on a disabled
                        // field, so callers had to smother it with `pointer-events-none`.
                        disabled={disabled}
                    />

                    {/* Vertical Separator */}
                    <div className={cn("h-6 w-px bg-gray-300 shrink-0", disabled && "bg-gray-400/40")} />

                    <input
                        ref={inputRef}
                        type="tel"
                        value={localPhone}
                        onChange={handlePhoneChange}
                        placeholder={placeholder ?? countryPlaceholder}
                        disabled={disabled}
                        className={cn(
                            // KP1-I217: `min-w-0` is load-bearing, not tidying. A flex item's
                            // min-width defaults to its MIN-CONTENT width, and an <input>'s is
                            // its `size` attribute — 20 characters, ~194px. Add the country
                            // selector (~108px) and this control could not render narrower than
                            // ~307px: below that the number was pushed out and then CLIPPED by
                            // the `overflow-hidden` on the wrapper above, which is the defect
                            // the ticket reports (Contract Create's postal row gives each field
                            // 137-252px). Measured: 173px of overflow at the narrow end, 0 with
                            // this class. `.input-element` in InputField.css carries the twin.
                            "flex-1 min-w-0 h-full px-3 bg-transparent text-foreground placeholder:text-muted-foreground",
                            // KP1-I99: this input had no size of its own and inherited body
                            // copy, so it would have stayed 16px while the InputField next
                            // to it stepped down to 14px below `xl`.
                            "text-[length:var(--input-font-size)]",
                            "outline-none border-0 focus:ring-0",
                            // KP1-I128: the same pinned read-only text colour every other
                            // control uses, so the number doesn't sit darker than the fields
                            // beside it. `[-webkit-text-fill-color]` because Safari/iOS
                            // ignore `color` on a disabled input.
                            disabled &&
                                "cursor-default text-disabled-foreground [-webkit-text-fill-color:hsl(var(--disabled-fg))] opacity-100"
                        )}
                        {...props}
                    />
                </div>
                {/* The shared message slot, like every other control (KP1-I107/I108). The
                    hand-rolled `<p className="mt-1.5 text-xs text-destructive">` this
                    replaces sat 6px below the control where ValidationMessage sits 4px, so
                    an errored phone field pushed its row taller than an errored text field. */}
                <ValidationMessage error={error} />
            </div>
        );
    }
);
PhoneInput.displayName = "PhoneInput";

type CountrySelectOption = { label: string; value: CountryIso2; dialCode: string };

type CountrySelectProps = {
    disabled?: boolean;
    value: CountryIso2;
    onChange: (value: CountryIso2) => void;
    options: CountrySelectOption[];
    selectedDialCode: string;
};

const CountrySelect = ({
    disabled,
    value,
    onChange,
    options,
    selectedDialCode,
}: CountrySelectProps) => {
    const [open, setOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");

    const handleSelect = React.useCallback(
        (country: CountryIso2) => {
            onChange(country);
            setOpen(false);
            setSearchQuery(""); // Reset search on selection
        },
        [onChange]
    );

    // Reset search when popover closes
    React.useEffect(() => {
        if (!open) {
            setSearchQuery("");
        }
    }, [open]);

    const selectedCountry = options.find((opt) => opt.value === value);

    // Filter options based on search query
    const filteredOptions = React.useMemo(() => {
        if (!searchQuery.trim()) return options;
        const query = searchQuery.toLowerCase();
        return options.filter(
            (option) =>
                option.label.toLowerCase().includes(query) ||
                option.dialCode.includes(query) ||
                option.value.toLowerCase().includes(query)
        );
    }, [options, searchQuery]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        "flex gap-1.5 items-center px-3 h-full",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        // `enabled:` — a disabled button still matches :hover in some browsers,
                        // and a hover highlight on a dead control reads as clickable.
                        "enabled:hover:bg-accent/50 transition-colors outline-none focus:outline-none"
                    )}
                    disabled={disabled}
                >
                    <FlagComponent country={value} countryName={selectedCountry?.label || value} />
                    <span className="text-sm font-medium text-foreground">
                        +{selectedDialCode}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <div className="flex h-full w-full flex-col overflow-hidden rounded-md bg-background text-foreground">
                    {/* Search Input */}
                    <div className="flex items-center border-b border-input px-3">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="mr-2 h-4 w-4 shrink-0 opacity-50"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search country..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                        />
                    </div>

                    {/* Country List */}
                    <div className="max-h-[300px] overflow-y-auto overflow-x-hidden p-1">
                        {filteredOptions.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                No country found.
                            </div>
                        ) : (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    className="relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                    onClick={() => handleSelect(option.value)}
                                >
                                    <FlagComponent
                                        country={option.value}
                                        countryName={option.label}
                                    />
                                    <span className="flex-1 text-sm">{option.label}</span>
                                    <span className="text-muted-foreground text-sm">
                                        +{option.dialCode}
                                    </span>
                                    {option.value === value && (
                                        <Check className="ml-auto h-4 w-4 opacity-100 text-primary" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};

const FlagComponent = ({ country, countryName }: { country: CountryIso2; countryName: string }) => {
    return (
        <span className="flex h-4 w-6 overflow-hidden rounded-sm bg-foreground/20 shrink-0">
            {country && (
                <img
                    src={`https://flagcdn.com/w40/${country.toLowerCase()}.png`}
                    alt={countryName}
                    className="object-cover w-full h-full"
                />
            )}
        </span>
    );
};

export default PhoneInput;
