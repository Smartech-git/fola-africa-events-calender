"use client";

import { useState, useTransition, type ReactNode } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  parseDate,
  parseDateTime,
  parseTime,
  type CalendarDate,
  type Time,
} from "@internationalized/date";
import { ArrowUpRight } from "lucide-react";
import { Controller, useWatch } from "react-hook-form";

import { discardChanges, saveHappening } from "@/actions/happening-edits";
import HoverText from "@/components/animations/hover-text";
import HappeningStatusDialog, {
  type StatusAction,
} from "@/components/contents/account/happening-status-dialog";
import { AccountSection } from "@/components/contents/account/profile-form";
import ArtworkUpload from "@/components/contents/submit-event/artwork-upload";
import Button from "@/components/ui/button";
import Checkbox from "@/components/ui/check-box";
import Chip from "@/components/ui/chip";
import DatePicker from "@/components/ui/date-picker";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import Textarea from "@/components/ui/text-area";
import TimeInput from "@/components/ui/time-input";
import useReactHookForm from "@/hooks/use-react-form";
import {
  changedFields,
  displayValue,
  fieldLabel,
  type HappeningField,
  type HappeningValues,
} from "@/lib/account/happening-fields";
import { cn } from "@/lib/utils";
import {
  ACCESS_OPTIONS,
  EVENT_TYPES,
  INDUSTRIES,
  LINK_REQUIRED_ACCESS,
  PRIVATE_ACCESS,
  VISIBILITY_OPTIONS,
} from "@/payload/constants";
import {
  editHappeningSchema,
  type EditHappeningValues,
} from "@/validations/happening-edit";

const hhmm = (time: Time) => time.toString().slice(0, 5);
const splitDateTime = (value: string) => {
  if (!value) return { date: null, time: null };
  const parsed = parseDateTime(value);
  return {
    date: parseDate(value.slice(0, 10)),
    time: parseTime(
      `${String(parsed.hour).padStart(2, "0")}:${String(parsed.minute).padStart(2, "0")}`,
    ),
  };
};

const ACTION_LINKS: Record<string, string> = {
  tickets: "Ticket link",
  rsvp: "RSVP link",
  free: "Registration link",
  "industry-only": "Registration link",
};

export interface EditHappeningProps {
  eventId: number;
  /** "direct": in review, edits save onto it. "request": live, edits await approval. */
  mode: "direct" | "request";
  status: string;
  title: string;
  statusLine: string;
  meta: string;
  publicHref?: string;
  cityName: string;
  timezoneLabel?: string | null;
  organiser: string;
  live: HappeningValues;
  values: HappeningValues;
  hasPending: boolean;
  pendingNote?: string | null;
  artworkCurrent?: { id: string; url: string };
  when: string;
}

/** Courier caps line under a field. */
function Hint({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "red";
}) {
  return (
    <p
      className={cn(
        "pt-2 font-courier text-xs tracking-cou uppercase",
        tone === "red" ? "text-red" : "text-ink/60",
      )}
    >
      {children}
    </p>
  );
}

// Figma: 13 — Edit Happening (Profile layout, under the My Happenings tab).
export default function EditHappeningForm(props: EditHappeningProps) {
  const { eventId, mode, live, values } = props;
  const router = useRouter();
  const [isSaving, startSaving] = useTransition();
  const [isDiscarding, startDiscarding] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [dialog, setDialog] = useState<StatusAction | null>(null);
  const [error, setError] = useState<string>();
  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    setError: setFieldError,
    formState: { errors },
  } = useReactHookForm(editHappeningSchema, {
    ...values,
    artworkRights: false,
    note: props.pendingNote ?? "",
  });
  const current = useWatch({ control }) as EditHappeningValues;
  const validate = { shouldDirty: true, shouldValidate: true };

  const start = splitDateTime(values.startAt);
  const end = splitDateTime(values.endAt);
  const [date, setDate] = useState<CalendarDate | null>(start.date);
  const [startTime, setStartTime] = useState<Time | null>(start.time);
  const [endTime, setEndTime] = useState<Time | null>(end.time);
  const [endDate, setEndDate] = useState<CalendarDate | null>(
    end.date && start.date && end.date.compare(start.date) > 0
      ? end.date
      : null,
  );

  // Same rule as the submission form: an end time before the start runs past midnight.
  const syncTimes = (next: {
    date?: CalendarDate | null;
    endDate?: CalendarDate | null;
    start?: Time | null;
    end?: Time | null;
  }) => {
    const d = next.date !== undefined ? next.date : date;
    const ed = next.endDate !== undefined ? next.endDate : endDate;
    const s = next.start !== undefined ? next.start : startTime;
    const e = next.end !== undefined ? next.end : endTime;
    setValue("startAt", d && s ? `${d}T${hhmm(s)}` : "", validate);
    const finalDate =
      ed ?? (d && s && e && e.compare(s) <= 0 ? d.add({ days: 1 }) : d);
    const finalTime = e ? hhmm(e) : ed ? "23:59" : null;
    setValue(
      "endAt",
      finalDate && finalTime ? `${finalDate}T${finalTime}` : "",
      validate,
    );
  };

  const changed = changedFields(live, current as HappeningValues);
  const isChanged = (name: HappeningField) => changed.includes(name);
  const was = (name: HappeningField) =>
    isChanged(name) ? (
      <Hint tone="red">
        Changed · was {displayValue(name, live[name]) || "empty"}
      </Hint>
    ) : null;
  const busy = isSaving || isDiscarding;
  const privateAccess = PRIVATE_ACCESS.includes(current.access);
  const direct = mode === "direct";
  const live_ = props.status === "published" || props.status === "postponed";

  const submit = (data: EditHappeningValues) =>
    startSaving(async () => {
      setError(undefined);
      const result = await saveHappening(eventId, data);
      if (!result.ok) {
        setError(result.error);
        for (const [name, messages] of Object.entries(result.fieldErrors ?? {}))
          if (messages?.[0])
            setFieldError(name as keyof EditHappeningValues, {
              message: messages[0],
            });
        return;
      }
      router.push(
        `/account/happenings/${eventId}/done?result=${direct ? "saved" : "submitted"}`,
      );
    });

  const discard = () => {
    if (!props.hasPending) {
      reset({ ...live, artworkRights: false, note: "" });
      const s = splitDateTime(live.startAt);
      const e = splitDateTime(live.endAt);
      setDate(s.date);
      setStartTime(s.time);
      setEndTime(e.time);
      setEndDate(
        e.date && s.date && e.date.compare(s.date) > 0 ? e.date : null,
      );
      return;
    }
    startDiscarding(async () => {
      const result = await discardChanges(eventId);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  };

  const text = (
    name: Extract<
      HappeningField,
      | "title"
      | "venueName"
      | "venueArea"
      | "venueAddress"
      | "actionUrl"
      | "eventWebsite"
      | "instagram"
      | "publicContactEmail"
    >,
    label: string,
    opts: {
      required?: boolean;
      type?: string;
      hint?: string;
      placeholder?: string;
    } = {},
  ) => (
    <div>
      <Input
        {...register(name)}
        label={label}
        type={opts.type ?? "text"}
        isRequired={opts.required}
        isDisabled={busy}
        placeholder={opts.placeholder}
        isInvalid={Boolean(errors[name])}
        errorMessage={errors[name]?.message}
        classNames={
          isChanged(name)
            ? { inputWrapper: "border-red! border-[1.5px]!" }
            : undefined
        }
      />
      {was(name)}
      {opts.hint && !isChanged(name) && <Hint>{opts.hint}</Hint>}
    </div>
  );

  const select = (
    name: "industry" | "eventType",
    label: string,
    options: { label: string; value: string }[],
  ) => (
    <div>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select
            ref={field.ref}
            name={field.name}
            label={label}
            isRequired
            options={options}
            selectedKeys={field.value ? [field.value] : []}
            onSelectionChange={(keys) => {
              if (keys === "all") return;
              setValue(
                name,
                String(Array.from(keys)[0] ?? "") as never,
                validate,
              );
            }}
            isDisabled={busy}
            isInvalid={Boolean(errors[name])}
            errorMessage={errors[name]?.message}
            classNames={
              isChanged(name)
                ? { trigger: "border-red! border-[1.5px]!" }
                : undefined
            }
          />
        )}
      />
      {was(name)}
    </div>
  );

  const locked = (label: string, value: string, why: string) => (
    <div>
      <Input
        label={label}
        value={value}
        isReadOnly
        classNames={{
          inputWrapper: "bg-cream! border-cream",
          input: "text-ink/60!",
        }}
      />
      <Hint>Locked · {why}</Hint>
    </div>
  );

  const chooseAccess = (value: string) => {
    setValue("access", value as EditHappeningValues["access"], validate);
    if (PRIVATE_ACCESS.includes(value)) setValue("actionUrl", "", validate);
    else setValue("visibility", "public", validate);
    if (current.visibility === "held-date" && value !== "private")
      setValue("visibility", "public", validate);
  };

  const submitLabel = direct ? "Save changes" : "Submit changes for approval";

  return (
    <>
      <div className="flex w-full flex-col gap-12 lg:flex-row lg:gap-16 xl:gap-24">
        {/* Sidebar: the happening, the change list, actions */}
        <aside className="flex flex-col gap-6 lg:sticky lg:top-28 lg:w-75 lg:shrink-0 lg:self-start">
          <div className="flex flex-col gap-3 bg-cream p-5">
            <span className="flex items-center gap-2 font-courier text-xs tracking-cou text-red uppercase">
              <span
                aria-hidden="true"
                className="mb-0.5 size-2 shrink-0 rounded-full bg-red"
              />
              {props.statusLine}
            </span>
            <span className="font-montreal text-2xl font-medium break-words uppercase">
              {props.title}
            </span>
            <span className="font-courier text-xs tracking-cou text-ink/60 uppercase">
              {props.meta}
            </span>
            {props.publicHref && (
              <Link
                href={props.publicHref}
                className="flex w-fit items-center gap-2 border-t border-ink/20 pt-3 font-courier text-xs tracking-cou text-red uppercase hover:underline"
              >
                View live listing
                <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            )}
          </div>

          <div className="flex flex-col">
            <span className="pb-2 font-courier text-sm tracking-cou text-red uppercase">
              {props.hasPending && !changed.length
                ? "No changes"
                : "Your changes"}
              {changed.length ? ` · ${changed.length}` : ""}
            </span>
            {changed.length ? (
              <ul className="flex flex-col">
                {changed.map((name) => (
                  <li
                    key={name}
                    className="flex flex-col gap-1 border-b border-ink/15 py-3.5"
                  >
                    <span className="font-courier text-[11px] tracking-cou text-ink/70 uppercase">
                      {fieldLabel(name)}
                    </span>
                    {name !== "artwork" && (
                      <span className="font-montreal text-sm text-ink/40 line-through">
                        {displayValue(name, live[name]) || "Empty"}
                      </span>
                    )}
                    <span className="font-montreal text-base break-words">
                      {name === "artwork"
                        ? current.artwork
                          ? "New image"
                          : "Removed"
                        : displayValue(name, current[name]) || "Empty"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="border-y border-ink/15 py-3.5 font-montreal text-sm text-ink/60">
                Change any field and it appears here.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              form="edit-happening"
              size="md"
              // The sidebar is narrow; let the longer label wrap.
              className="h-auto min-h-12 w-full px-4 py-3.5 text-center text-wrap whitespace-normal"
              isLoading={isSaving}
              disabled={busy || uploading || !changed.length}
            >
              <HoverText text={submitLabel} />
            </Button>
            <Button
              size="md"
              variant="bordered"
              className="w-full"
              isLoading={isDiscarding}
              disabled={busy || (!changed.length && !props.hasPending)}
              onPress={discard}
            >
              <HoverText text="Discard changes" />
            </Button>
            <p className="font-montreal text-sm text-ink/60">
              {direct
                ? "Your submission isn’t live yet. Saving updates what the team is reviewing."
                : "Nothing changes on the calendar until the Happenings team approves."}
            </p>
            {error && (
              <p
                role="alert"
                className="font-courier text-xs tracking-cou text-red uppercase"
              >
                {error}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-4 bg-ink p-5 text-white">
            <span className="font-courier text-xs tracking-cou text-cream uppercase">
              {direct ? "Not going ahead?" : "Urgent changes"}
            </span>
            <p className="font-montreal text-base">
              {direct
                ? "Withdraw it before it is approved. It never appears on the calendar."
                : "Flagged to the Happenings team immediately. The listing stays visible as Cancelled or Postponed."}
            </p>
            {direct ? (
              <Button
                size="md"
                variant="onWhite"
                className="w-full"
                disabled={busy}
                onPress={() => setDialog("withdraw")}
              >
                <HoverText text="Withdraw submission" />
              </Button>
            ) : (
              <>
                {live_ && (
                  <Button
                    size="md"
                    variant="onWhite"
                    className="w-full"
                    disabled={busy}
                    onPress={() => setDialog("cancel")}
                  >
                    <HoverText text="Cancel happening" />
                  </Button>
                )}
                {props.status === "published" && (
                  <Button
                    size="md"
                    variant="outlineWhite"
                    className="w-full"
                    disabled={busy}
                    onPress={() => setDialog("postpone")}
                  >
                    <HoverText text="Postpone happening" />
                  </Button>
                )}
                {!live_ && (
                  <p className="font-courier text-xs tracking-cou text-cream uppercase">
                    Cancel and postpone open once the happening is live.
                  </p>
                )}
              </>
            )}
          </div>
        </aside>

        {/* The form */}
        <form
          id="edit-happening"
          noValidate
          className="flex min-w-0 flex-1 flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            if (busy || uploading) return;
            void handleSubmit(submit)(event);
          }}
        >
          <div className="mb-10 flex flex-col gap-1.5 bg-ink px-6 py-5 text-white">
            <span className="font-courier text-xs tracking-cou text-cream uppercase">
              {direct ? "Not live yet" : "Live version stays up"}
            </span>
            <p className="font-montreal text-base sm:text-lg">
              {direct
                ? "Your edits update the submission the Happenings team is reviewing."
                : props.hasPending
                  ? "You have changes waiting for approval. Edit them here; the current listing stays on the calendar until they are approved."
                  : "The current approved listing remains on the calendar until your changes are approved."}
            </p>
          </div>

          <AccountSection number={1} title="The happening">
            <div className="grid gap-5 sm:grid-cols-2">
              {text("title", "Event name", { required: true })}
              {locked(
                "Organiser, company or brand",
                props.organiser,
                "ask the team to change",
              )}
              {select("industry", "Industry", INDUSTRIES)}
              {select("eventType", "Event type", EVENT_TYPES)}
            </div>
            <div>
              <Textarea
                {...register("description")}
                label="Short description"
                isDisabled={busy}
                isInvalid={Boolean(errors.description)}
                errorMessage={errors.description?.message}
                classNames={
                  isChanged("description")
                    ? { inputWrapper: "border-red! border-[1.5px]!" }
                    : undefined
                }
              />
              {was("description") ?? (
                <Hint>
                  {current.description?.trim()
                    ? current.description.trim().split(/\s+/).length
                    : 0}{" "}
                  / 60 words
                </Hint>
              )}
            </div>
          </AccountSection>

          <AccountSection number={2} title="When">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <DatePicker
                  label="Start date"
                  isRequired
                  granularity="day"
                  value={date}
                  onChange={(value) => {
                    const next = value
                      ? parseDate(value.toString().slice(0, 10))
                      : null;
                    setDate(next);
                    const keptEnd =
                      next && endDate && endDate.compare(next) < 0
                        ? null
                        : endDate;
                    setEndDate(keptEnd);
                    syncTimes({ date: next, endDate: keptEnd });
                  }}
                  isDisabled={busy}
                  isInvalid={Boolean(errors.startAt)}
                  errorMessage={errors.startAt?.message}
                />
                {was("startAt")}
              </div>
              <DatePicker
                label="End date"
                granularity="day"
                value={endDate}
                minValue={date ?? undefined}
                description="Optional. For events over more than one day."
                onChange={(value) => {
                  const next = value
                    ? parseDate(value.toString().slice(0, 10))
                    : null;
                  setEndDate(next);
                  syncTimes({ endDate: next });
                }}
                isDisabled={busy || !date}
              />
              <TimeInput
                label="Start time"
                isRequired
                value={startTime}
                onChange={(value) => {
                  const next = value ? parseTime(value.toString()) : null;
                  setStartTime(next);
                  syncTimes({ start: next });
                }}
                isDisabled={busy}
              />
              <div>
                <TimeInput
                  label="End time"
                  value={endTime}
                  onChange={(value) => {
                    const next = value ? parseTime(value.toString()) : null;
                    setEndTime(next);
                    syncTimes({ end: next });
                  }}
                  isDisabled={busy}
                  isInvalid={Boolean(errors.endAt)}
                  errorMessage={errors.endAt?.message}
                />
                {was("endAt")}
              </div>
            </div>
            <p className="font-montreal text-sm text-ink/60">
              All times in {props.cityName} time
              {props.timezoneLabel ? ` (${props.timezoneLabel})` : ""}.
            </p>
          </AccountSection>

          <AccountSection number={3} title="Where is it happening?">
            <div className="grid gap-5 sm:grid-cols-2">
              {locked("City", props.cityName, "it sets the listing’s calendar")}
              {text("venueName", "Venue")}
              {text("venueArea", "Area")}
              {text("venueAddress", "Full address", {
                hint: "For verification only",
              })}
            </div>
          </AccountSection>

          <AccountSection number={4} title="Who can attend?">
            <div
              role="radiogroup"
              aria-label="Who can attend"
              className="flex flex-wrap gap-2"
            >
              {ACCESS_OPTIONS.map((option) => (
                <Chip
                  key={option.value}
                  role="radio"
                  aria-checked={current.access === option.value}
                  isSelected={current.access === option.value}
                  disabled={busy}
                  onClick={() => chooseAccess(option.value)}
                >
                  {option.label}
                </Chip>
              ))}
            </div>
            {was("access")}
            {errors.access && <Hint tone="red">{errors.access.message}</Hint>}
            {privateAccess ? (
              <p className="flex gap-3 bg-cream px-4 py-3.5 font-montreal text-base">
                <span
                  aria-hidden="true"
                  className="mt-2 size-2.5 shrink-0 rounded-full bg-red"
                />
                Private and invitation only events have no public link. Making a
                happening private needs the organiser’s confirmation.
              </p>
            ) : (
              text(
                "actionUrl",
                ACTION_LINKS[current.access] ?? "Registration link",
                {
                  required: LINK_REQUIRED_ACCESS.includes(current.access),
                  placeholder: "example.com or tickets@example.com",
                  hint: "A link, or an email address for bookings",
                },
              )
            )}
          </AccountSection>

          <AccountSection number={5} title="Links and information">
            <div className="grid gap-5 sm:grid-cols-2">
              {text("eventWebsite", "Website", { type: "url" })}
              {text("instagram", "Instagram", {
                placeholder: "@handle or instagram.com/handle",
              })}
              {text("publicContactEmail", "Public contact email", {
                type: "email",
              })}
            </div>
          </AccountSection>

          <AccountSection number={6} title="Show us the happening">
            <Controller
              control={control}
              name="artwork"
              render={({ field }) => (
                <ArtworkUpload
                  value={field.value}
                  current={props.artworkCurrent}
                  onChange={(id) => {
                    setValue("artwork", id, validate);
                    if (!id || id === live.artwork)
                      setValue("artworkRights", false, validate);
                  }}
                  onBusyChange={setUploading}
                  disabled={busy}
                  error={errors.artwork?.message}
                />
              )}
            />
            {current.artwork && current.artwork !== live.artwork && (
              <Controller
                name="artworkRights"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    ref={field.ref}
                    name={field.name}
                    isSelected={field.value}
                    onValueChange={field.onChange}
                    isRequired
                    isDisabled={busy}
                    isInvalid={Boolean(errors.artworkRights)}
                  >
                    I have the right to share this artwork, and Happenings may
                    show it on the calendar.
                  </Checkbox>
                )}
              />
            )}
            {errors.artworkRights && (
              <Hint tone="red">{errors.artworkRights.message}</Hint>
            )}
            {!direct && (
              <p className="flex gap-3 bg-cream px-4 py-3.5 font-montreal text-base">
                <span
                  aria-hidden="true"
                  className="mt-2 size-2.5 shrink-0 rounded-full bg-red"
                />
                A new image goes for approval with your other changes. The
                current artwork stays on the event page until then.
              </p>
            )}
          </AccountSection>

          <AccountSection number={7} title="What should Happenings show?">
            <p className="font-montreal text-base">
              {privateAccess
                ? "Choose what can appear on the calendar for this private happening."
                : "Limited listing and Held date are for Private and Invitation only events. Change who can attend first."}
            </p>
            <div
              role="radiogroup"
              aria-label="What Happenings shows"
              className="flex flex-wrap gap-2"
            >
              {VISIBILITY_OPTIONS.map((option) => {
                const allowed =
                  option.value === "public" ||
                  (privateAccess &&
                    (option.value !== "held-date" ||
                      current.access === "private"));
                return (
                  <Chip
                    key={option.value}
                    role="radio"
                    aria-checked={current.visibility === option.value}
                    isSelected={current.visibility === option.value}
                    disabled={busy || !allowed}
                    title={option.description}
                    onClick={() =>
                      setValue(
                        "visibility",
                        option.value as EditHappeningValues["visibility"],
                        validate,
                      )
                    }
                  >
                    {option.label}
                  </Chip>
                );
              })}
            </div>
            {was("visibility")}
          </AccountSection>

          {!direct && (
            <div className="flex flex-col gap-2 pb-10">
              <Textarea
                {...register("note")}
                label="Note for the Happenings team (optional)"
                placeholder="Anything that helps the team review your changes."
                isDisabled={busy}
              />
            </div>
          )}

          <div className="flex flex-col gap-4 border-t-[1.5px] border-ink pt-8 sm:flex-row sm:items-center">
            <Button
              type="submit"
              size="md"
              isLoading={isSaving}
              disabled={busy || uploading || !changed.length}
              className="max-sm:w-full"
            >
              <HoverText text={submitLabel} />
            </Button>
            <p
              aria-live="polite"
              className="font-courier text-xs tracking-cou uppercase"
            >
              {uploading
                ? "Waiting for your artwork to finish uploading"
                : changed.length
                  ? `${changed.length} ${changed.length === 1 ? "change" : "changes"} · not yet ${direct ? "saved" : "submitted"}`
                  : "No changes yet"}
            </p>
          </div>
        </form>
      </div>

      <HappeningStatusDialog
        eventId={eventId}
        action={dialog}
        title={props.title}
        when={props.when}
        onClose={() => setDialog(null)}
      />
    </>
  );
}
