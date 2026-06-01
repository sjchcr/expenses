import {
  Car,
  CreditCard,
  Dumbbell,
  Fuel,
  Gamepad2,
  Gift,
  GraduationCap,
  HeartPulse,
  Home,
  PawPrint,
  Plane,
  Receipt,
  ShoppingCart,
  Tag,
  Utensils,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import {
  DEFAULT_CATEGORY_ICON,
  isCategoryIconName,
} from "@/lib/categoryOptions";
import { cn } from "@/lib/utils";

const CATEGORY_ICON_COMPONENTS: Record<string, LucideIcon> = {
  tag: Tag,
  home: Home,
  "shopping-cart": ShoppingCart,
  utensils: Utensils,
  car: Car,
  fuel: Fuel,
  receipt: Receipt,
  "credit-card": CreditCard,
  "heart-pulse": HeartPulse,
  plane: Plane,
  gift: Gift,
  "gamepad-2": Gamepad2,
  "graduation-cap": GraduationCap,
  "paw-print": PawPrint,
  wifi: Wifi,
  dumbbell: Dumbbell,
};

interface CategoryIconProps {
  icon: string | null | undefined;
  color: string | null | undefined;
  className?: string;
  iconClassName?: string;
}

export function CategoryIcon({
  icon,
  color,
  className,
  iconClassName,
}: CategoryIconProps) {
  const iconName =
    icon && isCategoryIconName(icon) ? icon : DEFAULT_CATEGORY_ICON;
  const Icon = CATEGORY_ICON_COMPONENTS[iconName];

  return (
    <span
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-full text-white [&_svg]:stroke-white",
        className,
      )}
      style={{ backgroundColor: color || undefined }}
    >
      <Icon className={cn("size-3.5", iconClassName)} />
    </span>
  );
}
