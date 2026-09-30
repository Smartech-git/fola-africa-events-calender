import LabelTitle from "@/components/common/label-title";
import { EventExternalAction } from "@/components/contents/events/event-actions";
import { externalUrl } from "@/lib/events/event-list";
import type { PublicEvent } from "@/requests/events/get-events-by-city";

export default function EventLocation({ event }: { event: PublicEvent }) {
  const venue = event.venue;
  if (!venue) return null;
  const address = [venue.name, venue.address, venue.area, event.city?.name]
    .filter(Boolean)
    .join(", ");
  const savedUrl = externalUrl(venue.mapUrl);
  const savedMap = savedUrl ? new URL(savedUrl) : undefined;
  const isGoogleMap =
    savedMap &&
    [
      "www.google.com",
      "google.com",
      "maps.google.com",
      "maps.app.goo.gl",
      "goo.gl",
    ].includes(savedMap.hostname);
  const query =
    (isGoogleMap &&
      (savedMap.searchParams.get("query") || savedMap.searchParams.get("q"))) ||
    address;
  const mapsUrl = isGoogleMap
    ? savedMap.href
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  return (
    <section aria-labelledby="event-venue" className="space-y-4">
      <LabelTitle title="Venue" />

      <p className="text-xs uppercase sm:text-xs">
        {venue.name}
        <br />
        {venue.address && (
          <>
            {venue.address}
            <br />
          </>
        )}
        {[venue.area, event.city?.name].filter(Boolean).join(", ")}
      </p>
      <EventExternalAction url={mapsUrl} label="Open map" />
      <iframe
        title={`Map of ${venue.name}`}
        src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        className="h-64 w-full border border-light-gray sm:h-80"
      />
    </section>
  );
}
