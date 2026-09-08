import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "../../lib/utils"

/**
 * What `SheetContent` needs to know about its own root but Radix does not expose: whether the
 * dialog is modal, and how to close it.
 *
 * `Dialog` keeps both in an internal context with a private scope, so a consumer of the
 * primitive cannot read them. Mirroring them here is what lets `SheetContent` render the
 * right overlay for the mode it is in — see `SheetOverlay`.
 */
interface SheetContextValue {
    modal: boolean
    close: () => void
}

const SheetContext = React.createContext<SheetContextValue>({ modal: true, close: () => { } })

/**
 * The sheet root. A thin wrapper over `Dialog.Root` that also publishes `modal` and a close
 * callback to the content below it; every prop is forwarded, so it behaves exactly as the
 * primitive did.
 */
const Sheet = ({
    modal = true,
    onOpenChange,
    children,
    ...props
}: React.ComponentPropsWithoutRef<typeof SheetPrimitive.Root>) => {
    const close = React.useCallback(() => onOpenChange?.(false), [onOpenChange])
    const value = React.useMemo<SheetContextValue>(() => ({ modal, close }), [modal, close])

    return (
        <SheetContext.Provider value={value}>
            <SheetPrimitive.Root modal={modal} onOpenChange={onOpenChange} {...props}>
                {children}
            </SheetPrimitive.Root>
        </SheetContext.Provider>
    )
}
Sheet.displayName = "Sheet"

const SheetTrigger = SheetPrimitive.Trigger

const SheetClose = SheetPrimitive.Close

const SheetPortal = SheetPrimitive.Portal

/** The dimmed backdrop, shared by both overlays below so they cannot drift apart. */
const OVERLAY_CLASS =
    "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"

/**
 * The MODAL backdrop — `Dialog.Overlay`, which also carries Radix's scroll lock
 * (`RemoveScroll`, sharded to the content) and its outside-pointer blocking.
 *
 * **It renders `null` whenever the root is `modal={false}`** — that is Radix's own
 * implementation (`return context.modal ? <Presence>…</Presence> : null`), not a
 * configuration. Every create drawer in both portals is non-modal (a Radix modal locks
 * pointer events to its own subtree, which kills the MUI `ConfirmPopup` they portal to
 * `body`), so all four rendered NO backdrop at all and the page behind stayed fully visible.
 * `SheetNonModalOverlay` is what covers that case.
 */
const SheetOverlay = React.forwardRef<
    React.ElementRef<typeof SheetPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
    <SheetPrimitive.Overlay className={cn(OVERLAY_CLASS, className)} {...props} ref={ref} />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

/**
 * The NON-MODAL backdrop: the same dimmed surface, as a plain element, and clicking it closes
 * the sheet.
 *
 * **Why a click handler here rather than Radix's `onPointerDownOutside` on the content.**
 * That callback fires for a pointerdown anywhere outside the content's subtree — INCLUDING
 * inside another layer portalled to `body`, such as the MUI `ConfirmPopup` these drawers
 * raise on cancel. Pressing its "No" therefore counted as an outside click and re-closed the
 * sheet, re-raising the very confirm the click was dismissing; the button appeared dead. That
 * is why all four drawers `preventDefault()` both outside callbacks, and why they must keep
 * doing so.
 *
 * An overlay CLICK cannot make that mistake: it only fires when the overlay is itself the
 * event target, and any portalled dialog paints above it (MUI's is z-index 1300 against this
 * z-50), so a click meant for the confirm never reaches here.
 *
 * Closing goes through the root's `onOpenChange(false)` — the same path as the X button and
 * Esc — so a drawer that intercepts it to ask "discard your changes?" keeps its single exit,
 * and one that does not simply closes.
 */
const SheetNonModalOverlay = ({ className }: { className?: string }) => {
    const { close } = React.useContext(SheetContext)
    return <div aria-hidden data-state="open" className={cn(OVERLAY_CLASS, className)} onClick={close} />
}
SheetNonModalOverlay.displayName = "SheetNonModalOverlay"

const sheetVariants = cva(
    "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
    {
        variants: {
            side: {
                top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
                bottom:
                    "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
                left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
                right:
                    "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
            },
        },
        defaultVariants: {
            side: "right",
        },
    }
)

const sheetSizeClasses = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-xl",
    lg: "sm:max-w-3xl",
    xl: "sm:max-w-5xl",
} as const

type SheetSize = keyof typeof sheetSizeClasses

interface SheetContentProps
    extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
    /** Controls the max-width of left/right sheets. Ignored for top/bottom. @default undefined (uses side variant default) */
    size?: SheetSize
}

const SheetContent = React.forwardRef<
    React.ElementRef<typeof SheetPrimitive.Content>,
    SheetContentProps
>(({ side = "right", size, className, children, ...props }, ref) => {
    /*
     * Exactly ONE backdrop, whichever mode the root is in: `SheetOverlay` would render
     * nothing when non-modal, and rendering both when modal would darken the page twice.
     */
    const { modal } = React.useContext(SheetContext)

    return (
        <SheetPortal>
            {modal ? <SheetOverlay /> : <SheetNonModalOverlay />}
            <SheetPrimitive.Content
                ref={ref}
                className={cn(sheetVariants({ side }), size && sheetSizeClasses[size], className)}
                {...props}
            >
                {children}
                <SheetPrimitive.Close className="absolute right-4 top-4 btn btn-primary data-[state=open]:bg-secondary">
                    <X className="w-5 h-5" />
                    <span className="sr-only">Close</span>
                </SheetPrimitive.Close>
            </SheetPrimitive.Content>
        </SheetPortal>
    )
})
SheetContent.displayName = SheetPrimitive.Content.displayName

const SheetHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col space-y-2 text-center sm:text-left",
            className
        )}
        {...props}
    />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
            className
        )}
        {...props}
    />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef<
    React.ElementRef<typeof SheetPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
    <SheetPrimitive.Title
        ref={ref}
        className={cn("text-lg font-semibold text-foreground", className)}
        {...props}
    />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

const SheetDescription = React.forwardRef<
    React.ElementRef<typeof SheetPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
    <SheetPrimitive.Description
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
))
SheetDescription.displayName = SheetPrimitive.Description.displayName

export {
    Sheet,
    SheetPortal,
    SheetOverlay,
    SheetNonModalOverlay,
    SheetTrigger,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetFooter,
    SheetTitle,
    SheetDescription,
}

export type { SheetSize }
