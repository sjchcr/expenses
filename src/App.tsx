import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { supabase } from "@/lib/supabase";
import { authService } from "@/services/auth.service";
import { settingsService } from "@/services/settings.service";
import Layout from "@/components/layout/Layout";
import { Spinner } from "@/components/ui/spinner";

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

  useEffect(() => {
    // First, let Supabase process any OAuth callback tokens from the URL
    // This is important for web OAuth redirects (Apple/Google sign-in)
    const initAuth = async () => {
      try {
        // getSession() will automatically process OAuth callback tokens in the URL
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const currentUser = session?.user ?? null;
        setUser(currentUser);

        // Initialize settings for new users
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

    // Listen for auth changes
    const {
      data: { subscription },
    } = authService.onAuthStateChange(async (newUser) => {
      setUser(newUser);

      if (newUser) {
        // Initialize settings when user signs in
        try {
          await settingsService.initializeSettings();
        } catch (error) {
          console.error("Failed to initialize settings:", error);
        }
      } else {
        // Clear React Query cache when user signs out
        queryClient.clear();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
          <Route
            path="/login"
            element={user ? <Navigate to="/expenses" /> : <Login />}
          />
          <Route path="/privacy" element={<PrivacyPolicy />} />

          {/* Protected routes with layout */}
          <Route element={user ? <Layout /> : <Navigate to="/login" />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/aguinaldo" element={<Aguinaldo />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route
            path="/"
            element={<Navigate to={user ? "/expenses" : "/login"} />}
          />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
