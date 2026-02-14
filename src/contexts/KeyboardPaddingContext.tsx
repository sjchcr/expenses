import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useKeyboard } from "@/hooks/useKeyboard";

interface KeyboardPaddingContextType {
  isDialogOpen: boolean;
  registerDialog: () => void;
  unregisterDialog: () => void;
  keyboardHeight: number;
  isKeyboardOpen: boolean;
}

const KeyboardPaddingContext = createContext<KeyboardPaddingContextType>({
  isDialogOpen: false,
  registerDialog: () => {},
  unregisterDialog: () => {},
  keyboardHeight: 0,
  isKeyboardOpen: false,
});

export function KeyboardPaddingProvider({ children }: { children: ReactNode }) {
  const [dialogCount, setDialogCount] = useState(0);
  const { isOpen, keyboardHeight } = useKeyboard();

  const registerDialog = useCallback(() => {
    setDialogCount((c) => c + 1);
  }, []);

  const unregisterDialog = useCallback(() => {
    setDialogCount((c) => Math.max(0, c - 1));
  }, []);

  return (
    <KeyboardPaddingContext.Provider
      value={{
        isDialogOpen: dialogCount > 0,
        registerDialog,
        unregisterDialog,
        keyboardHeight,
        isKeyboardOpen: isOpen,
      }}
    >
      {children}
    </KeyboardPaddingContext.Provider>
  );
}

export function useKeyboardPadding(type: "dialog" | "page") {
  const { isDialogOpen, keyboardHeight, isKeyboardOpen } = useContext(
    KeyboardPaddingContext
  );

  // Dialog content gets padding when keyboard is open
  // Page content gets padding when keyboard is open AND no dialog is open
  const shouldApplyPadding =
    isKeyboardOpen && (type === "dialog" || !isDialogOpen);

  return {
    paddingBottom: shouldApplyPadding ? keyboardHeight : 0,
    isKeyboardOpen,
    keyboardHeight,
  };
}

export function useDialogRegistration() {
  const { registerDialog, unregisterDialog } = useContext(
    KeyboardPaddingContext
  );
  return { registerDialog, unregisterDialog };
}
