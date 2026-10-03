import type {
  EmailMessage,
  EventEmailKind,
} from "@/payload/emails/email-settings";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

export function eventEmailTemplate({
  kind,
  title,
  name,
  recipient,
  sender,
  url,
}: {
  kind: EventEmailKind;
  title: string;
  name: string;
  recipient: string;
  sender: string;
  url?: string;
}): EmailMessage {
  const published = kind === "published";
  const heading = published
    ? "Your event is live on FOLA"
    : "We've received your event";
  const greeting = name ? `Hello ${name},` : "Hello,";
  const copy = published
    ? `Your event, ${title}, has been published on FOLA. You can now view and share your listing.`
    : `Thank you for submitting ${title} to FOLA. We've received your event and it is awaiting review. We'll email you again when it is published.`;
  const link =
    published && url
      ? `<p style="margin:28px 0"><a href="${escapeHtml(url)}" style="display:inline-block;padding:14px 22px;background:#171717;color:#fff;text-decoration:none;border-radius:4px">View event</a></p><p style="font-size:13px;word-break:break-all">Or open this link: <a href="${escapeHtml(url)}" style="color:#171717">${escapeHtml(url)}</a></p>`
      : "";
  return {
    from: `FOLA <${sender}>`,
    to: recipient,
    subject: `${published ? "Your event is published" : "Event submission received"}: ${title.replace(/[\r\n]/g, " ")}`,
    text: `${greeting}\n\n${copy}${published && url ? `\n\nView event: ${url}` : ""}\n\nThe FOLA team`,
    html: `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;background:#f5f5f2;font-family:Arial,Helvetica,sans-serif;color:#171717"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#fff"><tr><td style="padding:32px"><p style="font-size:26px;letter-spacing:4px;margin:0 0 32px">FOLA</p><h1 style="font-size:24px;line-height:1.3;margin:0 0 24px">${escapeHtml(heading)}</h1><p style="line-height:1.6">${escapeHtml(greeting)}</p><p style="line-height:1.6">${escapeHtml(copy)}</p>${link}<p style="line-height:1.6;margin-top:32px">The FOLA team</p></td></tr></table></td></tr></table></body></html>`,
  };
}
