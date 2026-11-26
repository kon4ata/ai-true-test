CREATE TYPE "public"."review_status" AS ENUM('new', 'in_progress', 'processed');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'client');--> statement-breakpoint
CREATE TABLE "branches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" text NOT NULL,
	"city" text NOT NULL,
	"address" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"branch_id" uuid NOT NULL,
	"date" date NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"website_clicks" integer DEFAULT 0 NOT NULL,
	"calls" integer DEFAULT 0 NOT NULL,
	"routes" integer DEFAULT 0 NOT NULL,
	"reviews_count" integer DEFAULT 0 NOT NULL,
	"rating_sum" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "daily_stats_branch_date_uq" UNIQUE("branch_id","date"),
	CONSTRAINT "daily_stats_non_negative_chk" CHECK ("daily_stats"."views" >= 0 AND "daily_stats"."website_clicks" >= 0 AND "daily_stats"."calls" >= 0 AND "daily_stats"."routes" >= 0 AND "daily_stats"."reviews_count" >= 0 AND "daily_stats"."rating_sum" >= 0)
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"branch_id" uuid NOT NULL,
	"author_name" text NOT NULL,
	"rating" smallint NOT NULL,
	"text" text NOT NULL,
	"status" "review_status" DEFAULT 'new' NOT NULL,
	"published_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reviews_rating_chk" CHECK ("reviews"."rating" BETWEEN 1 AND 5)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" NOT NULL,
	"company_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_role_company_chk" CHECK (("users"."role" = 'admin' AND "users"."company_id" IS NULL) OR ("users"."role" = 'client' AND "users"."company_id" IS NOT NULL))
);
--> statement-breakpoint
ALTER TABLE "branches" ADD CONSTRAINT "branches_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_stats" ADD CONSTRAINT "daily_stats_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "branches_company_idx" ON "branches" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "reviews_branch_status_idx" ON "reviews" USING btree ("branch_id","status");--> statement-breakpoint
CREATE INDEX "reviews_branch_rating_idx" ON "reviews" USING btree ("branch_id","rating");--> statement-breakpoint
CREATE INDEX "reviews_branch_published_idx" ON "reviews" USING btree ("branch_id","published_at");--> statement-breakpoint
CREATE INDEX "users_company_idx" ON "users" USING btree ("company_id");