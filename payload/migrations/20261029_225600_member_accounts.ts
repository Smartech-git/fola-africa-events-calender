import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_members_status" AS ENUM('active', 'suspended');
  CREATE TYPE "public"."enum_members_industry" AS ENUM('business', 'technology', 'fashion', 'art', 'music', 'design', 'film-television', 'food-drink', 'beauty', 'sport');
  CREATE TYPE "public"."enum_members_describes" AS ENUM('brand', 'company', 'agency', 'promoter', 'gallery', 'institution', 'foundation', 'media', 'venue', 'individual', 'other');
  CREATE TABLE "members" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"status" "enum_members_status" DEFAULT 'active' NOT NULL,
  	"full_name" varchar NOT NULL,
  	"phone" varchar,
  	"organisation" varchar,
  	"role" varchar,
  	"industry" "enum_members_industry",
  	"city_id" integer,
  	"country" varchar,
  	"describes" "enum_members_describes",
  	"marketing_consent" boolean DEFAULT false,
  	"terms_accepted_at" timestamp(3) with time zone,
  	"marketing_consent_at" timestamp(3) with time zone,
  	"email_verified_at" timestamp(3) with time zone,
  	"last_sign_in_at" timestamp(3) with time zone,
  	"login_token_hash" varchar,
  	"login_token_issued_at" timestamp(3) with time zone,
  	"login_token_expires_at" timestamp(3) with time zone,
  	"session_version" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "events" ADD COLUMN "member_id" integer;
  ALTER TABLE "_events_v" ADD COLUMN "version_member_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "members_id" integer;
  ALTER TABLE "members" ADD CONSTRAINT "members_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "members_email_idx" ON "members" USING btree ("email");
  CREATE INDEX "members_city_idx" ON "members" USING btree ("city_id");
  CREATE INDEX "members_login_token_hash_idx" ON "members" USING btree ("login_token_hash");
  CREATE INDEX "members_updated_at_idx" ON "members" USING btree ("updated_at");
  CREATE INDEX "members_created_at_idx" ON "members" USING btree ("created_at");
  ALTER TABLE "events" ADD CONSTRAINT "events_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_member_id_members_id_fk" FOREIGN KEY ("version_member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_members_fk" FOREIGN KEY ("members_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "events_member_idx" ON "events" USING btree ("member_id");
  CREATE INDEX "_events_v_version_version_member_idx" ON "_events_v" USING btree ("version_member_id");
  CREATE INDEX "payload_locked_documents_rels_members_id_idx" ON "payload_locked_documents_rels" USING btree ("members_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Drop the references before the table; DROP TABLE ... CASCADE would remove
  // these constraints first and the explicit drops below would then fail.
  await db.execute(sql`
   ALTER TABLE "events" DROP CONSTRAINT "events_member_id_members_id_fk";
  ALTER TABLE "_events_v" DROP CONSTRAINT "_events_v_version_member_id_members_id_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_members_fk";
  DROP INDEX "events_member_idx";
  DROP INDEX "_events_v_version_version_member_idx";
  DROP INDEX "payload_locked_documents_rels_members_id_idx";
  ALTER TABLE "events" DROP COLUMN "member_id";
  ALTER TABLE "_events_v" DROP COLUMN "version_member_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "members_id";
  DROP TABLE "members";
  DROP TYPE "public"."enum_members_status";
  DROP TYPE "public"."enum_members_industry";
  DROP TYPE "public"."enum_members_describes";`)
}
