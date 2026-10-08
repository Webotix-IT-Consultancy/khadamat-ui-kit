import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * A list screen's state — page, page size, sort, tab, search, filters — held in the URL.
 *
 * Every list used to keep it in `useState` inside its hook, so opening a record and pressing
 * Back landed on page 1 of the default tab with the search box empty, and a refresh did the
 * same. A user working through filtered results re-applied the filter after every record they
 * looked at. With the state in the query string, Back, refresh and a pasted link all restore
 * the exact view.
 *
 * ```ts
 * const DEFAULTS = { page: 1, limit: 25, sortBy: 'createdOn', sortOrder: 'desc', search: '', status: 'all' };
 * const [state, setState] = useListUrlState(DEFAULTS);
 * state.page;                                   // number — typed from the default
 * setState({ status: 'live', page: 1 });        // a patch …
 * setState((prev) => ({ page: prev.page + 1 })); // … or an updater
 * ```
 *
 * - **Types come from the defaults.** A number default parses back as a number (an unparsable
 *   value falls back to the default); a string default stays a string. Values are flat — a
 *   filter state of strings and numbers, which is what every list here has.
 * - **Defaults are omitted from the URL**, so an untouched list keeps a clean `/contracts`.
 * - **`replace`, never push.** Typing a search must not leave one history entry per keystroke;
 *   Back from a record returns to the list URL it was opened from, which is the point.
 * - **The returned object is stable** while the URL is unchanged, so it can sit in a fetch
 *   effect's dependency list without re-running it every render.
 * - **Only keys named in the defaults are read or written.** Other query params on the same
 *   URL (`?renewFrom=`, `?enquiryNo=`) are left exactly as they are.
 * - **One list per URL.** Two lists on one screen would share these keys; give the second a
 *   `prefix` (`useListUrlState(defaults, 'inv')` → `inv.page`).
 */
export type ListUrlValue = string | number;

export function useListUrlState<T extends Record<string, ListUrlValue>>(defaults: T, prefix = '') {
    const [searchParams, setSearchParams] = useSearchParams();
    const defaultsRef = useRef(defaults);
    const keyOf = (name: string) => (prefix ? `${prefix}.${name}` : name);

    /** The URL -> typed state. Used for the render AND inside an updater, on the freshest URL. */
    const parse = (params: URLSearchParams): T => {
        const out: Record<string, ListUrlValue> = {};
        for (const [name, fallback] of Object.entries(defaultsRef.current)) {
            const raw = params.get(keyOf(name));
            if (raw === null) {
                out[name] = fallback;
            } else if (typeof fallback === 'number') {
                const n = Number(raw);
                out[name] = Number.isFinite(n) ? n : fallback;
            } else {
                out[name] = raw;
            }
        }
        return out as T;
    };

    const serialized = searchParams.toString();
    // `serialized` is the URL's identity; `searchParams` itself is a new object each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const state = useMemo(() => parse(searchParams), [serialized, prefix]);

    /*
     * Updates made in the SAME tick must compose. The list pages routinely do
     * `setFilters({ ...filters, status }); setPage(1);` — two calls before a re-render — and
     * React Router's own updater form hands both the params of the LAST RENDER, so the second
     * call would silently undo the first. `pending` carries what this hook has already asked for
     * until the URL actually reflects it (the effect drops it once the router has re-rendered).
     */
    const latestParams = useRef(searchParams);
    latestParams.current = searchParams;
    const pending = useRef<URLSearchParams | null>(null);
    useEffect(() => {
        pending.current = null;
    }, [serialized]);

    const setState = useCallback(
        (patch: Partial<T> | ((prev: T) => Partial<T>)) => {
            const base = pending.current ?? latestParams.current;
            const next = new URLSearchParams(base);
            const resolved = typeof patch === 'function' ? patch(parse(base)) : patch;
            for (const [name, value] of Object.entries(resolved)) {
                if (!(name in defaultsRef.current)) continue;
                const key = keyOf(name);
                const fallback = defaultsRef.current[name];
                // Only the DEFAULT is omitted. An empty string whose default is not empty is
                // kept (`?status=`), or it would read back as the default.
                if (value === undefined || value === null || value === fallback) {
                    next.delete(key);
                } else {
                    next.set(key, String(value));
                }
            }
            pending.current = next;
            setSearchParams(next, { replace: true });
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [setSearchParams, prefix],
    );

    return [state, setState] as const;
}

export default useListUrlState;
