import { Link } from "react-router-dom";
import { ChevronLeft, Plus, type LucideIcon } from "lucide-react";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import HeaderActions from "./HeaderActions";

interface CustomHeaderProps {
  backLocation?: string;
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

const CustomHeader = ({
  backLocation,
  title,
  subtitle,
  hasAvatar,
  actions,
}: CustomHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 pt-[calc(0.5rem+env(safe-area-inset-top))] pb-2">
      <div className="mask-b-from-30% mask-b-to-100% bg-background/95 backdrop-blur-2xl w-full h-full absolute top-0 left-0"></div>
      <div className="flex justify-between items-center px-4 w-full min-h-11">
        <div className="flex items-center gap-2">
          {backLocation && (
            <Button
              asChild
              variant="outline"
              size="icon"
              className="relative"
              disabled
            >
              <Link to="/aguinaldo">
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </Button>
          )}
          <h1 className="text-2xl font-bold text-accent-foreground relative text-left">
            {title}
          </h1>
        </div>
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
          {(hasAvatar || (!actions && hasAvatar)) && <HeaderActions />}
        </div>
      </div>
    </header>
  );
};

export default CustomHeader;
