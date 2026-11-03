CREATE TYPE "role_type" AS ENUM('associe', 'gerant', 'administrateur');--> statement-breakpoint
CREATE TABLE "user_roles" (
	"userId" text PRIMARY KEY,
	"role" "role_type" NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_userId_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE;