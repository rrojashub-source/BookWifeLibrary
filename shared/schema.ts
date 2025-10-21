import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
}).omit({
  id: true,
  dateAdded: true,
});

export type InsertBook = z.infer<typeof insertBookSchema>;
export type Book = typeof books.$inferSelect;

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
