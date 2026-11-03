CREATE TABLE "calendar_settings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "calendar_settings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"version" integer DEFAULT 1 NOT NULL,
	"dayStartsAt" time NOT NULL,
	"dayEndsAt" time NOT NULL,
	CONSTRAINT "day_period_consistency" CHECK ("dayStartsAt" < "dayEndsAt")
);
