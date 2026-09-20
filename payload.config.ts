import path from "path";
import { fileURLToPath } from "url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import sharp from "sharp";

import { media } from "./payload/collections/media";
import { users } from "./payload/collections/users";
import { cities } from "./payload/collections/cities";
import { organisers } from "./payload/collections/organisers";
import { venues } from "./payload/collections/venues";
import { seasons } from "./payload/collections/seasons";
import { events } from "./payload/collections/events";
import { eventReviews } from "./payload/collections/event-reviews";
import { ReviewSettings } from "./payload/globals/review-settings";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

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
  ],
  globals: [ReviewSettings],
  editor: lexicalEditor(),
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
