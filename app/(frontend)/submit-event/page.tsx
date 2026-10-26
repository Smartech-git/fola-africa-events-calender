import HowItWorks from "@/components/contents/submit-event/how-it-works";
import LandingHero from "@/components/contents/submit-event/landing-hero";
import { SITE_NAME } from "@/constants/brand";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Submit a Happening",
  `Put it on Happenings. Submit your event for consideration on ${SITE_NAME}; every submission is reviewed before appearing on the calendar.`,
  "/submit-event",
);

export default function Page() {
  return (
    <div className="relative -mt-sm-header flex w-full flex-col sm:-mt-header">
      <LandingHero />
      <HowItWorks />
    </div>
  );
}
