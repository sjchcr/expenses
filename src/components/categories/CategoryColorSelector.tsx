import { Pipette } from "lucide-react";
import { CATEGORY_COLORS } from "@/lib/categoryOptions";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CategoryColorSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function CategoryColorSelector({
  value,
  onChange,
}: CategoryColorSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORY_COLORS.map((color) => (
        <Button
          key={color}
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onChange(color)}
          className={cn(
            "border-2 p-0",
            value === color ? "border-foreground" : "border-transparent",
            value !== color && "opacity-75",
          )}
          style={{ backgroundColor: color }}
          aria-label={color}
        />
      ))}
      <Label
        className={cn(
          "relative inline-flex cursor-pointer items-center justify-center rounded-full border-2 bg-background p-0",
          buttonVariants({ size: "icon", variant: "outline" }),
          !CATEGORY_COLORS.includes(
            value as (typeof CATEGORY_COLORS)[number],
          ) && "border-foreground",
        )}
        style={{
          backgroundColor: !CATEGORY_COLORS.includes(
            value as (typeof CATEGORY_COLORS)[number],
          )
            ? value
            : undefined,
        }}
      >
        <Pipette
          className={cn(
            "size-4 drop-shadow",
            !CATEGORY_COLORS.includes(
              value as (typeof CATEGORY_COLORS)[number],
            ) && "text-white",
          )}
        />
        <Input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
          aria-label="Custom color"
        />
      </Label>
    </div>
  );
}
