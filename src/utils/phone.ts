/**
 * UAE phone validation.
 *
 * Hand-rolled rather than pulling in libphonenumber-js (~150 kB metadata): only
 * UAE numbers are format-checked. `PhoneInput` lets the user pick any country and
 * we hold no metadata for the rest, so foreign numbers are only checked for
 * presence, not rejected.
 *
 * Formats (national part, i.e. after +971 / a leading 0):
 *   Mobile   5X XXX XXXX  — 9 digits, operator prefixes 50/52/54/55/56/58
 *   Landline X XXX XXXX   — 8 digits, area codes 2 (AUH), 3 (Al Ain), 4 (DXB),
 *                           6 (SHJ/AJM/UAQ), 7 (RAK), 9 (FUJ)
 *
 * Usage in a zod schema:
 *   telNo:    requiredString('telNo').refine(isUaePhoneOrForeign,  { message: ... })
 *   mobileNo: requiredString('mobileNo').refine(isUaeMobileOrForeign, { message: ... })
 */

/** Operator prefixes in service: Etisalat 50/54/56, du 52/55/58. */
const UAE_MOBILE = /^5[024568]\d{7}$/;
const UAE_LANDLINE = /^[234679]\d{7}$/;

/** Strips +, spaces, dashes and brackets. */
const digitsOnly = (value: string) => value.replace(/\D/g, '');

/**
 * The number without its country code or trunk prefix, so "+971 50 123 4567",
 * "0501234567" and "501234567" all reduce to "501234567".
 */
export const nationalPart = (value: string): string => {
    const digits = digitsOnly(value);
    const withoutCountry = digits.startsWith('971') ? digits.slice(3) : digits;
    return withoutCountry.startsWith('0') ? withoutCountry.slice(1) : withoutCountry;
};

/** True when the number carries the UAE country code (+971). */
export const isUaeNumber = (value?: string): boolean =>
    !!value && digitsOnly(value).startsWith('971');

/** True for a valid UAE mobile number. */
export const isUaeMobile = (value?: string): boolean =>
    !!value && UAE_MOBILE.test(nationalPart(value));

/** True for a valid UAE mobile or landline number. */
export const isUaePhone = (value?: string): boolean => {
    if (!value) return false;
    const national = nationalPart(value);
    return UAE_MOBILE.test(national) || UAE_LANDLINE.test(national);
};

/** Passes unless the value is a UAE number that doesn't match the mobile format. */
export const isUaeMobileOrForeign = (value?: string): boolean =>
    !value || !isUaeNumber(value) || isUaeMobile(value);

/** Passes unless the value is a UAE number that is neither a valid mobile nor landline. */
export const isUaePhoneOrForeign = (value?: string): boolean =>
    !value || !isUaeNumber(value) || isUaePhone(value);
