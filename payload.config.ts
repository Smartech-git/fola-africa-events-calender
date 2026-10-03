import path from "path";
import { fileURLToPath } from "url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { resendAdapter } from "@payloadcms/email-resend";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import sharp from "sharp";

import { roleOf } from "@/payload/access";
import { cities } from "@/payload/collections/cities";
import { emailNotifications } from "@/payload/collections/email-notifications";
import { eventReviews } from "@/payload/collections/event-reviews";
import { events } from "@/payload/collections/events";
import { media } from "@/payload/collections/media";
import { organisers } from "@/payload/collections/organisers";
import { seasons } from "@/payload/collections/seasons";
import { users } from "@/payload/collections/users";
import { venues } from "@/payload/collections/venues";
import { emailSettings } from "@/payload/emails/email-settings";
import { sendEventEmailTask } from "@/payload/emails/event-email-task";
import { ReviewSettings } from "@/payload/globals/review-settings";
import { reviewEventTask } from "@/payload/reviews/review-task";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const email = emailSettings();

export default buildConfig({
  admin: {
    user: users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    users,
    media,
    cities,
    organisers,
    venues,
    seasons,
    events,
    eventReviews,
    emailNotifications,
  ],
  globals: [ReviewSettings],
  jobs: {
    tasks: [reviewEventTask, sendEventEmailTask],
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
  email: email
    ? resendAdapter({
        apiKey: email.apiKey,
        defaultFromAddress: email.sender,
        defaultFromName: email.senderName,
      })
    : undefined,
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
  plugins: [],
});
