import Link from "next/link";

import DrawVerticalLine from "@/components/animations/draw-vertical-line";
import Fade from "@/components/animations/fade";
import FadeUpText from "@/components/animations/fade-up-text";
import EmailDetails from "@/components/common/email-details";
import SectionWrapper from "@/components/layout/section-wrapper";
import Button from "@/components/ui/button";
import { BUSINESS_EMAIL, ENQUIRY_EMAIL, socials } from "@/constants/socials";
import { cn } from "@/lib/utils";

export default function ContactPage() {
  return (
    <SectionWrapper className="grid flex-1 grid-cols-1 items-center justify-between pb-0 sm:py-0! md:h-[calc(100dvh-58px)] md:grid-cols-3 md:flex-row">
      <LogoFadeSection className="max-md:pb-16 md:hidden" />

      <div className="relative h-full w-full">
        <div className="relative flex h-full flex-col justify-between gap-8 p-0 md:py-4 md:pr-4 lg:py-8 lg:pr-8">
          <div className="flex w-full flex-col">
            <FadeUpText
              text="FOLA: Curators of cross-continental connection."
              className="text-xl text-primary uppercase max-md:items-center max-md:text-center sm:text-2xl md:max-w-[60%] 2xl:text-3xl"
            />
            <Fade className="mt-12 flex flex-col gap-4 max-md:items-center">
              <p className="font-inter text-xs text-primary uppercase max-md:text-center sm:text-xs md:max-w-[80%]">
                We are an elevated communications and experiential agency
                bridging the gap between Africa's vibrant pulse and the global
                stage. Pioneers in luxury fashion art music, and lifestyle, we
                dismantle the conventional, shaping narratives that resonate
                globally and defy boundaries.
              </p>
            </Fade>
          </div>
        </div>
        <DrawVerticalLine className="absolute top-0 right-0 max-md:hidden" />
      </div>

      <LogoFadeSection className="max-md:hidden" />

      <div className="flex w-full flex-col max-md:py-16 md:h-full">
        <div className="relative flex h-full w-full flex-col justify-between gap-8 p-0 md:py-4 md:pl-4 lg:py-8 lg:pl-8">
          <Fade
            translateY={12}
            className="flex flex-col gap-4 max-md:items-center"
          >
            <p className="max-w-[85%] font-inter text-xs text-primary uppercase max-md:text-center sm:text-xs">
              We'd Love to hear from you.
            </p>
            <EmailDetails title="New business" email={BUSINESS_EMAIL} />
            <EmailDetails title="General Inquiries" email={ENQUIRY_EMAIL} />
          </Fade>
          <Fade
            className="mt-12 flex flex-col gap-4 max-md:items-center"
            translateY={12}
            delay={0.3}
          >
            <div className="flex flex-wrap gap-12">
              {socials.map((item) => (
                <Link
                  key={item.name}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-fit"
                >
                  <Button
                    isFollowCursorLight
                    className="font-inter text-xs font-normal uppercase underline sm:text-xs"
                    size="fit"
                    variant="link"
                  >
                    {item.name}
                  </Button>
                </Link>
              ))}
            </div>
          </Fade>
        </div>
        {/* <div className="relative w-full flex-none animate-fade-in overflow-hidden bg-primary/10 bg-[url('/assets/images/contact/contact-828x1099.png')] bg-cover bg-position-[50%_15%] bg-blend-multiply max-md:-mx-pg max-md:mt-16 max-md:aspect-square max-md:w-[calc(100vw+4dvw)] max-sm:-mx-pg-sm max-sm:w-[calc(100vw)] md:h-[60%]" /> */}
      </div>
    </SectionWrapper>
  );
}

interface LogoFadeSectionProps {
  className?: string;
}
const LogoFadeSection = ({ className }: LogoFadeSectionProps) => (
  <div
    className={cn(
      `relative flex aspect-2/3 w-full items-center justify-center overflow-y-hidden md:h-full`,
      className,
    )}
  >
    {/* <video
      loop
      autoPlay
      muted
      playsInline
      preload="auto"
      className="size-full object-cover"
    >
      <source src="/assets/videos/fola.mp4" />
    </video> */}
    <div className="relative h-full w-full flex-none animate-fade-in overflow-hidden bg-primary/10 bg-[url('/assets/images/contact/contact-828x1099.png')] bg-cover bg-position-[50%_15%] bg-blend-multiply" />

    <DrawVerticalLine className="absolute top-0 right-[0.5px] z-20 delay-1000 max-md:hidden" />
  </div>
);
