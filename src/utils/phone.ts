/**
 * Phone validation for `PhoneInput`.
 *
 * KP1-I104: **use `isValidPhone` / `isValidMobile` (bottom of this file) for new work.**
 * `PhoneInput` lets the user pick ANY country and emits `+<dialCode><national>`, so only a
 * country-aware check can judge the value — and every portal that rolled its own bound
 * ("must be at least 10 digits") got it wrong, because that counted characters of
 * `+971501234567` rather than the 9 digits the UAE actually has.
 *
 * That capability costs the libphonenumber-js metadata this file was originally written to
 * avoid (~150 kB for `/max`, which is the variant needed to tell a mobile from a landline).
 * The trade was made deliberately: a validator that rejects a real customer's number, or
 * quotes a length no country has, is worse than the bytes.
 *
 * The UAE-only helpers below are kept for callers that genuinely mean "UAE format" and so
 * existing imports keep working.
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

import { parsePhoneNumberFromString } from 'libphonenumber-js/max';

/** Operator prefixes in service: Etisalat 50/54/56, du 52/55/58. */
const UAE_MOBILE = /^5[024568]\d{7}$/;
const UAE_LANDLINE = /^[234679]\d{7}$/;

/**
 * Example national numbers, for placeholders and help text — kept HERE, next to the
 * patterns that accept them, so an example can never contradict the rule that would
 * reject it. Both pass their regex above (KP1-I85: the PhoneInput placeholder used to
 * be an eleven-digit invention that matched neither).
 */
export const UAE_MOBILE_EXAMPLE = '501234567';
export const UAE_LANDLINE_EXAMPLE = '41234567';

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

/* ==========================================================================
 * Country-aware validation (KP1-I104) — prefer these.
 *
 * Same implementation the admin portal has used in `src/lib/phone.ts`, moved here so both
 * portals validate the shared `PhoneInput` identically instead of each inventing a rule.
 *
 * Empty passes, so these compose onto required and optional fields alike — required-ness
 * belongs to the schema, not here.
 * ======================================================================== */

/**
 * Default to AE for values stored without a country code (matching `PhoneInput`'s default
 * country); a value carrying `+<dialCode>` resolves to its own country.
 */
const parse = (value: string) => parsePhoneNumberFromString(value.trim(), 'AE');

/** Valid phone number (mobile OR landline) for its country. Empty passes. */
export const isValidPhone = (value?: string): boolean => {
    if (!value || !value.trim()) return true;
    const parsed = parse(value);
    return !!parsed && parsed.isValid();
};

/**
 * Valid MOBILE number for its country. Empty passes. Rejects only when the number is
 * positively a non-mobile line type (FIXED_LINE, TOLL_FREE, …); MOBILE,
 * FIXED_LINE_OR_MOBILE (e.g. US/CA) and an undetermined type all pass.
 */
export const isValidMobile = (value?: string): boolean => {
    if (!value || !value.trim()) return true;
    const parsed = parse(value);
    if (!parsed || !parsed.isValid()) return false;
    const type = parsed.getType();
    return type === 'MOBILE' || type === 'FIXED_LINE_OR_MOBILE' || type === undefined;
};
