/**
 * The password policy — ONE definition, shared by both portals.
 *
 * **The rule: at least 12 characters, plus one uppercase, one lowercase, one digit and one
 * special. There is NO maximum.**
 *
 * Why this file exists: the minimum was written out by hand in nine places across the two
 * portals and disagreed with the server in every one of them. Both portals create passwords
 * under the same policy, so the policy belongs here and is imported, never restated. Change
 * the one number below and every schema, checklist and message follows.
 *
 * ---
 * **The minimum is 12, and the API has two layers that disagree — read this before changing it.**
 *
 *   - The **request validator** (FluentValidation) says 8. Probed live: `POST /auth/register`
 *     with `Abc1!def` (8 chars) returns no password error at all.
 *   - **ASP.NET Identity** then applies `PasswordOptions.RequiredLength` inside the handler,
 *     after that validator passes, and it rejects with "Passwords must be at least 12
 *     characters." That is the layer the user actually hits.
 *
 * So the request validator's 8 is a floor the handler never lets you reach. The client must
 * use **12** — being stricter than the request validator is harmless; being laxer is what
 * produced the original defect, where the form accepted a password the API then refused.
 *
 * **No maximum.** Neither layer caps the length; a 38-character password is not rejected on
 * length. An earlier revision imposed a client-side cap of 12 (and a `maxLength` on the
 * inputs) — that was never a server rule and has been removed. See the note on KP1-I173 in
 * the workspace CLAUDE.md.
 * ---
 *
 * Deliberately zod-free: ui-kit does not depend on zod (the portals do). Each portal builds
 * its own schema from this constant and the predicates below, so there is exactly one number.
 */

/** Shortest accepted password. Never hardcode this number anywhere else. */
export const PASSWORD_MIN_LENGTH = 12;

export interface PasswordRuleState {
    /**
     * The length rule — a floor, with no upper bound.
     *
     * Still called `length` rather than `minLength`: it has been renamed once already (when a
     * maximum briefly existed) and a second rename would churn every consumer again for no
     * gain. "The length requirement" is accurate either way.
     */
    length: boolean;
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
        length: password.length >= PASSWORD_MIN_LENGTH,
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
 * `auth:setPassword.requirements.*` bundle. `length` takes `{{count}}` / `{{min}}` — pass
 * `PASSWORD_MIN_LENGTH` — so the copy cannot drift from the rule.
 */
export const PASSWORD_RULES: ReadonlyArray<{
    key: keyof PasswordRuleState;
    labelKey: string;
}> = [
    { key: 'length', labelKey: 'auth:setPassword.requirements.length' },
    { key: 'uppercase', labelKey: 'auth:setPassword.requirements.uppercase' },
    { key: 'lowercase', labelKey: 'auth:setPassword.requirements.lowercase' },
    { key: 'special', labelKey: 'auth:setPassword.requirements.special' },
    { key: 'number', labelKey: 'auth:setPassword.requirements.number' },
];
