/** A sign-in link works once and expires this long after it is sent. */
export const LINK_MINUTES = 20;
/** Repeat requests for the same address within this window send nothing. */
export const RESEND_SECONDS = 60;

/** The signed, httpOnly member session. */
export const SESSION_COOKIE = "hoa-session";
/**
 * Readable flag so client components (the header) can show "My account"
 * without a request. It proves nothing; pages check the signed session.
 */
export const SIGNED_IN_COOKIE = "hoa-signed-in";
export const SESSION_DAYS = 30;

/** What a Happenings account offers: Create Account and the sign-in popup. */
export const ACCOUNT_BENEFITS = [
  "Submit a happening",
  "Your details prefilled every time",
  "View your submissions",
  "See whether each is pending, approved or live",
];
