"use client";

import { forwardRef } from "react";

import {
  DatePicker as HeroUIDatePicker,
  type DatePickerProps,
} from "@heroui/react";

import { cn } from "@/lib/utils";

const DatePicker = forwardRef<HTMLElement, DatePickerProps>(
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
    <HeroUIDatePicker
      ref={ref}
      labelPlacement={labelPlacement}
      showMonthAndYearPickers
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
          "rounded-none font-montreal text-base normal-case text-ink data-[placeholder=true]:text-ink/40 focus:bg-cream focus:text-red sm:text-lg",
          classNames?.segment,
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
          pickerWrapper: cn(
            "bg-white",
            calendarProps?.classNames?.pickerWrapper,
          ),
          pickerHighlight: cn(
            "rounded-none bg-cream",
            calendarProps?.classNames?.pickerHighlight,
          ),
          pickerItem: cn(
            "rounded-none font-courier text-xs font-normal tracking-mono uppercase text-ink data-[hover=true]:text-red data-[focus-visible=true]:outline-red",
            calendarProps?.classNames?.pickerItem,
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
            // The circle marks dates: a red ring for today, filled red when selected.
            "rounded-full border-[1.5px] border-transparent font-courier text-ink data-[hover=true]:border-red data-[hover=true]:bg-transparent data-[hover=true]:text-red data-[today=true]:border-red data-[today=true]:text-red data-[selected=true]:border-red data-[selected=true]:bg-red data-[selected=true]:text-white data-[hover=true]:data-[selected=true]:bg-red data-[focus-visible=true]:outline-red",
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

DatePicker.displayName = "DatePicker";

export default DatePicker;
