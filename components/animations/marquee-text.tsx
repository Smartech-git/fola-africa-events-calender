import WarpText from "@/components/animations/warp-text";
import { cn } from "@/lib/utils";

interface MarqueeTextProps {
  text: string;
  className?: string;
}

export default function MarqueeText({ text, className }: MarqueeTextProps) {
  return (
    <div className={cn("flex w-full items-center overflow-hidden", className)}>
      <span className="sr-only">{text}</span>
      <div
        aria-hidden="true"
        className="flex w-max shrink-0 animate-marquee whitespace-nowrap will-change-transform motion-reduce:animate-none"
      >
        {[0, 1].map((copy) => (
          <div
            key={copy}
            className="flex min-w-screen shrink-0 items-center justify-around gap-8 px-4"
          >
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className="relative shrink-0 sm:px-4 px-1 py-2 font-apris leading-none font-medium text-dark-gray uppercase text-9xl md:text-[150px]"
              >
                {/* Reserve the full text size for the canvas without fitting it down. */}
                <span className="invisible block">{text}</span>
                <WarpText
                  text={text.toUpperCase()}
                  color="#201d1d"
                  fontSize="inherit"
                  fontWeight="inherit"
                  fontFamily="inherit"
                  letterSpacing="normal"
                  lineHeight={1}
                  fitText={false}
                  refraction={0.005}
                  pointerStrength={3}
                  pointerInfluence={1.5}
                  warpScale={3.1}
                  style={{ position: "absolute", inset: 0, minHeight: 0 }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
