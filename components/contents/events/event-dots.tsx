import { isPrivateEvent } from "@/lib/events/event-details";
import { cn } from "@/lib/utils";
import type { PublicEvent } from "@/requests/helpers/types";

/** Three public dots read as a busy day, however many events it holds. */
const MAX_PUBLIC_DOTS = 3;

interface Props {
  events: PublicEvent[];
  className?: string;
}

// Figma: Month grid key (332:2470). Filled dots are public events; one
// hollow dot marks any private or invitation-only events on the day.
export default function EventDots({ events, className }: Props) {
  const privateCount = events.filter(isPrivateEvent).length;
  const publicDots = Math.min(events.length - privateCount, MAX_PUBLIC_DOTS);

  return (
    <span
      aria-hidden="true"
      className={cn("flex items-center gap-1", className)}
    >
      {Array.from({ length: publicDots }, (_, index) => (
        <span key={index} className="size-1.75 rounded-full bg-red" />
      ))}
      {privateCount > 0 && (
        <span className="size-1.75 rounded-full border border-red" />
      )}
    </span>
  );
}
