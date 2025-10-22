import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, date, serial } from "drizzle-orm/pg-core";
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
});

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

// Statistics types for frontend
export interface MonthlyStats {
  month: string; // YYYY-MM format
  booksRead: number;
  pagesRead: number;
}

export interface YearlyStats {
  year: number;
  booksRead: number;
  pagesRead: number;
  monthlyBreakdown: MonthlyStats[];
}

export interface DashboardStats {
  totalBooks: number;
  booksReading: number;
  booksToRead: number;
  booksFinished: number;
  totalPagesRead: number;
  currentYearStats: YearlyStats;
  currentMonthStats: MonthlyStats;
}
