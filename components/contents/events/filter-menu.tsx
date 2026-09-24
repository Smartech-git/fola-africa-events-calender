"use client";

import { useId, useState } from "react";

import { parseDate, type CalendarDate } from "@internationalized/date";
import { ArrowLeft, ChevronDown } from "lucide-react";

import DrawHorizontalLine from "@/components/animations/draw-horizontal-line";
import FadeUpText from "@/components/animations/fade-up-text";
import HoverText from "@/components/animations/hover-text";
import Title from "@/components/common/title";
import SectionWrapper from "@/components/layout/section-wrapper";
import LenisProvider from "@/components/providers/lenis-provider";
import Button from "@/components/ui/button";
import DatePicker from "@/components/ui/date-picker";
import Drawer from "@/components/ui/drawer";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem_,
} from "@/components/ui/drop-down";
import { EVENTS_FILTER, FILTER_KEYS } from "@/constants/filters";
import { useRouteParam } from "@/hooks/use-route-param";
import { cn } from "@/lib/utils";
import { ACCESS_OPTIONS, INDUSTRIES } from "@/payload/constants";
import type { CitySummary } from "@/requests/get-cities";

interface Props {
  cities: CitySummary[];
  currentCity: string;
}

interface Filters {
  city: string;
  dateFrom: CalendarDate | null;
  dateTo: CalendarDate | null;
  industry: string[];
  access: string[];
}

const focusStyle =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

function readDate(value?: string): CalendarDate | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  try {
    return parseDate(value);
  } catch {
    return null;
  }
}

function selectedValues(values: string[], options: { value: string }[]) {
  return options
    .filter((option) => values.includes(option.value))
    .map((option) => option.value);
}

export default function FilterMenu({ cities, currentCity }: Props) {
  const { getFilterValue, getFilterValues } = useRouteParam();
  const filters: Filters = {
    city: currentCity,
    dateFrom: readDate(
      getFilterValue(FILTER_KEYS.dateFrom) ?? getFilterValue(FILTER_KEYS.date),
    ),
    dateTo: readDate(
      getFilterValue(FILTER_KEYS.dateTo) ?? getFilterValue(FILTER_KEYS.date),
    ),
    industry: selectedValues(getFilterValues(FILTER_KEYS.industry), INDUSTRIES),
    access: selectedValues(getFilterValues(FILTER_KEYS.access), ACCESS_OPTIONS),
  };
  const counts: Record<string, number> = {
    [FILTER_KEYS.city]: cities.some((city) => city.slug === currentCity)
      ? 1
      : 0,
    [FILTER_KEYS.date]: filters.dateFrom || filters.dateTo ? 1 : 0,
    [FILTER_KEYS.industry]: filters.industry.length,
    [FILTER_KEYS.access]: filters.access.length,
  };

  return (
    <Drawer.Root>
      <SectionWrapper className="flex-row justify-between gap-3 py-4 sm:py-4">
        {EVENTS_FILTER.map((item) => (
          <Drawer.Trigger
            key={item.key}
            variant="flat"
            size="fit"
            aria-haspopup="dialog"
            aria-label={`Filter by ${item.label}${counts[item.key] ? `, ${counts[item.key]} active` : ""}`}
            className={cn(
              "gap-1 text-xs font-medium sm:gap-2 sm:text-xs",
              focusStyle,
            )}
          >
            <HoverText text={item.label} />
            {counts[item.key] > 0 && (
              <div
                className={cn(
                  "z-40 flex h-4 min-w-4 animate-jump-in items-center justify-center bg-dark-gray text-xs font-bold text-white",
                )}
              >
                {counts[item.key]}
              </div>
            )}
            <ChevronDown size={14} aria-hidden="true" />
          </Drawer.Trigger>
        ))}
        <DrawHorizontalLine className="pointer-events-none absolute top-0 left-0 animate-delay-300" />
        <DrawHorizontalLine className="pointer-events-none absolute bottom-0 left-0 animate-delay-500" />
      </SectionWrapper>

      <Drawer.Content
        size="5xl"
        scrollBehavior="inside"
        aria-label="Filter events"
        className="h-[80dvh] max-h-[80dvh] w-full max-w-none bg-primary-light text-dark-gray shadow-none"
      >
        {(onClose) => (
          <>
            <Drawer.Header className="relative shrink-0 border-t border-light-gray py-4 2xl:px-pg-2xl 4k:px-pg-4k">
              <Button
                startContent={
                  <ArrowLeft
                    size={12}
                    className="translate-x-1 transition-all group-hover:translate-x-0"
                  />
                }
                className="ml-1"
                onPress={onClose}
                variant="flat"
                size="fit"
              >
                <HoverText text="Back to events" />
              </Button>
              <DrawHorizontalLine className="absolute bottom-0 left-0 animate-delay-500" />
            </Drawer.Header>
            <Drawer.Body className="scrollbar-none min-h-0 px-0! pt-0 pb-0">
              <LenisProvider className="">
                <SectionWrapper className="gap-8 pt-4 pb-10 sm:gap-10 sm:pt-6 sm:pb-16">
                  <div className="space-y-3">
                    <FadeUpText
                      className="font-apris text-3xl uppercase sm:text-4xl"
                      text="Filter events"
                    />
                    <FadeUpText
                      delay={0.3}
                      className="max-w-xl text-xs uppercase"
                      text="Choose one city and date range. Industry and Access allow
                    multiple selections."
                    />
                  </div>
                  <FilterOptions
                    key={JSON.stringify(filters)}
                    cities={cities}
                    initialFilters={filters}
                    onClose={onClose}
                  />
                </SectionWrapper>
              </LenisProvider>
            </Drawer.Body>
          </>
        )}
      </Drawer.Content>
    </Drawer.Root>
  );
}

function FilterOptions({
  cities,
  initialFilters,
  onClose,
}: {
  cities: CitySummary[];
  initialFilters: Filters;
  onClose: () => void;
}) {
  const { handleParamSet, clearAllParams } = useRouteParam();
  const [filters, setFilters] = useState(initialFilters);
  const id = useId();
  const cityLabelId = `${id}-city`;
  const selectedCity = cities.find((city) => city.slug === filters.city);
  const invalidRange = Boolean(
    filters.dateFrom &&
    filters.dateTo &&
    filters.dateFrom.compare(filters.dateTo) > 0,
  );

  const toggleOption = (key: "industry" | "access", value: string) => {
    setFilters((previous) => ({
      ...previous,
      [key]: previous[key].includes(value)
        ? previous[key].filter((selected) => selected !== value)
        : [...previous[key], value],
    }));
  };

  const applyFilters = () => {
    if (!selectedCity || invalidRange) return;

    handleParamSet({
      [FILTER_KEYS.city]: selectedCity.slug,
      [FILTER_KEYS.date]: undefined,
      [FILTER_KEYS.dateFrom]: filters.dateFrom?.toString(),
      [FILTER_KEYS.dateTo]: filters.dateTo?.toString(),
      [FILTER_KEYS.industry]: filters.industry,
      [FILTER_KEYS.access]: filters.access,
      [FILTER_KEYS.page]: undefined,
    });
    onClose();
  };

  const clearFilters = () => {
    clearAllParams();
    setFilters({
      city: initialFilters.city,
      dateFrom: null,
      dateTo: null,
      industry: [],
      access: [],
    });
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        applyFilters();
      }}
      className="flex flex-col gap-8 sm:gap-10"
    >
      <div className="space-y-3">
        <FilterLabel
          id={cityLabelId}
          title="City"
          count={selectedCity ? 1 : 0}
        />
        <Dropdown>
          <DropdownTrigger
            aria-labelledby={`${cityLabelId} ${id}-selected-city`}
            disabled={!cities.length}
          >
            <span id={`${id}-selected-city`} className="min-w-0 truncate">
              {selectedCity?.name ?? "Select a city"}
            </span>
            <ChevronDown size={16} aria-hidden="true" className="shrink-0" />
          </DropdownTrigger>
          <DropdownMenu
            aria-labelledby={cityLabelId}
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={selectedCity ? [selectedCity.slug] : []}
            onSelectionChange={(keys) => {
              if (keys === "all") return;
              const city = Array.from(keys)[0];
              if (
                typeof city === "string" &&
                city !== filters.city &&
                cities.some((item) => item.slug === city)
              ) {
                setFilters((previous) => ({ ...previous, city }));
                handleParamSet(
                  { [FILTER_KEYS.city]: city },
                  undefined,
                  "/events/" + encodeURIComponent(city),
                );
                onClose();
              }
            }}
            emptyContent="No cities available"
          >
            {cities.map((city) => (
              <DropdownItem_ key={city.slug} textValue={city.name}>
                {city.name}
              </DropdownItem_>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>

      <div className="grid max-w-full grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="min-w-0 space-y-3">
          <FilterLabel id={`${id}-from`} title="From" />
          <DatePicker
            aria-labelledby={`${id}-from`}
            name={FILTER_KEYS.dateFrom}
            granularity="day"
            value={filters.dateFrom}
            maxValue={filters.dateTo ?? undefined}
            onChange={(date) =>
              setFilters((previous) => ({
                ...previous,
                dateFrom: date ? parseDate(date.toString()) : null,
              }))
            }
            validationBehavior="aria"
          />
        </div>
        <div className="min-w-0 space-y-3">
          <FilterLabel id={`${id}-to`} title="To" />
          <DatePicker
            aria-labelledby={`${id}-to`}
            name={FILTER_KEYS.dateTo}
            granularity="day"
            value={filters.dateTo}
            minValue={filters.dateFrom ?? undefined}
            onChange={(date) =>
              setFilters((previous) => ({
                ...previous,
                dateTo: date ? parseDate(date.toString()) : null,
              }))
            }
            validationBehavior="aria"
            isInvalid={invalidRange || undefined}
            errorMessage={
              invalidRange ? "To must be on or after From." : undefined
            }
          />
        </div>
      </div>

      <FilterChoices
        id={`${id}-industry`}
        title="Industry"
        options={INDUSTRIES}
        selected={filters.industry}
        onToggle={(value) => toggleOption("industry", value)}
      />
      <FilterChoices
        id={`${id}-access`}
        title="Access"
        options={ACCESS_OPTIONS}
        selected={filters.access}
        onToggle={(value) => toggleOption("access", value)}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
        <Button
          type="button"
          size="sm"
          onPress={applyFilters}
          disabled={!selectedCity || invalidRange}
          className={cn("w-full sm:w-fit", focusStyle)}
        >
          <HoverText text="Apply filters" />
        </Button>
        <Button
          variant="bordered"
          size="sm"
          type="button"
          onPress={clearFilters}
          className={cn("w-full sm:w-fit", focusStyle)}
        >
          <HoverText text=" Clear all" />
        </Button>
      </div>
    </form>
  );
}

function FilterLabel({
  id,
  title,
  count = 0,
}: {
  id: string;
  title: string;
  count?: number;
}) {
  return (
    <div id={id} className="flex items-center gap-2">
      <Title title={title} />
      {count > 0 && (
        <span className="inline-flex h-4 min-w-4 items-center justify-center bg-dark-gray font-inter text-xs text-white">
          <span className="sr-only">Active filters: </span>
          {count}
        </span>
      )}
    </div>
  );
}

function FilterChoices({
  id,
  title,
  options,
  selected,
  onToggle,
}: {
  id: string;
  title: string;
  options: { label: string; value: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div role="group" aria-labelledby={id} className="space-y-3">
      <FilterLabel id={id} title={title} count={selected.length} />
      <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3">
        {options.map((option) => {
          const isSelected = selected.includes(option.value);
          return (
            <Button
              key={option.value}
              type="button"
              variant="bordered"
              aria-pressed={isSelected}
              onPress={() => onToggle(option.value)}
              className={cn(
                "h-11 w-full justify-start border-light-gray px-3 text-left font-normal hover:border-primary hover:text-primary",
                focusStyle,
                isSelected && "border-none bg-secondary text-primary",
              )}
            >
              {option.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
