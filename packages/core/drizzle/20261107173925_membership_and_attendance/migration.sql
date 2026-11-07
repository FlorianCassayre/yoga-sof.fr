ALTER TABLE "course_user_registrations" ADD COLUMN "present" boolean;--> statement-breakpoint
ALTER TABLE "memberships" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "memberships" ADD COLUMN "canceled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "memberships" ADD COLUMN "canceledAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "memberships" ADD COLUMN "canceledBy" text;--> statement-breakpoint
ALTER TYPE "role_type" RENAME VALUE 'associe' TO 'associate';--> statement-breakpoint
ALTER TYPE "role_type" RENAME VALUE 'gerant' TO 'manager';--> statement-breakpoint
ALTER TYPE "role_type" RENAME VALUE 'administrateur' TO 'administrator';--> statement-breakpoint
CREATE INDEX "courses_starts_at_index" ON "courses" ("startsAt");--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_canceledBy_user_id_fkey" FOREIGN KEY ("canceledBy") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "canceled_consistency" CHECK (("canceled" AND "canceledAt" IS NOT NULL AND "canceledBy" IS NOT NULL) OR (NOT "canceled" AND "canceledAt" IS NULL AND "canceledBy" IS NULL));
