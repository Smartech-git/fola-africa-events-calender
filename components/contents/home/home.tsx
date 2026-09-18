import Header from "@/components/header/header";
import SectionWrapper from "@/components/layout/section-wrapper";

export default function HomePage() {
  return (
    <div className="absolute top-0 z-50 flex h-dvh min-h-dvh w-full flex-col items-center bg-primary-light">
      <Header
        hideLogo
        className="flex-none border-b border-black/20 bg-primary-light"
      />

      <SectionWrapper className="flex h-full flex-col overflow-hidden bg-primary-light max-lg:justify-between md:py-0 lg:flex-row lg:pr-0!">
        
      </SectionWrapper>
    </div>
  );
}
