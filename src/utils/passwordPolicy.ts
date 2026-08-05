/**
 * The password policy — ONE definition, shared by both portals.
 *
 * The rules are the server's, confirmed against `POST /auth/register` on the API rather than
 * taken from a design or a comment:
 *
 *   "" (8 chars)          -> "Passwords must be at least 12 characters."
 *   "abcdefghijkl"        -> missing uppercase, digit, special
 *   "ABCDEFGHIJKL"        -> missing lowercase, digit, special
 *   "Abcdefghijk1"        -> missing special
 *   "Abcdefghijk1!"       -> accepted
 *
 * So: **12 characters**, plus one uppercase, one lowercase, one digit and one special.
 *
 * Why this file exists: the minimum was written out by hand in nine places across the two
 * portals and disagreed with the server in every one of them — `min(8)` in five schemas, a
 * `length >= 8` checklist in three screens, and `min(6)` on the admin login. The screens
 * therefore told the user a 8-character password was acceptable, accepted it client-side,
 * and only then had it refused by the API. Both portals create passwords under the same
 * policy, so the policy belongs here and is imported, never restated.
 *
 * Deliberately zod-free: ui-kit does not depend on zod (the portals do). Each portal builds
 * its own schema from `PASSWORD_MIN_LENGTH` and these predicates, so there is still exactly
 * one number.
 */

/** Server minimum, verified against the API. Never hardcode this number anywhere else. */
export const PASSWORD_MIN_LENGTH = 12;

export interface PasswordRuleState {
    minLength: boolean;
    uppercase: boolean;
    lowercase: boolean;
    special: boolean;
    number: boolean;
}

/**
 * Which rules a candidate password currently satisfies — drives the live checklist under
 * the password field on every set/change-password screen in both portals.
 */
export const passwordRuleState = (value?: string): PasswordRuleState => {
    const password = value ?? '';
    return {
        minLength: password.length >= PASSWORD_MIN_LENGTH,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        special: /[^A-Za-z0-9]/.test(password),
        number: /[0-9]/.test(password),
    };
};

/** True when every rule passes. */
export const isPasswordValid = (value?: string): boolean =>
    Object.values(passwordRuleState(value)).every(Boolean);

/**
 * Checklist rows in the order the design lists them, paired with their key in the shared
 * `auth:setPassword.requirements.*` bundle. `minLength` takes a `{{count}}` interpolation —
 * pass `PASSWORD_MIN_LENGTH` — so the copy cannot drift from the rule again.
 */
export const PASSWORD_RULES: ReadonlyArray<{
    key: keyof PasswordRuleState;
    labelKey: string;
}> = [
    { key: 'minLength', labelKey: 'auth:setPassword.requirements.minLength' },
    { key: 'uppercase', labelKey: 'auth:setPassword.requirements.uppercase' },
    { key: 'lowercase', labelKey: 'auth:setPassword.requirements.lowercase' },
    { key: 'special', labelKey: 'auth:setPassword.requirements.special' },
    { key: 'number', labelKey: 'auth:setPassword.requirements.number' },
];
