import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_event_imports_status" AS ENUM('published', 'submitted');
  CREATE TABLE "event_imports" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"file_name" varchar,
  	"status" "enum_event_imports_status",
  	"imported_by_id" integer,
  	"rows" numeric,
  	"created" numeric,
  	"updated" numeric,
  	"failed" numeric,
  	"failures" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "event_imports_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"events_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "event_imports_id" integer;
  ALTER TABLE "event_imports" ADD CONSTRAINT "event_imports_imported_by_id_users_id_fk" FOREIGN KEY ("imported_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_imports_rels" ADD CONSTRAINT "event_imports_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."event_imports"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_imports_rels" ADD CONSTRAINT "event_imports_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "event_imports_imported_by_idx" ON "event_imports" USING btree ("imported_by_id");
  CREATE INDEX "event_imports_updated_at_idx" ON "event_imports" USING btree ("updated_at");
  CREATE INDEX "event_imports_created_at_idx" ON "event_imports" USING btree ("created_at");
  CREATE INDEX "event_imports_rels_order_idx" ON "event_imports_rels" USING btree ("order");
  CREATE INDEX "event_imports_rels_parent_idx" ON "event_imports_rels" USING btree ("parent_id");
  CREATE INDEX "event_imports_rels_path_idx" ON "event_imports_rels" USING btree ("path");
  CREATE INDEX "event_imports_rels_events_id_idx" ON "event_imports_rels" USING btree ("events_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_event_imports_fk" FOREIGN KEY ("event_imports_id") REFERENCES "public"."event_imports"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_event_imports_id_idx" ON "payload_locked_documents_rels" USING btree ("event_imports_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_event_imports_fk";
  DROP INDEX "payload_locked_documents_rels_event_imports_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "event_imports_id";
  DROP TABLE "event_imports_rels" CASCADE;
  DROP TABLE "event_imports" CASCADE;
  DROP TYPE "public"."enum_event_imports_status";`)
}
