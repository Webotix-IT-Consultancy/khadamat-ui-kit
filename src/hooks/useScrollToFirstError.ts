import { useEffect, type RefObject } from 'react';

/**
 * **After a rejected submit, scroll to the first invalid field and focus it** (KP1-I461).
 *
 * A validation message the user cannot see is the same as no message at all: long forms —
 * Contract, Customer, Mobilisation — are several screens tall, so a submit that fails on a
 * field near the top leaves the user staring at an unchanged page and a button that did
 * nothing. This is the other half of "server errors are inline, never a banner": the banner
 * used to be what told them something had failed.
 *
 * ```tsx
 * const formRef = useRef<HTMLDivElement>(null);
 * const [submitAttempt, setSubmitAttempt] = useState(0);
 *
 * // every rejected submit — client-side OR server-side — bumps the counter
 * useScrollToFirstError(formRef, submitAttempt);
 * ```
 *
 * ## Why a COUNTER and not a boolean
 *
 * The same field failing twice must scroll twice. A boolean `hasErrors` changes on the first
 * rejection and then stays `true`, so the second Save — identical errors, user has scrolled
 * away — moves nothing. Bump the counter on every rejected submit, including the server's.
 *
 * ## What it looks for
 *
 * The first `.validation-message` in DOM order, which is the topmost failing field: every
 * ui-kit input renders its message through `ValidationMessage`, `PhoneInput` included. The
 * extra selectors cover messages a form hand-rolls beside a control with no error slot (a
 * RadioGroup, a file row) — those carry the class too today, but would otherwise be one
 * refactor away from being skipped.
 *
 * Scrolling targets the message's PARENT — the field wrapper of label + control + message —
 * which frames better than the message alone.
 *
 * ## Two things that have to be true at the call site
 *
 *  - **A collapsed section holding an error must be forced open** (`forceOpen={hasError(…)}`),
 *    or the message is in the DOM but invisible and this scrolls to nothing the user can read.
 *  - **The ref must wrap the fields**, not the page: a `querySelector` from `document` could
 *    find a message in a popup rendered over the form.
 *
 * `preventScroll` on the focus call stops the browser's own focus jump from cancelling the
 * smooth scroll. A `<input type="file">` is `display:none` in `FileUpload` and cannot take
 * focus, so it is excluded — those fields scroll without focusing.
 */
export const useScrollToFirstError = (
    /** Wraps the form's fields. `HTMLElement` so a `<form>`, `<div>` or `<section>` all fit. */
    containerRef: RefObject<HTMLElement | null>,
    /** Bumped once per rejected submit. `0` means "nothing has been submitted yet". */
    submitAttempt: number,
    options?: {
        /** Extra selectors, appended to the defaults. Rarely needed — prefer the shared class. */
        selector?: string;
        /** Skip the focus call and only scroll. */
        scrollOnly?: boolean;
    },
): void => {
    const selector = options?.selector
        ? `.validation-message, p.text-destructive, ${options.selector}`
        : '.validation-message, p.text-destructive';
    const scrollOnly = options?.scrollOnly;

    useEffect(() => {
        if (!submitAttempt) return;

        const firstError = containerRef.current?.querySelector<HTMLElement>(selector);
        if (!firstError) return;

        const field = firstError.parentElement ?? firstError;
        field.scrollIntoView({ behavior: 'smooth', block: 'center' });

        if (scrollOnly) return;
        /*
         * `:not(:disabled)` matters on a form with read-only fields — the customer profile is
         * mostly disabled inputs. Without it the first match can be a field nothing can type
         * into, `focus()` quietly does nothing, and the editable control beside it never gets
         * the caret.
         */
        field
            .querySelector<HTMLElement>(
                'input:not([type="file"]):not([type="hidden"]):not(:disabled), textarea:not(:disabled)',
            )
            ?.focus({ preventScroll: true });
        // `containerRef` is a ref object — stable by definition; the counter is the trigger.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [submitAttempt, selector, scrollOnly]);
};

export default useScrollToFirstError;
