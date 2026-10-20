"use client";

import { useEffect } from "react";

import { Search, X } from "lucide-react";

import Input from "@/components/ui/input";
import { FILTER_KEYS } from "@/constants/filters";
import useReactHookForm from "@/hooks/use-react-form";
import { useRouteParam } from "@/hooks/use-route-param";
import { cn } from "@/lib/utils";
import {
  eventSearchSchema,
  type EventSearchValues,
} from "@/validations/event-search";

const focusStyle =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

interface Props {
  className?: string;
}

export default function EventSearch({ className }: Props) {
  const { getFilterValue, handleParamSet } = useRouteParam();
  const currentSearch = getFilterValue(FILTER_KEYS.search) ?? "";
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useReactHookForm(eventSearchSchema, { search: currentSearch });
  const value = watch("search");

  useEffect(() => {
    reset({ search: currentSearch });
  }, [currentSearch, reset]);

  const applySearch = (search?: string) =>
    handleParamSet({
      [FILTER_KEYS.search]: search || undefined,
      [FILTER_KEYS.page]: undefined,
    });

  const onSubmit = ({ search }: EventSearchValues) => {
    if (search !== currentSearch) applySearch(search);
  };

  const onClear = () => {
    setValue("search", "");
    if (currentSearch) applySearch();
  };

  return (
    <form
      role="search"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className={cn("w-full max-w-100", className)}
    >
      <Input
        {...register("search")}
        type="search"
        aria-label="Search events"
        placeholder="Search events, organisers, venues or seasons"
        autoComplete="off"
        enterKeyHint="search"
        maxLength={100}
        isInvalid={Boolean(errors.search)}
        errorMessage={errors.search?.message}
        classNames={{
          input: "[&::-webkit-search-cancel-button]:hidden",
          inputWrapper: "h-[36px] min-h-[36px]",
        }}
        startContent={
          <button
            type="submit"
            aria-label="Submit search"
            className={cn(
              "flex shrink-0 cursor-pointer items-center text-dark-gray transition-colors hover:text-primary",
              focusStyle,
            )}
          >
            <Search size={14} aria-hidden="true" />
          </button>
        }
        endContent={
          value ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={onClear}
              className={cn(
                "flex shrink-0 animate-jump-in cursor-pointer items-center text-dark-gray transition-colors hover:text-primary",
                focusStyle,
              )}
            >
              <X size={14} aria-hidden="true" />
            </button>
          ) : null
        }
      />
    </form>
  );
}
