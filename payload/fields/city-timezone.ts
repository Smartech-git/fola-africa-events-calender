import { SEED_CITIES } from "@/payload/constants";

const normalize = (value: string) =>
  value.trim().toLowerCase().replace(/[_-]/g, " ");

export function cityTimezone(name: string, country = "") {
  const city = SEED_CITIES.find(
    (city) =>
      normalize(city.name) === normalize(name) &&
      (!country.trim() || normalize(city.country) === normalize(country)),
  );
  if (city) return city.timezone;
  // Match IANA city names beyond the starter records; leave unknown cities editable.
  const matches = Intl.supportedValuesOf("timeZone").filter(
    (zone) => normalize(zone.split("/").at(-1)!) === normalize(name),
  );
  return matches.length === 1 ? matches[0] : undefined;
}

export function validTimezone(value: unknown): true | string {
  if (!value) return true;
  try {
    new Intl.DateTimeFormat("en", { timeZone: String(value) });
    return true;
  } catch {
    return "Enter a valid IANA timezone, for example Africa/Lagos.";
  }
}

export function timezoneLabel(timezone: string) {
  if (!timezone || validTimezone(timezone) !== true) return undefined;
  return (
    SEED_CITIES.find((city) => city.timezone === timezone)?.timezoneLabel ??
    new Intl.DateTimeFormat("en", { timeZone: timezone, timeZoneName: "short" })
      .formatToParts(new Date())
      .find((part) => part.type === "timeZoneName")?.value
  );
}
