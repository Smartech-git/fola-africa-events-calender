import DrawHorizontalLine from "@/components/animations/draw-horizontal-line";
import Fade from "@/components/animations/fade";
import SectionWrapper from "@/components/layout/section-wrapper";

export default function Hero() {
  return (
    <SectionWrapper className="flex flex-none gap-y-2 overflow-hidden pb-2! md:flex-row">
      <Fade
        translateX={-12}
        translateY={0}
        className="w-42.5 flex-none sm:mb-4 lg:w-75"
      >
        <h1 className="font-apris text-xs tracking-wide text-nowrap text-primary uppercase sm:text-sm">
          journal
        </h1>
      </Fade>
      <Fade
        translateX={12}
        translateY={0}
        className="mb-4 w-full text-primary sm:mb-4"
      >
        <p className="w-full font-inter text-xs uppercase sm:text-xs">
          Curators of cross-continental connection. We are an elevated
          communications and experiential agency bridging the gap between
          Africa's vibrant pulse and the global stage. Pioneers in luxury,
          fashion, art, music, and lifestyle, we dismantle the conventional,
          shaping narratives that resonate globally and defy boundaries.
        </p>
      </Fade>
      <DrawHorizontalLine className="absolute bottom-0 left-0" />
    </SectionWrapper>
  );
}
