CREATE TABLE "course_bundles" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "course_bundles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"version" integer DEFAULT 1 NOT NULL,
	"label" text NOT NULL,
	"type" "course_type" NOT NULL,
	"price" integer NOT NULL,
	CONSTRAINT "price_nonnegative" CHECK ("price" >= 0)
);
--> statement-breakpoint
CREATE TABLE "registerables" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "registerables_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"capacity" integer NOT NULL,
	"registeredCount" integer DEFAULT 0 NOT NULL,
	"courseId" integer,
	"courseBundleId" integer,
	CONSTRAINT "capacity_nonnegative" CHECK ("capacity" >= 0),
	CONSTRAINT "registered_count_nonnegative" CHECK ("registeredCount" >= 0),
	CONSTRAINT "registered_count_within_capacity" CHECK ("registeredCount" <= "capacity"),
	CONSTRAINT "owner_consistency" CHECK (("courseId" IS NULL) <> ("courseBundleId" IS NULL))
);
--> statement-breakpoint
CREATE TABLE "course_user_presences" (
	"registrationId" integer,
	"courseId" integer,
	"present" boolean NOT NULL,
	CONSTRAINT "course_user_presences_pkey" PRIMARY KEY("registrationId","courseId")
);
--> statement-breakpoint
CREATE TABLE "registrations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "registrations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"version" integer DEFAULT 1 NOT NULL,
	"userId" text NOT NULL,
	"courseId" integer,
	"courseBundleId" integer,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"canceled" boolean DEFAULT false NOT NULL,
	"canceledAt" timestamp with time zone,
	"canceledBy" text,
	CONSTRAINT "target_consistency" CHECK (("courseId" IS NULL) <> ("courseBundleId" IS NULL)),
	CONSTRAINT "canceled_consistency" CHECK (("canceled" AND "canceledAt" IS NOT NULL AND "canceledBy" IS NOT NULL) OR (NOT "canceled" AND "canceledAt" IS NULL AND "canceledBy" IS NULL))
);
--> statement-breakpoint
DROP TABLE "course_user_registrations";--> statement-breakpoint
ALTER TABLE "courses" DROP CONSTRAINT "capacity_nonnegative";--> statement-breakpoint
ALTER TABLE "courses" DROP CONSTRAINT "registered_count_nonnegative";--> statement-breakpoint
ALTER TABLE "courses" DROP CONSTRAINT "registered_count_within_capacity";--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "price" integer;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "courseBundleId" integer;--> statement-breakpoint
ALTER TABLE "courses" DROP COLUMN "capacity";--> statement-breakpoint
ALTER TABLE "courses" DROP COLUMN "registeredCount";--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "type" DROP NOT NULL;--> statement-breakpoint
UPDATE "courses" SET "price" = 0 WHERE "courseBundleId" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "registrations_active_course_unique" ON "registrations" ("userId","courseId") WHERE NOT "canceled" AND "courseId" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "registrations_active_bundle_unique" ON "registrations" ("userId","courseBundleId") WHERE NOT "canceled" AND "courseBundleId" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_courseBundleId_course_bundles_id_fkey" FOREIGN KEY ("courseBundleId") REFERENCES "course_bundles"("id");--> statement-breakpoint
ALTER TABLE "registerables" ADD CONSTRAINT "registerables_courseId_courses_id_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "registerables" ADD CONSTRAINT "registerables_courseBundleId_course_bundles_id_fkey" FOREIGN KEY ("courseBundleId") REFERENCES "course_bundles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "course_user_presences" ADD CONSTRAINT "course_user_presences_registrationId_registrations_id_fkey" FOREIGN KEY ("registrationId") REFERENCES "registrations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "course_user_presences" ADD CONSTRAINT "course_user_presences_courseId_courses_id_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_userId_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_courseId_courses_id_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_courseBundleId_course_bundles_id_fkey" FOREIGN KEY ("courseBundleId") REFERENCES "course_bundles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_canceledBy_user_id_fkey" FOREIGN KEY ("canceledBy") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "price_nonnegative" CHECK ("price" >= 0);--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "bundle_consistency" CHECK (("courseBundleId" IS NOT NULL AND "type" IS NULL AND "price" IS NULL) OR ("courseBundleId" IS NULL AND "type" IS NOT NULL AND "price" IS NOT NULL));
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "canceled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "canceledAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "canceledBy" text;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_canceledBy_user_id_fkey" FOREIGN KEY ("canceledBy") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "canceled_consistency" CHECK (("canceled" AND "canceledAt" IS NOT NULL AND "canceledBy" IS NOT NULL) OR (NOT "canceled" AND "canceledAt" IS NULL AND "canceledBy" IS NULL));