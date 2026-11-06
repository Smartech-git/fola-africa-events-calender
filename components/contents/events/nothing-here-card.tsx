import Link from "next/link";

import HoverText from "@/components/animations/hover-text";
import Button from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  label?: string;
  as?: "h2" | "h3";
  /** The dates have gone by: look forward instead of asking for submissions. */
  past?: boolean;
  /** Where "See what’s coming up" goes on a past date. */
  upcomingHref?: string;
  className?: string;
}

export default function NothingHereCard({
  label,
  as: Heading = "h2",
  past = false,
  upcomingHref,
  className,
}: Props) {
  return (
    <div
      role="status"
      className={cn(
        "flex w-full max-w-full flex-col items-start gap-6 bg-red px-6 pt-8 pb-10 text-white sm:px-12 sm:pt-12 sm:pb-14",
        className,
      )}
    >
      {label && (
        <p className="font-courier text-sm tracking-cou uppercase">{label}</p>
      )}
      <Heading className="font-montreal text-5xl leading-none font-medium tracking-mono uppercase sm:text-7xl lg:text-[80px]">
        {past ? "Nothing on record" : "Nothing here yet"}
      </Heading>
      <p className="font-montreal text-lg sm:text-2xl">
        {past
          ? "Nothing was listed for these dates."
          : "Know something we don’t?"}
      </p>
      {past ? (
        upcomingHref && (
          <Link href={upcomingHref} className="w-full sm:w-fit">
            <Button variant="onWhite" size="md" className="w-full">
              <HoverText text="See what’s coming up" />
            </Button>
          </Link>
        )
      ) : (
        <Link href="/submit-event" className="w-full sm:w-fit">
          <Button variant="onWhite" size="md" className="w-full">
            <HoverText text="Submit a happening" />
          </Button>
        </Link>
      )}
    </div>
  );
}
