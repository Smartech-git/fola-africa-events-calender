import { SITE_NAME } from "@/constants/brand";
import { escapeHtml } from "@/payload/emails/event-email-template";

// Same palette and type as the event emails (event-email-template.ts).
const theme = {
  red: "#B51C17",
  cream: "#F4E3D7",
  ink: "#1A1A1A",
  white: "#FFFFFF",
  muted: "rgba(26,26,26,0.6)",
};
const monoFont = "'Courier Prime', 'Courier New', Courier, monospace";
const displayFont = "Montreal, 'Helvetica Neue', Helvetica, Arial, sans-serif";
const label = (size = 12, color: string = theme.ink) =>
  `font-family:${monoFont};font-size:${size}px;line-height:1.4;letter-spacing:0.08em;text-transform:uppercase;color:${color};`;
const body = `font-family:${displayFont};font-size:16px;line-height:1.6;color:${theme.ink};word-wrap:break-word;overflow-wrap:anywhere;`;

/** The one-time sign-in link. It opens the Continue page; nothing signs in until the member presses Continue. */
export function signInEmailTemplate({
  name,
  url,
  minutes,
  newAccount,
}: {
  name?: string | null;
  url: string;
  minutes: number;
  newAccount: boolean;
}) {
  const website = new URL(
    process.env.BASE_URL || "https://happeningsofafrica.com",
  );
  const websiteUrl = escapeHtml(website.origin);
  const fontUrl = new URL("/font/ppneuemontreal-medium.otf", website).href;
  // Email clients do not render SVG, so the wordmark is a PNG (rendered at 4.5x).
  const logoUrl = escapeHtml(
    new URL("/assets/brand/wordmark-white.png", website).href,
  );
  const logo = (width: number) =>
    `<a href="${websiteUrl}" style="display:inline-block;text-decoration:none"><img src="${logoUrl}" width="${width}" height="${Math.round((width * 81) / 1080)}" alt="${SITE_NAME}" style="display:block;width:${width}px;max-width:100%;height:auto;border:0;outline:none;text-decoration:none;font-family:${displayFont};font-size:18px;font-weight:500;text-transform:uppercase;color:${theme.white}"></a>`;

  const greeting = name ? `Hello ${name},` : "Hello,";
  const heading = newAccount ? "Confirm your email" : "Sign in";
  const kicker = newAccount ? "Welcome to Happenings" : "One link. No password";
  const copy = newAccount
    ? `Welcome to ${SITE_NAME}. Press the button below to confirm your email and sign in.`
    : `Press the button below to sign in to ${SITE_NAME}.`;
  const note = `This link works once and expires in ${minutes} minutes. If you didn’t ask for it, you can ignore this email; nothing happens until the link is used.`;
  const subject = newAccount
    ? `Confirm your email for ${SITE_NAME}`
    : `Your sign-in link for ${SITE_NAME}`;
  const safeUrl = escapeHtml(url);

  return {
    subject,
    text: `${greeting}\n\n${copy}\n\nSign in: ${url}\n\n${note}\n\n${SITE_NAME}\nWhere Africa’s people, ideas and events meet`,
    html: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>${escapeHtml(subject)}</title>
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
    <!--[if mso]><style>body, table, td, p, a, h1 { font-family:Arial, sans-serif !important; }</style><![endif]-->
  </head>
  <body style="margin:0;padding:0;background:${theme.cream};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%">
    <div aria-hidden="true" style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;mso-hide:all">${escapeHtml(copy)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="${theme.cream}" style="width:100%;background:${theme.cream};border-collapse:collapse">
      <tr><td align="center" style="padding:24px 12px">
        <!--[if mso]><table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0"><tr><td><![endif]-->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;border-collapse:collapse;table-layout:fixed">

          <tr><td class="email-pad" bgcolor="${theme.red}" style="background:${theme.red};padding:28px 24px 36px">
            ${logo(240)}
            <p style="${label(12, theme.white)}margin:40px 0 14px"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${theme.white};margin-right:8px;vertical-align:middle"></span>${kicker}</p>
            <h1 class="email-heading" style="font-family:${displayFont};font-size:48px;line-height:1;font-weight:500;letter-spacing:-0.04em;text-transform:uppercase;color:${theme.white};margin:0">${heading}</h1>
          </td></tr>

          <tr><td class="email-pad" bgcolor="${theme.white}" style="background:${theme.white};padding:32px 24px">
            <p style="${body}margin:0 0 12px">${escapeHtml(greeting)}</p>
            <p style="${body}margin:0 0 28px">${escapeHtml(copy)}</p>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 16px"><tr><td bgcolor="${theme.red}" style="background:${theme.red};mso-padding-alt:16px 28px"><a href="${safeUrl}" style="display:inline-block;padding:16px 28px;${label(14, theme.white)}text-decoration:none;mso-padding-alt:0">Sign in</a></td></tr></table>
            <p style="${body}font-size:13px;margin:0 0 28px">Or open this link:<br><a href="${safeUrl}" style="color:${theme.red};text-decoration:underline;word-break:break-all">${safeUrl}</a></p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="${theme.cream}" style="width:100%;background:${theme.cream};border-collapse:collapse;table-layout:fixed">
              <tr><td style="padding:16px 20px">
                <p style="${label(11, theme.red)}margin:0 0 6px">Works once · ${minutes} minutes</p>
                <p style="${body}font-size:14px;margin:0">${escapeHtml(note)}</p>
              </td></tr>
            </table>
          </td></tr>

          <tr><td class="email-pad" bgcolor="${theme.ink}" style="background:${theme.ink};padding:28px 24px">
            ${logo(200)}
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
