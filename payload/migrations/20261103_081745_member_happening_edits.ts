import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_event_changes_status" AS ENUM('pending', 'approved', 'declined', 'withdrawn');
  ALTER TYPE "public"."enum_events_status" ADD VALUE 'withdrawn';
  ALTER TYPE "public"."enum__events_v_version_status" ADD VALUE 'withdrawn';
  ALTER TYPE "public"."enum_email_notifications_kind" ADD VALUE 'changes';
  ALTER TYPE "public"."enum_email_notifications_kind" ADD VALUE 'changes-approved';
  ALTER TYPE "public"."enum_email_notifications_kind" ADD VALUE 'changes-declined';
  ALTER TYPE "public"."enum_email_notifications_kind" ADD VALUE 'urgent';
  ALTER TYPE "public"."enum_email_notifications_kind" ADD VALUE 'status';
  CREATE TABLE "event_changes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"summary" varchar,
  	"event_id" integer NOT NULL,
  	"member_id" integer,
  	"status" "enum_event_changes_status" DEFAULT 'pending' NOT NULL,
  	"note" varchar,
  	"previous" jsonb,
  	"changes" jsonb,
  	"venue_record_id" integer,
  	"organiser_confirmed" boolean DEFAULT false,
  	"decline_reason" varchar,
  	"reviewed_by_id" integer,
  	"reviewed_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "events" ADD COLUMN "submitter_edited_at" timestamp(3) with time zone;
  ALTER TABLE "_events_v" ADD COLUMN "version_submitter_edited_at" timestamp(3) with time zone;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "event_changes_id" integer;
  ALTER TABLE "event_changes" ADD CONSTRAINT "event_changes_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_changes" ADD CONSTRAINT "event_changes_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_changes" ADD CONSTRAINT "event_changes_venue_record_id_venues_id_fk" FOREIGN KEY ("venue_record_id") REFERENCES "public"."venues"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_changes" ADD CONSTRAINT "event_changes_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "event_changes_event_idx" ON "event_changes" USING btree ("event_id");
  CREATE INDEX "event_changes_member_idx" ON "event_changes" USING btree ("member_id");
  CREATE INDEX "event_changes_status_idx" ON "event_changes" USING btree ("status");
  CREATE INDEX "event_changes_venue_record_idx" ON "event_changes" USING btree ("venue_record_id");
  CREATE INDEX "event_changes_reviewed_by_idx" ON "event_changes" USING btree ("reviewed_by_id");
  CREATE INDEX "event_changes_updated_at_idx" ON "event_changes" USING btree ("updated_at");
  CREATE INDEX "event_changes_created_at_idx" ON "event_changes" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_event_changes_fk" FOREIGN KEY ("event_changes_id") REFERENCES "public"."event_changes"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_event_changes_id_idx" ON "payload_locked_documents_rels" USING btree ("event_changes_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_event_changes_fk";
  DROP TABLE "event_changes";
  -- Values the old enums cannot hold: withdrawn returns to submitted, and the
  -- new notification kinds are removed.
  UPDATE "events" SET "status" = 'submitted' WHERE "status"::text = 'withdrawn';
  UPDATE "_events_v" SET "version_status" = 'submitted' WHERE "version_status"::text = 'withdrawn';
  DELETE FROM "email_notifications" WHERE "kind"::text NOT IN ('submitted', 'published', 'team');
  
  ALTER TABLE "events" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "events" ALTER COLUMN "status" SET DEFAULT 'submitted'::text;
  DROP TYPE "public"."enum_events_status";
  CREATE TYPE "public"."enum_events_status" AS ENUM('submitted', 'approved', 'published', 'cancelled', 'postponed');
  ALTER TABLE "events" ALTER COLUMN "status" SET DEFAULT 'submitted'::"public"."enum_events_status";
  ALTER TABLE "events" ALTER COLUMN "status" SET DATA TYPE "public"."enum_events_status" USING "status"::"public"."enum_events_status";
  ALTER TABLE "_events_v" ALTER COLUMN "version_status" SET DATA TYPE text;
  ALTER TABLE "_events_v" ALTER COLUMN "version_status" SET DEFAULT 'submitted'::text;
  DROP TYPE "public"."enum__events_v_version_status";
  CREATE TYPE "public"."enum__events_v_version_status" AS ENUM('submitted', 'approved', 'published', 'cancelled', 'postponed');
  ALTER TABLE "_events_v" ALTER COLUMN "version_status" SET DEFAULT 'submitted'::"public"."enum__events_v_version_status";
  ALTER TABLE "_events_v" ALTER COLUMN "version_status" SET DATA TYPE "public"."enum__events_v_version_status" USING "version_status"::"public"."enum__events_v_version_status";
  ALTER TABLE "email_notifications" ALTER COLUMN "kind" SET DATA TYPE text;
  DROP TYPE "public"."enum_email_notifications_kind";
  CREATE TYPE "public"."enum_email_notifications_kind" AS ENUM('submitted', 'published', 'team');
  ALTER TABLE "email_notifications" ALTER COLUMN "kind" SET DATA TYPE "public"."enum_email_notifications_kind" USING "kind"::"public"."enum_email_notifications_kind";
  DROP INDEX "payload_locked_documents_rels_event_changes_id_idx";
  ALTER TABLE "events" DROP COLUMN "submitter_edited_at";
  ALTER TABLE "_events_v" DROP COLUMN "version_submitter_edited_at";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "event_changes_id";
  DROP TYPE "public"."enum_event_changes_status";`)
}
