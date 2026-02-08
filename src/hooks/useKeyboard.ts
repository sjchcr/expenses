import { useState, useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";

interface KeyboardState {
  isOpen: boolean;
  keyboardHeight: number;
}

export function useKeyboard() {
  const [state, setState] = useState<KeyboardState>({
    isOpen: false,
    keyboardHeight: 0,
  });

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const showListener = Keyboard.addListener("keyboardWillShow", (info) => {
      setState({
        isOpen: true,
        keyboardHeight: info.keyboardHeight,
      });
    });

    const hideListener = Keyboard.addListener("keyboardWillHide", () => {
      setState({
        isOpen: false,
        keyboardHeight: 0,
      });
    });

    return () => {
      showListener.then((handle) => handle.remove());
      hideListener.then((handle) => handle.remove());
    };
  }, []);

  return state;
}
