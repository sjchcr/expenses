import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { supabase } from "@/lib/supabase";
import { authService } from "@/services/auth.service";
import { settingsService } from "@/services/settings.service";
import Layout from "@/components/layout/Layout";
import { Spinner } from "@/components/ui/spinner";
import { avatarService } from "@/services/avatar.service";
import { useTheme } from "@/hooks/useTheme";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Lazy load pages for code splitting
const Login = lazy(() => import("@/pages/Login"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Expenses = lazy(() => import("@/pages/Expenses"));
const Templates = lazy(() => import("@/pages/Templates"));
const Aguinaldo = lazy(() => import("@/pages/Aguinaldo"));
const Settings = lazy(() => import("@/pages/Settings"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboardingReminder, setShowOnboardingReminder] = useState(false);

  useEffect(() => {
    // Process OAuth callbacks and fetch session
    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          try {
            await settingsService.initializeSettings();
          } catch (error) {
            console.error("Failed to initialize settings:", error);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = authService.onAuthStateChange(async (newUser) => {
      setUser(newUser);

      if (newUser) {
        try {
          await settingsService.initializeSettings();
        } catch (error) {
          console.error("Failed to initialize settings:", error);
        }
      } else {
        queryClient.clear();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const needsOnboarding = useMemo(() => {
    if (!user) return false;
    const metadata = user.user_metadata || {};
    if (metadata.onboarding_completed) return false;
    const hasNames = Boolean(metadata.first_name && metadata.last_name);
    const hasAvatar = Boolean(
      avatarService.getCustomAvatarPath(user) ||
        avatarService.getAvatarUrl(user),
    );
    return !(hasNames && hasAvatar);
  }, [user]);

  useEffect(() => {
    setShowOnboardingReminder(Boolean(user && needsOnboarding));
  }, [needsOnboarding, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-background">
        <Spinner className="size-12" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen w-full bg-background">
              <Spinner className="size-12" />
            </div>
          }
        >
          <Routes>
            <Route path="/login" element={user ? <Navigate to="/expenses" /> : <Login />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />

            {/* Protected routes with layout */}
            <Route element={user ? <Layout /> : <Navigate to="/login" /> }>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/aguinaldo" element={<Aguinaldo />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            <Route path="/" element={<Navigate to={user ? "/expenses" : "/login"} />} />
          </Routes>
          <OnboardingReminderModal
            open={showOnboardingReminder}
            onClose={() => setShowOnboardingReminder(false)}
          />
        </Suspense>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

function OnboardingReminderModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const { t } = useTranslation();
  const siteTitle = t("siteTitle", {
    defaultValue: import.meta.env.VITE_SITE_TITLE,
  });

  const handleNavigate = () => {
    onClose();
    navigate("/settings");
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <img
              src={
                resolvedTheme === "dark"
                  ? "/icon-1024x1024-dark.png"
                  : "/icon-1024x1024.png"
              }
              alt={siteTitle}
              className="h-12 w-12"
            />
            <DialogTitle className="text-2xl">
              {t("onboardingModal.title")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-base">
            {t("onboardingModal.description")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            {t("common.close")}
          </Button>
          <Button onClick={handleNavigate}>{t("onboardingModal.cta")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default App;
