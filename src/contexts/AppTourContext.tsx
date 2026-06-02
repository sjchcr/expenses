import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { authService } from "@/services/auth.service";
import { AppTourDialog } from "@/components/tour/AppTourDialog";

type AppTourSource = "auto" | "manual";

interface OpenTourOptions {
  source: AppTourSource;
}

interface AppTourContextValue {
  isOpen: boolean;
  openTour: (options: OpenTourOptions) => void;
  closeTour: () => void;
  completeTour: () => Promise<void>;
}

const AppTourContext = createContext<AppTourContextValue | null>(null);

interface AppTourProviderProps {
  children: ReactNode;
  user: User | null;
  onUserUpdated: (user: User | null) => void;
  onOpenChange?: (isOpen: boolean) => void;
}

export function AppTourProvider({
  children,
  user,
  onUserUpdated,
  onOpenChange,
}: AppTourProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [source, setSource] = useState<AppTourSource>("manual");
  const [autoShownUserId, setAutoShownUserId] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  const setTourOpen = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      onOpenChange?.(open);
    },
    [onOpenChange],
  );

  const openTour = useCallback(
    (options: OpenTourOptions) => {
      setSource(options.source);
      setTourOpen(true);
    },
    [setTourOpen],
  );

  const closeTour = useCallback(() => {
    setTourOpen(false);
  }, [setTourOpen]);

  const completeTour = useCallback(async () => {
    if (!user) {
      closeTour();
      return;
    }

    try {
      setIsCompleting(true);
      const updatedUser = await authService.completeAppTour();
      onUserUpdated(updatedUser);
      closeTour();
    } finally {
      setIsCompleting(false);
    }
  }, [closeTour, onUserUpdated, user]);

  useEffect(() => {
    if (!user) {
      setAutoShownUserId(null);
      return;
    }

    if (user.user_metadata?.app_tour_completed === true) return;
    if (autoShownUserId === user.id) return;

    setAutoShownUserId(user.id);
    openTour({ source: "auto" });
  }, [autoShownUserId, openTour, user]);

  return (
    <AppTourContext.Provider
      value={{
        isOpen,
        openTour,
        closeTour,
        completeTour,
      }}
    >
      {children}
      <AppTourDialog
        open={isOpen}
        source={source}
        isCompleting={isCompleting}
        onClose={closeTour}
        onComplete={completeTour}
      />
    </AppTourContext.Provider>
  );
}

export function useAppTour() {
  const context = useContext(AppTourContext);
  if (!context) {
    throw new Error("useAppTour must be used within AppTourProvider");
  }
  return context;
}
