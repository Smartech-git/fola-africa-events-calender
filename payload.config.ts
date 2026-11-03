import path from "path";
import { fileURLToPath } from "url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { buildConfig } from "payload";
import sharp from "sharp";

import { SITE_NAME } from "@/constants/brand";
import { roleOf } from "@/payload/access";
import { cities } from "@/payload/collections/cities";
import { emailNotifications } from "@/payload/collections/email-notifications";
import { eventChanges } from "@/payload/collections/event-changes";
import { eventReviews } from "@/payload/collections/event-reviews";
import { events } from "@/payload/collections/events";
import { media } from "@/payload/collections/media";
import { members } from "@/payload/collections/members";
import { organisers } from "@/payload/collections/organisers";
import { seasons } from "@/payload/collections/seasons";
import { users } from "@/payload/collections/users";
import { venues } from "@/payload/collections/venues";
import { emailSettings } from "@/payload/emails/email-settings";
import { sendEventEmailTask } from "@/payload/emails/event-email-task";
import { zeptomailAdapter } from "@/payload/emails/zeptomail-adapter";
import { NotificationSettings } from "@/payload/globals/notification-settings";
import { ReviewSettings } from "@/payload/globals/review-settings";
import { syncBrevoContactTask } from "@/payload/members/brevo-task";
import { reviewEventTask } from "@/payload/reviews/review-task";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    meta: { titleSuffix: `| ${SITE_NAME}` },
    user: users.slug,
    components: {
      // Show/hide toggle on every admin password field.
      providers: [
        "@/payload/components/password-toggle#PasswordToggleProvider",
      ],
      beforeNavLinks: [
        "@/payload/components/review-count-badge#ReviewCountBadge",
      ],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    users,
    media,
    members,
    cities,
    organisers,
    venues,
    seasons,
    events,
    eventReviews,
    eventChanges,
    emailNotifications,
  ],
  globals: [ReviewSettings, NotificationSettings],
  jobs: {
    tasks: [reviewEventTask, sendEventEmailTask, syncBrevoContactTask],
    enableConcurrencyControl: true,
    access: {
      run: ({ req }) => roleOf(req.user) === "admin",
      queue: ({ req }) => roleOf(req.user) === "admin",
      cancel: ({ req }) => roleOf(req.user) === "admin",
    },
    jobsCollectionOverrides: ({ defaultJobsCollection }) => ({
      ...defaultJobsCollection,
      access: {
        ...defaultJobsCollection.access,
        read: ({ req }) => roleOf(req.user) === "admin",
      },
      admin: { ...defaultJobsCollection.admin, hidden: false, group: "Review" },
    }),
  },
  editor: lexicalEditor(),
  email: emailSettings() ? zeptomailAdapter() : undefined,
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    push: false,
    migrationDir: path.resolve(dirname, "payload", "migrations"),
    pool: {
      connectionString: process.env.DATABASE_URL || "",
    },
  }),
  sharp,
  plugins: [
    // Uploads live in Vercel Blob; Vercel deletes local files on every deploy.
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      token: process.env.BLOB_READ_WRITE_TOKEN,
      // Keeps the schema the same with or without a token.
      alwaysInsertFields: true,
      // No addRandomSuffix: the adapter records the suffix on the original only,
      // so the resized copies would 404. Payload keeps file names unique, and
      // member uploads get random names in /api/submission-uploads.
      // Staff uploads in the admin go straight to Blob, past the 4.5 MB limit.
      clientUploads: true,
      collections: {
        // Pages link to the Blob CDN directly instead of through Payload.
        media: { prefix: "media", disablePayloadAccessControl: true },
      },
    }),
  ],
});
