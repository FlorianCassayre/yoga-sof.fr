CREATE TYPE "email_type" AS ENUM('sessionCanceled', 'sessionReminderNewcomer', 'sessionRegistration', 'orderCreated', 'courseWaitingList', 'other');--> statement-breakpoint
CREATE TABLE "emails" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "emails_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" text NOT NULL,
	"type" "email_type" NOT NULL,
	"destinationAddress" text NOT NULL,
	"ccAddress" text,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"sentAt" timestamp with time zone,
	"sendError" text
);
--> statement-breakpoint
ALTER TABLE "emails" ADD CONSTRAINT "emails_userId_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE;
--> statement-breakpoint
CREATE TABLE "email_attachments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "email_attachments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"emailId" integer NOT NULL,
	"filename" text NOT NULL,
	"file" bytea NOT NULL
);
--> statement-breakpoint
ALTER TABLE "email_attachments" ADD CONSTRAINT "email_attachments_emailId_emails_id_fkey" FOREIGN KEY ("emailId") REFERENCES "emails"("id") ON DELETE CASCADE;