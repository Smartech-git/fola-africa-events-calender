import SubmitEventForm from "@/components/contents/events/submit-event-form";
import SectionWrapper from "@/components/layout/section-wrapper";
import { SITE_NAME } from "@/constants/brand";
import { pageMetadata } from "@/lib/metadata";
import { getSubmissionOptions } from "@/payload/submissions/options";

export const metadata = pageMetadata(
  "Submit an event",
  `Share your event with ${SITE_NAME}. Submit the details for review and help people discover what is happening in your city.`,
  "/submit-event",
);

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export default async function SubmitEventPage() {
  let options;
  try {
    options = await getSubmissionOptions();
  } catch {
    return (
      <SectionWrapper>
        <h1 className="font-apris text-4xl uppercase">Submit an event</h1>
        <p role="alert" className="mt-6 text-sm">
          We couldn't load the submission form. Please refresh and try again.
        </p>
      </SectionWrapper>
    );
  }
  return <SubmitEventForm {...options} />;
}
