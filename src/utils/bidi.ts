/**
 * Which direction a run of user text reads in — KP1-I195 / KP1-I200.
 *
 * A listing cell is clipped with `text-overflow: ellipsis`, and the ellipsis is placed at the
 * END of the block's inline base direction. Get that direction wrong and the truncation eats
 * the BEGINNING of the sentence: the Arabic Enquiries list showed `…f Skips: 1 | Skip Size: 8
 * CBM`, and the admin Enquiries list showed an Arabic description clipped on its right-hand
 * side, which is where an Arabic reader starts.
 *
 * Both portals need this and neither owns it, so it lives here rather than in `TablePrimary` —
 * the admin portal's `capped()` formatter clips inside its own `<span>` and has to make the same
 * decision. Two copies of this rule is how the two surfaces came to disagree in the first place.
 *
 * ## The rule: the DOMINANT script, not the first strong character
 *
 * CSS can already do content-derived direction — `unicode-bidi: plaintext` — but it answers with
 * UAX #9 P2: whichever strong character comes first. That is right for a value written in one
 * script and wrong for the mixed values these columns actually hold. An enquiry description that
 * is four-fifths Arabic but opens with a Latin fragment (`No. of Skips: 1 — طلب سكيب…`) resolves
 * LTR off that `N` and truncates at its right-hand end. Counting letters settles all four cases:
 *
 * | value                             | direction | ellipsis |
 * |-----------------------------------|-----------|----------|
 * | Arabic                            | rtl       | left     |
 * | English                           | ltr       | right    |
 * | mostly Arabic, opening in English | rtl       | left     |
 * | mostly English, opening in Arabic | ltr       | right    |
 *
 * Row two is KP1-I195 and must not move: an English run truncated on the left hides the start of
 * the sentence. KP1-I195 and KP1-I200 read as opposites only until the value's own script decides.
 *
 * ## How it is applied: a mark, never `direction`
 *
 * `withTextDirection` prepends a zero-width bidi mark, which `unicode-bidi: plaintext` then reads
 * as the paragraph's first strong character. **Do not set `direction` on the element instead.**
 * `direction` is what `text-align: start` resolves against — KP1-I195 needs that to stay the
 * PAGE's, so every value sits under its own header — and what `inset-inline-end` pins the sticky
 * Action column by (KP1-I50), and what orders the row-action button flex. The mark moves the
 * paragraph and touches none of it.
 *
 * The marks render nothing but they DO reach `textContent`, so anything reading a cell back
 * strips them with `stripBidiMarks` — a tooltip must show the value, not our plumbing.
 *
 * ## This file is for DISPLAY. A field uses `dir="auto"` instead.
 *
 * `InputField`, `TextArea`, the list search box and `MUIAutocomplete`'s input all carry
 * `dir="auto"` and do NOT call anything here. The split is deliberate, and both halves are
 * KP1-I200:
 *
 * | surface                       | mechanism                | why                            |
 * |-------------------------------|--------------------------|--------------------------------|
 * | a clipped cell / `capped()`   | dominant script + a mark | the value is FINISHED, so counting its letters is stable, and the mark is the only way to move the paragraph without touching `direction` |
 * | an input, a textarea, a view field | `dir="auto"`        | the value changes on every keystroke, and a direction that flipped once the Arabic outweighed the Latin would move the caret out from under the user mid-word |
 *
 * **Never prepend a mark to a field's value.** These marks are characters: in a `<td>` that is
 * invisible plumbing, in an `<input>` it is part of what gets submitted.
 *
 * A read-only view field (`DetailField`, the disabled textareas on the view screens) is an input
 * element too, so it follows the field rule — there is no ellipsis there to place, only reading
 * order and alignment, which `dir="auto"` settles.
 */

export type TextDirection = 'rtl' | 'ltr';

const ANY_LETTER = /\p{L}/gu;
const RTL_LETTER = /[\p{Script=Arabic}\p{Script=Hebrew}\p{Script=Syriac}\p{Script=Thaana}]/gu;

/** RIGHT-TO-LEFT MARK / LEFT-TO-RIGHT MARK — zero-width, strong, invisible. */
export const BIDI_MARK: Record<TextDirection, string> = { rtl: '‏', ltr: '‎' };

/**
 * The direction `text` reads in, or `null` when it contains no letters at all.
 *
 * `null` is not "left-to-right" — it means **nothing to decide**, and the caller must leave the
 * element's inherited direction alone. A `-` placeholder, a serial number, `+971 52…` and
 * `25.13, 55.23` are bidi-NEUTRALS; UAX #9 P3 would default them to LTR and drag a column of
 * dashes to the far side of its own header for no gain. Their reading order is handled where it
 * actually matters, by `dir="ltr"` on the value (KP1-I238).
 */
export const dominantTextDirection = (text: string): TextDirection | null => {
    const letters = text.match(ANY_LETTER)?.length ?? 0;
    if (!letters) return null;
    const rtl = text.match(RTL_LETTER)?.length ?? 0;
    // Strictly more than half, so a tie falls to LTR — the same way UAX #9 P3 breaks one.
    return rtl * 2 > letters ? 'rtl' : 'ltr';
};

/**
 * `text` with the mark that makes `unicode-bidi: plaintext` resolve to its dominant script.
 *
 * Returns the text unchanged when there is nothing to decide, so a caller can apply it
 * unconditionally. **The element it is rendered into must carry `unicode-bidi: plaintext`** —
 * without it the mark is an ordinary character and the paragraph direction never moves.
 */
export const withTextDirection = (text: string): string => {
    const direction = dominantTextDirection(text);
    return direction ? `${BIDI_MARK[direction]}${text}` : text;
};

/** A rendered string as a human reads it — without the marks `withTextDirection` added. */
export const stripBidiMarks = (value: string): string => value.replace(/[‎‏]/g, '').trim();
