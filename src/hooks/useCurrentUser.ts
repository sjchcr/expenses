import { useState, useEffect } from "react";
import { authService } from "@/services/auth.service";
import type { User } from "@supabase/supabase-js";

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authService.getCurrentUser().then((u) => {
      setUser(u);
      console.log("Current user:", u);
      setIsLoading(false);
    });
  }, []);

  const displayName =
    user?.user_metadata?.first_name ||
    user?.user_metadata?.name ||
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    null;

  return {
    user,
    displayName,
    email: user?.email || null,
    isLoading,
  };
}
