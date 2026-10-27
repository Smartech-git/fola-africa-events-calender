import CitiesHero from "@/components/contents/cities/cities-hero";
import CitiesTable from "@/components/contents/cities/cities-table";
import { pageMetadata } from "@/lib/metadata";
import { getCities, type CityOverview } from "@/requests/get-cities";

export const metadata = pageMetadata(
  "Cities",
  "Choose a city and see what’s happening across Africa’s cities.",
  "/cities",
);

export const dynamic = "force-dynamic";

export default async function Page() {
  let cities: CityOverview[] = [];
  try {
    cities = (await getCities({})).data;
  } catch (error) {
    console.error("Cities request failed", error);
  }

  return (
    <div className="relative -mt-sm-header flex w-full flex-col sm:-mt-header">
      <CitiesHero />
      <CitiesTable cities={cities} />
    </div>
  );
}
