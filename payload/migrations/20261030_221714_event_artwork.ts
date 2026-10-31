import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" ADD COLUMN "uploaded_by_id" integer;
  ALTER TABLE "media" ADD COLUMN "prefix" varchar DEFAULT 'media';
  ALTER TABLE "media" ADD COLUMN "sizes_card_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_card_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_card_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_card_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_card_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_card_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_detail_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_detail_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_detail_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_detail_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_detail_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_detail_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_og_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_og_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_og_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_og_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_og_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_og_filename" varchar;
  ALTER TABLE "events" ADD COLUMN "artwork_id" integer;
  ALTER TABLE "events" ADD COLUMN "artwork_rights_confirmed_at" timestamp(3) with time zone;
  ALTER TABLE "_events_v" ADD COLUMN "version_artwork_id" integer;
  ALTER TABLE "_events_v" ADD COLUMN "version_artwork_rights_confirmed_at" timestamp(3) with time zone;
  ALTER TABLE "media" ADD CONSTRAINT "media_uploaded_by_id_members_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_artwork_id_media_id_fk" FOREIGN KEY ("artwork_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_artwork_id_media_id_fk" FOREIGN KEY ("version_artwork_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "media_uploaded_by_idx" ON "media" USING btree ("uploaded_by_id");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_detail_sizes_detail_filename_idx" ON "media" USING btree ("sizes_detail_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "media" USING btree ("sizes_og_filename");
  CREATE INDEX "events_artwork_idx" ON "events" USING btree ("artwork_id");
  CREATE INDEX "_events_v_version_version_artwork_idx" ON "_events_v" USING btree ("version_artwork_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" DROP CONSTRAINT "media_uploaded_by_id_members_id_fk";
  
  ALTER TABLE "events" DROP CONSTRAINT "events_artwork_id_media_id_fk";
  
  ALTER TABLE "_events_v" DROP CONSTRAINT "_events_v_version_artwork_id_media_id_fk";
  
  DROP INDEX "media_uploaded_by_idx";
  DROP INDEX "media_sizes_card_sizes_card_filename_idx";
  DROP INDEX "media_sizes_detail_sizes_detail_filename_idx";
  DROP INDEX "media_sizes_og_sizes_og_filename_idx";
  DROP INDEX "events_artwork_idx";
  DROP INDEX "_events_v_version_version_artwork_idx";
  ALTER TABLE "media" DROP COLUMN "uploaded_by_id";
  ALTER TABLE "media" DROP COLUMN "prefix";
  ALTER TABLE "media" DROP COLUMN "sizes_card_url";
  ALTER TABLE "media" DROP COLUMN "sizes_card_width";
  ALTER TABLE "media" DROP COLUMN "sizes_card_height";
  ALTER TABLE "media" DROP COLUMN "sizes_card_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_card_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_card_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_detail_url";
  ALTER TABLE "media" DROP COLUMN "sizes_detail_width";
  ALTER TABLE "media" DROP COLUMN "sizes_detail_height";
  ALTER TABLE "media" DROP COLUMN "sizes_detail_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_detail_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_detail_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_og_url";
  ALTER TABLE "media" DROP COLUMN "sizes_og_width";
  ALTER TABLE "media" DROP COLUMN "sizes_og_height";
  ALTER TABLE "media" DROP COLUMN "sizes_og_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_og_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_og_filename";
  ALTER TABLE "events" DROP COLUMN "artwork_id";
  ALTER TABLE "events" DROP COLUMN "artwork_rights_confirmed_at";
  ALTER TABLE "_events_v" DROP COLUMN "version_artwork_id";
  ALTER TABLE "_events_v" DROP COLUMN "version_artwork_rights_confirmed_at";`)
}
