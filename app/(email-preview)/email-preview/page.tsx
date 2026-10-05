import { notFound } from "next/navigation";

import EmailPreview from "@/components/email-preview/email-preview";
import { eventEmailTemplate } from "@/payload/emails/event-email-template";

export default function EmailPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  const sample = {
    title: "Lagos Art & Culture Weekend",
    name: "Amara",
    recipient: "amara@example.com",
    sender: "hello@example.com",
    url: "https://wewantfola.com/events/lagos/lagos-art-culture-weekend",
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
