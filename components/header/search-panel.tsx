"use client";

import { useEffect, useId, useState, type FormEvent } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { ArrowRight, Search, X } from "lucide-react";

import NothingHereCard from "@/components/contents/events/nothing-here-card";
import Button from "@/components/ui/button";
import Checkbox from "@/components/ui/check-box";
import { ALL_CITIES, FILTER_KEYS } from "@/constants/filters";
import { useAPI } from "@/hooks/use-api";
import {
  cityDate,
  eventPath,
  formatDay,
  formatTime,
} from "@/lib/events/event-list";
import { ACCESS_OPTIONS, EVENT_TYPES, INDUSTRIES } from "@/payload/constants";
import type { PublicEvent, SearchResults } from "@/requests/helpers/types";

const DEBOUNCE_MS = 300;
const MAX_LENGTH = 100;

const label = "font-courier text-sm tracking-cou text-red uppercase";
const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red";

const calendarLink = (key: string, value: string, city: string) =>
  `/calendar/${encodeURIComponent(city)}?${new URLSearchParams({ [key]: value })}`;

interface Props {
  /** The city searched first: the open calendar's, else the visitor's choice. */
  city: string;
  onClose: () => void;
}

export default function SearchPanel({ city, onClose }: Props) {
  const router = useRouter();
  const inputId = useId();
  const [query, setQuery] = useState("");
  const [term, setTerm] = useState("");
  const [allCities, setAllCities] = useState(false);
  const typed = query.trim().replace(/\s+/g, " ");

  useEffect(() => {
    const timer = setTimeout(() => setTerm(typed), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [typed]);

  const params = new URLSearchParams({
    search: term,
    city: allCities ? ALL_CITIES : city,
  });
  const { data, error, isLoading } = useAPI<SearchResults>(
    term ? `/api/public/search?${params}` : null,
    { keepPreviousData: true },
  );
  const results = term && data ? data : undefined;

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!typed) return;
    // Across cities, see all in the city with the most matches.
    const target =
      results?.city?.slug ?? results?.events.byCity[0]?.city.slug ?? city;
    router.push(calendarLink(FILTER_KEYS.search, typed, target));
    onClose();
  };

  return (
    <div className="flex w-full flex-col gap-6 text-ink sm:gap-9">
      <label htmlFor={inputId} className={label}>
        Search happenings
      </label>

      <form
        role="search"
        noValidate
        onSubmit={onSubmit}
        className="flex items-center gap-4 border-b-2 border-ink pb-3.5"
      >
        <button
          type="submit"
          aria-label="See all results"
          className={`shrink-0 cursor-pointer ${focus}`}
        >
          <Search
            aria-hidden="true"
            strokeWidth={1.5}
            className="size-5 sm:size-6"
          />
        </button>
        <input
          id={inputId}
          autoFocus
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Type to search"
          autoComplete="off"
          enterKeyHint="search"
          maxLength={MAX_LENGTH}
          className="min-w-0 flex-1 bg-transparent font-montreal text-xl font-medium tracking-mono text-ink outline-none placeholder:text-ink/30 sm:text-2xl [&::-webkit-search-cancel-button]:hidden"
        />
        <Button
          variant="bordered"
          size="icon"
          aria-label={query ? "Clear search" : "Close search"}
          onClick={() => (query ? setQuery("") : onClose())}
          className="rounded-full"
        >
          <X aria-hidden="true" size={16} />
        </Button>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        {term && (
          <p
            aria-live="polite"
            className="font-courier text-[11px] tracking-cou text-ink/70 uppercase sm:text-[13px]"
          >
            {error
              ? "Search is unavailable right now. Try again shortly."
              : !results || isLoading
                ? "Searching…"
                : `${resultCount(results)} ${resultCount(results) === 1 ? "result" : "results"} in ${results.city?.name ?? "all cities"} · Upcoming`}
          </p>
        )}
        <Checkbox
          isSelected={allCities}
          onValueChange={setAllCities}
          classNames={{
            base: "items-center py-0 sm:ml-auto",
            wrapper: "mt-0 bg-transparent",
            label: "text-xs sm:text-sm",
          }}
        >
          Search all cities
        </Checkbox>
      </div>

      {results && (
        <Results results={results} term={term} onNavigate={onClose} />
      )}
    </div>
  );
}

function resultCount({ events, industries, access }: SearchResults) {
  return events.totalDocs + industries.length + access.length;
}

function Results({
  results: { city, events, industries, access },
  term,
  onNavigate,
}: {
  results: SearchResults;
  term: string;
  onNavigate: () => void;
}) {
  // Across cities, every result names its city.
  const showCity = !city;
  // Cities with more matches than the list shows.
  const more = events.byCity.filter(
    (row) =>
      row.upcoming >
      events.data.filter((event) => event.city?.slug === row.city.slug).length,
  );
  const groups = [
    { title: "Industries", key: FILTER_KEYS.industry, rows: industries },
    { title: "Access", key: FILTER_KEYS.access, rows: access },
  ].filter((group) => group.rows.length > 0);

  return (
    <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:gap-14">
      <section aria-label="Happenings" className="flex min-w-0 flex-1 flex-col">
        {events.data.length ? (
          <>
            <h3 className={label}>Happenings</h3>
            <ul className="flex flex-col">
              {events.data.map((event) => {
                const place = event.city ?? city;
                if (!place) return null;
                return (
                  <li key={event.id}>
                    <EventRow
                      event={event}
                      href={eventPath(event, place.slug)}
                      timezone={place.timezone}
                      cityName={showCity ? place.name : undefined}
                      term={term}
                      onNavigate={onNavigate}
                    />
                  </li>
                );
              })}
            </ul>
            {more.map((row) => (
              <LinkRow
                key={row.city.slug}
                href={calendarLink(FILTER_KEYS.search, term, row.city.slug)}
                text={
                  showCity
                    ? `See all ${row.upcoming} in ${row.city.name}`
                    : `See all ${row.upcoming} happenings`
                }
                onNavigate={onNavigate}
              />
            ))}
          </>
        ) : (
          <NothingHereCard
            as="h3"
            label={`No happenings match “${term}”`}
            className="sm:px-8 sm:pt-8 sm:pb-10"
          />
        )}
      </section>

      {groups.length > 0 && (
        <div className="flex shrink-0 flex-col gap-7 lg:w-105">
          {groups.map((group) => (
            <section key={group.key} className="flex flex-col">
              <h3 className={label}>{group.title}</h3>
              <ul className="flex flex-col">
                {group.rows.map((row) => (
                  <li key={`${row.value}-${row.city.slug}`}>
                    <LinkRow
                      href={calendarLink(group.key, row.value, row.city.slug)}
                      text={[
                        row.label,
                        showCity && row.city.name,
                        `${row.upcoming} upcoming`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                      onNavigate={onNavigate}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function EventRow({
  event,
  href,
  timezone,
  cityName,
  term,
  onNavigate,
}: {
  event: PublicEvent;
  href: string;
  timezone: string;
  /** Shown when searching every city. */
  cityName?: string;
  term: string;
  onNavigate: () => void;
}) {
  const day = formatDay(cityDate(event.startAt, timezone), "EEE dd MMM");
  const time = event.allDay ? "All day" : formatTime(event.startAt, timezone);
  const details = [
    EVENT_TYPES.find((item) => item.value === event.eventType)?.label,
    INDUSTRIES.find((item) => item.value === event.industry)?.label,
    ACCESS_OPTIONS.find((item) => item.value === event.access)?.label,
    event.status === "cancelled" && "Cancelled",
    event.status === "postponed" && "Postponed",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`group flex flex-col gap-1 border-b border-ink/25 py-4 ${focus}`}
    >
      <time
        dateTime={event.startAt}
        className="font-courier text-[11px] tracking-cou text-red uppercase sm:text-[13px]"
      >
        {[day, time, cityName].filter(Boolean).join(" · ")}
      </time>
      <span className="font-montreal text-lg font-medium tracking-mono wrap-break-word uppercase transition-colors group-hover:text-red sm:text-2xl">
        <Highlight text={event.title} term={term} />
      </span>
      {details && (
        <span className="font-courier text-sm sm:text-base">{details}</span>
      )}
    </Link>
  );
}

function LinkRow({
  href,
  text,
  onNavigate,
}: {
  href: string;
  text: string;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`group flex items-center justify-between gap-4 border-b border-ink/25 py-3 font-montreal text-lg transition-colors hover:text-red ${focus}`}
    >
      {text}
      <ArrowRight
        size={18}
        aria-hidden="true"
        className="shrink-0 transition-transform group-hover:translate-x-1"
      />
    </Link>
  );
}

function Highlight({ text, term }: { text: string; term: string }) {
  const words = term
    .split(" ")
    .filter(Boolean)
    .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!words.length) return text;
  return text
    .split(new RegExp(`(${words.join("|")})`, "gi"))
    .map((part, index) =>
      index % 2 ? (
        <mark key={index} className="bg-transparent text-red">
          {part}
        </mark>
      ) : (
        part
      ),
    );
}
