"use client";

import { forwardRef } from "react";

import {
  DateRangePicker as HeroUIDateRangePicker,
  type DateRangePickerProps,
} from "@heroui/react";

import { cn } from "@/lib/utils";

const DateRangePicker = forwardRef<HTMLElement, DateRangePickerProps>(
  (
    {
      labelPlacement = "outside-top",
      variant = "bordered",
      radius = "none",
      hourCycle = 12,
      classNames,
      calendarProps,
      popoverProps,
      selectorButtonProps,
      timeInputProps,
      ...props
    },
    ref,
  ) => (
    <HeroUIDateRangePicker
      ref={ref}
      labelPlacement={labelPlacement}
      variant={variant}
      radius={radius}
      hourCycle={hourCycle}
      {...props}
      classNames={{
        ...classNames,
        base: cn("min-w-0", classNames?.base),
        label: cn(
          "font-courier text-sm! leading-[1.3] font-normal tracking-mono text-red! uppercase",
          "pb-2",
          classNames?.label,
        ),
        input: cn(
          "font-montreal text-base! leading-normal font-normal normal-case text-ink! placeholder:text-ink/40 sm:text-lg!",
          classNames?.input,
        ),
        inputWrapper: cn(
          "h-14 min-h-14 group-data-[focus-visible=true]:outline-2 group-data-[focus-visible=true]:outline-offset-2 group-data-[focus-visible=true]:outline-red",
          "rounded-none border border-ink bg-white! px-4 shadow-none data-[hover=true]:border-red group-data-[focus=true]:border-red group-data-[invalid=true]:border-red",
          classNames?.inputWrapper,
        ),
        segment: cn(
          "rounded-none font-montreal uppercase! text-base normal-case text-ink data-[placeholder=true]:text-ink/40 focus:bg-cream focus:text-red sm:text-lg",
          classNames?.segment,
        ),
        separator: cn(
          "font-montreal text-base text-ink/60 sm:text-lg",
          classNames?.separator,
        ),
        selectorButton: cn(
          "text-ink data-[hover=true]:bg-cream data-[hover=true]:text-red! data-[focus-visible=true]:outline-red",
          classNames?.selectorButton,
        ),
        helperWrapper: cn("px-0 pt-2", classNames?.helperWrapper),
        errorMessage: cn(
          "font-courier text-xs leading-5 tracking-mono text-red uppercase",
          classNames?.errorMessage,
        ),
        popoverContent: cn(
          "rounded-none border border-ink bg-white p-0 text-ink shadow-none",
          classNames?.popoverContent,
        ),
        description: cn(
          "font-courier text-xs leading-5 tracking-mono text-ink/70 uppercase",
          classNames?.description,
        ),
        bottomContent: cn("bg-white", classNames?.bottomContent),
        timeInput: cn(
          "border-none bg-white",
          "[&_[data-slot=input-wrapper]]:h-11 [&_[data-slot=input-wrapper]]:min-h-11 [&_[data-slot=input-wrapper]]:rounded-none [&_[data-slot=input-wrapper]]:border [&_[data-slot=input-wrapper]]:border-ink [&_[data-slot=input-wrapper]]:bg-white [&_[data-slot=input-wrapper]]:px-3 [&_[data-slot=input-wrapper]]:shadow-none",
          "[&_[data-slot=input-wrapper][data-hover=true]]:border-red [&_[data-slot=input-wrapper][data-hover=true]]:bg-white [&_[data-slot=input-wrapper]:focus-within]:border-red [&_[data-slot=input-wrapper]:focus-within]:bg-white",
          "[&_[data-slot=segment]]:rounded-none [&_[data-slot=segment]]:font-montreal [&_[data-slot=segment]]:text-base [&_[data-slot=segment]]:text-ink [&_[data-slot=segment][data-placeholder=true]]:text-ink/40 [&_[data-slot=segment]:focus]:bg-cream [&_[data-slot=segment]:focus]:text-red",
          classNames?.timeInput,
        ),
        timeInputLabel: cn(
          "font-courier text-sm! leading-[1.3] font-normal tracking-mono text-red! uppercase",
          classNames?.timeInputLabel,
        ),
      }}
      timeInputProps={{
        variant: "bordered",
        radius: "none",
        ...timeInputProps,
      }}
      selectorButtonProps={{ radius: "none", ...selectorButtonProps }}
      popoverProps={{
        placement: "bottom-start",
        ...popoverProps,
        classNames: {
          ...popoverProps?.classNames,
          base: cn("z-[110]", popoverProps?.classNames?.base),
          content: cn(
            "rounded-none border border-ink bg-white p-0 text-ink shadow-none",
            popoverProps?.classNames?.content,
          ),
        },
      }}
      calendarProps={{
        ...calendarProps,
        classNames: {
          ...calendarProps?.classNames,
          base: cn(
            "rounded-none bg-white font-courier text-ink shadow-none",
            calendarProps?.classNames?.base,
          ),
          headerWrapper: cn(
            "bg-white after:bg-white",
            calendarProps?.classNames?.headerWrapper,
          ),
          header: cn(
            "rounded-none bg-white text-ink data-[hover=true]:bg-cream data-[focus-visible=true]:outline-red",
            calendarProps?.classNames?.header,
          ),
          title: cn(
            "text-sm tracking-mono uppercase text-ink",
            calendarProps?.classNames?.title,
          ),
          gridHeader: cn(
            "bg-white shadow-none",
            calendarProps?.classNames?.gridHeader,
          ),
          gridHeaderCell: cn(
            "text-xs tracking-mono uppercase text-red",
            calendarProps?.classNames?.gridHeaderCell,
          ),
          cellButton: cn(
            // The circle marks dates: a red ring for today and on hover.
            "rounded-full border-[1.5px] border-transparent font-courier text-ink data-[hover=true]:border-red data-[hover=true]:bg-transparent data-[hover=true]:text-red data-[today=true]:border-red data-[today=true]:text-red data-[focus-visible=true]:outline-red",
            // Days inside the range sit on a cream band.
            "data-[selected=true]:data-[range-selection=true]:border-transparent data-[selected=true]:data-[range-selection=true]:bg-transparent data-[selected=true]:data-[range-selection=true]:text-ink data-[selected=true]:data-[range-selection=true]:before:bg-cream",
            "data-[selected=true]:data-[range-selection=true]:data-[outside-month=true]:text-ink/30 data-[selected=true]:data-[range-selection=true]:data-[outside-month=true]:before:bg-transparent",
            // The first and last days are filled red circles.
            "data-[selected=true]:data-[selection-start=true]:data-[range-selection=true]:border-red data-[selected=true]:data-[selection-start=true]:data-[range-selection=true]:bg-red data-[selected=true]:data-[selection-start=true]:data-[range-selection=true]:text-white",
            "data-[selected=true]:data-[selection-end=true]:data-[range-selection=true]:border-red data-[selected=true]:data-[selection-end=true]:data-[range-selection=true]:bg-red data-[selected=true]:data-[selection-end=true]:data-[range-selection=true]:text-white",
            calendarProps?.classNames?.cellButton,
          ),
          prevButton: cn(
            "rounded-none text-ink data-[hover=true]:bg-cream data-[hover=true]:text-red data-[focus-visible=true]:outline-red",
            calendarProps?.classNames?.prevButton,
          ),
          nextButton: cn(
            "rounded-none text-ink data-[hover=true]:bg-cream data-[hover=true]:text-red data-[focus-visible=true]:outline-red",
            calendarProps?.classNames?.nextButton,
          ),
        },
      }}
    />
  ),
);

DateRangePicker.displayName = "DateRangePicker";

export default DateRangePicker;
