import type { PayloadEmailAdapter, SendEmailOptions } from "payload";

import { emailSettings } from "@/payload/emails/email-settings";
import { sendZeptoMail, zeptoAddress } from "@/payload/emails/send-event-email";

type Recipients = SendEmailOptions["to"];

// Accepts "a@x.com", "Name <a@x.com>", comma-separated lists and nodemailer address objects.
function addresses(value: Recipients | SendEmailOptions["replyTo"]) {
  const items = Array.isArray(value) ? value : value ? [value] : [];
  return items.flatMap((item) => {
    if (typeof item !== "string")
      return item?.address ? [zeptoAddress(item.address, item.name)] : [];
    return item
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const match = part.match(/^(.*)<([^>]+)>$/);
        return match
          ? zeptoAddress(match[2].trim(), match[1].trim().replace(/^"|"$/g, ""))
          : zeptoAddress(part);
      });
  });
}

/**
 * Payload email adapter for ZeptoMail (Zoho CPaaS). Payload's own emails, such as
 * password resets, use it. Mail always leaves from the verified sender address;
 * only a display name passed in `from` is kept.
 */
export function zeptomailAdapter(): PayloadEmailAdapter<string | null> {
  return () => {
    const settings = emailSettings();
    if (!settings)
      throw new Error("ZeptoMail email settings are not configured.");
    return {
      name: "zeptomail",
      defaultFromAddress: settings.sender,
      defaultFromName: settings.senderName,
      sendEmail: async (message) => {
        if (message.attachments?.length)
          throw new Error("Email attachments are not supported.");
        const to = addresses(message.to);
        if (!to.length) throw new Error("The email has no recipient.");
        const from = addresses(message.from)[0];
        const cc = addresses(message.cc);
        const bcc = addresses(message.bcc);
        const replyTo = addresses(message.replyTo);
        return sendZeptoMail({
          from: {
            address: settings.sender,
            name: from?.name || settings.senderName,
          },
          to: to.map((email_address) => ({ email_address })),
          ...(cc.length
            ? { cc: cc.map((email_address) => ({ email_address })) }
            : {}),
          ...(bcc.length
            ? { bcc: bcc.map((email_address) => ({ email_address })) }
            : {}),
          ...(replyTo.length ? { reply_to: replyTo } : {}),
          subject: message.subject ?? "",
          htmlbody: message.html?.toString(),
          textbody: message.text?.toString(),
        });
      },
    };
  };
}
