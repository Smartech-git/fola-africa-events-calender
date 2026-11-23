import "server-only";

import { headers } from "next/headers";

import { getCalendarPayload } from "@/payload/queries/calendar-query";

type KnownCity = { slug: string; name: string; country: string };

// Cities change rarely; a short memo keeps the header off the database.
const TTL = 5 * 60_000;
let known: { at: number; cities: Promise<KnownCity[]> } | null = null;

function knownCities() {
  if (!known || Date.now() - known.at > TTL) {
    const cities = getCalendarPayload()
      .then((payload) =>
        payload.find({
          collection: "cities",
          limit: 200,
          depth: 0,
          overrideAccess: false,
          select: { slug: true, name: true, country: true },
        }),
      )
      .then(({ docs }) =>
        docs.map(({ slug, name, country }) => ({
          slug: slug ?? "",
          name,
          country,
        })),
      );
    known = { at: Date.now(), cities };
    // A failed lookup is retried on the next request, not kept for 5 minutes.
    cities.catch(() => {
      if (known?.cities === cities) known = null;
    });
  }
  return known.cities;
}

/** "São Paulo" and "sao paulo" match; so do "Côte d’Ivoire" and "cote d'ivoire". */
const plain = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[’‘]/g, "'")
    .toLowerCase()
    .trim();

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

/** Country names a city's country field may use for an ISO code, e.g. NG. */
function countryNames(code: string) {
  const names = new Set([plain(code)]);
  try {
    const name = regionNames.of(code.toUpperCase());
    if (name) names.add(plain(name));
  } catch {
    // Not a region code.
  }
  return names;
}

/**
 * The visitor's city from Vercel's IP geolocation, when it is one of the
 * calendar's cities: the same city name in the same country, otherwise the
 * only calendar city in their country. Nothing is stored. Undefined off
 * Vercel, for unknown places, and when the lookup fails.
 */
export async function geoCitySlug(): Promise<string | undefined> {
  const list = await headers();
  const rawCity = list.get("x-vercel-ip-city");
  const country = list.get("x-vercel-ip-country")?.trim();
  let city = "";
  try {
    city = rawCity ? plain(decodeURIComponent(rawCity)) : "";
  } catch {
    city = rawCity ? plain(rawCity) : "";
  }
  if (!city && !country) return undefined;

  let cities: KnownCity[];
  try {
    cities = await knownCities();
  } catch {
    return undefined;
  }
  const inCountry = country
    ? cities.filter((item) => countryNames(country).has(plain(item.country)))
    : [];
  // Lagos, Portugal is not Lagos, Nigeria: a name match needs the country too.
  const pool = country ? inCountry : cities;
  const byName = city && pool.find((item) => plain(item.name) === city);
  if (byName) return byName.slug;
  if (inCountry.length === 1) return inCountry[0].slug;
  return undefined;
}
