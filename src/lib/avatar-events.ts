export const AVATAR_UPDATED_EVENT = "avatar:updated";

export interface AvatarUpdatedDetail {
  userId: string;
  url: string | null;
}

export function dispatchAvatarUpdated(detail: AvatarUpdatedDetail) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<AvatarUpdatedDetail>(AVATAR_UPDATED_EVENT, {
      detail,
    }),
  );
}
