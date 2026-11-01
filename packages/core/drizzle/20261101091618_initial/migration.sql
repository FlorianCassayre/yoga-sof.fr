CREATE TYPE "course_type" AS ENUM('adulte', 'enfant');--> statement-breakpoint
CREATE TYPE "course_visibility" AS ENUM('public', 'private');--> statement-breakpoint
CREATE TYPE "membership_type" AS ENUM('individuelle', 'famille');--> statement-breakpoint
CREATE TABLE "account" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text,
	"providerAccountId" text,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_pkey" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sessionToken" text PRIMARY KEY,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY,
	"name" text,
	"email" text UNIQUE,
	"emailVerified" timestamp,
	"image" text
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" text,
	"token" text,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_pkey" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "courses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"version" integer DEFAULT 1 NOT NULL,
	"type" "course_type" NOT NULL,
	"startsAt" timestamp with time zone NOT NULL,
	"endsAt" timestamp with time zone NOT NULL,
	"capacity" integer NOT NULL,
	"registeredCount" integer DEFAULT 0 NOT NULL,
	"visibility" "course_visibility" NOT NULL,
	"internalNotes" text DEFAULT '' NOT NULL,
	CONSTRAINT "capacity_nonnegative" CHECK ("capacity" >= 0),
	CONSTRAINT "registered_count_nonnegative" CHECK ("registeredCount" >= 0),
	CONSTRAINT "registered_count_within_capacity" CHECK ("registeredCount" <= "capacity")
);
--> statement-breakpoint
CREATE TABLE "course_user_registrations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "course_user_registrations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"version" integer DEFAULT 1 NOT NULL,
	"courseId" integer NOT NULL,
	"userId" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"canceled" boolean DEFAULT false NOT NULL,
	"canceledAt" timestamp with time zone,
	"canceledBy" text,
	CONSTRAINT "canceled_consistency" CHECK (("canceled" AND "canceledAt" IS NOT NULL AND "canceledBy" IS NOT NULL) OR (NOT "canceled" AND "canceledAt" IS NULL AND "canceledBy" IS NULL))
);
--> statement-breakpoint
CREATE TABLE "membership_beneficiaries" (
	"membershipId" integer,
	"userId" text,
	CONSTRAINT "membership_beneficiaries_pkey" PRIMARY KEY("membershipId","userId")
);
--> statement-breakpoint
CREATE TABLE "memberships" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "memberships_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"type" "membership_type" NOT NULL,
	"price" integer NOT NULL,
	"startsAt" date NOT NULL,
	"endsAt" date NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "price_nonnegative" CHECK ("price" >= 0),
	CONSTRAINT "period_consistency" CHECK ("startsAt" <= "endsAt")
);
--> statement-breakpoint
CREATE TABLE "membership_prices" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "membership_prices_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"version" integer DEFAULT 1 NOT NULL,
	"type" "membership_type" NOT NULL,
	"price" integer NOT NULL,
	CONSTRAINT "price_nonnegative" CHECK ("price" >= 0)
);
--> statement-breakpoint
CREATE TABLE "membership_settings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "membership_settings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"version" integer DEFAULT 1 NOT NULL,
	"seasonStartMonth" smallint NOT NULL,
	CONSTRAINT "season_start_month_range" CHECK ("seasonStartMonth" BETWEEN 1 AND 12)
);
--> statement-breakpoint
CREATE UNIQUE INDEX "course_user_registrations_active_unique" ON "course_user_registrations" ("courseId","userId") WHERE "canceled" = false;--> statement-breakpoint
CREATE UNIQUE INDEX "membership_prices_type_unique" ON "membership_prices" ("type");--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "course_user_registrations" ADD CONSTRAINT "course_user_registrations_courseId_courses_id_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "course_user_registrations" ADD CONSTRAINT "course_user_registrations_userId_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "course_user_registrations" ADD CONSTRAINT "course_user_registrations_canceledBy_user_id_fkey" FOREIGN KEY ("canceledBy") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "membership_beneficiaries" ADD CONSTRAINT "membership_beneficiaries_membershipId_memberships_id_fkey" FOREIGN KEY ("membershipId") REFERENCES "memberships"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "membership_beneficiaries" ADD CONSTRAINT "membership_beneficiaries_userId_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE;