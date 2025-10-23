// Reference: javascript_database blueprint (modified for books)
import { 
  books, type Book, type InsertBook, 
  users, type User, type InsertUser,
  dictionaryEntries, type DictionaryEntry, type InsertDictionaryEntry,
  readingGoals, type ReadingGoal, type InsertReadingGoal,
  customAuthors, type CustomAuthor, type InsertCustomAuthor
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
  getLibraryBooks(): Promise<Book[]>; // Only books in library (isWishlist = 0)
  getWishlistBooks(): Promise<Book[]>; // Only books in wishlist (isWishlist = 1)
  getBook(id: string): Promise<Book | undefined>;
  getBookByISBN(isbn: string): Promise<Book | undefined>; // Check if book with ISBN already exists
  createBook(book: InsertBook): Promise<Book>;
  updateBook(id: string, book: InsertBook): Promise<Book | undefined>;
  deleteBook(id: string): Promise<boolean>;
  moveToLibrary(id: string): Promise<Book | undefined>; // Move from wishlist to library
  moveToWishlist(id: string): Promise<Book | undefined>; // Move from library to wishlist
  
  // Dictionary CRUD operations
  getAllDictionaryEntries(): Promise<DictionaryEntry[]>;
  getDictionaryEntry(id: string): Promise<DictionaryEntry | undefined>;
  createDictionaryEntry(entry: InsertDictionaryEntry): Promise<DictionaryEntry>;
  updateDictionaryEntry(id: string, entry: InsertDictionaryEntry): Promise<DictionaryEntry | undefined>;
  deleteDictionaryEntry(id: string): Promise<boolean>;
  
  // Reading goals CRUD operations
  getAllReadingGoals(userId: number): Promise<ReadingGoal[]>;
  getReadingGoal(id: string): Promise<ReadingGoal | undefined>;
  getReadingGoalByYear(userId: number, year: number): Promise<ReadingGoal | undefined>;
  createReadingGoal(goal: InsertReadingGoal): Promise<ReadingGoal>;
  updateReadingGoal(id: string, goal: InsertReadingGoal): Promise<ReadingGoal | undefined>;
  deleteReadingGoal(id: string): Promise<boolean>;
  
  // Custom authors CRUD operations
  getAllCustomAuthors(userId: number): Promise<CustomAuthor[]>;
  getCustomAuthor(id: string): Promise<CustomAuthor | undefined>;
  createCustomAuthor(author: InsertCustomAuthor): Promise<CustomAuthor>;
  updateCustomAuthor(id: string, author: InsertCustomAuthor): Promise<CustomAuthor | undefined>;
  deleteCustomAuthor(id: string): Promise<boolean>;
  
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

  async getLibraryBooks(): Promise<Book[]> {
    return await db.select().from(books).where(eq(books.isWishlist, 0)).orderBy(books.dateAdded);
  }

  async getWishlistBooks(): Promise<Book[]> {
    return await db.select().from(books).where(eq(books.isWishlist, 1)).orderBy(books.dateAdded);
  }

  async getBook(id: string): Promise<Book | undefined> {
    const [book] = await db.select().from(books).where(eq(books.id, id));
    return book || undefined;
  }

  async getBookByISBN(isbn: string): Promise<Book | undefined> {
    if (!isbn) return undefined;
    const [book] = await db.select().from(books).where(eq(books.isbn, isbn));
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

  async moveToLibrary(id: string): Promise<Book | undefined> {
    const [book] = await db
      .update(books)
      .set({ isWishlist: 0 })
      .where(eq(books.id, id))
      .returning();
    return book || undefined;
  }

  async moveToWishlist(id: string): Promise<Book | undefined> {
    const [book] = await db
      .update(books)
      .set({ isWishlist: 1 })
      .where(eq(books.id, id))
      .returning();
    return book || undefined;
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

  // Reading goals methods
  async getAllReadingGoals(userId: number): Promise<ReadingGoal[]> {
    return await db
      .select()
      .from(readingGoals)
      .where(eq(readingGoals.userId, userId))
      .orderBy(readingGoals.year);
  }

  async getReadingGoal(id: string): Promise<ReadingGoal | undefined> {
    const [goal] = await db.select().from(readingGoals).where(eq(readingGoals.id, id));
    return goal || undefined;
  }

  async getReadingGoalByYear(userId: number, year: number): Promise<ReadingGoal | undefined> {
    const [goal] = await db
      .select()
      .from(readingGoals)
      .where(and(eq(readingGoals.userId, userId), eq(readingGoals.year, year)));
    return goal || undefined;
  }

  async createReadingGoal(insertGoal: InsertReadingGoal): Promise<ReadingGoal> {
    const [goal] = await db
      .insert(readingGoals)
      .values(insertGoal)
      .returning();
    return goal;
  }

  async updateReadingGoal(id: string, insertGoal: InsertReadingGoal): Promise<ReadingGoal | undefined> {
    const [goal] = await db
      .update(readingGoals)
      .set(insertGoal)
      .where(eq(readingGoals.id, id))
      .returning();
    return goal || undefined;
  }

  async deleteReadingGoal(id: string): Promise<boolean> {
    const result = await db.delete(readingGoals).where(eq(readingGoals.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getMonthlyStats(year: number): Promise<any[]> {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    // Get books finished in the year (excluding wishlist)
    const finishedBooks = await db
      .select()
      .from(books)
      .where(
        and(
          eq(books.status, "terminado"),
          eq(books.isWishlist, 0), // Only library books, not wishlist
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

  // Custom authors methods
  async getAllCustomAuthors(userId: number): Promise<CustomAuthor[]> {
    return await db
      .select()
      .from(customAuthors)
      .where(eq(customAuthors.userId, userId))
      .orderBy(customAuthors.createdAt);
  }

  async getCustomAuthor(id: string): Promise<CustomAuthor | undefined> {
    const [author] = await db
      .select()
      .from(customAuthors)
      .where(eq(customAuthors.id, id));
    return author || undefined;
  }

  async createCustomAuthor(insertAuthor: InsertCustomAuthor): Promise<CustomAuthor> {
    const [author] = await db
      .insert(customAuthors)
      .values(insertAuthor)
      .returning();
    return author;
  }

  async updateCustomAuthor(id: string, insertAuthor: InsertCustomAuthor): Promise<CustomAuthor | undefined> {
    const [author] = await db
      .update(customAuthors)
      .set(insertAuthor)
      .where(eq(customAuthors.id, id))
      .returning();
    return author || undefined;
  }

  async deleteCustomAuthor(id: string): Promise<boolean> {
    const result = await db.delete(customAuthors).where(eq(customAuthors.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
