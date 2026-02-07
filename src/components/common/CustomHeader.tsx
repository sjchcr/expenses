import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  MonitorSmartphone,
  Moon,
  Plus,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { ButtonGroup } from "../ui/button-group";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import type { User } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useTheme } from "@/hooks/useTheme";
import { authService } from "@/services/auth.service";
import { useAvatarUrl } from "@/hooks/useAvatarUrl";

interface CustomHeaderProps {
  title: string;
  subtitle?: string;
  hasAvatar?: boolean;
  actions?: HeaderActionsGroups[];
}

export interface HeaderActionsGroups {
  group: string;
  type: "button" | "dropdown";
  icon?: LucideIcon;
  actions: HeaderActionsProps[];
}

export interface HeaderActionsProps {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: MonitorSmartphone },
] as const;

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

const CustomHeader = ({
  title,
  subtitle,
  hasAvatar,
  actions,
}: CustomHeaderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    authService.getCurrentUser().then(setUser);
  }, []);

  const handleSignOut = async () => {
    await authService.signOut();
    navigate("/login");
  };
  return (
    <header className="sticky top-0 z-50 pt-[calc(0.5rem+env(safe-area-inset-top))] pb-2">
      <div className="mask-b-from-30% mask-b-to-100% bg-background/95 backdrop-blur-2xl w-full h-full absolute top-0 left-0"></div>
      <div className="flex justify-between items-center px-4 w-full min-h-11">
        <h1 className="text-2xl font-bold text-accent-foreground relative text-left">
          {title}
        </h1>
        {subtitle && (
          <p className="text-muted-foreground text-sm absolute left-4 top-full mt-1">
            {subtitle}
          </p>
        )}
        <div className="flex items-center gap-2 relative">
          {actions &&
            actions.map(({ group, icon: GroupIcon, type, actions }) =>
              type === "button" ? (
                <ButtonGroup key={group}>
                  {actions.map(({ label, icon: Icon, onClick }) => (
                    <Button
                      size="iconLg"
                      variant="defaultTranslucent"
                      className="rounded-full"
                      onClick={onClick}
                      key={label}
                    >
                      <Icon className="h-6 w-6" />
                    </Button>
                  ))}
                </ButtonGroup>
              ) : (
                <DropdownMenu key={group}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="iconLg"
                      variant="defaultTranslucent"
                      className="rounded-full"
                    >
                      {GroupIcon ? (
                        <GroupIcon className="h-6 w-6" />
                      ) : (
                        <Plus className="h-6 w-6" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                      {actions.map(({ label, icon: Icon, onClick }) => (
                        <DropdownMenuItem key={label} onClick={onClick}>
                          <Icon className="h-4 w-4" />
                          {label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              ),
            )}
          {(hasAvatar || !actions) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="iconLg" className="rounded-full">
                  <UserAvatar user={user} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={handleSignOut}
                  >
                    <LogOut />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};

export default CustomHeader;
