import Link from "next/link";

import type { Payload, TypedUser } from "payload";

import { roleOf } from "@/payload/access";
import styles from "@/payload/components/members-brevo-export.module.css";
import { brevoAudience } from "@/payload/members/brevo";
import { BREVO_EXPORT_PATH } from "@/payload/members/brevo-export";

/**
 * Above the Members list: downloads the members who agreed to marketing as a
 * CSV for Brevo's contact import. Administrators only, like the export itself.
 */
export async function MembersBrevoExport({
  payload,
  user,
}: {
  payload: Payload;
  user?: TypedUser | null;
}) {
  if (!user || roleOf(user) !== "admin") return null;
  const { totalDocs } = await payload.count({
    collection: "members",
    where: brevoAudience,
  });
  const href = `${payload.config.routes.api}/members${BREVO_EXPORT_PATH}`;

  return (
    <div className={styles.panel}>
      <div className={styles.text}>
        <h4>Export for Brevo</h4>
        <p>
          {totalDocs === 1
            ? "1 active member has"
            : `${totalDocs} active members have`}{" "}
          agreed to marketing emails. Import the CSV in Brevo under Contacts →
          Import contacts. First create the text attributes ORGANISATION,
          JOB_TITLE, INDUSTRY, CITY, COUNTRY and MEMBER_TYPE, and the date
          attribute OPT_IN_DATE.
        </p>
      </div>
      <Link
        href={href}
        download
        prefetch={false}
        aria-disabled={totalDocs === 0}
        className={`btn btn--style-primary btn--size-small btn--withoutPopup btn--no-margin${totalDocs === 0 ? ` ${styles.disabled}` : ""}`}
      >
        <span className="btn__content">
          <span className="btn__label">Download CSV</span>
        </span>
      </Link>
    </div>
  );
}
