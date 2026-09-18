import path from "path";
import { fileURLToPath } from "url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Media } from "./collections/media";
import { Users } from "./collections/users";
import { Cities } from "./collections/cities";
import { Organisers } from "./collections/organisers";
import { Venues } from "./collections/venues";
import { Seasons } from "./collections/seasons";
import { Events } from "./collections/events";
import { EventReviews } from "./collections/event-reviews";
import { ReviewSettings } from "./globals/review-settings";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Cities,
    Organisers,
    Venues,
    Seasons,
    Events,
    EventReviews,
  ],
  globals: [ReviewSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    push: false,
    migrationDir: path.resolve(dirname, "migrations"),
    pool: {
      connectionString: process.env.DATABASE_URL || "",
    },
  }),
  sharp,
  plugins: [],
});
