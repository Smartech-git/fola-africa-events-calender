import DrawHorizontalLine from "@/components/animations/draw-horizontal-line";
import DrawVerticalLine from "@/components/animations/draw-vertical-line";
import Fade from "@/components/animations/fade";
import AboutImages from "@/components/contents/about/about-images";
import SectionWrapper from "@/components/layout/section-wrapper";
import { cn } from "@/lib/utils";

export default function AboutPage() {
  return (
    <SectionWrapper className="grid flex-1 grid-cols-1 items-center justify-between overflow-hidden pb-0 sm:py-0! md:h-[calc(100dvh-58px)] md:grid-cols-3 md:flex-row md:px-0!">
      <MiddelSection className="max-md:py-12 md:hidden" />
      <div className="flex h-full w-full animate-fade overflow-hidden max-md:hidden">
        <AboutImages />
      </div>
      <MiddelSection className="max-md:hidden" />

      <div className="relative flex w-full flex-col justify-between md:h-full">
        <Fade
          inView={false}
          translateY={6}
          className="flex flex-col gap-8 pr-0 sm:gap-16 sm:py-8 md:p-4 lg:p-8 2xl:pr-pg-2xl 4k:pr-pg-4k"
        >
          <Section
            title="Our mission"
            body="Champion African creativity on the global stage. We design campaigns, partnerships, and events that push cultural boundaries, amplify innovators, and redefine how Africa's stories are told."
          />
          <Section
            title="Who we are"
            body="We are strategic, bold, and unapologetically creative. From intimate cultural gatherings to global PR rollouts. Our work is rooted in excellence, authenticity, and impact."
          />
        </Fade>

        <div className="relative w-full pt-0 max-md:mt-8">
          <DrawHorizontalLine className="absolute top-0 left-0" />

          <Fade
            delay={0.5}
            inView={false}
            translateY={6}
            className="flex flex-col gap-6 py-8 pr-0 md:p-4 lg:p-8 2xl:pr-pg-2xl 4k:pr-pg-4k"
          >
            <p className="font-inter text-xs text-primary uppercase sm:text-xs">
              Sade Teyibo is the Founder and CEO of FOLA and its experiential
              arm, Studio FOLA. With over 15 years of global experience in brand
              marketing, strategic communications, and partnerships, Sade has
              led initiatives for some of the world's most influential luxury,
              fashion, and lifestyle brands.
            </p>
          </Fade>
        </div>
      </div>
      <div className="flex aspect-2/3 w-full overflow-hidden max-md:-mx-pg max-md:mt-10 max-md:w-[calc(100vw+4dvw)] max-sm:-mx-pg-sm max-sm:w-[calc(100vw)] md:hidden">
        <AboutImages />
      </div>
    </SectionWrapper>
  );
}

interface MiddelSectionProps {
  className?: string;
}
const MiddelSection = ({ className }: MiddelSectionProps) => (
  <div
    className={cn(
      `relative flex h-full w-full flex-col items-center justify-center p-4 max-md:mb-8 max-md:h-75 md:h-full lg:p-8`,
      className,
    )}
  >
    <Fade
      inView={false}
      translateY={0}
      className="flex flex-col items-center gap-6 text-primary"
    >
      <p className="max-w-90 text-center font-inter text-xs leading-4 uppercase sm:text-xs">
        FOLA is a strategic communications and experiential agency positioning
        Africa in the world through culture, commerce, and influence. We work
        across fashion, art, music, hospitality, government, and the
        institutions shaping what comes next.
      </p>
    </Fade>
    <DrawVerticalLine className="absolute top-0 left-0 max-md:hidden" />
    <DrawVerticalLine className="absolute top-0 right-0 max-md:hidden" />
  </div>
);

interface Props {
  title: string;
  body: string;
}
const Section = ({ title, body }: Props) => {
  return (
    <div className="flex flex-col gap-1 text-xs text-primary">
      <h2 className="font-apris text-sm! font-medium text-nowrap uppercase">
        {title}
      </h2>
      <p className="font-inter uppercase">{body}</p>
    </div>
  );
};
