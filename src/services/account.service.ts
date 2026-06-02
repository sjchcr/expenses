import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { supabase } from "@/lib/supabase";

export const accountService = {
  async deleteAccount() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error("Not authenticated");
    }

    const baseUrl = getApiBaseUrl("Delete account API");
    if (!baseUrl) {
      throw new Error("Delete account API is not configured");
    }

    const response = await fetch(`${baseUrl}/api/delete-account`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const contentType = response.headers.get("content-type");
    const body = contentType?.includes("application/json")
      ? await response.json()
      : null;

    if (!response.ok) {
      throw new Error(body?.error || "Failed to delete account");
    }

    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch {
      await supabase.auth.signOut();
    }
  },
};
