"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

import {
  endOfMonth,
  endOfWeek,
  parseDate,
  today,
  type CalendarDate,
} from "@internationalized/date";
import type { LenisRef } from "lenis/react";
import { CalendarPlus } from "lucide-react";

import LenisProvider from "@/components/providers/lenis-provider";
import { Accordion } from "@/components/ui/accordion";
import Button from "@/components/ui/button";
import DateRangePicker from "@/components/ui/date-range-picker";
import { FILTER_KEYS } from "@/constants/filters";
import { useRouteParam } from "@/hooks/use-route-param";
import { cn } from "@/lib/utils";
import { ACCESS_OPTIONS, INDUSTRIES } from "@/payload/constants";
import type { CitySummary } from "@/requests/get-cities";

interface Props {
  cities: CitySummary[];
  currentCity: string;
  seasonSelected?: boolean;
}

type DatePreset = "today" | "week" | "month";

const DATE_PRESETS: { label: string; value: DatePreset }[] = [
  { label: "Today", value: "today" },
  { label: "This week", value: "week" },
  { label: "This month", value: "month" },
];

function readDate(value?: string): CalendarDate | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  try {
    return parseDate(value);
  } catch {
    return null;
  }
}

export default function EventFilter({
  cities,
  currentCity,
  seasonSelected = false,
}: Props) {
  const { getFilterValue, getFilterValues, handleParamSet } = useRouteParam();
  const city = cities.find((item) => item.slug === currentCity);
  const single = getFilterValue(FILTER_KEYS.date);
  const from = readDate(getFilterValue(FILTER_KEYS.dateFrom) ?? single);
  const to = readDate(getFilterValue(FILTER_KEYS.dateTo) ?? single);
  const industry = getFilterValues(FILTER_KEYS.industry);
  const access = getFilterValues(FILTER_KEYS.access);

  const presetRange = (preset: DatePreset) => {
    if (!city) return undefined;
    const start = today(city.timezone);
    const end =
      preset === "today"
        ? start
        : preset === "week"
          ? endOfWeek(start, "en-US")
          : endOfMonth(start);
    return { from: start, to: end };
  };
  const activePreset = DATE_PRESETS.find((preset) => {
    const range = presetRange(preset.value);
    return (
      range && from?.compare(range.from) === 0 && to?.compare(range.to) === 0
    );
  })?.value;

  const setDates = (range: { from: CalendarDate; to: CalendarDate } | null) =>
    handleParamSet({
      [FILTER_KEYS.date]: undefined,
      [FILTER_KEYS.dateFrom]: range?.from.toString(),
      [FILTER_KEYS.dateTo]: range?.to.toString(),
      [FILTER_KEYS.page]: undefined,
      ...(getFilterValue(FILTER_KEYS.eventLayoutKey) === "day" && {
        [FILTER_KEYS.eventLayoutKey]: "list",
      }),
    });

  const toggle = (
    key: typeof FILTER_KEYS.industry | typeof FILTER_KEYS.access,
    selected: string[],
    value?: string,
  ) =>
    handleParamSet({
      [key]: !value
        ? undefined
        : selected.includes(value)
          ? selected.filter((item) => item !== value)
          : [...selected, value],
      [FILTER_KEYS.page]: undefined,
    });

  const customRange = Boolean(from && to && !activePreset);
  const datesSet = !seasonSelected && Boolean(from || to);
  const anyActive = datesSet || industry.length > 0 || access.length > 0;

  const clearAll = () =>
    handleParamSet({
      ...(!seasonSelected && {
        [FILTER_KEYS.date]: undefined,
        [FILTER_KEYS.dateFrom]: undefined,
        [FILTER_KEYS.dateTo]: undefined,
        ...(getFilterValue(FILTER_KEYS.eventLayoutKey) === "day" && {
          [FILTER_KEYS.eventLayoutKey]: "list",
        }),
      }),
      [FILTER_KEYS.industry]: undefined,
      [FILTER_KEYS.access]: undefined,
      [FILTER_KEYS.page]: undefined,
    });

  const count = (datesSet ? 1 : 0) + industry.length + access.length;

  const rows = (
    <div className="flex w-full min-w-0 flex-col gap-3 sm:gap-4.5">
      <FilterRow
        title="Date"
        active={activePreset ?? (customRange ? "custom" : "")}
      >
        <Button
          size="xs"
          variant="bordered"
          disabled={!anyActive}
          onPress={clearAll}
          className="shrink-0 rounded-full border-red text-red hover:bg-red hover:text-white sm:px-4"
        >
          Clear all
        </Button>
        {DATE_PRESETS.map((preset) => {
          const range = presetRange(preset.value);
          const selected = activePreset === preset.value;
          return (
            <FilterButton
              key={preset.value}
              label={preset.label}
              selected={selected}
              disabled={seasonSelected || !range}
              onPress={() => setDates(selected ? null : (range ?? null))}
            />
          );
        })}
        <DateRangePicker
          aria-label="Choose dates"
          data-selected={customRange || undefined}
          isDisabled={seasonSelected}
          granularity="day"
          firstDayOfWeek="sun"
          labelPlacement="outside-left"
          value={from && to ? { start: from, end: to } : null}
          onChange={(range) =>
            setDates(
              range
                ? {
                    from: parseDate(range.start.toString()),
                    to: parseDate(range.end.toString()),
                  }
                : null,
            )
          }
          selectorIcon={<CalendarPlus size={16} aria-hidden="true" />}
          classNames={{
            base: "w-auto shrink-0",
            inputWrapper: cn(
              "h-[28px] min-h-[28px] rounded-full border-[1.5px] px-3 sm:px-4",
              customRange
                ? "border-ink bg-ink! data-[hover=true]:border-ink"
                : "border-ink bg-transparent! data-[hover=true]:border-red",
            ),
            segment: cn(
              "font-courier text-xs tracking-cou sm:text-xs",
              customRange &&
                "text-white! data-[placeholder=true]:text-white/60 focus:bg-white/15 focus:text-white",
            ),
            separator: cn(
              "font-courier text-xs sm:text-xs",
              customRange && "text-white/70",
            ),
            selectorButton: cn(
              "size-7 min-w-7  rounded-full",
              customRange && "text-white data-[hover=true]:text-ink!",
            ),
          }}
        />
      </FilterRow>

      <FilterRow title="Industry" active={industry.join(",") || "all"}>
        <FilterButton
          label="All"
          selected={!industry.length}
          onPress={() => toggle(FILTER_KEYS.industry, industry)}
        />
        {INDUSTRIES.map((option) => (
          <FilterButton
            key={option.value}
            label={option.label}
            selected={industry.includes(option.value)}
            onPress={() => toggle(FILTER_KEYS.industry, industry, option.value)}
          />
        ))}
      </FilterRow>

      <FilterRow title="Access" active={access.join(",") || "all"}>
        <FilterButton
          label="All"
          selected={!access.length}
          onPress={() => toggle(FILTER_KEYS.access, access)}
        />
        {ACCESS_OPTIONS.map((option) => (
          <FilterButton
            key={option.value}
            label={option.label}
            selected={access.includes(option.value)}
            onPress={() => toggle(FILTER_KEYS.access, access, option.value)}
          />
        ))}
      </FilterRow>
    </div>
  );

  return (
    <>
      <Accordion
        className="lg:hidden"
        itemClasses={{
          base: "border-b-0",
          trigger: "py-0",
          content: "pt-4 pb-0",
        }}
        items={[
          {
            key: "filters",
            ariaLabel: `Filters${count ? `, ${count} active` : ""}`,
            title: (
              <span className="flex text-red items-center gap-2">
                Filters
                {count > 0 && (
                  <span className="inline-flex h-5 min-w-5 leading-none pt-0.5 items-center justify-center rounded-full bg-ink px-1.5 text-xs text-white">
                    {count}
                  </span>
                )}
              </span>
            ),
            content: rows,
          },
        ]}
      />
      <div className="max-lg:hidden">{rows}</div>
    </>
  );
}

function FilterRow({
  title,
  active,
  children,
}: {
  title: string;
  active: string;
  children: ReactNode;
}) {
  const id = useId();
  const lenisRef = useRef<LenisRef>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const selected = rowRef.current?.querySelector<HTMLElement>(
      "[aria-pressed='true'], [data-selected='true']",
    );
    const lenis = lenisRef.current?.lenis;
    if (!selected || !lenis) return;
    lenis.scrollTo(selected, { offset: -16, duration: 0.8 });
  }, [active]);

  return (
    <div
      ref={rowRef}
      role="group"
      aria-labelledby={id}
      className="flex min-w-0 items-center gap-2.5"
    >
      <span
        id={id}
        className="w-24 shrink-0 font-courier text-sm tracking-cou text-red uppercase max-sm:sr-only"
      >
        {title}
      </span>
      <LenisProvider
        ref={lenisRef}
        orientation="horizontal"
        className="h-fit min-w-0 flex-1 overflow-x-auto overflow-y-hidden *:flex *:min-h-0 *:w-max *:items-center *:gap-2 sm:*:gap-2.5"
      >
        {children}
      </LenisProvider>
    </div>
  );
}

function FilterButton({
  label,
  selected,
  disabled,
  onPress,
}: {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Button
      size="xs"
      variant={selected ? "ink" : "bordered"}
      aria-pressed={selected}
      disabled={disabled}
      onPress={onPress}
      className={cn(
        "shrink-0 rounded-full sm:px-4",
        !selected && "hover:border-red hover:text-red",
      )}
    >
      {label}
    </Button>
  );
}
