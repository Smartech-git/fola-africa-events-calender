import SubmitEventForm from "@/components/contents/events/submit-event-form";
import SectionWrapper from "@/components/layout/section-wrapper";
import { getSubmissionOptions } from "@/payload/submissions/options";

export const dynamic = "force-dynamic";

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
