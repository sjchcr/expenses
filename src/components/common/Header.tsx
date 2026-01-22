import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authService } from "@/services/auth.service";
import { LayoutDashboard, LogOut, Receipt, Settings, FileText } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import type { User } from "@supabase/supabase-js";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "../ui/navigation-menu";
import { cn } from "@/lib/utils";

const getInitials = (user: User | null): string => {
  if (!user) return "?";

  // Try to get name from user_metadata (set by OAuth providers)
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

  // Fallback to email
  if (user.email) {
    return user.email.slice(0, 2).toUpperCase();
  }

  return "?";
};

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    authService.getCurrentUser().then(setUser);
  }, []);

  const handleSignOut = async () => {
    await authService.signOut();
    navigate("/login");
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/expenses", label: "Expenses", icon: Receipt },
    { path: "/templates", label: "Templates", icon: FileText },
    { path: "/settings", label: "Settings", icon: Settings },
  ];
  return (
    <header className="bg-background/60 backdrop-blur-2xl py-2 shadow-sm sticky top-0 z-50">
      <div className="md:w-10/12 mx-auto sm:w-full px-4 md:px-0">
        <div className="flex justify-between gap-2">
          <div className="flex gap-4">
            <div className="shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                {import.meta.env.VITE_SITE_TITLE}
              </h1>
            </div>
            <NavigationMenu>
              <NavigationMenuList>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <NavigationMenuItem>
                      <NavigationMenuLink
                        key={item.path}
                        asChild
                        className={cn(
                          "flex flex-row justify-center items-center gap-2 rounded-full md:px-3 w-9 md:w-auto h-9",
                          isActive &&
                            "text-gray-900 bg-accent hover:text-accent-foreground",
                        )}
                      >
                        <Link to={item.path}>
                          <Icon className="h-4 w-4" />
                          <p className="hidden md:block">{item.label}</p>
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  );
                })}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className="flex justify-center items-center gap-2">
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
            <Button
              className="rounded-full"
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
