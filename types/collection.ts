// export const collection = pgTable("collection", {
//   id: text("id").primaryKey(),
//   name: text("name").notNull(),
//   slug: text("slug").notNull().unique(),
//   description: text("description"),
//   image: text("image"),
//   isActive: boolean("is_active").$defaultFn(() => true),
//   sortOrder: text("sort_order").$defaultFn(() => "manual"), // manual, best-selling, price-asc, price-desc, newest
//   // conditions: jsonb("conditions"), // For smart collections
//   createdAt: timestamp("created_at").$defaultFn(() => new Date()),
//   updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
// }, (table) => [
//   index('collection_slug_idx').on(table.slug),
// ]);
//
export type Collection = {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  isActive: boolean
  sortOrder: string
  createdAt: Date
  updatedAt: Date
}
