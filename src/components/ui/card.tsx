import * as React from "react";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const cardvariants = cva(
  "flex flex-col gap-6 rounded-2xl border py-4 shadow-sm transition-shadow",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foregroundflex",
        defaultGradient: "bg-linear-180 from-background to-accent",
        destructive:
          "bg-linear-180 from-background to-red-50 dark:to-red-950/50",
        success:
          "bg-linear-180 from-background to-green-50 dark:to-green-950/50",
        warning:
          "bg-linear-180 from-background to-amber-50 dark:to-amber-950/50",
        primary: "bg-linear-180 from-primary to-amber-50 dark:to-amber-950/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface CardProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof cardvariants> {
  hoverShadow?: boolean;
  asChild?: boolean;
}

function Card({
  className,
  variant,
  hoverShadow = false,
  ...props
}: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(
        cardvariants({ variant, className }),
        hoverShadow && "hover:shadow-lg transition-shadow",
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-4 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-4", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-4 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
