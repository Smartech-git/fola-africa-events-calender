import { toast } from "sonner";

import { createEventCalendar } from "@/lib/events/event-calendar";
import { externalUrl } from "@/lib/events/event-list";
import type { PublicEvent } from "@/requests/events/get-events-by-city";

export function openExternal(value: string) {
  const url = externalUrl(value);
  if (url) window.open(url, "_blank", "noopener,noreferrer");
}

export async function shareLink(title: string, path: string) {
  const url = new URL(path, window.location.origin).href;
  if (navigator.share) {
    try {
      await navigator.share({ title, url });
      return;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    toast.success("Link copied");
  } catch {
    window.prompt("Copy this link to share", url);
  }
}

export function downloadEventCalendar(
  event: PublicEvent,
  timezone: string,
  path: string,
) {
  const url = new URL(path, window.location.origin).href;
  const blob = new Blob([createEventCalendar(event, timezone, url)], {
    type: "text/calendar;charset=utf-8",
  });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = `${event.title}-${event.id}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}
