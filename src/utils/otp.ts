/**
 * OTP timing, shared by both portals (KP1-I144).
 *
 * There is exactly ONE countdown on an OTP screen and it is the RESEND COOLDOWN — how long
 * until a new code can be requested. It is not the code's expiry: the API tells us when a
 * code stops working only by refusing it, so a front end that counts down to an expiry is
 * inventing a deadline it does not know.
 *
 * The customer screen used to do exactly that ("Please enter the code within 10 minutes",
 * over a "Time remaining" countdown seeded from the API's `expiresInSeconds`), while its
 * Resend button ignored the countdown entirely and stayed clickable throughout — so the
 * screen told the user to wait and then let them not wait. The admin screen had already been
 * reduced to the cooldown alone; this makes the two agree and keeps the number in one place.
 */

/**
 * How long Resend OTP stays disabled after a code is sent.
 *
 * KP1-I143 specifies 60 seconds ("Resend OTP should be disabled for 60 seconds", counting
 * down from `00:59`). It was 30 here, inherited from the admin screen's earlier fix, so
 * BOTH portals move to 60 — which is the point of the value living in one place.
 *
 * Erring long is the safe direction: a client cooldown SHORTER than the server's throttle
 * re-enables the button while the API is still refusing, which reads to the user as a broken
 * Resend. Longer only means waiting a little past the moment the server would have allowed it.
 */
export const RESEND_COOLDOWN_SECONDS = 60;

/** `95` -> `01:35`. Zero-padded mm:ss, the format both screens display. */
export const formatCountdown = (seconds: number): string => {
    const safe = Math.max(0, Math.floor(seconds || 0));
    const mins = Math.floor(safe / 60);
    const secs = safe % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
