"use client";

import { forwardRef } from "react";

import {
  Select as HeroUISelect,
  SelectItem,
  type SelectItemProps,
  type SelectProps,
} from "@heroui/react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

interface Props extends Omit<SelectProps, "children"> {
  options?: { label: string; value: string | number }[];
  children?: SelectProps["children"];
  selectItemProps?: Partial<Omit<SelectItemProps, "children">>;
}

const Select = forwardRef<HTMLSelectElement, Props>(
  (
    {
      options,
      children,
      classNames,
      popoverProps,
      listboxProps,
      selectItemProps,
      ...props
    },
    ref,
  ) => (
    <HeroUISelect
      ref={ref}
      variant="bordered"
      radius="none"
      labelPlacement="outside-top"
      validationBehavior="aria"
      placeholder="Select an option"
      selectorIcon={<ChevronDown size={24} aria-hidden="true" />}
      {...props}
      classNames={{
        ...classNames,
        base: cn("min-w-0 w-full", classNames?.base),
        trigger: cn(
          "h-14 min-h-14 data-[open=true]:border-red data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-red",
          "rounded-none border border-ink bg-white! px-4 shadow-none data-[hover=true]:border-red group-data-[focus=true]:border-red group-data-[invalid=true]:border-red",
          classNames?.trigger,
        ),
        value: cn(
          "truncate text-left",
          "font-montreal text-base! leading-normal font-normal normal-case text-ink! placeholder:text-ink/40 sm:text-lg!",
          "group-data-[has-value=false]:text-ink/40!",
          classNames?.value,
        ),
        selectorIcon: cn("size-6 shrink-0 text-ink", classNames?.selectorIcon),
        label: cn(
          "font-courier text-sm! leading-[1.3] font-normal tracking-mono text-red! uppercase",
          "pb-2",
          classNames?.label,
        ),
        helperWrapper: cn("px-0 pt-2", classNames?.helperWrapper),
        description: cn(
          "font-courier text-xs leading-5 tracking-mono text-ink/70 uppercase",
          classNames?.description,
        ),
        errorMessage: cn(
          "font-courier text-xs leading-5 tracking-mono text-red uppercase",
          classNames?.errorMessage,
        ),
        listboxWrapper: cn("max-h-72 p-0", classNames?.listboxWrapper),
        popoverContent: cn(
          "rounded-none border border-ink bg-white p-0 text-ink shadow-none",
          classNames?.popoverContent,
        ),
      }}
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
      listboxProps={{
        emptyContent: "No options available",
        ...listboxProps,
        itemClasses: {
          ...listboxProps?.itemClasses,
          base: cn(
            "min-h-11 cursor-pointer rounded-none px-4 py-2.5 text-ink data-[hover=true]:bg-cream! data-[hover=true]:text-red data-[focus=true]:bg-cream! data-[selectable=true]:focus:bg-cream data-[selected=true]:text-red data-[focus-visible=true]:outline-red",
            listboxProps?.itemClasses?.base,
          ),
          title: cn(
            "font-montreal text-base font-normal",
            listboxProps?.itemClasses?.title,
          ),
          selectedIcon: cn("text-red", listboxProps?.itemClasses?.selectedIcon),
        },
      }}
    >
      {options
        ? options.map((option) => (
            <SelectItem
              hideSelectedIcon
              {...selectItemProps}
              key={option.value}
              textValue={option.label}
            >
              {option.label}
            </SelectItem>
          ))
        : (children ?? [])}
    </HeroUISelect>
  ),
);

Select.displayName = "Select";
export default Select;
