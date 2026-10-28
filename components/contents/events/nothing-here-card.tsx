import Link from "next/link";

import HoverText from "@/components/animations/hover-text";
import Button from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  label?: string;
  as?: "h2" | "h3";
  className?: string;
}

export default function NothingHereCard({
  label,
  as: Heading = "h2",
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
        Nothing here yet.
      </Heading>
      <p className="font-montreal text-lg sm:text-2xl">
        Know something we don’t?
      </p>
      <Link href="/submit-event" className="w-full sm:w-fit">
        <Button variant="onWhite" size="md" className="w-full">
          <HoverText text="Submit a happening" />
        </Button>
      </Link>
    </div>
  );
}
