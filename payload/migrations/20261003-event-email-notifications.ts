import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_email_notifications_kind" AS ENUM('submitted', 'published');
  CREATE TYPE "public"."enum_email_notifications_status" AS ENUM('queued', 'sent', 'skipped', 'failed');
  ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'send-event-email';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'send-event-email';
  CREATE TABLE "email_notifications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"event_id" numeric NOT NULL,
  	"kind" "enum_email_notifications_kind" NOT NULL,
  	"status" "enum_email_notifications_status" DEFAULT 'queued' NOT NULL,
  	"message" jsonb,
  	"first_attempt_at" timestamp(3) with time zone,
  	"sent_at" timestamp(3) with time zone,
  	"provider_id" varchar,
  	"failure_reason" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "email_notifications_id" integer;
  CREATE UNIQUE INDEX "email_notifications_key_idx" ON "email_notifications" USING btree ("key");
  CREATE INDEX "email_notifications_event_id_idx" ON "email_notifications" USING btree ("event_id");
  CREATE INDEX "email_notifications_updated_at_idx" ON "email_notifications" USING btree ("updated_at");
  CREATE INDEX "email_notifications_created_at_idx" ON "email_notifications" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_email_notifications_fk" FOREIGN KEY ("email_notifications_id") REFERENCES "public"."email_notifications"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_email_notifications_id_idx" ON "payload_locked_documents_rels" USING btree ("email_notifications_id");`);
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_email_notifications_fk";
  DROP TABLE "email_notifications";
  DELETE FROM "payload_jobs" WHERE "task_slug" = 'send-event-email';
  DELETE FROM "payload_jobs_log" WHERE "task_slug" = 'send-event-email';
  
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'review-event');
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_log_task_slug" USING "task_slug"::"public"."enum_payload_jobs_log_task_slug";
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'review-event');
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_task_slug" USING "task_slug"::"public"."enum_payload_jobs_task_slug";
  DROP INDEX "payload_locked_documents_rels_email_notifications_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "email_notifications_id";
  DROP TYPE "public"."enum_email_notifications_kind";
  DROP TYPE "public"."enum_email_notifications_status";`);
}
