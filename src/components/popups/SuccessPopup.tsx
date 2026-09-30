/**
 * Kept as the success-only name for `StatusPopup`, which is the same component with a
 * `status` prop (KP1-I124 generalised it so error alerts share the shell).
 *
 * Existing imports of `SuccessPopup` — the Customer create/edit confirmations and the
 * enquiry `AssignedSuccessPopup` from KP1-I112 — keep working unchanged. New code should
 * import `StatusPopup` directly.
 */
export { default, type StatusPopupProps as SuccessPopupProps } from './StatusPopup';
