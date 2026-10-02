"use client";

import { useEffect, useRef, useState } from "react";

import type { EventListFilters } from "@/lib/events/event-list";
import { getEventList } from "@/requests/events/get-event-list";
import type { PublicEvent } from "@/requests/helpers/types";

/** Share request state and retries across city and season calendar views. */
export function useEventCalendar({
  filters,
  initialEvents,
  initialError,
  invalidFilters,
}: {
  filters: EventListFilters;
  initialEvents: PublicEvent[];
  initialError?: string;
  invalidFilters?: boolean;
}) {
  const [events, setEvents] = useState(initialEvents);
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);
  const busy = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const retry = async () => {
    if (busy.current || invalidFilters) return;
    busy.current = true;
    setLoading(true);
    try {
      const data = await getEventList(filters);
      if (!mounted.current) return;
      setEvents(data);
      setError(undefined);
    } catch {
      if (mounted.current)
        setError("We couldn't load events. Please try again.");
    } finally {
      busy.current = false;
      if (mounted.current) setLoading(false);
    }
  };
  return { events, error, loading, retry };
}
