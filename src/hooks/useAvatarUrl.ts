import { useCallback, useEffect, useState } from "react";
import { avatarService } from "@/services/avatar.service";
import { supabase } from "@/lib/supabase";
import {
  AVATAR_UPDATED_EVENT,
  type AvatarUpdatedDetail,
} from "@/lib/avatar-events";
import type { User } from "@supabase/supabase-js";

const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour, matches avatarService
const SIGNED_URL_REFRESH_BUFFER_MS = 5 * 60 * 1000; // refresh 5 minutes before expiry
const SIGNED_URL_REFRESH_INTERVAL_MS =
  SIGNED_URL_TTL_SECONDS * 1000 - SIGNED_URL_REFRESH_BUFFER_MS;

interface RefreshOptions {
  /** Provide an already-created signed URL for instant UI updates */
  immediateUrl?: string | null;
}

export function useAvatarUrl(user: User | null) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    user ? avatarService.getAvatarUrl(user) : null,
  );
  const [isLoading, setIsLoading] = useState(false);

  const refreshAvatarUrl = useCallback(
    async (options?: RefreshOptions): Promise<string | null> => {
      if (options?.immediateUrl !== undefined) {
        setAvatarUrl(options.immediateUrl);
      }

      let effectiveUser = user;

      if (!effectiveUser) {
        const {
          data: { user: latestUser },
        } = await supabase.auth.getUser();
        effectiveUser = latestUser ?? null;
      }

      if (!effectiveUser) {
        setAvatarUrl(null);
        return null;
      }

      let customPath = avatarService.getCustomAvatarPath(effectiveUser);
      if (!customPath) {
        const {
          data: { user: latestUser },
        } = await supabase.auth.getUser();
        if (latestUser) {
          effectiveUser = latestUser;
          customPath = avatarService.getCustomAvatarPath(latestUser);
        }
      }

      if (customPath) {
        try {
          const signedUrl = await avatarService.getSignedAvatarUrl(effectiveUser);
          setAvatarUrl(signedUrl);
          return signedUrl;
        } catch {
          // Fall back to OAuth-provided URL
          const fallbackUrl = avatarService.getAvatarUrl(effectiveUser);
          setAvatarUrl(fallbackUrl);
          return fallbackUrl;
        }
      }

      const fallbackUrl = avatarService.getAvatarUrl(effectiveUser);
      setAvatarUrl(fallbackUrl);
      return fallbackUrl;
    },
    [user],
  );

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    refreshAvatarUrl().finally(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    });

    if (!user || typeof window === "undefined") {
      return () => {
        isMounted = false;
      };
    }

    const intervalId = window.setInterval(() => {
      refreshAvatarUrl();
    }, Math.max(SIGNED_URL_REFRESH_INTERVAL_MS, 30_000));

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [user, refreshAvatarUrl]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleAvatarUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<AvatarUpdatedDetail>;
      const detail = customEvent.detail;
      if (!detail) return;

      if (user?.id && detail.userId !== user.id) {
        return;
      }

      refreshAvatarUrl({ immediateUrl: detail.url ?? null });
    };

    window.addEventListener(AVATAR_UPDATED_EVENT, handleAvatarUpdated);

    return () => {
      window.removeEventListener(AVATAR_UPDATED_EVENT, handleAvatarUpdated);
    };
  }, [user?.id, refreshAvatarUrl]);

  return {
    avatarUrl,
    isLoading,
    refreshAvatarUrl,
  };
}
