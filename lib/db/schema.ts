import {
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  content: jsonb("content").notNull(),
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const contentRevisions = pgTable(
  "content_revisions",
  {
    id: serial("id").primaryKey(),
    serviceSlug: varchar("service_slug", { length: 128 }).notNull(),
    content: jsonb("content").notNull(),
    version: integer("version").notNull(),
    action: varchar("action", { length: 32 }).notNull(),
    actor: varchar("actor", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("content_revisions_slug_idx").on(table.serviceSlug)]
);

export type ServiceRow = typeof services.$inferSelect;
export type ContentRevisionRow = typeof contentRevisions.$inferSelect;
