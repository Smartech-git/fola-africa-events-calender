import { FormHeader } from "@/components/contents/submit-event/form-parts";
import SubmissionForm from "@/components/contents/submit-event/submission-form";
import Header from "@/components/header/header";
import SectionWrapper from "@/components/layout/section-wrapper";
import { SITE_NAME } from "@/constants/brand";
import { pageMetadata } from "@/lib/metadata";
import { getSubmissionOptions } from "@/payload/submissions/options";

export const metadata = pageMetadata(
  "Submission form",
  `Tell us what’s happening. Submit your event to ${SITE_NAME} for review.`,
  "/submit-event/form",
);

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export default async function Page() {
  let options;
  try {
    options = await getSubmissionOptions();
  } catch {
    options = null;
  }

  return (
    <div className="relative -mt-sm-header flex w-full flex-col sm:-mt-header">
      <FormHeader header={<Header isLight />} />
      {options ? (
        <SubmissionForm {...options} />
      ) : (
        <SectionWrapper>
          <p role="alert" className="font-montreal text-lg">
            We couldn’t load the submission form. Please refresh and try again.
          </p>
        </SectionWrapper>
      )}
    </div>
  );
}
