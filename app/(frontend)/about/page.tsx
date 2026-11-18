import Activity from "@/components/contents/about/activity";
import Ambition from "@/components/contents/about/ambition";
import Bridge from "@/components/contents/about/bridge";
import Hero from "@/components/contents/about/hero";
import LaunchCities from "@/components/contents/about/launch-cities";
import OnePlace from "@/components/contents/about/one-place";
import TheGap from "@/components/contents/about/the-gap";
import { pageMetadata } from "@/lib/metadata";
import { getCities, type CityOverview } from "@/requests/get-cities";

export const metadata = pageMetadata(
  "About",
  "A shared events calendar connecting the business, cultural and social activity shaping African cities.",
  "/about",
);

// The city tiles show this week's counts.
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
      <Hero />
      <Activity />
      <TheGap />
      <Bridge />
      <OnePlace />
      <LaunchCities cities={cities} />
      <Ambition />
    </div>
  );
}
