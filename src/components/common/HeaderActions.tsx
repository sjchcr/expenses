import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import {
  LogOut,
  Map,
  MonitorSmartphone,
  Moon,
  Settings,
  Sun,
} from "lucide-react";
import { useAvatarUrl } from "@/hooks/useAvatarUrl";
import type { User } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useTheme } from "@/hooks/useTheme";
import { useTranslation } from "react-i18next";
import { authService } from "@/services/auth.service";
import { useMobile } from "@/hooks/useMobile";
import { useAppTour } from "@/contexts/AppTourContext";

const getInitials = (user: User | null): string => {
  if (!user) return "?";

  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.user_metadata?.display_name;

  if (fullName) {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  }

  if (user.email) {
    return user.email.slice(0, 2).toUpperCase();
  }

  return "?";
};

const UserAvatar = ({ user }: { user: User | null }) => {
  const { avatarUrl } = useAvatarUrl(user);

  return (
    <Avatar className="w-11 h-11 border border-gray-200 dark:border-gray-900">
      <AvatarImage src={avatarUrl || undefined} alt={user?.email || "User"} />
      <AvatarFallback>{getInitials(user)}</AvatarFallback>
    </Avatar>
  );
};

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: MonitorSmartphone },
] as const;

const HeaderActions = () => {
  const isMobile = useMobile();
  const { user } = useCurrentUser();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { openTour } = useAppTour();

  const handleSignOut = async () => {
    await authService.signOut();
    navigate("/login");
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={isMobile ? "iconLg" : "icon"}
          className="p-0"
        >
          <UserAvatar user={user} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to="/settings">
            <Settings />
            {t("nav.settings")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openTour({ source: "manual" })}>
          <Map />
          {t("tour.menuLabel")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Theme</DropdownMenuLabel>
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
            <DropdownMenuCheckboxItem
              key={value}
              onClick={() => setTheme(value)}
              checked={theme === value}
              className="capitalize"
            >
              <Icon className="h-4 w-4" />
              {label}
            </DropdownMenuCheckboxItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
            <LogOut />
            {t("auth.signOut")}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HeaderActions;
