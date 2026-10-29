import { termsOfUseContent } from "@/app/(frontend)/(legal)/terms-of-use/variables";
import Hero from "@/components/contents/legal/hero";
import SectionNav from "@/components/contents/legal/section-nav";
import SectionWrapper from "@/components/layout/section-wrapper";
import PortableText from "@/components/ui/portable-text";
import { SITE_NAME } from "@/constants/brand";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Terms of use",
  `The terms for using ${SITE_NAME} and submitting a happening to the calendar.`,
  "/terms-of-use",
);

export default function TermsOfUse() {
  return (
    <>
      <Hero title="Terms of use" date={termsOfUseContent.effective} />
      <SectionWrapper className="gap-10 lg:flex-row lg:items-start lg:gap-16 xl:gap-24">
        <SectionNav htmlString={termsOfUseContent.htmlString} />

        <div className="relative flex min-w-0 flex-1 flex-col">
          <PortableText
            htmlString={termsOfUseContent.htmlString}
            className="max-w-200"
          />
        </div>
      </SectionWrapper>
    </>
  );
}
