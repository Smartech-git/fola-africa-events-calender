import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_events_organiser_resolution" ADD VALUE 'update-existing' BEFORE 'create-new';
  ALTER TYPE "public"."enum_events_venue_resolution" ADD VALUE 'update-existing' BEFORE 'create-new';
  ALTER TYPE "public"."enum__events_v_version_organiser_resolution" ADD VALUE 'update-existing' BEFORE 'create-new';
  ALTER TYPE "public"."enum__events_v_version_venue_resolution" ADD VALUE 'update-existing' BEFORE 'create-new';
  ALTER TABLE "events" ADD COLUMN "organiser_update" jsonb;
  ALTER TABLE "events" ADD COLUMN "venue_update" jsonb;
  ALTER TABLE "_events_v" ADD COLUMN "version_organiser_update" jsonb;
  ALTER TABLE "_events_v" ADD COLUMN "version_venue_update" jsonb;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" ALTER COLUMN "organiser_resolution" SET DATA TYPE text;
  DROP TYPE "public"."enum_events_organiser_resolution";
  CREATE TYPE "public"."enum_events_organiser_resolution" AS ENUM('use-existing', 'create-new');
  ALTER TABLE "events" ALTER COLUMN "organiser_resolution" SET DATA TYPE "public"."enum_events_organiser_resolution" USING "organiser_resolution"::"public"."enum_events_organiser_resolution";
  ALTER TABLE "events" ALTER COLUMN "venue_resolution" SET DATA TYPE text;
  DROP TYPE "public"."enum_events_venue_resolution";
  CREATE TYPE "public"."enum_events_venue_resolution" AS ENUM('use-existing', 'create-new', 'omit');
  ALTER TABLE "events" ALTER COLUMN "venue_resolution" SET DATA TYPE "public"."enum_events_venue_resolution" USING "venue_resolution"::"public"."enum_events_venue_resolution";
  ALTER TABLE "_events_v" ALTER COLUMN "version_organiser_resolution" SET DATA TYPE text;
  DROP TYPE "public"."enum__events_v_version_organiser_resolution";
  CREATE TYPE "public"."enum__events_v_version_organiser_resolution" AS ENUM('use-existing', 'create-new');
  ALTER TABLE "_events_v" ALTER COLUMN "version_organiser_resolution" SET DATA TYPE "public"."enum__events_v_version_organiser_resolution" USING "version_organiser_resolution"::"public"."enum__events_v_version_organiser_resolution";
  ALTER TABLE "_events_v" ALTER COLUMN "version_venue_resolution" SET DATA TYPE text;
  DROP TYPE "public"."enum__events_v_version_venue_resolution";
  CREATE TYPE "public"."enum__events_v_version_venue_resolution" AS ENUM('use-existing', 'create-new', 'omit');
  ALTER TABLE "_events_v" ALTER COLUMN "version_venue_resolution" SET DATA TYPE "public"."enum__events_v_version_venue_resolution" USING "version_venue_resolution"::"public"."enum__events_v_version_venue_resolution";
  ALTER TABLE "events" DROP COLUMN "organiser_update";
  ALTER TABLE "events" DROP COLUMN "venue_update";
  ALTER TABLE "_events_v" DROP COLUMN "version_organiser_update";
  ALTER TABLE "_events_v" DROP COLUMN "version_venue_update";`)
}
