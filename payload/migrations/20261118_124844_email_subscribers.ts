import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_subscribers_status" AS ENUM('subscribed', 'unsubscribed');
  CREATE TYPE "public"."enum_subscribers_source" AS ENUM('popup', 'admin');
  ALTER TYPE "public"."enum_members_industry" ADD VALUE 'other';
  ALTER TYPE "public"."enum_events_industry" ADD VALUE 'other';
  ALTER TYPE "public"."enum_events_secondary_industry" ADD VALUE 'other';
  ALTER TYPE "public"."enum__events_v_version_industry" ADD VALUE 'other';
  ALTER TYPE "public"."enum__events_v_version_secondary_industry" ADD VALUE 'other';
  ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'sync-brevo-subscriber';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'sync-brevo-subscriber';
  CREATE TABLE "subscribers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"status" "enum_subscribers_status" DEFAULT 'subscribed' NOT NULL,
  	"source" "enum_subscribers_source" DEFAULT 'admin',
  	"consent_at" timestamp(3) with time zone,
  	"unsubscribed_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "subscribers_id" integer;
  CREATE UNIQUE INDEX "subscribers_email_idx" ON "subscribers" USING btree ("email");
  CREATE INDEX "subscribers_updated_at_idx" ON "subscribers" USING btree ("updated_at");
  CREATE INDEX "subscribers_created_at_idx" ON "subscribers" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_subscribers_fk" FOREIGN KEY ("subscribers_id") REFERENCES "public"."subscribers"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_subscribers_id_idx" ON "payload_locked_documents_rels" USING btree ("subscribers_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "subscribers" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "subscribers" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_subscribers_fk";
  
  ALTER TABLE "members" ALTER COLUMN "industry" SET DATA TYPE text;
  DROP TYPE "public"."enum_members_industry";
  CREATE TYPE "public"."enum_members_industry" AS ENUM('business', 'technology', 'fashion', 'art', 'music', 'design', 'film-television', 'food-drink', 'beauty', 'sport');
  ALTER TABLE "members" ALTER COLUMN "industry" SET DATA TYPE "public"."enum_members_industry" USING "industry"::"public"."enum_members_industry";
  ALTER TABLE "events" ALTER COLUMN "industry" SET DATA TYPE text;
  DROP TYPE "public"."enum_events_industry";
  CREATE TYPE "public"."enum_events_industry" AS ENUM('business', 'technology', 'fashion', 'art', 'music', 'design', 'film-television', 'food-drink', 'beauty', 'sport');
  ALTER TABLE "events" ALTER COLUMN "industry" SET DATA TYPE "public"."enum_events_industry" USING "industry"::"public"."enum_events_industry";
  ALTER TABLE "events" ALTER COLUMN "secondary_industry" SET DATA TYPE text;
  DROP TYPE "public"."enum_events_secondary_industry";
  CREATE TYPE "public"."enum_events_secondary_industry" AS ENUM('business', 'technology', 'fashion', 'art', 'music', 'design', 'film-television', 'food-drink', 'beauty', 'sport');
  ALTER TABLE "events" ALTER COLUMN "secondary_industry" SET DATA TYPE "public"."enum_events_secondary_industry" USING "secondary_industry"::"public"."enum_events_secondary_industry";
  ALTER TABLE "_events_v" ALTER COLUMN "version_industry" SET DATA TYPE text;
  DROP TYPE "public"."enum__events_v_version_industry";
  CREATE TYPE "public"."enum__events_v_version_industry" AS ENUM('business', 'technology', 'fashion', 'art', 'music', 'design', 'film-television', 'food-drink', 'beauty', 'sport');
  ALTER TABLE "_events_v" ALTER COLUMN "version_industry" SET DATA TYPE "public"."enum__events_v_version_industry" USING "version_industry"::"public"."enum__events_v_version_industry";
  ALTER TABLE "_events_v" ALTER COLUMN "version_secondary_industry" SET DATA TYPE text;
  DROP TYPE "public"."enum__events_v_version_secondary_industry";
  CREATE TYPE "public"."enum__events_v_version_secondary_industry" AS ENUM('business', 'technology', 'fashion', 'art', 'music', 'design', 'film-television', 'food-drink', 'beauty', 'sport');
  ALTER TABLE "_events_v" ALTER COLUMN "version_secondary_industry" SET DATA TYPE "public"."enum__events_v_version_secondary_industry" USING "version_secondary_industry"::"public"."enum__events_v_version_secondary_industry";
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'review-event', 'send-event-email', 'sync-brevo-contact');
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_log_task_slug" USING "task_slug"::"public"."enum_payload_jobs_log_task_slug";
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'review-event', 'send-event-email', 'sync-brevo-contact');
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_task_slug" USING "task_slug"::"public"."enum_payload_jobs_task_slug";
  DROP INDEX "payload_locked_documents_rels_subscribers_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "subscribers_id";
  DROP TYPE "public"."enum_subscribers_status";
  DROP TYPE "public"."enum_subscribers_source";`)
}
