import DotField from "@/components/animations/dot-field";
import FadeUpText from "@/components/animations/fade-up-text";
import Header from "@/components/header/header";
import SectionWrapper from "@/components/layout/section-wrapper";

export default function Hero() {
  return (
    <div className="relative z-60 flex w-full flex-col bg-red text-white">
      <Header isLight />
      <SectionWrapper className="gap-12 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex w-full min-w-0 flex-col gap-8">
          <FadeUpText
            as="h1"
            text="Across Africa, there is always something happening"
            delay={0.1}
            className="w-full max-w-450 font-montreal text-5xl font-medium tracking-mono lg:text-7xl xl:text-8xl"
          />
        </div>
        <div className="h-40 w-full shrink-0 self-end lg:aspect-square lg:h-70 lg:w-72">
          <DotField />
        </div>
      </SectionWrapper>
    </div>
  );
}
