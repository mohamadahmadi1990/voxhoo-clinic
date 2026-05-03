"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("w-[308px] bg-white px-4 pb-4 pt-5", className)}
      classNames={{
        months: "flex w-full flex-col",
        month: "w-full space-y-4",
        month_caption: "relative flex h-10 items-center justify-center px-12",
        caption_label: "text-sm font-semibold text-foreground",
        nav: "absolute inset-x-0 top-1 flex items-center justify-between px-3",
        button_previous: cn(
          buttonVariants({ variant: "outline", size: "icon-sm" }),
          "h-8 w-8 rounded-full bg-white p-0 shadow-sm opacity-90 hover:opacity-100",
        ),
        button_next: cn(
          buttonVariants({ variant: "outline", size: "icon-sm" }),
          "h-8 w-8 rounded-full bg-white p-0 shadow-sm opacity-90 hover:opacity-100",
        ),
        month_grid: "w-full border-collapse",
        weekdays: "grid grid-cols-7 gap-y-1",
        weekday: "flex h-9 items-center justify-center text-[0.78rem] font-medium text-muted-foreground",
        week: "mt-1 grid grid-cols-7",
        day: "flex h-10 w-10 items-center justify-center p-0 text-sm",
        day_button: cn(
          buttonVariants({ variant: "ghost", size: "icon-sm" }),
          "h-10 w-10 rounded-full p-0 font-normal text-foreground aria-selected:opacity-100",
        ),
        today: "text-primary font-semibold",
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        outside: "text-muted-foreground opacity-45",
        disabled: "text-muted-foreground opacity-35",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: iconClassName, ...iconProps }) =>
          orientation === "left" ? (
            <ChevronLeft className={cn("h-4 w-4", iconClassName)} {...iconProps} />
          ) : (
            <ChevronRight className={cn("h-4 w-4", iconClassName)} {...iconProps} />
          ),
      }}
      {...props}
    />
  );
}
