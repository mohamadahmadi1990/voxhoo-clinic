"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { cn } from "@/lib/utils";

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Popup> & {
    sideOffset?: number;
  }
>(({ className, sideOffset = 10, children, ...props }, ref) => {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner sideOffset={sideOffset} className="z-50 outline-none">
        <PopoverPrimitive.Popup
          ref={ref}
          className={cn(
            "rounded-[24px] border border-border bg-white p-2 text-foreground shadow-[0_18px_48px_rgba(0,0,0,0.16)] outline-none",
            className,
          )}
          {...props}
        >
          {children}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
});

PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverContent, PopoverTrigger };
