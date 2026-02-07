import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Camera, Trash2, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { avatarService } from "@/services/avatar.service";
import { useAvatarUrl } from "@/hooks/useAvatarUrl";
import { dispatchAvatarUpdated } from "@/lib/avatar-events";
import { AvatarCropperDialog } from "@/components/common/AvatarCropperDialog";
import type { User } from "@supabase/supabase-js";

interface AvatarUploadProps {
  user: User | null;
  onAvatarChange?: (newUrl: string | null) => void;
}

const getInitials = (user: User | null): string => {
  if (!user) return "?";

  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.user_metadata?.display_name;

  if (fullName) {
    const parts = String(fullName).trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return String(fullName).slice(0, 2).toUpperCase();
  }

  if (user.email) {
    return user.email.slice(0, 2).toUpperCase();
  }

  return "?";
};

export function AvatarUpload({ user, onAvatarChange }: AvatarUploadProps) {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<{ file: File; url: string } | null>(null);

  const { avatarUrl, refreshAvatarUrl } = useAvatarUrl(user);
  const [hasCustomAvatar, setHasCustomAvatar] = useState<boolean>(() =>
    Boolean(avatarService.getCustomAvatarPath(user)),
  );

  useEffect(() => {
    setHasCustomAvatar(Boolean(avatarService.getCustomAvatarPath(user)));
  }, [user]);

  useEffect(() => {
    return () => {
      if (pendingFile?.url) {
        URL.revokeObjectURL(pendingFile.url);
      }
    };
  }, [pendingFile]);

  const resetFileInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const uploadAvatarFile = useCallback(
    async (fileToUpload: File) => {
      setIsUploading(true);
      try {
        const result = await avatarService.uploadAvatar(fileToUpload);
        toast.success(t("settings.avatarUpdated"));
        setHasCustomAvatar(true);
        await refreshAvatarUrl({ immediateUrl: result.url });
        if (user?.id) {
          dispatchAvatarUpdated({ userId: user.id, url: result.url });
        }
        onAvatarChange?.(result.url);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : t("settings.avatarUploadFailed"),
        );
      } finally {
        setIsUploading(false);
        resetFileInput();
      }
    },
    [t, onAvatarChange, refreshAvatarUrl, resetFileInput, user?.id],
  );

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const previewUrl = URL.createObjectURL(file);
      setPendingFile({ file, url: previewUrl });
      resetFileInput();
    },
    [resetFileInput],
  );

  const handleCropCancel = useCallback(() => {
    setPendingFile(null);
    resetFileInput();
  }, [resetFileInput]);

  const handleCropComplete = useCallback(
    async (croppedFile: File) => {
      setPendingFile(null);
      await uploadAvatarFile(croppedFile);
    },
    [uploadAvatarFile],
  );

  const handleRemoveAvatar = useCallback(async () => {
    setIsRemoving(true);
    try {
      await avatarService.removeAvatar();
      toast.success(t("settings.avatarRemoved"));
      setHasCustomAvatar(false);
      await refreshAvatarUrl({ immediateUrl: null });
      if (user?.id) {
        dispatchAvatarUpdated({ userId: user.id, url: null });
      }
      onAvatarChange?.(null);
    } catch {
      toast.error(t("settings.avatarRemoveFailed"));
    } finally {
      setIsRemoving(false);
    }
  }, [t, onAvatarChange, refreshAvatarUrl, user?.id]);

  const handleAvatarClick = () => {
    if (pendingFile || isUploading) return;
    fileInputRef.current?.click();
  };

  const isCropperOpen = Boolean(pendingFile);

  return (
    <>
      <div className="flex items-center gap-4">
        <div className="relative group">
          <Avatar className="w-20 h-20 border-2 border-gray-200 dark:border-gray-800">
            <AvatarImage src={avatarUrl || undefined} alt={user?.email || "User"} />
            <AvatarFallback className="text-xl">{getInitials(user)}</AvatarFallback>
          </Avatar>

        {/* Upload overlay */}
        <button
          type="button"
          onClick={handleAvatarClick}
          disabled={isUploading || isCropperOpen}
          className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
          aria-label={t("settings.changeAvatar")}
        >
          {isUploading ? (
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          ) : (
            <Camera className="h-6 w-6 text-white" />
          )}
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          aria-label={t("settings.uploadAvatar")}
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAvatarClick}
          disabled={isUploading || isCropperOpen}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("common.loading")}
            </>
          ) : (
            <>
              <Camera className="h-4 w-4" />
              {t("settings.changeAvatar")}
            </>
          )}
        </Button>

        {hasCustomAvatar && (
          <Button
            type="button"
            variant="ghostDestructive"
            size="sm"
            onClick={handleRemoveAvatar}
            disabled={isRemoving}
          >
            {isRemoving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {t("settings.removeAvatar")}
          </Button>
        )}
      </div>
      </div>

      {pendingFile && (
        <AvatarCropperDialog
          open={isCropperOpen}
          file={pendingFile.file}
          previewUrl={pendingFile.url}
          onCancel={handleCropCancel}
          onComplete={handleCropComplete}
        />
      )}
    </>
  );
}
