"use client";

import {
  startTransition,
  useActionState,
  useState,
  type ReactNode,
} from "react";

import { parseDateTime } from "@internationalized/date";
import { Controller, useWatch } from "react-hook-form";

import {
  submitEvent,
  type SubmitEventActionState,
} from "@/actions/submit-event";
import DrawHorizontalLine from "@/components/animations/draw-horizontal-line";
import FadeUpText from "@/components/animations/fade-up-text";
import HoverText from "@/components/animations/hover-text";
import HeaderTitle from "@/components/common/header-title";
import LabelTitle from "@/components/common/label-title";
import SubmissionSuccess from "@/components/contents/events/submission-success";
import SectionWrapper from "@/components/layout/section-wrapper";
import Button from "@/components/ui/button";
import Checkbox from "@/components/ui/check-box";
import DatePicker from "@/components/ui/date-picker";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import Textarea from "@/components/ui/text-area";
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

type TextFieldName = Exclude<
  keyof SubmitEventValues,
  "allDay" | "agreement" | "seasons"
>;

const ACTION_LINKS: Record<string, { title: string; description: string }> = {
  tickets: {
    title: "Ticket link",
    description: "Required for ticketed events.",
  },
  rsvp: { title: "RSVP link", description: "Required when RSVP is required." },
  free: { title: "Registration link", description: "Optional." },
  "industry-only": {
    title: "Registration link",
    description: "Optional. Where industry guests can register.",
  },
};

const initialActionState: SubmitEventActionState = {
  success: false,
  status: 0,
};

export default function SubmitEventForm(options: SubmissionOptions) {
  const [formVersion, setFormVersion] = useState(0);

  return (
    <EventSubmissionForm
      key={formVersion}
      {...options}
      onReset={() => setFormVersion((version) => version + 1)}
    />
  );
}

function EventSubmissionForm({
  cities,
  seasons,
  onReset,
}: SubmissionOptions & { onReset: () => void }) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors, isSubmitting, isSubmitted },
  } = useReactHookForm(submitEventSchema, submitEventDefaults);
  const [state, action, isPending] = useActionState<
    SubmitEventActionState,
    SubmitEventValues
  >(submitEvent, initialActionState);
  const [receiptDismissed, setReceiptDismissed] = useState(false);

  const submitError =
    !isPending && !state.success
      ? (state.error ??
        (state.fieldErrors ? "Please check the highlighted fields." : ""))
      : "";
  const [city, access, visibility, description, startAt] = useWatch({
    control,
    name: ["city", "access", "visibility", "description", "startAt"],
  });
  const selectedCity = cities.find((item) => item.value === city);
  const privateEvent = PRIVATE_ACCESS.includes(access);
  const actionLink = ACTION_LINKS[access] ?? ACTION_LINKS.free;
  const busy = isSubmitting || isPending || state.success;

  const input = (
    name: TextFieldName,
    title: string,
    required = false,
    type = "text",
    description?: string,
  ) => (
    <div className="min-w-0 space-y-3" key={name}>
      <FieldLabel name={name} title={title} required={required} />
      <Input
        {...register(name)}
        id={name}
        aria-labelledby={`${name}-label`}
        type={type}
        isRequired={required}
        isDisabled={busy}
        description={description}
        errorMessage={errors[name]?.message}
        isInvalid={Boolean(errors[name])}
      />
    </div>
  );

  const dateInput = (
    name: "startAt" | "endAt",
    title: string,
    required = false,
    description?: string,
  ) => (
    <div className="min-w-0 space-y-3" key={name}>
      <FieldLabel name={name} title={title} required={required} />
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <DatePicker
            ref={field.ref}
            id={name}
            name={field.name}
            aria-labelledby={`${name}-label`}
            granularity="minute"
            value={field.value ? parseDateTime(field.value) : null}
            minValue={
              name === "endAt" && startAt
                ? parseDateTime(startAt).add({ minutes: 1 })
                : undefined
            }
            onChange={(date) =>
              field.onChange(date ? date.toString().slice(0, 16) : "")
            }
            onBlur={field.onBlur}
            isRequired={required}
            isDisabled={busy}
            validationBehavior="aria"
            description={description}
            errorMessage={errors[name]?.message}
            isInvalid={Boolean(errors[name])}
          />
        )}
      />
    </div>
  );

  const select = (
    name: TextFieldName | "seasons",
    title: string,
    options: { label: string; value: string }[],
    required = false,
    description?: string,
  ) => (
    <div className="min-w-0 space-y-3" key={name}>
      <FieldLabel name={name} title={title} required={required} />
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select
            ref={field.ref}
            id={name}
            name={field.name}
            aria-labelledby={`${name}-label`}
            options={options}
            selectedKeys={
              Array.isArray(field.value)
                ? field.value
                : field.value
                  ? [field.value]
                  : []
            }
            onBlur={field.onBlur}
            selectionMode={name === "seasons" ? "multiple" : "single"}
            isDisabled={busy || !options.length}
            isRequired={required}
            description={description}
            errorMessage={errors[name]?.message}
            isInvalid={Boolean(errors[name])}
            onSelectionChange={(keys) => {
              if (keys === "all") return;
              const values = Array.from(keys).map(String);
              const value = name === "seasons" ? values : (values[0] ?? "");
              setValue(name, value, { shouldDirty: true });
              if (name === "city") setValue("seasons", []);
              if (
                name === "access" &&
                typeof value === "string" &&
                PRIVATE_ACCESS.includes(value)
              )
                setValue("actionUrl", "");
              if (name === "visibility" && value === "held-date") {
                setValue("access", "private");
                setValue("actionUrl", "");
              }
              // Validate related fields after applying all selection changes.
              if (isSubmitted) void trigger();
            }}
          />
        )}
      />
    </div>
  );

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    await handleSubmit(async (data) => {
      setReceiptDismissed(false);
      startTransition(() => action(data));
    })(e);
  };

  const submitAnother = () => {
    onReset();
    document
      .getElementById("submit-event-heading")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <div id="submit-event-heading" className="relative w-full">
        <SectionWrapper>
          <div className="relative space-y-4 uppercase">
            <HeaderTitle as="h1" text="Put it on Happenings." />
            <p className="text-sm uppercase">
              Planning something? Tell us what’s happening.
            </p>
            <p className="max-w-150 text-xs leading-5 uppercase">
              From summits, conferences and launches to exhibitions, screenings,
              shows, dinners, concerts and private gatherings, submit your event
              for consideration on Happenings of Africa.
            </p>
            <p className="max-w-150 text-xs leading-5 uppercase">
              Public, ticketed, RSVP, invitation only or private. Every
              submission is reviewed before appearing on the calendar.
            </p>
          </div>
        </SectionWrapper>
        <DrawHorizontalLine className="pointer-events-none absolute bottom-0 left-0 animate-delay-300" />
      </div>

      <SectionWrapper className="pb-16 sm:pb-20">
        <p className="mb-4 w-fit bg-secondary px-2 py-0.5 text-xxs uppercase sm:text-xs">
          Fields marked * are required. Your contact details are never
          displayed.
        </p>
        <form noValidate onSubmit={onSubmit}>
          <FormSection title="01 / The Happening">
            {input("title", "Event name", true)}
            {input("organiserName", "Organiser, company or brand", true)}
            {select(
              "organiserType",
              "What best describes the organiser?",
              ORGANISER_TYPES,
              true,
            )}
            {select("city", "City", cities, true)}
            {dateInput(
              "startAt",
              "Start date & time",
              true,
              selectedCity
                ? `Local time in ${selectedCity.timezoneLabel}`
                : "Select a city for its local time zone.",
            )}
            {dateInput("endAt", "End date & time", false, "Optional")}
            <div className="space-y-3">
              <FieldLabel name="allDay" title="All day" />
              <Controller
                name="allDay"
                control={control}
                render={({ field }) => (
                  <Select
                    id="allDay"
                    name={field.name}
                    aria-labelledby="allDay-label"
                    ref={field.ref}
                    selectedKeys={[field.value ? "yes" : "no"]}
                    disallowEmptySelection
                    onSelectionChange={(keys) => {
                      if (keys !== "all") field.onChange(keys.has("yes"));
                    }}
                    onBlur={field.onBlur}
                    isDisabled={busy}
                    options={[
                      { label: "No", value: "no" },
                      { label: "Yes", value: "yes" },
                    ]}
                  />
                )}
              />
            </div>
            {select("eventType", "Event type", EVENT_TYPES, true)}
            {select(
              "industry",
              "Industry",
              INDUSTRIES,
              true,
              "Choose one primary industry.",
            )}
            {select(
              "secondaryIndustry",
              "Secondary industry",
              INDUSTRIES,
              false,
              "Optional; used for filtering only. Select again to clear.",
            )}
            <div className="space-y-3 sm:col-span-2">
              <FieldLabel name="description" title="Short description" />
              <Textarea
                {...register("description")}
                id="description"
                aria-labelledby="description-label"
                isDisabled={busy}
                minRows={3}
                isInvalid={Boolean(errors.description)}
                errorMessage={errors.description?.message}
                description={`${description?.trim() ? description.trim().split(/\s+/).length : 0} / 60 words · Event page only. Keep the description factual.`}
              />
            </div>
            <div className="sm:col-span-2">
              {select(
                "seasons",
                "In the diary",
                seasons.filter((season) => season.city === city),
                false,
                "Optional. Choose a major period in this city that the event belongs to.",
              )}
            </div>
          </FormSection>
          <FormSection title="02 / Who can attend?">
            {select("access", "Access", ACCESS_OPTIONS, true)}
            {privateEvent ? (
              <p className="self-end text-xs leading-5 uppercase">
                Private and invitation only events have no public link. Only the
                organiser, the company or brand, or their agency or PR may
                submit them.
              </p>
            ) : (
              input(
                "actionUrl",
                actionLink.title,
                LINK_REQUIRED_ACCESS.includes(access),
                "url",
                actionLink.description,
              )
            )}
          </FormSection>
          <FormSection title="03 / What should Happenings show?">
            {select(
              "visibility",
              "Listing",
              VISIBILITY_OPTIONS,
              true,
              VISIBILITY_OPTIONS.find((option) => option.value === visibility)
                ?.description,
            )}
            <p className="self-end text-xs leading-5 uppercase">
              For private events, you choose what appears publicly. A held date
              shows only the industry, date, time and Private status.
            </p>
          </FormSection>
          <FormSection title="04 / Where is it happening?">
            {input("venueName", "Venue")}
            {input("venueArea", "Area")}
            {input("venueAddress", "Full address")}
            {input("venueMapUrl", "Map link", false, "url")}
          </FormSection>
          <FormSection title="05 / Links and information">
            {input("eventWebsite", "Website", false, "url")}
            {input(
              "instagram",
              "Instagram",
              false,
              "text",
              "Handle or profile link.",
            )}
            {input("organiserWebsite", "Organiser website", false, "url")}
            {input(
              "publicContactEmail",
              "Public contact email",
              false,
              "email",
              "Optional. Shown on full listings so guests can get in touch.",
            )}
            <div className="sm:col-span-2">
              {input(
                "organiserContact",
                "Organiser contact email",
                true,
                "email",
                "For verification only; never displayed.",
              )}
            </div>
          </FormSection>
          <FormSection title="06 / About you">
            <p className="text-xs leading-5 uppercase sm:col-span-2">
              Your contact information is used to verify and manage your
              submission. It will not appear publicly unless you add it above as
              the public contact email.
            </p>
            {input("submitterName", "Name", true)}
            {input("submitterEmail", "Email", true, "email")}
            {input("submitterPhone", "Phone or WhatsApp", true, "tel")}
            {input("submitterOrganisation", "Organisation")}
            {input("submitterRole", "Role")}
            {select(
              "relationship",
              "Relationship to event",
              SUBMITTER_RELATIONSHIPS,
              true,
            )}
          </FormSection>
          <div className="space-y-4 py-8">
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
                  aria-describedby="agreement-error"
                >
                  I confirm that I am authorised to share these event details.
                </Checkbox>
              )}
            />
            {errors.agreement && (
              <p
                id="agreement-error"
                role="alert"
                className="text-xs text-danger uppercase"
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
            <p className="mt-8 text-xs uppercase">
              Submitting sends this listing for review. It does not publish it.
            </p>
            {submitError && (
              <p role="alert" className="text-xs text-danger uppercase">
                {submitError}
              </p>
            )}
            {!cities.length && (
              <p role="alert" className="text-xs uppercase">
                No cities are available for submission yet.
              </p>
            )}
            <Button
              type="submit"
              isLoading={isSubmitting || isPending}
              disabled={busy || !cities.length}
              className="w-full min-w-40 sm:w-fit"
              size="sm"
            >
              <HoverText text="Submit a happening" />
            </Button>
          </div>
        </form>
      </SectionWrapper>
      <SubmissionSuccess
        isOpen={state.success && !receiptDismissed}
        onOpenChange={(open) => setReceiptDismissed(!open)}
        onSubmitAnother={submitAnother}
      />
    </>
  );
}

function FieldLabel({
  name,
  title,
  required,
}: {
  name: string;
  title: string;
  required?: boolean;
}) {
  return (
    <label id={`${name}-label`} htmlFor={name} className="block">
      <LabelTitle title={`${title}${required ? " *" : ""}`} />
    </label>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="min-w-0 space-y-6 py-4">
      <legend className="float-left mb-6 w-full text-lg font-medium uppercase sm:text-xl">
        <FadeUpText text={title} />
      </legend>
      <div className="clear-both grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
        {children}
      </div>
    </fieldset>
  );
}
