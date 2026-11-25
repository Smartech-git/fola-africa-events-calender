import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "members" ADD COLUMN "happenings_submitted" numeric DEFAULT 0;
   UPDATE "members" SET "happenings_submitted" = (
     SELECT count(*) FROM "events" WHERE "events"."member_id" = "members"."id"
   );`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "members" DROP COLUMN "happenings_submitted";`)
}
