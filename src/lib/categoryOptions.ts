export const CATEGORY_COLORS = [
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#ea580c",
  "#ca8a04",
  "#7c3aed",
  "#db2777",
  "#0891b2",
] as const;

export const DEFAULT_CATEGORY_COLOR = CATEGORY_COLORS[0];
export const DEFAULT_CATEGORY_ICON = "tag";

export const CATEGORY_ICONS = [
  "tag",
  "home",
  "shopping-cart",
  "utensils",
  "car",
  "fuel",
  "receipt",
  "credit-card",
  "heart-pulse",
  "plane",
  "gift",
  "gamepad-2",
  "graduation-cap",
  "paw-print",
  "wifi",
  "dumbbell",
] as const;

export type CategoryIconName = (typeof CATEGORY_ICONS)[number];

export const isCategoryIconName = (value: string): value is CategoryIconName =>
  CATEGORY_ICONS.includes(value as CategoryIconName);
