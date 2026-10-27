import {
  accessLabel,
  categoryLabel,
  statusLabel,
  timeRange,
} from "@/lib/events/event-details";
import { cn } from "@/lib/utils";
import type { PublicEvent } from "@/requests/helpers/types";

interface Props {
  event: PublicEvent;
  timezone: string;
  className?: string;
}

export default function EventDetailFacts({
  event,
  timezone,
  className,
}: Props) {
  const venue = [event.venue?.name, event.venue?.area]
    .filter(Boolean)
    .join(", ");
  const status = statusLabel(event);

  return (
    <ul
      className={cn(
        "flex flex-col gap-1.5 font-courier text-base sm:text-lg",
        className,
      )}
    >
      {status && <li className="tracking-cou uppercase">{status}</li>}
      <li className="max-md:hidden" >{timeRange(event, timezone)}</li>
      <li>{categoryLabel(event)}</li>
      <li>{accessLabel(event)}</li>
      {venue && <li>{venue}</li>}
    </ul>
  );
}
