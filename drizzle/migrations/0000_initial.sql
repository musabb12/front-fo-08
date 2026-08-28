CREATE TABLE IF NOT EXISTS "services" (
  "id" serial PRIMARY KEY NOT NULL,
  "slug" varchar(128) NOT NULL,
  "content" jsonb NOT NULL,
  "version" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "services_slug_unique" UNIQUE("slug")
);

CREATE TABLE IF NOT EXISTS "content_revisions" (
  "id" serial PRIMARY KEY NOT NULL,
  "service_slug" varchar(128) NOT NULL,
  "content" jsonb NOT NULL,
  "version" integer NOT NULL,
  "action" varchar(32) NOT NULL,
  "actor" varchar(255),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "content_revisions_slug_idx" ON "content_revisions" ("service_slug");
