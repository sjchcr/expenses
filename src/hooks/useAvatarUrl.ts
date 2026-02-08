import { useCallback, useEffect, useState } from "react";
import { avatarService } from "@/services/avatar.service";
import { supabase } from "@/lib/supabase";
import {
  AVATAR_UPDATED_EVENT,
  type AvatarUpdatedDetail,
} from "@/lib/avatar-events";
import type { User } from "@supabase/supabase-js";

const SIGNED_URL_TTL_MS = 55 * 60 * 1000; // 55 minutes cache TTL
const SIGNED_URL_REFRESH_INTERVAL_MS = SIGNED_URL_TTL_MS;

// Global cache for signed avatar URLs
interface AvatarCache {
  url: string | null;
  userId: string;
  timestamp: number;
  customPath: string | null;
}

let avatarCache: AvatarCache | null = null;

function isCacheValid(userId: string, customPath: string | null): boolean {
  if (!avatarCache) return false;
  if (avatarCache.userId !== userId) return false;
  if (avatarCache.customPath !== customPath) return false;
  return Date.now() - avatarCache.timestamp < SIGNED_URL_TTL_MS;
}

function setCache(
  userId: string,
  url: string | null,
  customPath: string | null,
) {
  avatarCache = {
    url,
    userId,
    timestamp: Date.now(),
    customPath,
  };
}

function invalidateCache() {
  avatarCache = null;
}

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
      // If an immediate URL is provided (e.g., after upload), use it and invalidate cache
      if (options?.immediateUrl !== undefined) {
        invalidateCache();
        setAvatarUrl(options.immediateUrl);
        // Still continue to refresh and cache the proper URL
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

      // Check cache before making network requests
      if (isCacheValid(effectiveUser.id, customPath)) {
        const cachedUrl = avatarCache!.url;
        setAvatarUrl(cachedUrl);
        return cachedUrl;
      }

      if (customPath) {
        try {
          const signedUrl = await avatarService.getSignedAvatarUrl(effectiveUser);
          setCache(effectiveUser.id, signedUrl, customPath);
          setAvatarUrl(signedUrl);
          return signedUrl;
        } catch {
          // Fall back to OAuth-provided URL
          const fallbackUrl = avatarService.getAvatarUrl(effectiveUser);
          setCache(effectiveUser.id, fallbackUrl, customPath);
          setAvatarUrl(fallbackUrl);
          return fallbackUrl;
        }
      }

      const fallbackUrl = avatarService.getAvatarUrl(effectiveUser);
      setCache(effectiveUser.id, fallbackUrl, customPath);
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
