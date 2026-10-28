import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_email_notifications_kind" ADD VALUE 'team';
  CREATE TABLE "notification_settings_submission_recipients" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL
  );
  
  CREATE TABLE "notification_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "email_notifications" ADD COLUMN "recipient" varchar;
  ALTER TABLE "notification_settings_submission_recipients" ADD CONSTRAINT "notification_settings_submission_recipients_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."notification_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "notification_settings_submission_recipients_order_idx" ON "notification_settings_submission_recipients" USING btree ("_order");
  CREATE INDEX "notification_settings_submission_recipients_parent_id_idx" ON "notification_settings_submission_recipients" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "notification_settings_submission_recipients" CASCADE;
  DROP TABLE "notification_settings" CASCADE;
  DELETE FROM "email_notifications" WHERE "kind" = 'team';
  ALTER TABLE "email_notifications" ALTER COLUMN "kind" SET DATA TYPE text;
  DROP TYPE "public"."enum_email_notifications_kind";
  CREATE TYPE "public"."enum_email_notifications_kind" AS ENUM('submitted', 'published');
  ALTER TABLE "email_notifications" ALTER COLUMN "kind" SET DATA TYPE "public"."enum_email_notifications_kind" USING "kind"::"public"."enum_email_notifications_kind";
  ALTER TABLE "email_notifications" DROP COLUMN "recipient";`)
}
