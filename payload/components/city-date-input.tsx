"use client";

import { useEffect } from "react";

import {
  DateTimeField,
  useConfig,
  useField,
  useFormFields,
} from "@payloadcms/ui";
import type { DateFieldClientProps } from "payload";
import useSWR from "swr";

import { validTimezone } from "@/payload/fields/city-timezone";
import { relationID } from "@/payload/validation";

async function getCityTimezone(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Unable to load the city's timezone.");
  const city = await response.json();
  if (!city.timezone || validTimezone(city.timezone) !== true)
    throw new Error("The city needs a valid timezone configured.");
  return city.timezone;
}

export function CityDateInput(props: DateFieldClientProps) {
  const { config } = useConfig();
  const city = useFormFields(([fields]) => relationID(fields.city?.value));
  const { data: timezone, error } = useSWR<string>(
    city == null
      ? null
      : `${config.routes.api}/cities/${encodeURIComponent(city)}?depth=0`,
    getCityTimezone,
  );
  // Payload reads this companion field to display and convert local dates.
  // Keep it out of saved data: the city is the source of truth for timezone.
  const { value, setValue } = useField<string | null>({
    path: `${props.path}_tz`,
    disableFormData: true,
  });

  useEffect(() => {
    const next = timezone ?? null;
    if (value !== next) setValue(next, true);
  }, [timezone, value, setValue]);

  return (
    <>
      <DateTimeField
        {...props}
        readOnly={props.readOnly || !timezone || value !== timezone}
        field={{
          ...props.field,
          timezone: {
            required: true,
            supportedTimezones: timezone
              ? [{ label: timezone, value: timezone }]
              : [],
          },
        }}
      />
      <p className="field-description">
        {timezone
          ? `Times are shown in ${timezone}, the selected city's timezone. Stored as UTC.`
          : "Select a city to use its local timezone."}
      </p>
      {error && (
        <p role="alert">
          Unable to load the city’s timezone. Check its settings and try again.
        </p>
      )}
    </>
  );
}
