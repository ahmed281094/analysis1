
import { integer, pgTable, varchar } from "drizzle-orm/pg-core";


export const websites = pgTable("websites", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  url: varchar("url").notNull(),
  name: varchar("name").notNull(),
  status: varchar("status").default("active"),

});

export const analyses = pgTable("analyses", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  websiteId: integer("website_id").notNull().references(() => websites.id),
  type: varchar("type").notNull(),
  report: varchar("report").notNull(),
 
});
