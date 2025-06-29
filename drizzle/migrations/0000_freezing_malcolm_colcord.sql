CREATE TABLE "jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"department" varchar(100) NOT NULL,
	"location" varchar(255),
	"salary_min" integer,
	"salary_max" integer,
	"requirements" json,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
