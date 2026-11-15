CREATE TABLE "course_super_bundles" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "course_super_bundles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"version" integer DEFAULT 1 NOT NULL,
	"label" text NOT NULL,
	"price" integer NOT NULL,
	CONSTRAINT "price_nonnegative" CHECK ("price" >= 0)
);
--> statement-breakpoint
ALTER TABLE "course_bundles" ADD COLUMN "courseSuperBundleId" integer;--> statement-breakpoint
ALTER TABLE "course_bundles" ADD CONSTRAINT "course_bundles_courseSuperBundleId_course_super_bundles_id_fkey" FOREIGN KEY ("courseSuperBundleId") REFERENCES "course_super_bundles"("id");