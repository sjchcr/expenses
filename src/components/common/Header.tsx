import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { Receipt, FileText, Gift, Home, TrendingUpDown } from "lucide-react";
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
import HeaderActions from "./HeaderActions";

const NAV_ITEMS = [
  { path: "/dashboard", labelKey: "nav.dashboard", icon: Home },
  { path: "/expenses", labelKey: "nav.expenses", icon: Receipt },
  { path: "/templates", labelKey: "nav.templates", icon: FileText },
  { path: "/aguinaldo", labelKey: "nav.aguinaldo", icon: Gift },
  { path: "/stocks", labelKey: "nav.stocks", icon: TrendingUpDown },
];

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
          isActive
            ? "bg-background text-accent-foreground border"
            : "bg-transparent border border-transparent hover:bg-background hover:border-border",
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

const Header = () => {
  const location = useLocation();
  const isMobile = useMobile();
  const { resolvedTheme } = useTheme();
  const { t } = useTranslation();
  const siteTitle = t("siteTitle", {
    defaultValue: import.meta.env.VITE_SITE_TITLE,
  });

  const renderNavItems = () =>
    NAV_ITEMS.map((item) => (
      <NavItem
        key={item.path}
        {...item}
        isActive={
          (item.path === "/aguinaldo" && location.pathname === "/salary") ||
          location.pathname === item.path
        }
      />
    ));

  return isMobile ? (
    <MobileNavigation currentPath={location.pathname} items={NAV_ITEMS} />
  ) : (
    <header className="bg-muted/60 backdrop-blur-lg border-b sticky top-0 z-50 pt-[calc(0.5rem+env(safe-area-inset-top))] pb-2">
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
            <HeaderActions />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
