// Reference: javascript_database blueprint (modified for books)
import { 
  books, type Book, type InsertBook, 
  users, type User, type InsertUser,
  dictionaryEntries, type DictionaryEntry, type InsertDictionaryEntry 
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User authentication
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Book CRUD operations
  getAllBooks(): Promise<Book[]>;
  getBook(id: string): Promise<Book | undefined>;
  createBook(book: InsertBook): Promise<Book>;
  updateBook(id: string, book: InsertBook): Promise<Book | undefined>;
  deleteBook(id: string): Promise<boolean>;
  
  // Dictionary CRUD operations
  getAllDictionaryEntries(): Promise<DictionaryEntry[]>;
  getDictionaryEntry(id: string): Promise<DictionaryEntry | undefined>;
  createDictionaryEntry(entry: InsertDictionaryEntry): Promise<DictionaryEntry>;
  updateDictionaryEntry(id: string, entry: InsertDictionaryEntry): Promise<DictionaryEntry | undefined>;
  deleteDictionaryEntry(id: string): Promise<boolean>;
  
  // Statistics
  getMonthlyStats(year: number): Promise<any[]>;
  getYearlyStats(year: number): Promise<any>;
  
  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Book methods
  async getAllBooks(): Promise<Book[]> {
    return await db.select().from(books).orderBy(books.dateAdded);
  }

  async getBook(id: string): Promise<Book | undefined> {
    const [book] = await db.select().from(books).where(eq(books.id, id));
    return book || undefined;
  }

  async createBook(insertBook: InsertBook): Promise<Book> {
    const [book] = await db
      .insert(books)
      .values(insertBook)
      .returning();
    return book;
  }

  async updateBook(id: string, insertBook: InsertBook): Promise<Book | undefined> {
    const [book] = await db
      .update(books)
      .set(insertBook)
      .where(eq(books.id, id))
      .returning();
    return book || undefined;
  }

  async deleteBook(id: string): Promise<boolean> {
    const result = await db.delete(books).where(eq(books.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Dictionary methods
  async getAllDictionaryEntries(): Promise<DictionaryEntry[]> {
    return await db.select().from(dictionaryEntries).orderBy(dictionaryEntries.dateAdded);
  }

  async getDictionaryEntry(id: string): Promise<DictionaryEntry | undefined> {
    const [entry] = await db.select().from(dictionaryEntries).where(eq(dictionaryEntries.id, id));
    return entry || undefined;
  }

  async createDictionaryEntry(insertEntry: InsertDictionaryEntry): Promise<DictionaryEntry> {
    const [entry] = await db
      .insert(dictionaryEntries)
      .values(insertEntry)
      .returning();
    return entry;
  }

  async updateDictionaryEntry(id: string, insertEntry: InsertDictionaryEntry): Promise<DictionaryEntry | undefined> {
    const [entry] = await db
      .update(dictionaryEntries)
      .set(insertEntry)
      .where(eq(dictionaryEntries.id, id))
      .returning();
    return entry || undefined;
  }

  async deleteDictionaryEntry(id: string): Promise<boolean> {
    const result = await db.delete(dictionaryEntries).where(eq(dictionaryEntries.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getMonthlyStats(year: number): Promise<any[]> {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    // Get books finished in the year
    const finishedBooks = await db
      .select()
      .from(books)
      .where(
        and(
          eq(books.status, "terminado"),
          gte(books.finishDate, startDate),
          lte(books.finishDate, endDate)
        )
      );

    // Group by month
    const monthlyData: Record<string, { booksRead: number; pagesRead: number }> = {};
    
    // Initialize all months
    for (let month = 1; month <= 12; month++) {
      const monthKey = `${year}-${month.toString().padStart(2, "0")}`;
      monthlyData[monthKey] = { booksRead: 0, pagesRead: 0 };
    }

    // Aggregate data
    finishedBooks.forEach((book) => {
      if (book.finishDate) {
        const monthKey = book.finishDate.substring(0, 7); // YYYY-MM
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].booksRead += 1;
          monthlyData[monthKey].pagesRead += book.pages || 0;
        }
      }
    });

    // Convert to array
    return Object.entries(monthlyData).map(([month, stats]) => ({
      month,
      booksRead: stats.booksRead,
      pagesRead: stats.pagesRead,
    }));
  }

  async getYearlyStats(year: number): Promise<any> {
    const monthlyStats = await this.getMonthlyStats(year);
    
    return {
      year,
      booksRead: monthlyStats.reduce((sum, m) => sum + m.booksRead, 0),
      pagesRead: monthlyStats.reduce((sum, m) => sum + m.pagesRead, 0),
      monthlyBreakdown: monthlyStats,
    };
  }
}

export const storage = new DatabaseStorage();
