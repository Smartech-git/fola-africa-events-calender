import type {
  EmailMessage,
  EventEmailKind,
} from "@/payload/emails/email-settings";

// Match the frontend palette in app/styles/globals.css. Inline styles keep
// these colours available when an email client removes the document head.
const theme = {
  background: "#F4F1EE",
  surface: "#EFE4DB",
  primary: "#838061",
  text: "#201D1D",
  border: "#ADB0A6",
};
const bodyFont = "Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif";
const headingFont = "Apris, 'Helvetica Neue', Helvetica, Arial, sans-serif";
const labelStyle = `font-family:${bodyFont};font-size:11px;line-height:18px;font-weight:500;letter-spacing:1.4px;text-transform:uppercase;color:${theme.text};`;
const paragraphStyle = `font-family:${bodyFont};font-size:14px;line-height:24px;font-weight:400;color:${theme.text};word-wrap:break-word;overflow-wrap:anywhere;`;

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
  const heading = published ? "Your event<br>is live." : "Event<br>received.";
  const status = published ? "Published on FOLA" : "Awaiting review";
  const website = new URL(process.env.BASE_URL || "https://wewantfola.com");
  const fontUrl = new URL("/font/Apris-Light.woff2", website).href;
  const websiteUrl = escapeHtml(website.origin);
  const greeting = name ? `Hello ${name},` : "Hello,";
  const copy = published
    ? `Your event, ${title}, has been published on FOLA. You can now view and share your listing.`
    : `Thank you for submitting ${title} to FOLA. We've received your event and it is awaiting review. We'll email you again when it is published.`;
  const link =
    published && url
      ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0 20px"><tr><td bgcolor="${theme.text}" style="background:${theme.text};text-align:center;mso-padding-alt:14px 24px"><a href="${escapeHtml(url)}" style="display:inline-block;background:${theme.text};border:1px solid ${theme.text};padding:13px 24px;font-family:${bodyFont};font-size:12px;line-height:20px;font-weight:600;letter-spacing:1px;text-transform:uppercase;text-decoration:none;color:${theme.background};mso-padding-alt:0">View event</a></td></tr></table><p style="${paragraphStyle}margin:0;font-size:12px;line-height:20px">Or open this link:<br><a href="${escapeHtml(url)}" style="color:${theme.text};text-decoration:underline;word-break:break-all;overflow-wrap:anywhere">${escapeHtml(url)}</a></p>`
      : "";
  return {
    from: `FOLA <${sender}>`,
    to: recipient,
    subject: `${published ? "Your event is published" : "Event submission received"}: ${title.replace(/[\r\n]/g, " ")}`,
    text: `${greeting}\n\n${copy}${published && url ? `\n\nView event: ${url}` : ""}\n\nThe FOLA team`,
    html: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>${published ? "Your event is published" : "Event submission received"} | FOLA</title>
    <!--[if !mso]><!-->
    <style>
      @font-face { font-family:Apris; font-style:normal; font-weight:300; font-display:swap; src:url('${escapeHtml(fontUrl)}') format('woff2'); }
      @media only screen and (min-width:621px) {
        .email-content { padding:32px 40px !important; }
        .email-heading { font-size:52px !important; line-height:56px !important; }
        .email-title { font-size:30px !important; line-height:36px !important; }
      }
    </style>
    <!--<![endif]-->
    <!--[if mso]><style>body, table, td, p, a, h1, h2 { font-family:Arial, sans-serif !important; }</style><![endif]-->
  </head>
  <body style="margin:0;padding:0;background:${theme.background};font-family:${bodyFont};color:${theme.text};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%">
    <div aria-hidden="true" style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;mso-hide:all">${escapeHtml(copy)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="${theme.background}" style="width:100%;background:${theme.background};border-collapse:collapse">
      <tr><td align="center" style="padding:24px 12px">
        <!--[if mso]><table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0"><tr><td><![endif]-->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;border-collapse:collapse;table-layout:fixed">
          <tr><td class="email-content" style="padding:28px 24px;background:${theme.background}">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse">
              <tr>
                <td valign="middle" style="padding:0 12px 22px 0;border-bottom:1px solid ${theme.border}"><a href="${websiteUrl}" style="font-family:${headingFont};font-size:32px;line-height:38px;font-weight:300;letter-spacing:4px;color:${theme.text};text-decoration:none">FOLA</a></td>
                <td valign="middle" align="right" style="padding:0 0 22px;border-bottom:1px solid ${theme.border}"><p style="${labelStyle}margin:0;font-size:10px;line-height:16px;letter-spacing:1px">Africa’s<br>events calendar</p></td>
              </tr>
            </table>
            <p style="${labelStyle}margin:32px 0 16px">${published ? "On the calendar" : "Your submission"}</p>
            <h1 class="email-heading" style="font-family:${headingFont};font-size:40px;line-height:44px;font-weight:300;letter-spacing:1px;text-transform:uppercase;color:${theme.primary};margin:0 0 32px">${heading}</h1>
            <p style="${paragraphStyle}margin:0 0 12px">${escapeHtml(greeting)}</p>
            <p style="${paragraphStyle}margin:0 0 28px">${escapeHtml(copy)}</p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="${theme.surface}" style="width:100%;background:${theme.surface};border:1px solid ${theme.border};border-collapse:collapse;table-layout:fixed">
              <tr><td style="padding:20px 24px;border-left:3px solid ${theme.primary}">
                <p style="${labelStyle}margin:0 0 10px">${status}</p>
                <h2 class="email-title" style="font-family:${headingFont};font-size:26px;line-height:32px;font-weight:300;color:${theme.text};margin:0;word-wrap:break-word;overflow-wrap:anywhere">${escapeHtml(title)}</h2>
               </td></tr>
            </table>
            ${link}
            <p style="${paragraphStyle}margin:28px 0 32px">The FOLA team</p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse">
              <tr><td style="padding-top:20px;border-top:1px solid ${theme.border}">
                <p style="${labelStyle}margin:0 0 8px;font-size:10px">The people. The places.<br>The moments that move us.</p>
                <a href="${websiteUrl}" style="${labelStyle}font-size:10px;color:${theme.text};text-decoration:underline">${escapeHtml(website.hostname)}</a>
              </td></tr>
            </table>
          </td></tr>
        </table>
        <!--[if mso]></td></tr></table><![endif]-->
      </td></tr>
    </table>
  </body>
</html>`,
  };
}
