/**
 * The signed-in person's name, as the UI should show it (KP1-I151).
 *
 * Every caller used to hand-roll `user.companyName || 'User'`. The session user simply does
 * not have a `companyName` — `/auth/me` returns `fullName` / `firstName` / `lastName` /
 * `userName` / `email`, in BOTH portals — so that was not a fallback at all: it was the only
 * branch that ever ran, and every customer and every admin saw the generic label.
 *
 * First non-empty wins. `companyName` stays in the list so any caller that really does pass
 * one (the old mock session did) still works, but it sits behind the person's name rather
 * than in front of it.
 *
 * Returns '' when the server sent no name at all — the caller supplies the generic label.
 * The point is that a name the API DID send can no longer be missed, not that one is invented.
 */
export const resolveDisplayName = (user: any): string => {
    const candidates = [
        user?.fullName,
        [user?.firstName, user?.lastName].filter(Boolean).join(' '),
        user?.companyName,
        user?.contactName,
        user?.userName,
        user?.email,
    ];
    for (const candidate of candidates) {
        const value = typeof candidate === 'string' ? candidate.trim() : '';
        if (value) return value;
    }
    return '';
};

/**
 * One word, for a greeting. `userName` is set to the email address at registration, so the
 * resolved name can BE an email — take the part before the `@` rather than greeting someone
 * as "farhan@example.com".
 */
export const toFirstName = (displayName: string): string => {
    /*
     * `.trim()` first (KP1-I172): `' zoë'.split(/\s+/)` yields `['', 'zoë']`, so a name with
     * ANY leading whitespace returned the empty string — the greeting said "Welcome back"
     * followed by nothing, and `toInitial` below inherited the same blank. The server does
     * not promise trimmed names, and a padded one is not a missing one.
     */
    const [firstToken] = (displayName || '').trim().split(/\s+/);
    return firstToken.includes('@') ? firstToken.split('@')[0] : firstToken;
};

/**
 * The avatar letter (KP1-I172) — the first letter of the user's name, uppercased.
 *
 * Built on `toFirstName` so the letter is taken from the same word the header greets the
 * user by, and so an email-derived name gives `F` for "farhan@example.com" rather than the
 * `@` or the domain's initial.
 *
 * `Array.from` rather than `charAt(0)`: `charAt` returns ONE UTF-16 code unit, so a name
 * beginning with a character outside the BMP comes back as half a surrogate pair and renders
 * as a replacement glyph. Iterating yields whole code points.
 *
 * `toLocaleUpperCase()` is a no-op for scripts without case, so an Arabic name keeps its
 * letter unchanged instead of being mangled.
 *
 * Returns '' when there is no usable name — the caller decides what to show instead, rather
 * than this inventing a placeholder letter that looks like real data.
 */
export const toInitial = (displayName: string): string => {
    const firstName = toFirstName(displayName || '').trim();
    // Skip anything that isn't a letter or digit, so "  (Acme)" gives `A`, not `(`.
    const firstMeaningful = Array.from(firstName).find((character) => /[\p{L}\p{N}]/u.test(character));
    return (firstMeaningful ?? '').toLocaleUpperCase();
};
