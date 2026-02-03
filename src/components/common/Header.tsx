import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authService } from "@/services/auth.service";
import {
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings,
  FileText,
  Gift,
  Sun,
  Moon,
  Monitor,
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
} from "../ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/useMobile";
import { useTheme } from "@/hooks/useTheme";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/expenses", label: "Expenses", icon: Receipt },
  { path: "/templates", label: "Templates", icon: FileText },
  { path: "/aguinaldo", label: "Aguinaldo", icon: Gift },
  { path: "/settings", label: "Settings", icon: Settings },
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

interface NavItemProps {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  isMobile: boolean;
}

const NavItem = ({
  path,
  label,
  icon: Icon,
  isActive,
  isMobile,
}: NavItemProps) => {
  if (isMobile) {
    return (
      <Link
        to={path}
        className={cn(
          "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-full transition-colors border border-transparent",
          isActive &&
            "bg-accent/50 text-accent-foreground border border-border shadow-md",
        )}
      >
        <Icon className="h-5 w-5" />
        <span className="text-[10px]">{label}</span>
      </Link>
    );
  }

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
          <p>{label}</p>
        </Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
};

interface IndicatorPosition {
  left: number;
  width: number;
}

const MobileNavigation = ({ currentPath }: { currentPath: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [indicator, setIndicator] = useState<IndicatorPosition>({
    left: 0,
    width: 0,
  });

  const activeIndex = NAV_ITEMS.findIndex((item) => item.path === currentPath);

  useLayoutEffect(() => {
    const updateIndicator = () => {
      const activeItem = itemRefs.current[activeIndex];
      const container = containerRef.current;

      if (activeItem && container) {
        const containerRect = container.getBoundingClientRect();
        const itemRect = activeItem.getBoundingClientRect();

        setIndicator({
          left: itemRect.left - containerRect.left,
          width: itemRect.width,
        });
      }
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeIndex]);

  return (
    <nav
      ref={containerRef}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-background/60 backdrop-blur-xl border border-border shadow-lg rounded-full px-2 py-2"
    >
      {/* Sliding indicator */}
      <div
        className="absolute top-2 bottom-2 bg-accent-foreground/10 shadow-md rounded-full transition-all duration-300 ease-out"
        style={{
          left: indicator.left,
          width: indicator.width,
        }}
      />

      {/* Nav items */}
      <div className="relative flex items-center">
        {NAV_ITEMS.map((item, index) => {
          const Icon = item.icon;
          const isActive = item.path === currentPath;

          return (
            <Link
              key={item.path}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-full transition-colors relative z-10",
                isActive && "text-accent-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
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
        return <Monitor className="h-4 w-4" />;
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
        isMobile={isMobile}
      />
    ));

  return (
    <>
      {/* Top Header */}
      <header className="bg-background/60 backdrop-blur-2xl py-2 shadow-sm sticky top-0 z-50">
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
                    alt={import.meta.env.VITE_SITE_TITLE}
                    className="inline-block h-9"
                  />
                  {import.meta.env.VITE_SITE_TITLE}
                </h1>
              </div>

              {/* Desktop Navigation */}
              {!isMobile && (
                <NavigationMenu>
                  <NavigationMenuList>{renderNavItems()}</NavigationMenuList>
                </NavigationMenu>
              )}
            </div>

            {/* Right: User info and sign out */}
            <div className="flex justify-center items-center gap-2 absolute md:right-1/12 right-2 top-2">
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
                <Avatar className="w-9 h-9">
                  <AvatarImage
                    src={
                      user?.user_metadata?.avatar_url ||
                      user?.user_metadata?.picture
                    }
                    alt={user?.email || "User"}
                  />
                  <AvatarFallback>{getInitials(user)}</AvatarFallback>
                </Avatar>
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

      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileNavigation currentPath={location.pathname} />}
    </>
  );
};

export default Header;
