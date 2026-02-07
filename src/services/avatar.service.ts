import { supabase } from "@/lib/supabase";

const BUCKET_NAME = "avatars";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export interface AvatarUploadResult {
  /** Signed URL valid for a limited time */
  url: string;
  /** Storage path, e.g. {userId}/avatar.jpg */
  path: string;
}

export const avatarService = {
  /**
   * Uploads an avatar image to Supabase Storage
   * File is stored at: avatars/{userId}/avatar.{ext}
   */
  async uploadAvatar(file: File): Promise<AvatarUploadResult> {
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error(
        "Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.",
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File too large. Maximum size is 5MB.");
    }

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Generate file path: {userId}/avatar.{extension}
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filePath = `${user.id}/avatar.${fileExt}`;

    // Delete existing avatar first (to handle different extensions)
    await this.deleteExistingAvatars(user.id);

    // Upload new avatar
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) throw error;

    // Create signed URL (bucket should be private)
    const { data: signedData, error: signedError } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(data.path, 60 * 60); // 1 hour

    if (signedError) throw signedError;

    const signedUrl = signedData.signedUrl;

    // Store path in user metadata (NOT a signed/public URL)
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        custom_avatar_path: data.path,
      },
    });

    if (updateError) throw updateError;

    return {
      url: signedUrl,
      path: data.path,
    };
  },

  /**
   * Deletes existing avatar files for a user
   */
  async deleteExistingAvatars(userId: string): Promise<void> {
    const { data: files } = await supabase.storage
      .from(BUCKET_NAME)
      .list(userId);

    if (files && files.length > 0) {
      const filesToDelete = files.map((f) => `${userId}/${f.name}`);
      await supabase.storage.from(BUCKET_NAME).remove(filesToDelete);
    }
  },

  /**
   * Removes the custom avatar and clears metadata
   */
  async removeAvatar(): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Delete from storage
    await this.deleteExistingAvatars(user.id);

    // Clear metadata
    const { error } = await supabase.auth.updateUser({
      data: {
        custom_avatar_url: null,
        custom_avatar_path: null,
      },
    });

    if (error) throw error;
  },

  /**
   * Returns OAuth/profile-provider avatar URLs that are stored directly
   * in auth metadata. Custom uploads require getSignedAvatarUrl.
   */
  getAvatarUrl(
    user: { user_metadata?: Record<string, unknown> } | null,
  ): string | null {
    if (!user?.user_metadata) return null;

    return (
      (user.user_metadata.avatar_url as string) ||
      (user.user_metadata.picture as string) ||
      null
    );
  },

  getCustomAvatarPath(
    user: { user_metadata?: Record<string, unknown> } | null,
  ): string | null {
    if (!user?.user_metadata) return null;

    return (user.user_metadata.custom_avatar_path as string) || null;
  },

  async getSignedAvatarUrl(
    user: { user_metadata?: Record<string, unknown> } | null,
    expiresInSeconds: number = 60 * 60,
  ): Promise<string | null> {
    const path = this.getCustomAvatarPath(user);
    if (!path) return null;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(path, expiresInSeconds);

    if (error) throw error;

    return data.signedUrl;
  },
};
