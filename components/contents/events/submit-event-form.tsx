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

const initialActionState: SubmitEventActionState = {
  success: false,
  status: 0,
};

export default function SubmitEventForm({
  cities,
  seasons,
}: SubmissionOptions) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useReactHookForm(submitEventSchema, submitEventDefaults);
  const [state, action, isPending] = useActionState<
    SubmitEventActionState,
    SubmitEventValues | null
  >((previousState, data) => {
    // Starting another event resets the result without a server request.
    return data === null
      ? initialActionState
      : submitEvent(previousState, data);
  }, initialActionState);
  const [receiptDismissed, setReceiptDismissed] = useState(false);

  const submitError =
    !isPending && !state.success
      ? (state.error ??
        (state.fieldErrors ? "Please check the highlighted fields." : ""))
      : "";
  const [city, access, description, startAt] = useWatch({
    control,
    name: ["city", "access", "description", "startAt"],
  });
  const selectedCity = cities.find((item) => item.value === city);
  const privateEvent = PRIVATE_ACCESS.includes(access);
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
            hourCycle={24}
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
              field.onChange(value);
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
    setReceiptDismissed(true);
    reset();
    startTransition(() => action(null));
    document
      .getElementById("submit-event-heading")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <div id="submit-event-heading" className="relative w-full">
        <SectionWrapper>
          <div className="relative space-y-4 uppercase">
            <HeaderTitle text="Submit an event" />
            <p className="max-w-150 text-xs uppercase">
              Every listing is reviewed by FOLA. Expect a response within two
              working days
            </p>
          </div>
        </SectionWrapper>
        <DrawHorizontalLine className="pointer-events-none absolute bottom-0 left-0 animate-delay-300" />
      </div>

      <SectionWrapper className="pb-16 sm:pb-20">
        <p className="mb-4 w-fit bg-secondary px-2 py-0.5 sm:text-xs text-xxs uppercase">
          Fields marked * are required. Your contact details are never displayed
        </p>
        <form noValidate onSubmit={onSubmit}>
          <FormSection title="01 / Event details">
            {input("title", "Event title", true)}
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
          </FormSection>
          <FormSection title="02 / Access & visibility">
            {select("access", "Access", ACCESS_OPTIONS, true)}
            {select("visibility", "Visibility", VISIBILITY_OPTIONS, true)}
            <div className="sm:col-span-2">
              {privateEvent ? (
                <p className="text-xs leading-5 uppercase">
                  Private and invitation-only listings have no action link. Only
                  the organiser or their authorised representative may submit
                  them. Held dates conceal event details on the calendar.
                </p>
              ) : (
                input(
                  "actionUrl",
                  "Organiser action URL",
                  ["tickets", "rsvp"].includes(access),
                  "url",
                  "Required for tickets and RSVP. Optional for free events.",
                )
              )}
            </div>
          </FormSection>
          <FormSection title="03 / Organiser & venue">
            {input("organiserName", "Organiser name", true)}
            {select("organiserType", "Organiser type", ORGANISER_TYPES, true)}
            {input("organiserWebsite", "Organiser website", false, "url")}
            {input(
              "organiserContact",
              "Organiser contact",
              true,
              "email",
              "For verification only; never displayed.",
            )}
            {input(
              "venueName",
              "Venue name",
              false,
              "text",
              "Optional; displayed according to visibility.",
            )}
            {input("venueArea", "Venue area")}
            {input("venueAddress", "Venue address")}
            {input("venueMapUrl", "Venue map link", false, "url")}
          </FormSection>
          <FormSection title="04 / Context">
            <div className="space-y-3 sm:col-span-2">
              <FieldLabel name="description" title="Description" />
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
                "Seasons",
                seasons.filter((season) => season.city === city),
                false,
                "Optional. Select existing seasons for this city; FOLA manages season records.",
              )}
            </div>
          </FormSection>
          <FormSection title="05 / Your details">
            {input("submitterName", "Your name", true)}
            {input("submitterEmail", "Your email", true, "email")}
            <div className="sm:col-span-2">
              {select(
                "relationship",
                "Relationship to event",
                SUBMITTER_RELATIONSHIPS,
                true,
              )}
            </div>
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
              <p role="alert" className="text-sm text-danger">
                {submitError}
              </p>
            )}
            {!cities.length && (
              <p role="alert" className="text-sm">
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
              <HoverText text="Submit for review" />
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
