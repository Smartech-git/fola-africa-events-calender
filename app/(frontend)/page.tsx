import FadeUpText from "@/components/animations/fade-up-text";
import HoverText from "@/components/animations/hover-text";
import Cities from "@/components/contents/home/cities";
import Hero from "@/components/contents/home/hero-two";
import OnTheRadar from "@/components/contents/home/on-the-radar";
import SectionWrapper from "@/components/layout/section-wrapper";
import Button from "@/components/ui/button";
import { getCities } from "@/requests/get-cities";

export default async function Home() {
  const cities = await getCities({});

  return (
    <div className="flex min-h-dvh w-full flex-col items-center bg-primary-light">
      <Hero />
      <OnTheRadar citySlug={cities.data[0]?.slug} />
      <Cities cities={cities} />

      <SectionWrapper
        role="region"
        aria-labelledby="closing-heading"
        className="gap-8 py-12 sm:py-16"
      >
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center md:gap-8">
          <FadeUpText
            id="closing-heading"
            as="h2"
            text={"Make it\na date."}
            className="font-apris text-7xl leading-[0.9] font-light uppercase md:text-8xl lg:text-[144px]"
          />
          <div className="flex w-full flex-col items-end gap-12 md:w-60 md:shrink-0">
            <FadeUpText
              text={"Put your next event\non Africa’s\ncalendar."}
              className="text-right text-xs uppercase sm:text-sm"
            />
            <Button size="sm" className="w-full md:max-w-fit">
              <HoverText text="Submit an event" />
            </Button>
          </div>
        </div>
        {/* <footer className="mt-4 flex flex-col justify-between gap-4 border-t border-light-gray pt-6 text-xs uppercase sm:flex-row sm:gap-8">
          <FadeUpText text="Brought to you by Fola" className="font-medium tracking-wider" />
          <FadeUpText text={`Africa’s events calendar / © Fola ${new Date().getFullYear()}`} className="sm:text-right" />
        </footer> */}
      </SectionWrapper>
    </div>
  );
}
