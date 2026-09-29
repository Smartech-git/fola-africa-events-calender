import { type MigrateDownArgs, type MigrateUpArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "review_settings"
      DROP COLUMN "turnaround_working_days",
      DROP COLUMN "minimum_verified_events_per_city";
    ALTER TABLE "_review_settings_v"
      DROP COLUMN "version_turnaround_working_days",
      DROP COLUMN "version_minimum_verified_events_per_city";
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Removed values cannot be recovered; restore the former defaults.
  await db.execute(sql`
    ALTER TABLE "review_settings"
      ADD COLUMN "turnaround_working_days" numeric DEFAULT 2 NOT NULL,
      ADD COLUMN "minimum_verified_events_per_city" numeric DEFAULT 25 NOT NULL;
    ALTER TABLE "_review_settings_v"
      ADD COLUMN "version_turnaround_working_days" numeric DEFAULT 2 NOT NULL,
      ADD COLUMN "version_minimum_verified_events_per_city" numeric DEFAULT 25 NOT NULL;
  `);
}
