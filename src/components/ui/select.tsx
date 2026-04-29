"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        "inline-flex h-12 w-full items-center justify-between rounded-full border border-border bg-white px-4 text-left text-sm font-medium text-foreground shadow-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-[popup-open]:border-foreground/20",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />
    </SelectPrimitive.Trigger>
  );
});

SelectTrigger.displayName = "SelectTrigger";

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Popup>
>(({ className, children, ...props }, ref) => {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner sideOffset={10} align="start" className="z-50 outline-none">
        <SelectPrimitive.Popup
          ref={ref}
          className={cn(
            "surface-panel min-w-[240px] rounded-[24px] border border-border p-1.5 text-foreground shadow-[0_18px_48px_rgba(0,0,0,0.16)] outline-none",
            className,
          )}
          {...props}
        >
          <SelectPrimitive.List className="max-h-72 overflow-y-auto outline-none">
            {children}
          </SelectPrimitive.List>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
});

SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => {
  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        "flex cursor-default items-center justify-between rounded-[18px] px-3 py-2.5 text-sm text-foreground outline-none transition-colors data-[highlighted]:bg-secondary data-[selected]:font-medium",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="ml-3 text-primary">
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
});

SelectItem.displayName = "SelectItem";

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
