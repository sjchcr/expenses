import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useDialogRegistration } from "@/contexts/KeyboardPaddingContext";

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80",
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  submitOnTop = false,
  backButton = false,
  fromBottom = true,
  style,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
  submitOnTop?: boolean;
  backButton?: boolean;
  fromBottom?: boolean;
}) {
  const { registerDialog, unregisterDialog } = useDialogRegistration();

  React.useEffect(() => {
    registerDialog();
    return () => unregisterDialog();
  }, [registerDialog, unregisterDialog]);

  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        data-submit-on-top={submitOnTop ? "true" : undefined}
        data-back-button={backButton ? "true" : undefined}
        data-from-bottom={fromBottom ? "true" : undefined}
        className={cn(
          // Base styles
          "group/dialog-content bg-background/90 backdrop-blur-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed z-50 flex flex-col gap-4 border border-b-0 p-4 shadow-lg duration-200 outline-none",
          // Mobile: bottom sheet with auto height, max height respects safe area
          fromBottom
            ? "inset-x-0 bottom-0 max-h-[calc(100dvh-env(safe-area-inset-top)-1rem)] rounded-t-3xl rounded-b-none data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom"
            : "left-[50%] right-auto bottom-auto top-[50%] w-full max-h-[85vh] translate-x-[-50%] translate-y-[-50%] rounded-3xl data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-bottom-0 data-[state=open]:slide-in-from-bottom-0",
          // Desktop: centered modal
          "sm:left-[50%] sm:right-auto sm:bottom-auto sm:top-[50%] sm:w-full sm:max-w-lg sm:max-h-[85vh] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-3xl sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95 sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=open]:slide-in-from-bottom-0",
          className,
        )}
        style={style}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className={cn(
              "ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 w-11 sm:w-9",
              submitOnTop ? "left-4 sm:left-auto sm:right-4" : "right-4",
            )}
          >
            <Button variant="outline" size="icon" className="bg-muted/50">
              <X />
            </Button>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "flex flex-col gap-2 text-left pr-19 sm:pr-13 shrink-0",
        "group-data-[submit-on-top=true]/dialog-content:pr-0 group-data-[submit-on-top=true]/dialog-content:pl-0",
        "group-data-[back-button=true]/dialog-content:pl-0 group-data-[back-button=true]/dialog-content:pr-0",
        className,
      )}
      {...props}
    />
  );
}

function DialogBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-body"
      className={cn(
        "flex-1 min-h-0 overflow-y-auto -mx-4 px-4",
        // Apply keyboard padding only to this scrollable area
        "pb-[calc(env(safe-area-inset-bottom)+var(--kb,0px))]",
        className,
      )}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "text-lg leading-none font-semibold",
        "group-data-[submit-on-top=true]/dialog-content:h-11 group-data-[submit-on-top=true]/dialog-content:flex group-data-[submit-on-top=true]/dialog-content:items-center group-data-[submit-on-top=true]/dialog-content:justify-center group-data-[submit-on-top=true]/dialog-content:pl-19 group-data-[submit-on-top=true]/dialog-content:pr-19 group-data-[submit-on-top=true]/dialog-content:sm:justify-start group-data-[submit-on-top=true]/dialog-content:sm:pl-0 group-data-[submit-on-top=true]/dialog-content:sm:text-left",
        "group-data-[back-button=true]/dialog-content:h-11 group-data-[back-button=true]/dialog-content:flex group-data-[back-button=true]/dialog-content:items-center group-data-[back-button=true]/dialog-content:justify-center group-data-[back-button=true]/dialog-content:pl-19 group-data-[back-button=true]/dialog-content:pr-19 group-data-[back-button=true]/dialog-content:sm:justify-start group-data-[back-button=true]/dialog-content:sm:pl-0 group-data-[back-button=true]/dialog-content:sm:text-left",
        className,
      )}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
