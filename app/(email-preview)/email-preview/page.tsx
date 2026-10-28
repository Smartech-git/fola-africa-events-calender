import { notFound } from "next/navigation";

import EmailPreview from "@/components/email-preview/email-preview";
import { eventEmailTemplate } from "@/payload/emails/event-email-template";
import { teamAlertTemplate } from "@/payload/emails/team-alert-template";
import type { Event } from "@/payload-types";

export default function EmailPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  const sample = {
    title: "Financial Times Africa Summit",
    name: "Amara",
    recipient: "amara@example.com",
    sender: "hello@happeningsofafrica.com",
    url: "https://happeningsofafrica.com/calendar/lagos/financial-times-africa-summit",
  };
  // Only the fields the team alert reads; demo values, not a real record.
  const sampleEvent = {
    id: 1,
    title: "Private Leadership Dinner",
    city: { name: "Lagos", timezone: "Africa/Lagos", timezoneLabel: "WAT" },
    startAt: "2026-12-05T18:30:00.000Z",
    endAt: "2026-12-05T21:00:00.000Z",
    allDay: false,
    industry: "business",
    eventType: "dinner",
    access: "private",
    visibility: "industry",
    seasons: [{ name: "Lagos December" }],
    submittedOrganiser: { name: "Example Organiser" },
    submittedVenue: { name: "Example Venue", area: "Ikoyi" },
    description:
      "An evening for leaders in finance and enterprise, hosted ahead of the December season.",
    submittedBy: {
      name: "Amara Example",
      email: "amara@example.com",
      phone: "+234 800 000 0000",
      organisation: "Example Organiser",
      role: "Head of Events",
      relationship: "organiser",
    },
  } as unknown as Event;

  return (
    <EmailPreview
      messages={{
        submitted: eventEmailTemplate({ ...sample, kind: "submitted" }),
        published: eventEmailTemplate({ ...sample, kind: "published" }),
        team: teamAlertTemplate({
          event: sampleEvent,
          recipient: "hello@happeningsofafrica.com",
          sender: sample.sender,
          adminUrl: "http://localhost:3000/admin/collections/events/1",
        }),
      }}
    />
  );
}
