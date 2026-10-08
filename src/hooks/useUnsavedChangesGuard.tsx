import React, { useCallback, useEffect, useRef } from 'react';
import { useBlocker } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ConfirmPopup from '../components/popups/ConfirmPopup';

/**
 * Warn before an edited form is left — by ANY route out, not only its own Cancel button.
 *
 * The long create/edit screens (Contract, Quotation, Customer, Enquiry, My Profile) asked
 * "Do you really want to exit this page?" from their Cancel / Back button — and from nothing
 * else. The sidebar, the browser's Back button, a refresh and closing the tab all discarded
 * the form silently; and the one confirm that did exist fired even when nothing had been
 * typed, which trained users to click through it.
 *
 * ```tsx
 * // in the FORM:  const { isDirty } = useFormDirty(formRef, formData); -> onDirtyChange(isDirty)
 * const [isDirty, setDirty] = useState(false);       // in the PAGE, fed by the form
 * const guard = useUnsavedChangesGuard(isDirty);
 *
 * const handleCancel = () => navigate('/contracts');  // just leave — the guard asks if needed
 * const handleSaved = () => { guard.allowNavigation(); navigate(`/contracts/${id}`); };
 *
 * return <>{form}{guard.dialog}</>;
 * ```
 *
 * - **In-app navigation** goes through React Router's `useBlocker`, which needs a DATA router
 *   (`createBrowserRouter`) — both portals' `main.tsx` provide one for this reason.
 * - **Refresh / close / typed URL** go through `beforeunload`, where the browser shows its own
 *   generic prompt (custom text has not been allowed for years).
 * - **`allowNavigation()` before a programmatic exit that is NOT a loss** — the redirect after a
 *   successful save. The form is still "dirty" at that moment (it differs from what was loaded),
 *   and without it the user would be asked to confirm leaving the record they just saved.
 * - Only a change of path or query blocks; a hash change or `replace` on the same screen
 *   (a tab, a filter) is not leaving it.
 */
export function useUnsavedChangesGuard(
    isDirty: boolean,
    options?: { title?: string; message?: string },
) {
    const { t } = useTranslation('common');
    const dirtyRef = useRef(isDirty);
    dirtyRef.current = isDirty;
    const bypassRef = useRef(false);

    const blocker = useBlocker(
        useCallback(
            ({ currentLocation, nextLocation }) =>
                dirtyRef.current &&
                !bypassRef.current &&
                (currentLocation.pathname !== nextLocation.pathname ||
                    currentLocation.search !== nextLocation.search),
            [],
        ),
    );

    useEffect(() => {
        if (!isDirty) return;
        const onBeforeUnload = (event: BeforeUnloadEvent) => {
            if (bypassRef.current) return;
            event.preventDefault();
            // Chrome still requires returnValue to be set for the prompt to appear.
            event.returnValue = '';
        };
        window.addEventListener('beforeunload', onBeforeUnload);
        return () => window.removeEventListener('beforeunload', onBeforeUnload);
    }, [isDirty]);

    /** Let the next navigation through without asking — call it right before a post-save redirect. */
    const allowNavigation = useCallback(() => {
        bypassRef.current = true;
    }, []);

    const dialog = (
        <ConfirmPopup
            open={blocker.state === 'blocked'}
            onClose={() => blocker.reset?.()}
            onConfirm={() => blocker.proceed?.()}
            title={options?.title ?? t('confirmLeave.title')}
            message={options?.message ?? t('confirmLeave.message')}
            confirmLabel={t('confirmLeave.yes')}
            cancelLabel={t('confirmLeave.no')}
        />
    );

    return { dialog, allowNavigation, isBlocked: blocker.state === 'blocked' };
}

/**
 * Whether the USER has changed a form — `value` compared with what it was the moment they
 * first touched it.
 *
 * Why the baseline is the first TOUCH, not the first render or "when the record loaded":
 * these forms keep adjusting their own state after mount — an edit screen's record arrives
 * asynchronously, a contract type locks its waste type, the signed-in executive's name lands
 * after `/auth/me` — and every one of those would read as an edit, so the guard would ask on
 * a form nobody had typed in. Nothing the user does can happen before they focus or press
 * something inside the form, so that instant is the honest "before".
 *
 * - `focusin` + `pointerdown`, captured on the form's root element (pass the ref the form
 *   already holds for `useScrollToFirstError`). A dropdown's options render in a portal, but
 *   opening it focused its input first, which is inside.
 * - Compared as JSON — right for plain form state. Changing a field and changing it back is
 *   NOT dirty.
 * - `reset()` forgets the baseline (re-taken on the next touch) — for a save that stays on
 *   the page.
 */
export function useFormDirty<T>(rootRef: React.RefObject<HTMLElement | null>, value: T) {
    const [baseline, setBaseline] = React.useState<string | null>(null);
    const serialized = safeStringify(value);
    const latest = useRef(serialized);
    latest.current = serialized;

    useEffect(() => {
        if (baseline !== null) return;
        /* Listened for on the DOCUMENT and tested for containment, rather than attached to the
           element: a page that early-returns a loading state mounts its form later, and an
           effect keyed on the ref object would never see the element arrive. */
        const take = (event: Event) => {
            if (rootRef.current?.contains(event.target as Node)) {
                setBaseline((prev) => prev ?? latest.current);
            }
        };
        document.addEventListener('focusin', take, true);
        document.addEventListener('pointerdown', take, true);
        return () => {
            document.removeEventListener('focusin', take, true);
            document.removeEventListener('pointerdown', take, true);
        };
    }, [rootRef, baseline]);

    const reset = useCallback(() => setBaseline(null), []);

    return { isDirty: baseline !== null && baseline !== serialized, reset };
}

const safeStringify = (value: unknown): string => {
    try {
        return JSON.stringify(value) ?? '';
    } catch {
        return '';
    }
};

export default useUnsavedChangesGuard;
