import type { ClipboardEvent, KeyboardEvent } from 'react';

/**
 * A field that can never contain whitespace — an email address (KP1-I8).
 *
 * The ticket: the Username box on Login accepted a leading space, and the user only found
 * out later, from "Invalid email address." An address has no whitespace ANYWHERE, so the
 * field refuses it outright rather than trimming only the front.
 *
 * Why this is not "rewrite the value in onChange": the email fields are `type="email"`,
 * whose `value` the browser already trims while still DISPLAYING the space, and which has no
 * selection API — assigning the value on every keystroke would throw the caret to the end
 * whenever the user edits the middle of an address. So the space never gets in:
 *
 *  - `onKeyDown` drops the space key;
 *  - `onPaste` inserts the clipboard text with its whitespace removed, at the caret;
 *  - `setValueAs` strips whatever still slips through (autofill, IME) from the value the
 *    form validates and submits.
 *
 * Usage with react-hook-form:
 *
 *   <InputField type="email" {...register('email', NO_WHITESPACE_REGISTER)} {...noWhitespaceProps} />
 */
export const stripWhitespace = (value: unknown): string =>
    typeof value === 'string' ? value.replace(/\s+/g, '') : (value as string);

/** react-hook-form `register` options: the form's own copy of the value carries no whitespace. */
export const NO_WHITESPACE_REGISTER = { setValueAs: stripWhitespace } as const;

export const noWhitespaceProps = {
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === ' ' || event.key === 'Spacebar') event.preventDefault();
    },
    onPaste: (event: ClipboardEvent<HTMLInputElement>) => {
        const text = event.clipboardData.getData('text');
        const clean = stripWhitespace(text);
        if (clean === text) return;
        event.preventDefault();
        /* `insertText` keeps the caret and the undo stack, and fires the input event React
           listens for. It is deprecated but universally implemented; if a browser ever drops
           it, the fallback appends — and `setValueAs` still cleans the submitted value. */
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        if (!document.execCommand?.('insertText', false, clean)) {
            const input = event.currentTarget;
            input.value = stripWhitespace(input.value + clean);
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
    },
};
