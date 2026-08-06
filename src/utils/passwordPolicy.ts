/**
 * The password policy — ONE definition, shared by both portals.
 *
 * **The rule: 8-12 characters, plus one uppercase, one lowercase, one digit and one special.**
 *
 * Why this file exists: the bounds were written out by hand in nine places across the two
 * portals and disagreed with each other in every one of them — `min(8)` in five schemas, a
 * `length >= 8` checklist in three screens, and `min(6)` on the admin login. Both portals
 * create passwords under the same policy, so the policy belongs here and is imported, never
 * restated. Change the two numbers below and every schema, checklist and message follows.
 *
 * ---
 * **Open question — the minimum contradicts what the deployed API was observed to do.**
 *
 * The minimum here was previously 12, recorded against a live probe of `POST /auth/register`:
 *
 *     ""  (8 chars)      -> "Passwords must be at least 12 characters."
 *     "Abcdefghijk1!"    -> accepted
 *
 * The legacy server source agrees with 8, not 12 — `MinimumLength(8)` in
 * `Khadamat_Wallet/Server/.../Validators/Accounts/SetPasswordRequestDtoValidator.cs`,
 * `ResetPasswordRequestDtoValidator.cs` and `InternalUserCreateRequestDtoValidator.cs` — so the
 * 12 most likely came from an ASP.NET Identity `PasswordOptions.RequiredLength` sitting in front
 * of FluentValidation on the deployed environment, not from the request validators.
 *
 * 8 is what the team specified, so 8 is what ships. But if the deployed API still enforces 12,
 * a 8-character password will pass here and be refused by the server — the exact failure this
 * file was created to prevent. **Re-probe the environment before release**, and if it still says
 * 12, raise `PASSWORD_MIN_LENGTH` here (only here) rather than in any consumer.
 *
 * No `MaximumLength` exists in the server validators at all, so the 12-character cap is a
 * client-side rule for now; the API will not reject a longer password.
 * ---
 *
 * Deliberately zod-free: ui-kit does not depend on zod (the portals do). Each portal builds
 * its own schema from these two constants and the predicates below, so there is still exactly
 * one number for each bound.
 */

/** Shortest accepted password. Never hardcode this number anywhere else. */
export const PASSWORD_MIN_LENGTH = 8;

/** Longest accepted password. Never hardcode this number anywhere else. */
export const PASSWORD_MAX_LENGTH = 12;

export interface PasswordRuleState {
    /**
     * The length bound — a RANGE, not a floor. Named `length` rather than the old `minLength`
     * on purpose: the rename makes every consumer of the old floor-only meaning a compile
     * error, so none can silently keep checking only the minimum.
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
        length:
            password.length >= PASSWORD_MIN_LENGTH && password.length <= PASSWORD_MAX_LENGTH,
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
 * `auth:setPassword.requirements.*` bundle. `length` takes `{{min}}` / `{{max}}` — pass
 * `PASSWORD_MIN_LENGTH` and `PASSWORD_MAX_LENGTH` — so the copy cannot drift from the rule.
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
