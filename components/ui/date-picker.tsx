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
      classNames,
      calendarProps,
      popoverProps,
      selectorButtonProps,
      ...props
    },
    ref,
  ) => (
    <HeroUIDatePicker
      ref={ref}
      labelPlacement={labelPlacement}
      variant={variant}
      radius={radius}
      {...props}
      classNames={{
        ...classNames,
        base: cn("min-w-0 font-inter", classNames?.base),
        label: cn(
          "text-xs font-normal uppercase text-dark-gray",
          classNames?.label,
        ),
        input: cn("text-sm text-dark-gray", classNames?.input),
        inputWrapper: cn(
          "h-[46px] min-h-[46px] rounded-none border border-light-gray bg-transparent px-3 shadow-none data-[hover=true]:bg-transparent data-[hover=true]:border-primary group-data-[focus=true]:border-primary group-data-[focus=true]:bg-transparent group-data-[focus-visible=true]:outline-2 group-data-[focus-visible=true]:outline-offset-2 group-data-[focus-visible=true]:outline-primary",
          classNames?.inputWrapper,
        ),
        segment: cn(
          "rounded-none uppercase text-sm text-dark-gray data-[placeholder=true]:text-primary focus:bg-secondary focus:text-dark-gray",
          classNames?.segment,
        ),
        selectorButton: cn(
          "text-dark-gray data-[hover=true]:bg-secondary data-[hover=true]:text-dark-gray! data-[focus-visible=true]:outline-primary",
          classNames?.selectorButton,
        ),
        errorMessage: cn("text-xs text-danger", classNames?.errorMessage),
        popoverContent: cn(
          "rounded-none bg-primary-light",
          classNames?.popoverContent,
        ),
      }}
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
            "bg-primary-light",
            calendarProps?.classNames?.headerWrapper,
          ),
          header: cn("bg-primary-light", calendarProps?.classNames?.header),
          title: cn(
            "text-sm font-medium text-dark-gray",
            calendarProps?.classNames?.title,
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
            "rounded-none text-dark-gray data-[hover=true]:bg-secondary data-[selected=true]:bg-dark-gray data-[selected=true]:text-white data-[hover=true]:data-[selected=true]:bg-dark-gray data-[focus-visible=true]:outline-primary",
            calendarProps?.classNames?.cellButton,
          ),
          prevButton: cn(
            "text-dark-gray data-[hover=true]:bg-secondary",
            calendarProps?.classNames?.prevButton,
          ),
          nextButton: cn(
            "text-dark-gray data-[hover=true]:bg-secondary",
            calendarProps?.classNames?.nextButton,
          ),
        },
      }}
    />
  ),
);

DatePicker.displayName = "DatePicker";

export default DatePicker;
