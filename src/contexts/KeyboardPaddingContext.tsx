import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { useKeyboard } from "@/hooks/useKeyboard";

interface KeyboardPaddingContextType {
  isDialogOpen: boolean;
  registerDialog: () => void;
  unregisterDialog: () => void;
}

const KeyboardPaddingContext = createContext<KeyboardPaddingContextType>({
  isDialogOpen: false,
  registerDialog: () => {},
  unregisterDialog: () => {},
});

export function KeyboardPaddingProvider({ children }: { children: ReactNode }) {
  const [dialogCount, setDialogCount] = useState(0);
  const { isOpen, keyboardHeight } = useKeyboard();

  // Set CSS variable globally
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--kb",
      isOpen ? `${keyboardHeight}px` : "0px"
    );
  }, [isOpen, keyboardHeight]);

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
      }}
    >
      {children}
    </KeyboardPaddingContext.Provider>
  );
}

export function useDialogRegistration() {
  const { registerDialog, unregisterDialog } = useContext(
    KeyboardPaddingContext
  );
  return { registerDialog, unregisterDialog };
}

export function useIsDialogOpen() {
  const { isDialogOpen } = useContext(KeyboardPaddingContext);
  return isDialogOpen;
}
