import Audiences from "@/components/contents/about/audiences";
import Calendar from "@/components/contents/about/calendar";
import Hero from "@/components/contents/about/hero";
import Mark from "@/components/contents/about/mark";
import { SITE_NAME } from "@/constants/brand";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "About",
  `${SITE_NAME} is a shared calendar for the events shaping Africa’s cities.`,
  "/about",
);

export default function Page() {
  return (
    <div className="relative -mt-sm-header flex w-full flex-col sm:-mt-header">
      <Hero />
      <Calendar />
      <Audiences />
      <Mark />
    </div>
  );
}
