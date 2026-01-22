import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { authService } from "./services/auth.service";
import { settingsService } from "./services/settings.service";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Expenses from "@/pages/Expenses";
import Layout from "@/components/layout/Layout";

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
    // Check current user
    authService
      .getCurrentUser()
      .then(async (currentUser) => {
        setUser(currentUser);

        // Initialize settings for new users
        if (currentUser) {
          try {
            await settingsService.initializeSettings();
          } catch (error) {
            console.error("Failed to initialize settings:", error);
          }
        }
      })
      .finally(() => setLoading(false));

    // Listen for auth changes
    const {
      data: { subscription },
    } = authService.onAuthStateChange(async (newUser) => {
      setUser(newUser);

      // Initialize settings when user signs in
      if (newUser) {
        try {
          await settingsService.initializeSettings();
        } catch (error) {
          console.error("Failed to initialize settings:", error);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/expenses" /> : <Login />}
          />

          {/* Protected routes with layout */}
          <Route element={user ? <Layout /> : <Navigate to="/login" />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/expenses" element={<Expenses />} />
          </Route>

          <Route
            path="/"
            element={<Navigate to={user ? "/expenses" : "/login"} />}
          />
        </Routes>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
