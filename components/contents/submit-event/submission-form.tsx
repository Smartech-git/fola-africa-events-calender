"use client";

import { startTransition, useActionState, useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import {
  parseDate,
  parseTime,
  type CalendarDate,
  type Time,
} from "@internationalized/date";
import { Controller, useWatch } from "react-hook-form";

import {
  submitEvent,
  type SubmitEventActionState,
} from "@/actions/submit-event";
import HoverText from "@/components/animations/hover-text";
import {
  ChoiceCard,
  FieldRow,
  FormSection,
  Note,
  SectionNav,
  SectionProgress,
  useActiveSection,
} from "@/components/contents/submit-event/form-parts";
import SectionWrapper from "@/components/layout/section-wrapper";
import Button from "@/components/ui/button";
import Checkbox from "@/components/ui/check-box";
import DatePicker from "@/components/ui/date-picker";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import Textarea from "@/components/ui/text-area";
import TimeInput from "@/components/ui/time-input";
import useReactHookForm from "@/hooks/use-react-form";
import {
  ACCESS_OPTIONS,
  EVENT_TYPES,
  INDUSTRIES,
  LINK_REQUIRED_ACCESS,
  ORGANISER_TYPES,
  PRIVATE_ACCESS,
  SUBMITTER_RELATIONSHIPS,
  VISIBILITY_OPTIONS,
} from "@/payload/constants";
import type { SubmissionOptions } from "@/payload/submissions/options";
import {
  submitEventDefaults,
  submitEventSchema,
  type SubmitEventValues,
} from "@/validations/submit-event";

// Figma: Submission Form, "Who can attend?" card copy.
const ACCESS_DESCRIPTIONS: Record<string, string> = {
  free: "Anyone may attend.",
  tickets: "Paid entry.",
  rsvp: "Free, confirm attendance.",
  "invitation-only": "Guests invited by you.",
  private: "Details for invited guests only.",
  "industry-only": "For the industry, not the public.",
};

const ACTION_LINKS: Record<string, string> = {
  tickets: "Ticket link",
  rsvp: "RSVP link",
  free: "Registration link",
  "industry-only": "Registration link",
};

const initialActionState: SubmitEventActionState = {
  success: false,
  status: 0,
};

const hhmm = (time: Time) => time.toString().slice(0, 5);

const ampm = (time: Time) =>
  `${time.hour % 12 || 12}:${String(time.minute).padStart(2, "0")} ${time.hour < 12 ? "AM" : "PM"}`;

export default function SubmissionForm({ cities }: SubmissionOptions) {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isSubmitted },
  } = useReactHookForm(submitEventSchema, submitEventDefaults);
  const [state, action, isPending] = useActionState<
    SubmitEventActionState,
    SubmitEventValues
  >(submitEvent, initialActionState);

  // The design asks for a date and two times; the API takes start and end instants.
  const activeSection = useActiveSection();

  const [date, setDate] = useState<CalendarDate | null>(null);
  const [start, setStart] = useState<Time | null>(null);
  const [end, setEnd] = useState<Time | null>(null);
  const [endDate, setEndDate] = useState<CalendarDate | null>(null);

  const [
    title,
    industry,
    eventType,
    access,
    visibility,
    venueName,
    description,
  ] = useWatch({
    control,
    name: [
      "title",
      "industry",
      "eventType",
      "access",
      "visibility",
      "venueName",
      "description",
    ],
  });

  useEffect(() => {
    if (state.success) router.push("/submit-event/success");
  }, [state.success, router]);

  const busy = isSubmitting || isPending || state.success;
  const validate = { shouldDirty: true, shouldValidate: isSubmitted };
  const privateAccess = PRIVATE_ACCESS.includes(access);
  const submitError =
    !isPending && !state.success
      ? (state.error ??
        (state.fieldErrors ? "Please check the highlighted fields." : ""))
      : "";

  const syncTimes = ({
    nextDate = date,
    nextEndDate = endDate,
    nextStart = start,
    nextEnd = end,
  }: {
    nextDate?: CalendarDate | null;
    nextEndDate?: CalendarDate | null;
    nextStart?: Time | null;
    nextEnd?: Time | null;
  }) => {
    setValue(
      "startAt",
      nextDate && nextStart ? `${nextDate}T${hhmm(nextStart)}` : "",
      validate,
    );
    // With an end date, the end time applies on that day (end of day if none).
    // Without one, the event ends the same day, or the next day when the end
    // time is earlier than the start, as for late dinners and parties.
    const finalDate =
      nextEndDate ??
      (nextDate && nextStart && nextEnd && nextEnd.compare(nextStart) <= 0
        ? nextDate.add({ days: 1 })
        : nextDate);
    const finalTime = nextEnd ? hhmm(nextEnd) : nextEndDate ? "23:59" : null;
    setValue(
      "endAt",
      finalDate && finalTime ? `${finalDate}T${finalTime}` : "",
      validate,
    );
  };

  const chooseAccess = (value: string) => {
    setValue("access", value as SubmitEventValues["access"], validate);
    if (PRIVATE_ACCESS.includes(value)) setValue("actionUrl", "", validate);
    if (visibility === "held-date" && value !== "private")
      setValue("visibility", "public", validate);
  };

  const chooseVisibility = (value: string) => {
    setValue("visibility", value as SubmitEventValues["visibility"], validate);
    if (value === "held-date") {
      setValue("access", "private", validate);
      setValue("actionUrl", "", validate);
    }
  };

  const text = (
    name: Parameters<typeof register>[0],
    label: string,
    options: {
      required?: boolean;
      type?: string;
      description?: string;
      placeholder?: string;
    } = {},
  ) => (
    <Input
      {...register(name)}
      label={label}
      type={options.type ?? "text"}
      isRequired={options.required}
      isDisabled={busy}
      description={options.description}
      placeholder={options.placeholder}
      errorMessage={errors[name as keyof typeof errors]?.message as string}
      isInvalid={Boolean(errors[name as keyof typeof errors])}
    />
  );

  const select = (
    name: "city" | "industry" | "eventType" | "organiserType" | "relationship",
    label: string,
    options: { label: string; value: string }[],
  ) => (
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
            setValue(name, (Array.from(keys)[0] ?? "") as never, validate);
          }}
          onBlur={field.onBlur}
          isDisabled={busy || !options.length}
          errorMessage={errors[name]?.message}
          isInvalid={Boolean(errors[name])}
        />
      )}
    />
  );

  const industryEntry = INDUSTRIES.find((entry) => entry.value === industry);
  const accessLabel = ACCESS_OPTIONS.find((o) => o.value === access)?.label;
  const typeLabel = EVENT_TYPES.find((o) => o.value === eventType)?.label;
  const held = visibility === "held-date";
  const preview = {
    title: held
      ? `Private ${industryEntry?.short ?? industryEntry?.label ?? ""} event`
      : title?.trim() || "Your happening",
    facts: [
      start && `${ampm(start)}${end ? ` to ${ampm(end)}` : ""}`,
      !held && visibility === "public" && typeLabel,
      industryEntry?.label,
      held ? "Private" : accessLabel,
      visibility === "public" && venueName?.trim(),
    ].filter(Boolean),
  };

  return (
    <>
      <SectionProgress active={activeSection} />
      <SectionWrapper className="lg:flex-row lg:gap-24">
        <aside className="max-lg:hidden lg:w-75 lg:shrink-0">
          <SectionNav active={activeSection} />
        </aside>

        <form
          noValidate
          className="flex min-w-0 flex-1 flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            if (busy) return;
            void handleSubmit((data) => startTransition(() => action(data)))(
              event,
            );
          }}
        >
          <FormSection id="the-happening">
            {text("title", "Event name", { required: true })}
            {text("organiserName", "Organiser, company or brand", {
              required: true,
            })}
            <FieldRow>
              {select(
                "organiserType",
                "What best describes the organiser?",
                ORGANISER_TYPES,
              )}
              {select("city", "City", cities)}
            </FieldRow>
            <FieldRow>
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
                  // Drop an end date that would now fall before the start.
                  const keptEnd =
                    next && endDate && endDate.compare(next) < 0
                      ? null
                      : endDate;
                  setEndDate(keptEnd);
                  syncTimes({ nextDate: next, nextEndDate: keptEnd });
                }}
                isDisabled={busy}
                isInvalid={Boolean(errors.startAt) && !date}
                errorMessage={!date ? errors.startAt?.message : undefined}
              />
              <DatePicker
                label="End date"
                granularity="day"
                value={endDate}
                minValue={date ?? undefined}
                description="Optional. For events that run over more than one day."
                onChange={(value) => {
                  const next = value
                    ? parseDate(value.toString().slice(0, 10))
                    : null;
                  setEndDate(next);
                  syncTimes({ nextEndDate: next });
                }}
                isDisabled={busy || !date}
              />
            </FieldRow>
            <FieldRow>
              <TimeInput
                label="Start time"
                isRequired
                value={start}
                onChange={(value) => {
                  const next = value ? parseTime(value.toString()) : null;
                  setStart(next);
                  syncTimes({ nextStart: next });
                }}
                isDisabled={busy}
                isInvalid={Boolean(errors.startAt) && Boolean(date)}
                errorMessage={date ? errors.startAt?.message : undefined}
              />
              <TimeInput
                label="End time"
                value={end}
                onChange={(value) => {
                  const next = value ? parseTime(value.toString()) : null;
                  setEnd(next);
                  syncTimes({ nextEnd: next });
                }}
                isDisabled={busy}
                isInvalid={Boolean(errors.endAt)}
                errorMessage={errors.endAt?.message}
              />
            </FieldRow>
            <FieldRow>
              {select("industry", "Industry", INDUSTRIES)}
              {select("eventType", "Event type", EVENT_TYPES)}
            </FieldRow>
            <Textarea
              {...register("description")}
              label="Short description"
              placeholder="What is happening, for whom, and why it matters. Up to 60 words."
              isDisabled={busy}
              isInvalid={Boolean(errors.description)}
              errorMessage={errors.description?.message}
              description={`${description?.trim() ? description.trim().split(/\s+/).length : 0} / 60 words`}
            />
          </FormSection>

          <FormSection id="who-can-attend">
            <div
              role="radiogroup"
              aria-labelledby="who-can-attend-title"
              className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
            >
              {ACCESS_OPTIONS.map((option) => (
                <ChoiceCard
                  key={option.value}
                  name="access"
                  value={option.value}
                  label={option.label}
                  description={ACCESS_DESCRIPTIONS[option.value]}
                  checked={access === option.value}
                  disabled={busy}
                  onChange={chooseAccess}
                />
              ))}
            </div>
            {errors.access && (
              <p
                role="alert"
                className="font-courier text-xs tracking-cou text-red uppercase"
              >
                {errors.access.message}
              </p>
            )}
            {privateAccess && (
              <Note>
                Private and invitation only events have no public link. Only the
                organiser, the company or brand, or their agency or PR may
                submit them.
              </Note>
            )}
          </FormSection>

          <FormSection id="where">
            <FieldRow>
              {text("venueName", "Venue")}
              {text("venueArea", "Area")}
            </FieldRow>
            {text("venueAddress", "Full address")}
            <Note>
              For private events: you choose what location information appears
              publicly. The full address is used for verification.
            </Note>
          </FormSection>

          <FormSection id="links">
            <FieldRow>
              {text("eventWebsite", "Website", { type: "url" })}
              {text("instagram", "Instagram", {
                placeholder: "@handle or instagram.com/handle",
                description: "Handle or profile link.",
              })}
            </FieldRow>
            <FieldRow>
              {privateAccess ? (
                <Note>
                  Private and invitation only events have no public link.
                </Note>
              ) : (
                text("actionUrl", ACTION_LINKS[access] ?? "Registration link", {
                  required: LINK_REQUIRED_ACCESS.includes(access),
                  placeholder: "example.com or tickets@example.com",
                  description: "A link, or an email address for bookings.",
                })
              )}
              {text(
                "publicContactEmail",
                "Public contact email, where applicable",
                {
                  type: "email",
                },
              )}
            </FieldRow>
            <FieldRow>
              {text("organiserWebsite", "Organiser website", { type: "url" })}
              {text("organiserContact", "Organiser contact email", {
                type: "email",
                required: true,
                description: "For verification only; never displayed.",
              })}
            </FieldRow>
          </FormSection>

          {/* <FormSection
          id="show-us"
          intro="Please upload your event artwork or graphic and, where relevant, the invitation."
        >
          <div className="flex flex-col gap-5 sm:flex-row">
            <UploadBox
              badge="May be shown publicly"
              badgeTone="red"
              title="Event artwork or graphic"
              description="Artwork may be displayed publicly where appropriate."
            />
            <UploadBox
              badge="Verification only"
              badgeTone="ink"
              title="Invitation"
              description="Used to verify the event."
            />
          </div>
          <Note>
            Upload your event artwork, invitation or supporting material.
            Invitations submitted for verification will not be published unless
            you explicitly choose otherwise.
          </Note>
          <ChoiceCard
            type="checkbox"
            name="displayInvitation"
            value="yes"
            label="Display the invitation publicly"
            description="Off by default."
            checked={false}
            disabled
            onChange={() => undefined}
          />
        </FormSection> */}

          <FormSection id="about-you">
            <FieldRow>
              {text("submitterName", "Name", { required: true })}
              {text("submitterEmail", "Email", {
                type: "email",
                required: true,
              })}
            </FieldRow>
            <FieldRow>
              {text("submitterPhone", "Phone or WhatsApp", {
                type: "tel",
                required: true,
              })}
              {text("submitterOrganisation", "Organisation")}
            </FieldRow>
            <FieldRow>
              {text("submitterRole", "Role")}
              {select(
                "relationship",
                "Relationship to event",
                SUBMITTER_RELATIONSHIPS,
              )}
            </FieldRow>
            <Note>
              Your account and contact information are used to verify and manage
              your submission. They will not appear publicly unless you choose
              to display them as event contact information.
            </Note>
          </FormSection>

          <FormSection
            id="what-to-show"
            intro="For private and invitation only events, choose what can appear on the calendar."
          >
            <div
              role="radiogroup"
              aria-labelledby="what-to-show-title"
              className="flex flex-col gap-5"
            >
              {VISIBILITY_OPTIONS.map((option) => (
                <ChoiceCard
                  key={option.value}
                  name="visibility"
                  value={option.value}
                  label={option.label}
                  description={option.description}
                  checked={visibility === option.value}
                  disabled={busy}
                  onChange={chooseVisibility}
                />
              ))}
            </div>
            <div
              aria-live="polite"
              className="flex flex-col gap-1 bg-ink px-6 py-5 text-white"
            >
              <span className="font-courier text-xs tracking-cou text-cream uppercase">
                Preview · How it appears in the calendar
              </span>
              <span className="font-montreal text-2xl font-medium tracking-mono uppercase">
                {preview.title}
              </span>
              {preview.facts.length > 0 && (
                <span className="font-courier text-base text-cream sm:text-lg">
                  {preview.facts.join(" · ")}
                </span>
              )}
            </div>
          </FormSection>

          <div className="flex flex-col gap-5 border-t-[1.5px] border-ink pt-10">
            <Controller
              name="agreement"
              control={control}
              render={({ field }) => (
                <Checkbox
                  ref={field.ref}
                  name={field.name}
                  isSelected={field.value}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  isRequired
                  isDisabled={busy}
                  isInvalid={Boolean(errors.agreement)}
                >
                  I confirm that I am authorised to share these event details.
                </Checkbox>
              )}
            />
            {errors.agreement && (
              <p
                role="alert"
                className="font-courier text-xs tracking-cou text-red uppercase"
              >
                {errors.agreement.message}
              </p>
            )}
            <div className="hidden" aria-hidden="true">
              <input
                {...register("website")}
                tabIndex={-1}
                autoComplete="off"
                aria-label="Leave empty"
              />
            </div>
            {submitError && (
              <p
                role="alert"
                className="font-courier text-xs tracking-cou text-red uppercase"
              >
                {submitError}
              </p>
            )}
            {!cities.length && (
              <p
                role="alert"
                className="font-courier text-xs tracking-cou uppercase"
              >
                No cities are available for submission yet.
              </p>
            )}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <Button
                type="submit"
                variant="solid"
                size="md"
                isLoading={isSubmitting || isPending}
                disabled={busy || !cities.length}
                className="w-full sm:w-fit"
              >
                <HoverText text="Submit for review" />
              </Button>
            </div>
          </div>
        </form>
      </SectionWrapper>
    </>
  );
}
