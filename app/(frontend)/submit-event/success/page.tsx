import SuccessHero from "@/components/contents/submit-event/success-hero";
import { pageMetadata } from "@/lib/metadata";

export const metadata = {
  ...pageMetadata(
    "Submitted",
    "Your Happening has been submitted for review.",
    "/submit-event/success",
  ),
  robots: { index: false },
};

export default function Page() {
  return (
    <div className="relative -mt-sm-header flex w-full flex-col sm:-mt-header">
      <SuccessHero />
    </div>
  );
}
