CREATE TABLE "cards" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "cards_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"version" integer DEFAULT 1 NOT NULL,
	"userId" text NOT NULL,
	"templateId" integer NOT NULL,
	"type" "course_type" NOT NULL,
	"price" integer NOT NULL,
	"count" integer NOT NULL,
	"remaining" integer NOT NULL,
	"validUntil" date NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"canceled" boolean DEFAULT false NOT NULL,
	"canceledAt" timestamp with time zone,
	"canceledBy" text,
	CONSTRAINT "price_nonnegative" CHECK ("price" >= 0),
	CONSTRAINT "count_positive" CHECK ("count" > 0),
	CONSTRAINT "remaining_nonnegative" CHECK ("remaining" >= 0),
	CONSTRAINT "remaining_within_count" CHECK ("remaining" <= "count"),
	CONSTRAINT "canceled_consistency" CHECK (("canceled" AND "canceledAt" IS NOT NULL AND "canceledBy" IS NOT NULL) OR (NOT "canceled" AND "canceledAt" IS NULL AND "canceledBy" IS NULL))
);
--> statement-breakpoint
CREATE TABLE "card_settings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "card_settings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"version" integer DEFAULT 1 NOT NULL,
	"validityMonths" integer DEFAULT 12 NOT NULL,
	CONSTRAINT "validity_months_range" CHECK ("validityMonths" BETWEEN 1 AND 120)
);
--> statement-breakpoint
CREATE TABLE "card_templates" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "card_templates_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"version" integer DEFAULT 1 NOT NULL,
	"type" "course_type" NOT NULL,
	"price" integer NOT NULL,
	"count" integer NOT NULL,
	CONSTRAINT "price_nonnegative" CHECK ("price" >= 0),
	CONSTRAINT "count_positive" CHECK ("count" > 0)
);
--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_userId_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_canceledBy_user_id_fkey" FOREIGN KEY ("canceledBy") REFERENCES "user"("id");