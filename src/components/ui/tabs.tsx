import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "h-[calc(100%-1px)] flex-1 border border-transparent text-foreground dark:text-muted-foreground data-[state=active]:border-input data-[state=active]:bg-background dark:data-[state=active]:border-input dark:data-[state=active]:text-foreground dark:data-[state=active]:bg-input/30",
        outline:
          "h-[calc(100%-1px)] flex-1 border border-transparent hover:bg-background/75 dark:hover:bg-background/30 text-foreground data-[state=active]:bg-background dark:data-[state=active]:bg-background/30 data-[state=active]:border-input dark:data-[state=active]:border-background/50",
        ghost:
          "hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-accent data-[state=active]:text-accent-foreground",
        success:
          "h-[calc(100%-1px)] flex-1 border border-transparent hover:bg-green-600/10 hover:text-green-600 data-[state=active]:bg-green-600/10 data-[state=active]:border-green-600/30 data-[state=active]:text-green-700",
        warning:
          "h-[calc(100%-1px)] flex-1 border border-transparent hover:bg-amber-500/10 hover:text-amber-500 data-[state=active]:bg-amber-500/10 data-[state=active]:border-amber-500/30 data-[state=active]:text-amber-500",
        destructive:
          "h-[calc(100%-1px)] flex-1 hover:bg-red-600/10 hover:text-red-600 data-[state=active]:bg-red-600/20 data-[state=active]:text-red-700 data-[state=active]:border-red-600/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  background,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & {
  background?: boolean;
}) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-0.75",
        !background && "bg-transparent p-0",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> &
  VariantProps<typeof tabsTriggerVariants>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(tabsTriggerVariants({ variant }), className)}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
