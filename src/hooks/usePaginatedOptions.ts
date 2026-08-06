/**
 * Server-paged, server-searched source for a searchable dropdown (`MUIAutocomplete`).
 *
 * WHY THIS EXISTS
 * ---------------
 * Every dropdown backed by a real list endpoint used to load the WHOLE table up front —
 * `PageSize: 200`, or a walk of 25 pages of 100 — before the form could be used. That is
 * slow, and worse, it is silently WRONG past the cap: account 201 simply did not exist as
 * far as the form was concerned.
 *
 * This hook loads **one page at a time (25 by default)**, appends the next page when the
 * listbox is scrolled to the bottom, and re-queries the API — not the loaded page — when the
 * user types. The API is the filter, so a match anywhere in the table is findable.
 *
 * Use it ONLY for endpoints that actually page. The .NET API splits cleanly in two
 * (verified against Swagger):
 *
 *   - `PageNumber`/`PageSize`/`SearchTerm` — /customers, /enquiries, /contracts, /quotations,
 *     /users, /files, /notifications, /pricing/*  -> this hook.
 *   - No query parameters at all, one bare array — /areas, /bin-sizes, /waste-types,
 *     /contract-periods, /credit-days, /credit-limits, /disposal-sites, /supervisors,
 *     /roles, /masters/{groupCode}  -> keep loading them as one array and pass it to
 *     `MUIAutocomplete` as plain `options`; that component windows a static list 25 rows at
 *     a time on its own. Paging those client-side here would only add a wrapper.
 *
 * SHAPE CONTRACT
 * --------------
 * The fetcher returns the options for ONE page, and optionally the raw rows behind them
 * (`rows[i]` must line up with `options[i]`). Rows are accumulated across every page and
 * search the user has seen, so a caller can still resolve the FK / code behind a selection
 * (`getRow(value)`) exactly as it used to from the fully-loaded array.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export const DEFAULT_OPTION_PAGE_SIZE = 25;

export interface PaginatedOption {
    label: string;
    value: string | number;
    /** Second line in the dropdown (a code, a reference…). */
    description?: string;
}

export interface OptionPage<TRow = unknown> {
    options: PaginatedOption[];
    /** Omit and it is inferred from `total`, else from a short page. */
    hasMore?: boolean;
    total?: number;
    /** Raw rows for this page, index-aligned with `options`. */
    rows?: TRow[];
}

export interface OptionQuery {
    /** 1-based, matching the API's `PageNumber`. */
    page: number;
    pageSize: number;
    /** Trimmed; '' when the user has typed nothing. */
    search: string;
    signal: AbortSignal;
}

export type OptionPageFetcher<TRow = unknown> = (
    query: OptionQuery,
) => Promise<OptionPage<TRow> | PaginatedOption[]>;

export interface UsePaginatedOptionsConfig {
    pageSize?: number;
    /** Keystroke debounce before the search request goes out. */
    debounceMs?: number;
    /** false holds every request — for a dropdown whose dependency isn't chosen yet. */
    enabled?: boolean;
    /** Load page 1 on mount instead of on first open. Default: on first open. */
    eager?: boolean;
    /** Re-runs page 1 when any value changes (e.g. the active contract type). */
    deps?: unknown[];
    onError?: (error: unknown) => void;
}

export interface PaginatedOptionsSource<TRow = unknown> {
    /** Marks this object to `MUIAutocomplete` as a server source. */
    readonly serverSide: true;
    /** Everything loaded so far for the current search, plus any pinned selection. */
    options: PaginatedOption[];
    loading: boolean;
    loadingMore: boolean;
    hasMore: boolean;
    total?: number;
    /** The search term currently applied on the server. */
    search: string;
    /** Raw row behind a value — from ANY page seen this session, not just the visible one. */
    getRow: (value: string | number | null | undefined) => TRow | undefined;
    /** Every raw row loaded so far, in load order. */
    rows: TRow[];
    onOpen: () => void;
    onClose: () => void;
    onSearch: (text: string) => void;
    loadMore: () => void;
    /**
     * Keep an option selectable/visible even when it is not in the current page — the saved
     * value in edit mode, or the user's own choice after they type a new search.
     */
    pin: (option: PaginatedOption | null | undefined) => void;
    /** Drop everything loaded and re-run page 1 (pins survive). */
    reload: () => void;
}

const keyOf = (value: string | number) => `${typeof value}:${value}`;

export function usePaginatedOptions<TRow = unknown>(
    fetchPage: OptionPageFetcher<TRow>,
    config: UsePaginatedOptionsConfig = {},
): PaginatedOptionsSource<TRow> {
    const {
        pageSize = DEFAULT_OPTION_PAGE_SIZE,
        debounceMs = 350,
        enabled = true,
        eager = false,
        deps = [],
        onError,
    } = config;

    const [options, setOptions] = useState<PaginatedOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [total, setTotal] = useState<number | undefined>(undefined);
    const [search, setSearch] = useState('');
    // Pins live in a ref (they must survive every reload) and are mirrored into state only
    // to re-render; `pinTick` is that mirror.
    const [pinTick, setPinTick] = useState(0);

    // The fetcher is usually an inline arrow, so it changes identity on every render. Held
    // in a ref, it can be called by stable callbacks without re-creating them (and without
    // an effect loop) — the same reason the flags below are refs.
    const fetchRef = useRef(fetchPage);
    fetchRef.current = fetchPage;
    const onErrorRef = useRef(onError);
    onErrorRef.current = onError;

    const enabledRef = useRef(enabled);
    enabledRef.current = enabled;

    const pageRef = useRef(1);
    const searchRef = useRef('');
    /** A load has been kicked off — what stops a second open re-fetching page 1. */
    const requestedRef = useRef(false);
    /** A response has actually landed. */
    const loadedRef = useRef(false);
    const staleSearchRef = useRef(false);
    const requestRef = useRef(0);
    const abortRef = useRef<AbortController | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const mountedRef = useRef(true);
    const rowsRef = useRef<Map<string, TRow>>(new Map());
    const pinnedRef = useRef<Map<string, PaginatedOption>>(new Map());
    /** Mirror of `options`, so an appended page can be merged without a stale closure. */
    const optionsRef = useRef<PaginatedOption[]>([]);

    /**
     * `mountedRef` MUST be re-armed here, not just cleared in the cleanup.
     *
     * React 18 StrictMode mounts, runs the cleanup, and mounts again — with the SAME refs.
     * Setting the flag only in the cleanup therefore left it `false` for the rest of the
     * component's life in dev, and every response was dropped by the `mountedRef.current`
     * guard in `load`: the request went out and appeared in the network tab, the rows came
     * back, and the dropdown stayed empty. Combined with the "already requested" flag, it
     * never even retried.
     */
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            abortRef.current?.abort();
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    const load = useCallback(
        async (page: number, term: string, append: boolean) => {
            if (!enabledRef.current) return;

            // One request in flight at a time: a slow page 1 must never land on top of the
            // page 1 of a newer search. `requestRef` guards the same race for responses that
            // resolve after the abort (axios adapters don't all honour the signal).
            abortRef.current?.abort();
            const controller = new AbortController();
            abortRef.current = controller;
            const requestId = ++requestRef.current;

            pageRef.current = page;
            searchRef.current = term;
            requestedRef.current = true;
            if (append) setLoadingMore(true);
            else setLoading(true);

            try {
                const result = await fetchRef.current({ page, pageSize, search: term, signal: controller.signal });
                if (!mountedRef.current || requestId !== requestRef.current) return;

                const pageResult: OptionPage<TRow> = Array.isArray(result) ? { options: result } : result;
                const pageOptions = pageResult.options ?? [];

                if (pageResult.rows) {
                    pageResult.rows.forEach((row, index) => {
                        const option = pageOptions[index];
                        if (option) rowsRef.current.set(keyOf(option.value), row);
                    });
                }

                // Merged against a ref rather than inside the updater: `hasMore` below needs
                // the new length NOW, and with one request in flight at a time the ref is
                // exactly the list on screen.
                const seen = new Set(optionsRef.current.map((o) => keyOf(o.value)));
                const merged = append
                    ? [...optionsRef.current, ...pageOptions.filter((o) => !seen.has(keyOf(o.value)))]
                    : pageOptions;
                optionsRef.current = merged;
                loadedRef.current = true;

                setTotal(pageResult.total);
                setOptions(merged);
                // A page shorter than asked for is the last one. `hasMore` from the API wins
                // where it sends one (`PaginatedList.hasNextPage`); `total` is the next best.
                setHasMore(
                    pageResult.hasMore ??
                        (pageResult.total != null
                            ? merged.length < pageResult.total
                            : pageOptions.length >= pageSize),
                );
            } catch (error) {
                if (!mountedRef.current || requestId !== requestRef.current || controller.signal.aborted) return;
                // A failed page must not look like "the end of a list that loaded fine":
                // the options already shown stay, and the scroll simply stops asking.
                setHasMore(false);
                // Reopening retries rather than showing an empty list for good — a first
                // page that failed is the one case where re-fetching is exactly right.
                if (!append) requestedRef.current = false;
                onErrorRef.current?.(error);
            } finally {
                if (mountedRef.current && requestId === requestRef.current) {
                    setLoading(false);
                    setLoadingMore(false);
                }
            }
        },
        // `options.length` is read for the hasMore inference only; taking it as a dep would
        // rebuild this callback on every page. The append branch recomputes from `previous`.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [pageSize],
    );

    const reload = useCallback(() => {
        setSearch('');
        load(1, '', false);
    }, [load]);

    // Page 1 up front when asked for, and again whenever a dependency changes — but only
    // when something was already requested, so a lazy dropdown stays lazy.
    useEffect(() => {
        if (!enabled) return;
        if (eager || requestedRef.current) {
            setSearch('');
            load(1, '', false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, eager, load, ...deps]);

    const onOpen = useCallback(() => {
        if (!enabledRef.current) return;
        // Reopening after a search shows the unfiltered first page again — the input is
        // empty at that point, so a filtered list would not say what it was filtered by.
        if (!requestedRef.current || staleSearchRef.current) {
            staleSearchRef.current = false;
            setSearch('');
            load(1, '', false);
        }
    }, [load]);

    const onClose = useCallback(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        // Deferred to the next open rather than fired here: closing after a pick shouldn't
        // cost a request the user will never see the result of.
        if (searchRef.current) staleSearchRef.current = true;
    }, []);

    const onSearch = useCallback(
        (text: string) => {
            const term = text.trim();
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
                if (!mountedRef.current) return;
                if (term === searchRef.current && loadedRef.current) return;
                staleSearchRef.current = false;
                setSearch(term);
                load(1, term, false);
            }, debounceMs);
        },
        [debounceMs, load],
    );

    const loadMore = useCallback(() => {
        if (!hasMore || loading || loadingMore) return;
        load(pageRef.current + 1, searchRef.current, true);
    }, [hasMore, loading, loadingMore, load]);

    const pin = useCallback((option: PaginatedOption | null | undefined) => {
        if (!option || option.value === '' || option.value == null) return;
        const key = keyOf(option.value);
        if (pinnedRef.current.get(key)?.label === option.label) return;
        pinnedRef.current.set(key, option);
        setPinTick((n) => n + 1);
    }, []);

    const getRow = useCallback(
        (value: string | number | null | undefined) =>
            value == null || value === '' ? undefined : rowsRef.current.get(keyOf(value)),
        [],
    );

    /**
     * Pinned options are prepended only when the current page doesn't already carry them,
     * so the selected row stays selectable after the list moves on — without it MUI shows a
     * blank input the moment the user types a search that excludes their own choice.
     */
    const visibleOptions = useMemo(() => {
        if (!pinnedRef.current.size) return options;
        const present = new Set(options.map((o) => keyOf(o.value)));
        const missing = [...pinnedRef.current.values()].filter((o) => !present.has(keyOf(o.value)));
        return missing.length ? [...missing, ...options] : options;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [options, pinTick]);

    const rows = useMemo(() => [...rowsRef.current.values()], [options, pinTick]);

    return {
        serverSide: true,
        options: visibleOptions,
        loading,
        loadingMore,
        hasMore,
        total,
        search,
        rows,
        getRow,
        onOpen,
        onClose,
        onSearch,
        loadMore,
        pin,
        reload,
    };
}

export default usePaginatedOptions;
