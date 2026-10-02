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
      labelPlacement = "outside",
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
        base: cn("min-w-0 font-inter", classNames?.base),
        label: cn(
          "text-xs font-normal uppercase text-dark-gray",
          classNames?.label,
        ),
        input: cn("text-xs text-dark-gray", classNames?.input),
        inputWrapper: cn(
          "h-[46px] min-h-[46px] rounded-none border border-light-gray bg-transparent px-3 shadow-none data-[hover=true]:bg-transparent data-[hover=true]:border-primary group-data-[focus=true]:border-primary group-data-[focus=true]:bg-transparent group-data-[focus-visible=true]:outline-2 group-data-[focus-visible=true]:outline-offset-2 group-data-[focus-visible=true]:outline-primary",
          classNames?.inputWrapper,
        ),
        segment: cn(
          "rounded-none uppercase text-xs text-dark-gray data-[placeholder=true]:text-primary focus:bg-secondary focus:text-dark-gray",
          classNames?.segment,
        ),
        selectorButton: cn(
          "text-dark-gray data-[hover=true]:bg-secondary data-[hover=true]:text-dark-gray! data-[focus-visible=true]:outline-primary",
          classNames?.selectorButton,
        ),
        errorMessage: cn(
          "text-xs uppercase text-danger",
          classNames?.errorMessage,
        ),
        popoverContent: cn(
          "rounded-none bg-primary-light",
          classNames?.popoverContent,
        ),
        description: "uppercase text-xs text-dark-gray/75",
        timeInput: cn(
          "border-none bg-primary-light font-inter",
          "[&_[data-slot=input-wrapper]]:h-[36px] [&_[data-slot=input-wrapper]]:min-h-[36px] [&_[data-slot=input-wrapper]]:rounded-none [&_[data-slot=input-wrapper]]:border [&_[data-slot=input-wrapper]]:border-light-gray [&_[data-slot=input-wrapper]]:bg-transparent [&_[data-slot=input-wrapper]]:px-3 [&_[data-slot=input-wrapper]]:shadow-none",
          "[&_[data-slot=input-wrapper][data-hover=true]]:border-primary [&_[data-slot=input-wrapper][data-hover=true]]:bg-transparent [&_[data-slot=input-wrapper]:focus-within]:border-primary [&_[data-slot=input-wrapper]:focus-within]:bg-transparent",
          "[&_[data-slot=segment]]:rounded-none [&_[data-slot=segment]]:text-xs [&_[data-slot=segment]]:uppercase [&_[data-slot=segment]]:text-dark-gray [&_[data-slot=segment][data-placeholder=true]]:text-primary [&_[data-slot=segment]:focus]:bg-secondary [&_[data-slot=segment]:focus]:text-dark-gray",
          classNames?.timeInput,
        ),
        timeInputLabel: cn(
          "text-xs font-normal uppercase text-dark-gray",
          classNames?.timeInputLabel,
        ),
      }}
      timeInputProps={{ variant: "bordered", radius: "none", ...timeInputProps }}
      selectorButtonProps={{ radius: "none", ...selectorButtonProps }}
      popoverProps={{
        placement: "bottom-start",
        ...popoverProps,
        classNames: {
          ...popoverProps?.classNames,
          base: cn("z-[110]", popoverProps?.classNames?.base),
          content: cn(
            "rounded-none border border-light-gray bg-primary-light p-0 shadow-sm",
            popoverProps?.classNames?.content,
          ),
        },
      }}
      calendarProps={{
        ...calendarProps,
        classNames: {
          ...calendarProps?.classNames,
          base: cn(
            "rounded-none bg-primary-light font-inter text-dark-gray shadow-none",
            calendarProps?.classNames?.base,
          ),
          headerWrapper: cn(
            "bg-primary-light after:bg-primary-light",
            calendarProps?.classNames?.headerWrapper,
          ),
          header: cn(
            "rounded-none bg-primary-light text-dark-gray data-[hover=true]:bg-secondary data-[focus-visible=true]:outline-primary",
            calendarProps?.classNames?.header,
          ),
          title: cn(
            "text-xs uppercase font-medium text-dark-gray",
            calendarProps?.classNames?.title,
          ),
          pickerWrapper: cn(
            "bg-primary-light",
            calendarProps?.classNames?.pickerWrapper,
          ),
          pickerHighlight: cn(
            "rounded-none bg-secondary",
            calendarProps?.classNames?.pickerHighlight,
          ),
          pickerItem: cn(
            "rounded-none font-inter text-xs font-normal uppercase text-dark-gray data-[hover=true]:text-primary data-[focus-visible=true]:outline-primary",
            calendarProps?.classNames?.pickerItem,
          ),
          gridHeader: cn(
            "bg-primary-light shadow-none",
            calendarProps?.classNames?.gridHeader,
          ),
          gridHeaderCell: cn(
            "text-xs text-primary",
            calendarProps?.classNames?.gridHeaderCell,
          ),
          cellButton: cn(
            "rounded-none text-dark-gray data-[hover=true]:text-primary data-[hover=true]:bg-secondary data-[selected=true]:bg-dark-gray data-[selected=true]:text-white data-[hover=true]:data-[selected=true]:bg-dark-gray data-[focus-visible=true]:outline-primary",
            calendarProps?.classNames?.cellButton,
          ),
          prevButton: cn(
            "rounded-none text-dark-gray data-[hover=true]:bg-secondary data-[focus-visible=true]:outline-primary",
            calendarProps?.classNames?.prevButton,
          ),
          nextButton: cn(
            "rounded-none text-dark-gray data-[hover=true]:bg-secondary data-[focus-visible=true]:outline-primary",
            calendarProps?.classNames?.nextButton,
          ),
        },
      }}
    />
  ),
);

DatePicker.displayName = "DatePicker";

export default DatePicker;
