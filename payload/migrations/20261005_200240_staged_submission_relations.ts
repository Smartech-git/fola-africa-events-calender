import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_events_submitted_organiser_type" AS ENUM('brand', 'label', 'gallery', 'promoter', 'institution', 'individual');
  CREATE TYPE "public"."enum_events_organiser_resolution" AS ENUM('use-existing', 'create-new');
  CREATE TYPE "public"."enum_events_venue_resolution" AS ENUM('use-existing', 'create-new', 'omit');
  CREATE TYPE "public"."enum__events_v_version_submitted_organiser_type" AS ENUM('brand', 'label', 'gallery', 'promoter', 'institution', 'individual');
  CREATE TYPE "public"."enum__events_v_version_organiser_resolution" AS ENUM('use-existing', 'create-new');
  CREATE TYPE "public"."enum__events_v_version_venue_resolution" AS ENUM('use-existing', 'create-new', 'omit');
  ALTER TABLE "events" ALTER COLUMN "organiser_id" DROP NOT NULL;
  ALTER TABLE "_events_v" ALTER COLUMN "version_organiser_id" DROP NOT NULL;
  ALTER TABLE "events" ADD COLUMN "submitted_organiser_name" varchar;
  ALTER TABLE "events" ADD COLUMN "submitted_organiser_type" "enum_events_submitted_organiser_type";
  ALTER TABLE "events" ADD COLUMN "submitted_organiser_website" varchar;
  ALTER TABLE "events" ADD COLUMN "submitted_organiser_contact_email" varchar;
  ALTER TABLE "events" ADD COLUMN "organiser_resolution" "enum_events_organiser_resolution";
  ALTER TABLE "events" ADD COLUMN "submitted_venue_name" varchar;
  ALTER TABLE "events" ADD COLUMN "submitted_venue_area" varchar;
  ALTER TABLE "events" ADD COLUMN "submitted_venue_address" varchar;
  ALTER TABLE "events" ADD COLUMN "submitted_venue_map_url" varchar;
  ALTER TABLE "events" ADD COLUMN "venue_resolution" "enum_events_venue_resolution";
  ALTER TABLE "_events_v" ADD COLUMN "version_submitted_organiser_name" varchar;
  ALTER TABLE "_events_v" ADD COLUMN "version_submitted_organiser_type" "enum__events_v_version_submitted_organiser_type";
  ALTER TABLE "_events_v" ADD COLUMN "version_submitted_organiser_website" varchar;
  ALTER TABLE "_events_v" ADD COLUMN "version_submitted_organiser_contact_email" varchar;
  ALTER TABLE "_events_v" ADD COLUMN "version_organiser_resolution" "enum__events_v_version_organiser_resolution";
  ALTER TABLE "_events_v" ADD COLUMN "version_submitted_venue_name" varchar;
  ALTER TABLE "_events_v" ADD COLUMN "version_submitted_venue_area" varchar;
  ALTER TABLE "_events_v" ADD COLUMN "version_submitted_venue_address" varchar;
  ALTER TABLE "_events_v" ADD COLUMN "version_submitted_venue_map_url" varchar;
  ALTER TABLE "_events_v" ADD COLUMN "version_venue_resolution" "enum__events_v_version_venue_resolution";`);
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" ALTER COLUMN "organiser_id" SET NOT NULL;
  ALTER TABLE "_events_v" ALTER COLUMN "version_organiser_id" SET NOT NULL;
  ALTER TABLE "events" DROP COLUMN "submitted_organiser_name";
  ALTER TABLE "events" DROP COLUMN "submitted_organiser_type";
  ALTER TABLE "events" DROP COLUMN "submitted_organiser_website";
  ALTER TABLE "events" DROP COLUMN "submitted_organiser_contact_email";
  ALTER TABLE "events" DROP COLUMN "organiser_resolution";
  ALTER TABLE "events" DROP COLUMN "submitted_venue_name";
  ALTER TABLE "events" DROP COLUMN "submitted_venue_area";
  ALTER TABLE "events" DROP COLUMN "submitted_venue_address";
  ALTER TABLE "events" DROP COLUMN "submitted_venue_map_url";
  ALTER TABLE "events" DROP COLUMN "venue_resolution";
  ALTER TABLE "_events_v" DROP COLUMN "version_submitted_organiser_name";
  ALTER TABLE "_events_v" DROP COLUMN "version_submitted_organiser_type";
  ALTER TABLE "_events_v" DROP COLUMN "version_submitted_organiser_website";
  ALTER TABLE "_events_v" DROP COLUMN "version_submitted_organiser_contact_email";
  ALTER TABLE "_events_v" DROP COLUMN "version_organiser_resolution";
  ALTER TABLE "_events_v" DROP COLUMN "version_submitted_venue_name";
  ALTER TABLE "_events_v" DROP COLUMN "version_submitted_venue_area";
  ALTER TABLE "_events_v" DROP COLUMN "version_submitted_venue_address";
  ALTER TABLE "_events_v" DROP COLUMN "version_submitted_venue_map_url";
  ALTER TABLE "_events_v" DROP COLUMN "version_venue_resolution";
  DROP TYPE "public"."enum_events_submitted_organiser_type";
  DROP TYPE "public"."enum_events_organiser_resolution";
  DROP TYPE "public"."enum_events_venue_resolution";
  DROP TYPE "public"."enum__events_v_version_submitted_organiser_type";
  DROP TYPE "public"."enum__events_v_version_organiser_resolution";
  DROP TYPE "public"."enum__events_v_version_venue_resolution";`);
}
