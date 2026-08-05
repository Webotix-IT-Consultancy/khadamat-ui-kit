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
    const [firstToken] = (displayName || '').split(/\s+/);
    return firstToken.includes('@') ? firstToken.split('@')[0] : firstToken;
};
