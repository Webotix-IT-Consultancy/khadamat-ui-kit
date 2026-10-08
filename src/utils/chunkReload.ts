/**
 * Recovering from a route chunk that no longer exists — the post-deploy white screen.
 *
 * Every screen in both portals is a `React.lazy` chunk with a content hash in its file name.
 * A deploy replaces those files, so a tab opened BEFORE the deploy asks for a chunk that has
 * gone and the import rejects. Nothing caught that rejection, so React unmounted the app.
 *
 * Vite announces exactly this case as a `vite:preloadError` event on `window`. The fix is a
 * reload — the new `index.html` names the new chunks — done ONCE: a session-scoped stamp
 * stops a chunk that is genuinely missing (a broken deploy, offline) from reloading forever.
 * If it fails again inside the window, the event is left alone and the error boundary shows
 * its "a new version is available" panel instead, with a manual Reload.
 */

const STAMP_KEY = 'khadamat:chunk-reload-at';
/** A second failure within this window is treated as real, not stale. */
const RELOAD_WINDOW_MS = 30_000;

/** True for the errors a missing or stale dynamic-import chunk produces, across browsers. */
export const isChunkLoadError = (error: unknown): boolean => {
    const text = `${(error as any)?.name ?? ''} ${(error as any)?.message ?? error ?? ''}`;
    return /ChunkLoadError|Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS/i.test(
        text,
    );
};

/** Reloads once per window; answers whether it did. */
export const reloadOnceForStaleChunk = (): boolean => {
    try {
        const last = Number(sessionStorage.getItem(STAMP_KEY)) || 0;
        if (Date.now() - last < RELOAD_WINDOW_MS) return false;
        sessionStorage.setItem(STAMP_KEY, String(Date.now()));
    } catch {
        /* Storage blocked: without the stamp there is no loop guard, so do NOT reload —
           the error boundary's panel offers a manual Reload instead. */
        return false;
    }
    window.location.reload();
    return true;
};

/** Call once from `main.tsx`, before the app renders. */
export const installChunkReloadGuard = (): void => {
    window.addEventListener('vite:preloadError', (event) => {
        if (reloadOnceForStaleChunk()) event.preventDefault();
    });
};
