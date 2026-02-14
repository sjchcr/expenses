import { useKeyboardPadding } from "@/contexts/KeyboardPaddingContext";

export function KeyboardSpacer() {
  const { paddingBottom } = useKeyboardPadding("page");

  if (!paddingBottom) return null;

  return (
    <div
      className="shrink-0 transition-all duration-200"
      style={{ height: paddingBottom }}
      aria-hidden="true"
    />
  );
}
