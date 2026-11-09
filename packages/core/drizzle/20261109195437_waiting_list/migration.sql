CREATE TABLE "course_user_waiting_lists" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "course_user_waiting_lists_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"courseId" integer NOT NULL,
	"userId" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"notified" boolean DEFAULT false NOT NULL,
	"notifiedAt" timestamp with time zone,
	CONSTRAINT "notified_consistency" CHECK (("notified" AND "notifiedAt" IS NOT NULL) OR (NOT "notified" AND "notifiedAt" IS NULL))
);
--> statement-breakpoint
CREATE UNIQUE INDEX "course_user_waiting_lists_pair_unique" ON "course_user_waiting_lists" ("courseId","userId");--> statement-breakpoint
ALTER TABLE "course_user_waiting_lists" ADD CONSTRAINT "course_user_waiting_lists_courseId_courses_id_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "course_user_waiting_lists" ADD CONSTRAINT "course_user_waiting_lists_userId_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE;