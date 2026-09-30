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
      labelPlacement="outside"
      validationBehavior="aria"
      placeholder="Select an option"
      selectorIcon={<ChevronDown size={16} aria-hidden="true" />}
      {...props}
      classNames={{
        ...classNames,
        base: cn("min-w-0 w-full font-inter", classNames?.base),
        trigger: cn(
          "h-[46px] min-h-[46px] rounded-none border border-light-gray bg-transparent! px-3 shadow-none",
          "data-[hover=true]:border-primary data-[open=true]:border-primary data-[focus-visible=true]:outline-primary data-[focus-visible=true]:outline-offset-2 group-data-[invalid=true]:border-danger",
          classNames?.trigger,
        ),
        value: cn(
          "truncate text-left text-xs font-normal text-dark-gray uppercase group-data-[has-value=true]:text-dark-gray!",
          classNames?.value,
        ),
        selectorIcon: cn("shrink-0 text-dark-gray", classNames?.selectorIcon),
        label: cn(
          "text-xs! font-normal text-dark-gray! uppercase",
          classNames?.label,
        ),
        helperWrapper: cn("px-0 pt-2", classNames?.helperWrapper),
        description: cn(
          "text-xs leading-5 uppercase text-dark-gray/75",
          classNames?.description,
        ),
        errorMessage: cn("text-xs uppercase text-danger", classNames?.errorMessage),
        listboxWrapper: cn("max-h-72 p-0", classNames?.listboxWrapper),
        popoverContent: cn(
          "rounded-none border border-light-gray bg-primary-light p-1 font-inter text-dark-gray shadow-none",
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
            "rounded-none border border-light-gray bg-primary-light",
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
            "min-h-9 cursor-pointer rounded-none px-2 py-2 text-dark-gray hover:bg-secondary! data-[hover=true]:bg-secondary! data-[hover=true]:text-primary data-[focus=true]:bg-secondary! data-[selected=true]:text-primary data-[selected=true]:bg-secondary data-[focus-visible=true]:outline-primary",
            listboxProps?.itemClasses?.base,
          ),
          title: cn(
            "text-xs font-normal uppercase",
            listboxProps?.itemClasses?.title,
          ),
          selectedIcon: cn(
            "text-primary",
            listboxProps?.itemClasses?.selectedIcon,
          ),
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
