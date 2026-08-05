import { useCallback, useEffect, useId, useState } from 'react';

/**
 * KP1-I77: at most ONE date/time picker popup may be open at a time, anywhere in the app.
 *
 * MUI X normally guarantees this on its own: an open picker's popper registers a
 * click-away listener on `document`, so the click that opens a second picker closes the
 * first. That guarantee is only as good as the click actually reaching `document` — and
 * it did not in the Enquiry filter panel, which wrapped the panel in
 * `<div onClick={e => e.stopPropagation()}>` to stop backdrop clicks from closing it.
 * React's synthetic `stopPropagation()` calls `stopPropagation()` on the NATIVE event too,
 * and React 18 listens on the root container (`#root`), i.e. BELOW `document` — so every
 * click inside such a panel died at the root and no picker ever saw a click-away. Both
 * date fields could sit open on top of each other.
 *
 * Those wrappers are fixed at the call sites, but "the fix depends on nobody ever writing
 * a stopPropagation wrapper again" is not a fix. This hook makes exclusivity a property of
 * the pickers themselves: each one drives MUI's controlled `open`/`onOpen`/`onClose`, and
 * opening one closes the incumbent directly through the registry below — no DOM events
 * involved, so no host layout or event handler can defeat it.
 *
 * Deliberately module-level rather than a React context: pickers live in ui-kit and are
 * dropped into forms, panels and portaled poppers across two portals with no common
 * provider, and the invariant is global anyway ("one popup on screen").
 */

/** The picker allowed to be open right now; `null` when every picker is closed. */
let activePickerId: string | null = null;

/** Every mounted picker's setter, so opening one can close the incumbent. */
const setters = new Map<string, (open: boolean) => void>();

export interface ExclusivePickerState {
    /** Pass to the MUI picker's `open` prop. */
    open: boolean;
    /** Pass to `onOpen`: claims the slot and closes whichever picker held it. */
    onOpen: () => void;
    /** Pass to `onClose`: MUI calls it on select, Escape, and click-away. */
    onClose: () => void;
}

const useExclusivePicker = (): ExclusivePickerState => {
    const id = useId();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setters.set(id, setOpen);
        return () => {
            setters.delete(id);
            // An unmounting picker must not keep the slot, or the next one to open would
            // try to close a component that no longer exists (filter panels unmount whole).
            if (activePickerId === id) {
                activePickerId = null;
            }
        };
    }, [id]);

    const onOpen = useCallback(() => {
        if (activePickerId !== null && activePickerId !== id) {
            setters.get(activePickerId)?.(false);
        }
        activePickerId = id;
        setOpen(true);
    }, [id]);

    const onClose = useCallback(() => {
        if (activePickerId === id) {
            activePickerId = null;
        }
        setOpen(false);
    }, [id]);

    return { open, onOpen, onClose };
};

export default useExclusivePicker;
