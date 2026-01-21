import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authService } from "@/services/auth.service";
import { LayoutDashboard, LogOut, Receipt, Settings } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import type { User } from "@supabase/supabase-js";

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
    { path: "/settings", label: "Settings", icon: Settings },
  ];
  return (
    <nav className="bg-background/60 backdrop-blur-2xl shadow-sm sticky top-0 z-50">
      <div className="md:w-10/12 mx-auto sm:w-full px-4 md:px-0">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Expense Tracker
              </h1>
            </div>
            <div className="sm:ml-6 sm:flex">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center gap-2 h-full px-4 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? "border-primary text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <p className="hidden md:block">{item.label}</p>
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex justify-center items-center gap-2">
            <div className="flex justify-end items-center gap-1">
              {user?.user_metadata?.full_name && (
                <p className="font-bold hidden lg:block">
                  {user?.user_metadata?.full_name}
                </p>
              )}
              {user?.email && (
                <p className="font-medium text-sm hidden lg:block">
                  {user?.email}
                </p>
              )}
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
    </nav>
  );
};

export default Header;
