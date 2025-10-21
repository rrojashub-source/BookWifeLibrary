import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all books
  app.get("/api/books", async (req, res) => {
    try {
      const books = await storage.getAllBooks();
      res.json(books);
    } catch (error) {
      console.error("Error fetching books:", error);
      res.status(500).json({ error: "Failed to fetch books" });
    }
  });

  // Get single book
  app.get("/api/books/:id", async (req, res) => {
    try {
      const book = await storage.getBook(req.params.id);
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }
      res.json(book);
    } catch (error) {
      console.error("Error fetching book:", error);
      res.status(500).json({ error: "Failed to fetch book" });
    }
  });

  // Create new book
  app.post("/api/books", async (req, res) => {
    try {
      const validatedData = insertBookSchema.parse(req.body);
      const book = await storage.createBook(validatedData);
      res.status(201).json(book);
    } catch (error: any) {
      console.error("Error creating book:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid book data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create book" });
    }
  });

  // Update book
  app.patch("/api/books/:id", async (req, res) => {
    try {
      const validatedData = insertBookSchema.parse(req.body);
      const book = await storage.updateBook(req.params.id, validatedData);
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }
      res.json(book);
    } catch (error: any) {
      console.error("Error updating book:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid book data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update book" });
    }
  });

  // Delete book
  app.delete("/api/books/:id", async (req, res) => {
    try {
      const success = await storage.deleteBook(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Book not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting book:", error);
      res.status(500).json({ error: "Failed to delete book" });
    }
  });

  // Get dashboard statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
      const yearStart = `${currentYear}-01-01`;
      const yearEnd = `${currentYear}-12-31`;

      // Get all books for overall stats
      const allBooks = await storage.getAllBooks();

      // Get yearly stats
      const yearlyStats = await storage.getYearlyStats(currentYear);

      // Calculate current month stats
      const currentMonthStats = yearlyStats.monthlyBreakdown.find(
        (m: any) => m.month === currentMonth
      ) || { month: currentMonth, booksRead: 0, pagesRead: 0 };

      // Count books by status (overall, not year-specific)
      const booksReading = allBooks.filter((b) => b.status === "leyendo").length;
      const booksToRead = allBooks.filter((b) => b.status === "por_leer").length;

      // Count books finished THIS YEAR (year-specific)
      const booksFinished = allBooks.filter((b) => 
        b.status === "terminado" && 
        b.finishDate && 
        b.finishDate >= yearStart && 
        b.finishDate <= yearEnd
      ).length;

      // Calculate total pages read THIS YEAR (year-specific)
      const totalPagesRead = allBooks
        .filter((b) => 
          b.status === "terminado" && 
          b.finishDate && 
          b.finishDate >= yearStart && 
          b.finishDate <= yearEnd &&
          b.pages
        )
        .reduce((sum, b) => sum + (b.pages || 0), 0);

      const stats = {
        totalBooks: allBooks.length,
        booksReading,
        booksToRead,
        booksFinished,
        totalPagesRead,
        currentYearStats: yearlyStats,
        currentMonthStats,
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
