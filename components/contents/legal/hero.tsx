import DotField from "@/components/animations/dot-field";
import FadeUpText from "@/components/animations/fade-up-text";
import SurTitle from "@/components/common/sur-title";
import Header from "@/components/header/header";
import SectionWrapper from "@/components/layout/section-wrapper";
import { formatDay } from "@/lib/events/event-list";

interface Props {
  title: string;
  date: string;
}

export default function Hero({ title, date }: Props) {
  return (
    <div className="relative z-60 flex w-full flex-col bg-red text-white">
      <Header isLight />
      <SectionWrapper className="gap-12 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex w-full min-w-0 flex-col gap-8">
          <SurTitle
            dot
            content={`Effective ${formatDay(date, "d MMMM yyyy")}`}
            className="text-white"
          />
          <FadeUpText
            as="h1"
            text={title}
            delay={0.1}
            className="w-full font-montreal text-5xl font-medium tracking-mono lg:text-7xl xl:text-8xl"
          />
        </div>
        <div className="h-40 w-full shrink-0 self-end max-md:hidden lg:h-30 lg:w-72">
          <DotField />
        </div>
      </SectionWrapper>
    </div>
  );
}
