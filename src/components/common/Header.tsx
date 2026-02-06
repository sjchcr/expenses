import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authService } from "@/services/auth.service";
import {
  LogOut,
  Receipt,
  Settings,
  FileText,
  Gift,
  Sun,
  Moon,
  Home,
  MonitorSmartphone,
} from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import type { User } from "@supabase/supabase-js";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/useMobile";
import { useTheme } from "@/hooks/useTheme";
import { MobileNavigation } from "./MobileNavigation";

const NAV_ITEMS = [
  { path: "/dashboard", labelKey: "nav.dashboard", icon: Home },
  { path: "/expenses", labelKey: "nav.expenses", icon: Receipt },
  { path: "/templates", labelKey: "nav.templates", icon: FileText },
  { path: "/aguinaldo", labelKey: "nav.aguinaldo", icon: Gift },
  { path: "/settings", labelKey: "nav.settings", icon: Settings },
];

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

const UserAvatar = ({ user }: { user: User | null }) => (
  <Avatar className="w-9 h-9">
    <AvatarImage
      src={user?.user_metadata?.avatar_url || user?.user_metadata?.picture}
      alt={user?.email || "User"}
    />
    <AvatarFallback>{getInitials(user)}</AvatarFallback>
  </Avatar>
);

interface NavItemProps {
  path: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
}

const NavItem = ({ path, labelKey, icon: Icon, isActive }: NavItemProps) => {
  const { t } = useTranslation();

  return (
    <NavigationMenuItem>
      <NavigationMenuLink
        asChild
        className={cn(
          navigationMenuTriggerStyle(),
          "flex items-center flex-row rounded-full",
          isActive && "bg-accent text-accent-foreground",
        )}
      >
        <Link to={path}>
          <Icon className="h-4 w-4" />
          <p>{t(labelKey)}</p>
        </Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
};

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    const themes: Array<"light" | "dark" | "system"> = [
      "light",
      "dark",
      "system",
    ];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const getIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />;
      case "dark":
        return <Moon className="h-4 w-4" />;
      case "system":
        return <MonitorSmartphone className="h-4 w-4" />;
    }
  };

  return (
    <Button
      className="rounded-full"
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      title={`Theme: ${theme}`}
    >
      {getIcon()}
    </Button>
  );
};

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const isMobile = useMobile();
  const { resolvedTheme } = useTheme();
  const { t } = useTranslation();
  const siteTitle = t("siteTitle", {
    defaultValue: import.meta.env.VITE_SITE_TITLE,
  });

  useEffect(() => {
    authService.getCurrentUser().then(setUser);
  }, []);

  const handleSignOut = async () => {
    await authService.signOut();
    navigate("/login");
  };

  const renderNavItems = () =>
    NAV_ITEMS.map((item) => (
      <NavItem
        key={item.path}
        {...item}
        isActive={location.pathname === item.path}
      />
    ));

  return isMobile ? (
    <MobileNavigation currentPath={location.pathname} items={NAV_ITEMS} />
  ) : (
    <header className="bg-background/60 backdrop-blur-2xl shadow-sm sticky top-0 z-50 pt-[calc(0.5rem+env(safe-area-inset-top))] pb-2">
      <div className="md:w-10/12 mx-auto sm:w-full px-4 md:px-0">
        <div className="flex justify-between items-center gap-2">
          {/* Left: App icon and title */}
          <div className="flex flex-col lg:flex-row items-start justify-start w-full gap-4">
            <div className="shrink-0 flex items-center">
              <h1 className="flex items-center justify-start gap-2 text-xl font-bold text-foreground">
                <img
                  src={
                    resolvedTheme === "dark"
                      ? "/icon-1024x1024-dark.png"
                      : "/icon-1024x1024.png"
                  }
                  alt={siteTitle}
                  className="inline-block h-9"
                />
                {siteTitle}
              </h1>
            </div>

            {/* Desktop Navigation */}
            <NavigationMenu>
              <NavigationMenuList>{renderNavItems()}</NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right: User info and sign out */}
          <div className="flex justify-center items-center gap-2 absolute md:right-1/12 right-2 top-[calc(0.5rem+env(safe-area-inset-top))]">
            <div className="flex justify-end items-center gap-2">
              <div className="flex flex-col justify-center items-end gap-0">
                {user?.user_metadata?.full_name && (
                  <p className="font-bold truncate hidden lg:block">
                    {user?.user_metadata?.full_name}
                  </p>
                )}
                {user?.email && (
                  <p className="font-medium text-xs truncate hidden lg:block">
                    {user?.email}
                  </p>
                )}
              </div>
              <UserAvatar user={user} />
            </div>
            <ThemeToggle />
            <Button
              className="rounded-full"
              variant="ghostDestructive"
              size="icon"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
