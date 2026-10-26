import { notFound } from "next/navigation";

import EmailPreview from "@/components/email-preview/email-preview";
import { eventEmailTemplate } from "@/payload/emails/event-email-template";

export default function EmailPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  const sample = {
    title: "Financial Times Africa Summit",
    name: "Amara",
    recipient: "amara@example.com",
    sender: "hello@happeningsofafrica.com",
    url: "https://happeningsofafrica.com/calendar/lagos/financial-times-africa-summit",
  };

  return (
    <EmailPreview
      messages={{
        submitted: eventEmailTemplate({ ...sample, kind: "submitted" }),
        published: eventEmailTemplate({ ...sample, kind: "published" }),
      }}
    />
  );
}
