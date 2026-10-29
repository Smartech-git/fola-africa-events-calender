import { privacyPolicyContent } from "@/app/(frontend)/(legal)/privacy-policy/variables";
import Hero from "@/components/contents/legal/hero";
import SectionNav from "@/components/contents/legal/section-nav";
import SectionWrapper from "@/components/layout/section-wrapper";
import PortableText from "@/components/ui/portable-text";
import { SITE_NAME } from "@/constants/brand";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Privacy policy",
  `What personal data ${SITE_NAME} collects, why, how long we keep it and the choices you have.`,
  "/privacy-policy",
);

export default function PrivacyPolicy() {
  return (
    <>
      <Hero title="Privacy policy" date={privacyPolicyContent.effective} />
      <SectionWrapper className="gap-10 lg:flex-row lg:items-start lg:gap-16 xl:gap-24">
        <SectionNav htmlString={privacyPolicyContent.htmlString} />

        <div className="relative flex min-w-0 flex-1 flex-col">
          <PortableText
            htmlString={privacyPolicyContent.htmlString}
            className="max-w-200"
          />
        </div>
      </SectionWrapper>
    </>
  );
}
