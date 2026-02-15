import { useIsDialogOpen } from "@/contexts/KeyboardPaddingContext";

interface KeyboardSpacerProps {
  className?: string;
}

/**
 * A spacer component that adds padding when the keyboard is open.
 * Use this at the bottom of scrollable content in pages outside the main Layout.
 * Only renders padding when no dialog is open (dialogs handle their own padding via DialogBody).
 */
export function KeyboardSpacer({ className }: KeyboardSpacerProps) {
  const isDialogOpen = useIsDialogOpen();

  // Don't render if a dialog is open (dialog handles its own padding)
  if (isDialogOpen) return null;

  return (
    <div
      className={className}
      style={{
        height: "calc(env(safe-area-inset-bottom) + var(--kb, 0px))",
        transition: "height 0.2s ease-out",
      }}
      aria-hidden="true"
    />
  );
}
