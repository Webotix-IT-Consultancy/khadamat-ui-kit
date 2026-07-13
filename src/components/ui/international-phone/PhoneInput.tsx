import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import {
    defaultCountries,
    CountryIso2
} from "react-international-phone";

import { cn } from "@/lib/utils";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

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

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
    ({ className, onChange, value, label, required, error, defaultCountry = "ae", placeholder = "ex.5663 3723 323", ...props }, ref) => {

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



        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm text-foreground mb-1.5">
                        {label}
                        {required && <span className="text-destructive ml-1">*</span>}
                    </label>
                )}
                <div
                    className={cn(
                        "flex items-center rounded-10 border-2 border-primary bg-background h-[var(--input-large-height)] overflow-hidden",
                        "focus-within:ring-4 focus-within:ring-primary-light focus-within:border-primary",
                        error && "border-destructive focus-within:border-destructive focus-within:ring-destructive/30",
                        className
                    )}
                >
                    <CountrySelect
                        value={currentCountry}
                        onChange={handleCountryChange}
                        options={options}
                        selectedDialCode={selectedCountry?.dialCode || ""}
                    />

                    {/* Vertical Separator */}
                    <div className="h-6 w-px bg-gray-300 shrink-0" />

                    <input
                        ref={inputRef}
                        type="tel"
                        value={localPhone}
                        onChange={handlePhoneChange}
                        placeholder={placeholder}
                        className={cn(
                            "flex-1 h-full px-3 bg-transparent text-foreground placeholder:text-muted-foreground",
                            "outline-none border-0 focus:ring-0"
                        )}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="mt-1.5 text-xs text-destructive">{error}</p>
                )}
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
                        "hover:bg-accent/50 transition-colors outline-none focus:outline-none"
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
