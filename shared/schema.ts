import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, date, serial, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users, {
  username: z.string().min(3, "El usuario debe tener al menos 3 caracteres"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
}).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Books table
export const books = pgTable("books", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  author: text("author").notNull(),
  isbn: text("isbn"),
  pages: integer("pages"),
  coverUrl: text("cover_url"),
  genre: text("genre"),
  status: text("status").notNull().default("por_leer"), // por_leer, leyendo, terminado
  rating: integer("rating"), // 1-5 stars, only for finished books
  review: text("review"),
  startDate: date("start_date"),
  finishDate: date("finish_date"),
  dateAdded: timestamp("date_added").notNull().defaultNow(),
  isWishlist: integer("is_wishlist").notNull().default(0), // 0 = in library, 1 = wishlist
  
  // New enrichment fields
  language: text("language"), // Idioma del libro (es, en, la, etc.)
  edition: text("edition"), // Tipo de edición (Tapa dura, Tapa blanda, eBook, etc.)
  synopsis: text("synopsis"), // Sinopsis/descripción larga del libro
  series: text("series"), // Nombre de la serie (si es parte de una)
  seriesNumber: integer("series_number"), // Número en la serie
  publisher: text("publisher"), // Editorial
  publishedDate: text("published_date"), // Fecha de publicación (YYYY o YYYY-MM-DD)
});

export const insertBookSchema = createInsertSchema(books, {
  title: z.string().min(1, "El título es requerido"),
  author: z.string().min(1, "El autor es requerido"),
  isbn: z.string().optional(),
  pages: z.number().int().positive().optional(),
  coverUrl: z.string().url().optional().or(z.literal("")),
  genre: z.string().optional(),
  status: z.enum(["por_leer", "leyendo", "terminado"]),
  rating: z.number().int().min(1).max(5).optional(),
  review: z.string().optional(),
  startDate: z.string().optional(),
  finishDate: z.string().optional(),
  isWishlist: z.number().int().min(0).max(1).optional(),
  // New enrichment fields validation
  language: z.string().optional(),
  edition: z.string().optional(),
  synopsis: z.string().optional(),
  series: z.string().optional(),
  seriesNumber: z.number().int().positive().optional(),
  publisher: z.string().optional(),
  publishedDate: z.string().optional(),
}).omit({
  id: true,
  dateAdded: true,
});

export type InsertBook = z.infer<typeof insertBookSchema>;
export type Book = typeof books.$inferSelect;

// Dictionary entries table
export const dictionaryEntries = pgTable("dictionary_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  word: text("word").notNull(),
  definition: text("definition").notNull(),
  bookId: varchar("book_id").references(() => books.id, { onDelete: "set null" }),
  notes: text("notes"),
  dateAdded: timestamp("date_added").notNull().defaultNow(),
});

export const insertDictionaryEntrySchema = createInsertSchema(dictionaryEntries, {
  word: z.string().min(1, "La palabra es requerida"),
  definition: z.string().min(1, "La definición es requerida"),
  bookId: z.string().optional().or(z.literal("")),
  notes: z.string().optional(),
}).omit({
  id: true,
  dateAdded: true,
});

export type InsertDictionaryEntry = z.infer<typeof insertDictionaryEntrySchema>;
export type DictionaryEntry = typeof dictionaryEntries.$inferSelect;

// Reading goals table
export const readingGoals = pgTable("reading_goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  year: integer("year").notNull(),
  type: text("type").notNull(), // 'books' or 'pages'
  target: integer("target").notNull(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userYearUnique: unique("user_year_unique").on(table.userId, table.year),
}));

export const insertReadingGoalSchema = createInsertSchema(readingGoals, {
  year: z.number().int().min(2000).max(2100),
  type: z.enum(["books", "pages"]),
  target: z.number().int().positive("El objetivo debe ser un número positivo"),
  userId: z.number().int(),
}).omit({
  id: true,
  createdAt: true,
});

export type InsertReadingGoal = z.infer<typeof insertReadingGoalSchema>;
export type ReadingGoal = typeof readingGoals.$inferSelect;

// Custom authors table
export const customAuthors = pgTable("custom_authors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  period: text("period"),
  links: text("links").notNull(), // JSON stringified array of {label, url}
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCustomAuthorSchema = createInsertSchema(customAuthors, {
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  period: z.string().optional(),
  links: z.string().min(1, "Debe incluir al menos un enlace"),
  userId: z.number().int(),
}).omit({
  id: true,
  createdAt: true,
});

export type InsertCustomAuthor = z.infer<typeof insertCustomAuthorSchema>;
export type CustomAuthor = typeof customAuthors.$inferSelect;

// ISBN Search Cache table - stores successful ISBN lookups
export const isbnCache = pgTable("isbn_cache", {
  isbn: text("isbn").primaryKey(), // Normalized ISBN
  title: text("title").notNull(),
  author: text("author"),
  pages: integer("pages"),
  coverUrl: text("cover_url"),
  genre: text("genre"),
  language: text("language"),
  edition: text("edition"),
  synopsis: text("synopsis"),
  series: text("series"),
  seriesNumber: integer("series_number"),
  publisher: text("publisher"),
  publishedDate: text("published_date"),
  sources: text("sources").notNull(), // Comma-separated list of sources (e.g., "Open Library,Google Books")
  cachedAt: timestamp("cached_at").notNull().defaultNow(),
});

export type ISBNCache = typeof isbnCache.$inferSelect;

// Search History table - tracks recent ISBN searches by user
export const searchHistory = pgTable("search_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  isbn: text("isbn").notNull(),
  title: text("title"), // Store title for display
  searchedAt: timestamp("searched_at").notNull().defaultNow(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
});

export type SearchHistory = typeof searchHistory.$inferSelect;

// Statistics types and schemas for frontend with defensive validation
export const monthlyStatsSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format"),
  booksRead: z.number().int().nonnegative().default(0),
  pagesRead: z.number().int().nonnegative().default(0),
});

export const yearlyStatsSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  booksRead: z.number().int().nonnegative().default(0),
  pagesRead: z.number().int().nonnegative().default(0),
  monthlyBreakdown: z.array(monthlyStatsSchema).default([]),
});

export const dashboardStatsSchema = z.object({
  totalBooks: z.number().int().nonnegative().default(0),
  booksReading: z.number().int().nonnegative().default(0),
  booksToRead: z.number().int().nonnegative().default(0),
  booksFinished: z.number().int().nonnegative().default(0),
  totalPagesRead: z.number().int().nonnegative().default(0),
  currentYearStats: yearlyStatsSchema,
  currentMonthStats: monthlyStatsSchema,
  // Optional comparison data for trends
  previousYearStats: yearlyStatsSchema.optional(),
  previousMonthStats: monthlyStatsSchema.optional(),
});

export type MonthlyStats = z.infer<typeof monthlyStatsSchema>;
export type YearlyStats = z.infer<typeof yearlyStatsSchema>;
export type DashboardStats = z.infer<typeof dashboardStatsSchema>;
