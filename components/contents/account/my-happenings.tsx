import Link from "next/link";

import HoverText from "@/components/animations/hover-text";
import Button from "@/components/ui/button";
import { chipVariants } from "@/components/ui/chip";
import { CONTACT_EMAIL } from "@/constants/socials";
import { cn } from "@/lib/utils";
import {
  ACCESS_OPTIONS,
  PUBLIC_STATUSES,
  VISIBILITY_OPTIONS,
} from "@/payload/constants";
import {
  HAPPENING_FILTERS,
  happeningState,
  matchesFilter,
  type HappeningFilter,
  type MemberHappening,
} from "@/payload/members/member-happenings";

const labelOf = (options: { label: string; value: string }[], value: string) =>
  options.find((option) => option.value === value)?.label ?? value;

/** "THU 03 DEC · 19:00" in the city's own time zone, as the calendar shows it. */
function when(happening: MemberHappening) {
  const timeZone = happening.city?.timezone ?? "UTC";
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(happening.startAt));
  const part = (type: string) =>
    parts.find((entry) => entry.type === type)?.value ?? "";
  const day = `${part("weekday")} ${part("day")} ${part("month")}`;
  return {
    day,
    time: happening.allDay ? "All day" : `${part("hour")}:${part("minute")}`,
  };
}

/** Access, then the listing type when it is not a full listing. */
function details(happening: MemberHappening) {
  return [
    labelOf(ACCESS_OPTIONS, happening.access),
    happening.visibility !== "public" &&
      labelOf(VISIBILITY_OPTIONS, happening.visibility),
    happening.city?.name,
  ]
    .filter(Boolean)
    .join(" · ");
}

function State({ happening }: { happening: MemberHappening }) {
  const state = happeningState(happening);
  const live = state === "Live";
  return (
    <span
      className={cn(
        "flex items-center gap-2 font-courier text-xs tracking-cou uppercase",
        (live || state === "Pending review") && "text-red",
      )}
    >
      {live && (
        <span
          aria-hidden="true"
          className="size-2.5 shrink-0 rounded-full bg-red"
        />
      )}
      {state}
    </span>
  );
}

function ViewLink({ happening }: { happening: MemberHappening }) {
  // Only listings on the public calendar have a page to open.
  if (!PUBLIC_STATUSES.includes(happening.status) || !happening.city)
    return null;
  return (
    <Link
      href={`/calendar/${encodeURIComponent(happening.city.slug)}/${encodeURIComponent(happening.slug)}`}
      className="w-fit font-courier text-xs tracking-cou text-red uppercase hover:underline focus-visible:outline-2 focus-visible:outline-red"
    >
      View happening
    </Link>
  );
}

interface Props {
  happenings: MemberHappening[];
  counts: Record<HappeningFilter, number>;
  filter: HappeningFilter;
}

// Figma: 12 — My Happenings. Status filters are chips; the list keeps the
// calendar listing structure, and the state is a word, not a coloured pill.
export default function MyHappenings({ happenings, counts, filter }: Props) {
  const shown = happenings.filter((happening) =>
    matchesFilter(happening, filter),
  );
  const label = HAPPENING_FILTERS.find((entry) => entry.value === filter)!;

  return (
    <div className="flex flex-col gap-10">
      <nav aria-label="Filter your happenings">
        <ul className="flex flex-wrap gap-2">
          {HAPPENING_FILTERS.map((entry) => {
            const current = entry.value === filter;
            return (
              <li key={entry.value}>
                <Link
                  href={`/account/happenings?show=${entry.value}`}
                  aria-current={current ? "page" : undefined}
                  scroll={false}
                  className={chipVariants({
                    variant: current ? "active" : "default",
                  })}
                >
                  {entry.label} · {counts[entry.value]}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {shown.length ? (
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">{label.label} happenings</caption>
          <thead className="max-md:sr-only">
            <tr className="border-b-[1.5px] border-ink font-courier text-sm tracking-cou text-red uppercase">
              <th scope="col" className="w-44 pb-4 font-normal">
                Date
              </th>
              <th scope="col" className="pb-4 font-normal">
                Happening
              </th>
              <th scope="col" className="w-56 pb-4 font-normal">
                State
              </th>
              <th scope="col" className="w-40 pb-4 font-normal">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {shown.map((happening) => {
              const { day, time } = when(happening);
              return (
                <tr
                  key={happening.id}
                  className="flex flex-col gap-2 border-b border-ink/20 py-6 md:table-row md:py-0"
                >
                  <td className="font-courier text-sm tracking-cou uppercase md:py-6 md:align-top">
                    <span className="md:flex md:flex-col">
                      <span>{day} · </span>
                      <span>{time}</span>
                    </span>
                  </td>
                  <td className="md:py-6 md:pr-6 md:align-top">
                    <span className="flex flex-col gap-1.5">
                      <span className="font-montreal text-xl font-medium tracking-mono uppercase sm:text-2xl">
                        {happening.title}
                      </span>
                      <span className="font-courier text-sm">
                        {details(happening)}
                      </span>
                    </span>
                  </td>
                  <td className="md:py-6 md:align-top">
                    <State happening={happening} />
                  </td>
                  <td className="md:py-6 md:text-right md:align-top">
                    <span className="flex md:justify-end">
                      <ViewLink happening={happening} />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div className="flex flex-col items-start gap-5 border-y border-ink/20 py-10">
          <p className="font-montreal text-xl sm:text-2xl">
            {happenings.length
              ? `Nothing ${filter === "upcoming" ? "upcoming" : `in ${label.label.toLowerCase()}`} right now.`
              : "You haven’t submitted a happening yet."}
          </p>
          <Link href="/submit-event/form" className="max-sm:w-full">
            <Button variant="solid" size="md" className="w-full">
              <HoverText text="Submit a happening" />
            </Button>
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-2 bg-ink px-6 py-6 text-white">
        <span className="font-courier text-xs tracking-cou text-cream uppercase">
          Urgent changes
        </span>
        <p className="font-montreal text-base sm:text-lg">
          To cancel, postpone or correct a happening, email{" "}
          <Link
            href={`mailto:${CONTACT_EMAIL}`}
            className="underline hover:text-cream"
          >
            {CONTACT_EMAIL}
          </Link>
          . Cancelled and postponed listings stay visible on the calendar.
        </p>
      </div>
    </div>
  );
}
