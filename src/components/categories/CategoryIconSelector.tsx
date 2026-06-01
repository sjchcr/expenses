import { CATEGORY_ICONS } from "@/lib/categoryOptions";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "./CategoryIcon";
import { cn } from "@/lib/utils";

interface CategoryIconSelectorProps {
  value: string;
  color: string;
  onChange: (value: string) => void;
}

export function CategoryIconSelector({
  value,
  color,
  onChange,
}: CategoryIconSelectorProps) {
  return (
    <div className="grid grid-cols-8 gap-2">
      {CATEGORY_ICONS.map((icon) => (
        <Button
          key={icon}
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onChange(icon)}
          className={cn(
            "size-9 rounded-full p-0 border-2",
            value === icon && "border-foreground",
            value !== icon && "opacity-50",
          )}
          style={{ borderColor: value === icon ? "#000000" : color }}
          aria-label={icon}
        >
          <CategoryIcon icon={icon} color={color} />
        </Button>
      ))}
    </div>
  );
}
