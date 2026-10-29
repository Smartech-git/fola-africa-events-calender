import { SITE_NAME } from "@/constants/brand";
import type {
  EmailMessage,
  EventEmailKind,
} from "@/payload/emails/email-settings";

// The Happenings palette from app/styles/globals.css. Inline styles keep these
// colours when an email client strips the document head.
const theme = {
  red: "#B51C17",
  cream: "#F4E3D7",
  ink: "#1A1A1A",
  white: "#FFFFFF",
  muted: "rgba(26,26,26,0.6)",
};
const monoFont = "'Courier Prime', 'Courier New', Courier, monospace";
const displayFont = "Montreal, 'Helvetica Neue', Helvetica, Arial, sans-serif";
// Courier caps with the site's tracking-cou spacing (0.08em).
const label = (size = 12, color: string = theme.ink) =>
  `font-family:${monoFont};font-size:${size}px;line-height:1.4;letter-spacing:0.08em;text-transform:uppercase;color:${color};`;
const body = `font-family:${displayFont};font-size:16px;line-height:1.6;color:${theme.ink};word-wrap:break-word;overflow-wrap:anywhere;`;
const STEPS = ["Submitted", "Approved", "Live"];

export function escapeHtml(value: string) {
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

/** Submitted → Approved → Live, the circles filled up to the current stage. */
function stepsRow(done: number) {
  const cells = STEPS.map((step, index) => {
    const reached = index < done;
    return `<td valign="top" width="33%" style="padding:0 8px 0 0">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td align="center" valign="middle" width="40" height="40" style="width:40px;height:40px;border:1.5px solid ${theme.red};border-radius:50%;background:${reached ? theme.red : theme.white};${label(13, reached ? theme.white : theme.red)}">${String(index + 1).padStart(2, "0")}</td></tr></table>
      <p style="${label(12, reached ? theme.red : theme.muted)}margin:10px 0 0">${step}</p>
    </td>`;
  }).join("");
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse;margin:0 0 28px"><tr>${cells}</tr></table>`;
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
  const heading = published ? "It’s live" : "We’ve got it";
  const kicker = published ? "On the calendar" : "Submitted for review";
  const status = published ? "Live on Happenings" : "Awaiting review";
  const website = new URL(
    process.env.BASE_URL || "https://happeningsofafrica.com",
  );
  const fontUrl = new URL("/font/ppneuemontreal-medium.otf", website).href;
  const websiteUrl = escapeHtml(website.origin);
  const greeting = name ? `Hello ${name},` : "Hello,";
  const copy = published
    ? `${title} is now live on ${SITE_NAME}. You can view and share your listing.`
    : `Thank you for submitting ${title} to ${SITE_NAME}. Every submission is reviewed before it appears on the calendar. We’ll email you again when it’s live.`;
  const subject = `${published ? "Your Happening is live" : "We’ve got your Happening"}: ${title.replace(/[\r\n]/g, " ")}`;
  const button =
    published && url
      ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 16px"><tr><td bgcolor="${theme.red}" style="background:${theme.red};mso-padding-alt:16px 28px"><a href="${escapeHtml(url)}" style="display:inline-block;padding:16px 28px;${label(14, theme.white)}text-decoration:none;mso-padding-alt:0">View your Happening</a></td></tr></table>
        <p style="${body}font-size:13px;margin:0 0 28px">Or open this link:<br><a href="${escapeHtml(url)}" style="color:${theme.red};text-decoration:underline;word-break:break-all">${escapeHtml(url)}</a></p>`
      : "";

  return {
    from: `${SITE_NAME} <${sender}>`,
    to: recipient,
    subject,
    text: `${greeting}\n\n${copy}${published && url ? `\n\nView your Happening: ${url}` : ""}\n\n${SITE_NAME}\nWhere Africa’s people, ideas and events meet`,
    html: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>${escapeHtml(subject)} | ${SITE_NAME}</title>
    <!--[if !mso]><!-->
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');
      @font-face { font-family:Montreal; font-style:normal; font-weight:500; font-display:swap; src:url('${escapeHtml(fontUrl)}') format('opentype'); }
      @media only screen and (min-width:621px) {
        .email-pad { padding-left:40px !important; padding-right:40px !important; }
        .email-heading { font-size:64px !important; }
      }
    </style>
    <!--<![endif]-->
    <!--[if mso]><style>body, table, td, p, a, h1, h2 { font-family:Arial, sans-serif !important; }</style><![endif]-->
  </head>
  <body style="margin:0;padding:0;background:${theme.cream};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%">
    <div aria-hidden="true" style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;mso-hide:all">${escapeHtml(copy)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="${theme.cream}" style="width:100%;background:${theme.cream};border-collapse:collapse">
      <tr><td align="center" style="padding:24px 12px">
        <!--[if mso]><table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0"><tr><td><![endif]-->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;border-collapse:collapse;table-layout:fixed">

          <!-- Red header, like the site's hero. -->
          <tr><td class="email-pad" bgcolor="${theme.red}" style="background:${theme.red};padding:28px 24px 36px">
            <a href="${websiteUrl}" style="font-family:${displayFont};font-size:22px;line-height:1.1;font-weight:500;letter-spacing:-0.02em;text-transform:uppercase;color:${theme.white};text-decoration:none">${SITE_NAME}</a>
            <p style="${label(12, theme.white)}margin:40px 0 14px"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${theme.white};margin-right:8px;vertical-align:middle"></span>${kicker}</p>
            <h1 class="email-heading" style="font-family:${displayFont};font-size:48px;line-height:1;font-weight:500;letter-spacing:-0.04em;text-transform:uppercase;color:${theme.white};margin:0">${heading}</h1>
          </td></tr>

          <!-- Body on white. -->
          <tr><td class="email-pad" bgcolor="${theme.white}" style="background:${theme.white};padding:32px 24px">
            <p style="${body}margin:0 0 12px">${escapeHtml(greeting)}</p>
            <p style="${body}margin:0 0 28px">${escapeHtml(copy)}</p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="${theme.cream}" style="width:100%;background:${theme.cream};border-collapse:collapse;table-layout:fixed;margin:0 0 28px">
              <tr><td style="padding:20px 24px">
                <p style="${label(12, theme.red)}margin:0 0 8px">${status}</p>
                <h2 style="font-family:${displayFont};font-size:24px;line-height:1.15;font-weight:500;letter-spacing:-0.02em;text-transform:uppercase;color:${theme.ink};margin:0;word-wrap:break-word;overflow-wrap:anywhere">${escapeHtml(title)}</h2>
              </td></tr>
            </table>
            ${stepsRow(published ? 3 : 1)}
            ${button}
          </td></tr>

          <!-- Ink footer, like the site's. -->
          <tr><td class="email-pad" bgcolor="${theme.ink}" style="background:${theme.ink};padding:28px 24px">
            <a href="${websiteUrl}" style="font-family:${displayFont};font-size:18px;line-height:1.1;font-weight:500;letter-spacing:-0.02em;text-transform:uppercase;color:${theme.white};text-decoration:none">${SITE_NAME}</a>
            <p style="${body}font-size:14px;color:${theme.cream};margin:8px 0 20px">Where Africa’s people, ideas and events meet</p>
            <p style="${label(11, "rgba(255,255,255,0.55)")}margin:0">FOLA Projects · <a href="${websiteUrl}" style="color:rgba(255,255,255,0.55);text-decoration:underline">${escapeHtml(website.hostname)}</a></p>
          </td></tr>

        </table>
        <!--[if mso]></td></tr></table><![endif]-->
      </td></tr>
    </table>
  </body>
</html>`,
  };
}
