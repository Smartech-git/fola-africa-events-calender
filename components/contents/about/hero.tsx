import DotField from "@/components/animations/dot-field";
import FadeUpText from "@/components/animations/fade-up-text";
import SurTitle from "@/components/common/sur-title";
import Header from "@/components/header/header";
import SectionWrapper from "@/components/layout/section-wrapper";

export default function Hero() {
  return (
    <div className="relative z-60 flex w-full flex-col bg-red text-white">
      <Header isLight />
      <SectionWrapper className="gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex min-w-0 flex-col gap-8">
          <SurTitle dot content="About Happenings" className="text-white" />
          <FadeUpText
            as="h1"
            text="Where Africa’s people, ideas and events meet."
            delay={0.1}
            className="max-w-250 font-montreal text-5xl font-medium tracking-mono sm:text-7xl xl:text-[112px]"
          />
        </div>
        <div className="aspect-square w-[40vw] shrink-0 self-end sm:w-[26vw] lg:w-[18vw] lg:max-w-72">
          <DotField />
        </div>
      </SectionWrapper>
    </div>
  );
}
