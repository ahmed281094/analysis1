CREATE TABLE "analyses" (
	"id" integer PRIMARY KEY NOT NULL,
	"website_id" integer NOT NULL,
	"type" varchar NOT NULL,
	"report" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "websites" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "websites_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"url" varchar NOT NULL,
	"name" varchar NOT NULL,
	"status" varchar DEFAULT 'active'
);
--> statement-breakpoint
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_website_id_websites_id_fk" FOREIGN KEY ("website_id") REFERENCES "public"."websites"("id") ON DELETE no action ON UPDATE no action;