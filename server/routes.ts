import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookSchema, insertDictionaryEntrySchema, insertReadingGoalSchema, insertCustomAuthorSchema } from "@shared/schema";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication (creates /api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);

  // Get all books (library only - not wishlist)
  app.get("/api/books", async (req, res) => {
    try {
      const books = await storage.getLibraryBooks();
      res.json(books);
    } catch (error) {
      console.error("Error fetching books:", error);
      res.status(500).json({ error: "Failed to fetch books" });
    }
  });

  // Get wishlist books
  app.get("/api/wishlist", async (req, res) => {
    try {
      const books = await storage.getWishlistBooks();
      res.json(books);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({ error: "Failed to fetch wishlist" });
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

  // Move book to library (from wishlist)
  app.post("/api/books/:id/move-to-library", async (req, res) => {
    try {
      const book = await storage.moveToLibrary(req.params.id);
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }
      res.json(book);
    } catch (error) {
      console.error("Error moving book to library:", error);
      res.status(500).json({ error: "Failed to move book to library" });
    }
  });

  // Move book to wishlist (from library)
  app.post("/api/books/:id/move-to-wishlist", async (req, res) => {
    try {
      const book = await storage.moveToWishlist(req.params.id);
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }
      res.json(book);
    } catch (error) {
      console.error("Error moving book to wishlist:", error);
      res.status(500).json({ error: "Failed to move book to wishlist" });
    }
  });

  // Dictionary endpoints
  // Search word definition using Merriam-Webster API
  app.get("/api/dictionary/search/:word", async (req, res) => {
    try {
      const word = req.params.word.toLowerCase().trim();
      const apiKey = process.env.MERRIAM_WEBSTER_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ error: "Dictionary API key not configured" });
      }

      const response = await fetch(
        `https://www.dictionaryapi.com/api/v3/references/spanish/json/${encodeURIComponent(word)}?key=${apiKey}`
      );

      if (!response.ok) {
        return res.status(404).json({ error: "Word not found" });
      }

      const data = await response.json();

      // Check if we got valid results (not spelling suggestions)
      if (!data || data.length === 0 || typeof data[0] === 'string') {
        return res.status(404).json({ error: "Word not found", suggestions: typeof data[0] === 'string' ? data : [] });
      }

      // Extract the first definition
      const entry = data[0];
      const shortdef = entry.shortdef?.[0];
      
      if (!shortdef) {
        return res.status(404).json({ error: "No definition available" });
      }

      res.json({
        word: word,
        definition: shortdef,
        pronunciation: entry.hwi?.hw || word,
        partOfSpeech: entry.fl || "",
      });
    } catch (error) {
      console.error("Error searching dictionary:", error);
      res.status(500).json({ error: "Failed to search dictionary" });
    }
  });

  // Get all dictionary entries
  app.get("/api/dictionary", async (req, res) => {
    try {
      const entries = await storage.getAllDictionaryEntries();
      res.json(entries);
    } catch (error) {
      console.error("Error fetching dictionary entries:", error);
      res.status(500).json({ error: "Failed to fetch dictionary entries" });
    }
  });

  // Get single dictionary entry
  app.get("/api/dictionary/:id", async (req, res) => {
    try {
      const entry = await storage.getDictionaryEntry(req.params.id);
      if (!entry) {
        return res.status(404).json({ error: "Dictionary entry not found" });
      }
      res.json(entry);
    } catch (error) {
      console.error("Error fetching dictionary entry:", error);
      res.status(500).json({ error: "Failed to fetch dictionary entry" });
    }
  });

  // Create new dictionary entry
  app.post("/api/dictionary", async (req, res) => {
    try {
      const validatedData = insertDictionaryEntrySchema.parse(req.body);
      // Convert empty string bookId to undefined for storage interface
      const entryData = {
        ...validatedData,
        bookId: validatedData.bookId && validatedData.bookId !== "" ? validatedData.bookId : undefined,
      };
      const entry = await storage.createDictionaryEntry(entryData);
      res.status(201).json(entry);
    } catch (error: any) {
      console.error("Error creating dictionary entry:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid dictionary entry data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create dictionary entry" });
    }
  });

  // Update dictionary entry
  app.patch("/api/dictionary/:id", async (req, res) => {
    try {
      const validatedData = insertDictionaryEntrySchema.parse(req.body);
      // Convert empty string bookId to undefined for storage interface
      const entryData = {
        ...validatedData,
        bookId: validatedData.bookId && validatedData.bookId !== "" ? validatedData.bookId : undefined,
      };
      const entry = await storage.updateDictionaryEntry(req.params.id, entryData);
      if (!entry) {
        return res.status(404).json({ error: "Dictionary entry not found" });
      }
      res.json(entry);
    } catch (error: any) {
      console.error("Error updating dictionary entry:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid dictionary entry data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update dictionary entry" });
    }
  });

  // Delete dictionary entry
  app.delete("/api/dictionary/:id", async (req, res) => {
    try {
      const success = await storage.deleteDictionaryEntry(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Dictionary entry not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting dictionary entry:", error);
      res.status(500).json({ error: "Failed to delete dictionary entry" });
    }
  });

  // Reading goals endpoints
  // Get all reading goals for current user
  app.get("/api/goals", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    try {
      const goals = await storage.getAllReadingGoals(req.user.id);
      res.json(goals);
    } catch (error) {
      console.error("Error fetching reading goals:", error);
      res.status(500).json({ error: "Failed to fetch reading goals" });
    }
  });

  // Get reading goal for specific year
  app.get("/api/goals/year/:year", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    try {
      const year = parseInt(req.params.year);
      const goal = await storage.getReadingGoalByYear(req.user.id, year);
      if (!goal) {
        return res.status(404).json({ error: "No goal found for this year" });
      }
      res.json(goal);
    } catch (error) {
      console.error("Error fetching reading goal:", error);
      res.status(500).json({ error: "Failed to fetch reading goal" });
    }
  });

  // Create new reading goal
  app.post("/api/goals", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    try {
      const validatedData = insertReadingGoalSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      
      // Check if goal already exists for this year
      const existingGoal = await storage.getReadingGoalByYear(req.user.id, validatedData.year);
      if (existingGoal) {
        return res.status(400).json({ error: "Ya existe una meta para este año" });
      }
      
      const goal = await storage.createReadingGoal(validatedData);
      res.status(201).json(goal);
    } catch (error: any) {
      console.error("Error creating reading goal:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid reading goal data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create reading goal" });
    }
  });

  // Update reading goal
  app.patch("/api/goals/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    try {
      const validatedData = insertReadingGoalSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      const goal = await storage.updateReadingGoal(req.params.id, validatedData);
      if (!goal) {
        return res.status(404).json({ error: "Reading goal not found" });
      }
      res.json(goal);
    } catch (error: any) {
      console.error("Error updating reading goal:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid reading goal data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update reading goal" });
    }
  });

  // Delete reading goal
  app.delete("/api/goals/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    try {
      const success = await storage.deleteReadingGoal(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Reading goal not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting reading goal:", error);
      res.status(500).json({ error: "Failed to delete reading goal" });
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

  // Custom Authors endpoints
  // Get all custom authors for current user
  app.get("/api/custom-authors", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const userId = req.user!.id;
      const authors = await storage.getAllCustomAuthors(userId);
      res.json(authors);
    } catch (error) {
      console.error("Error fetching custom authors:", error);
      res.status(500).json({ error: "Failed to fetch custom authors" });
    }
  });

  // Get single custom author
  app.get("/api/custom-authors/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const author = await storage.getCustomAuthor(req.params.id);
      if (!author) {
        return res.status(404).json({ error: "Author not found" });
      }
      // Ensure user can only access their own custom authors
      if (author.userId !== req.user!.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      res.json(author);
    } catch (error) {
      console.error("Error fetching custom author:", error);
      res.status(500).json({ error: "Failed to fetch custom author" });
    }
  });

  // Create new custom author
  app.post("/api/custom-authors", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const userId = req.user!.id;
      // Validate without userId (it comes from session, not client)
      const validatedData = insertCustomAuthorSchema.omit({ userId: true }).parse(req.body);
      const author = await storage.createCustomAuthor({ ...validatedData, userId });
      res.status(201).json(author);
    } catch (error: any) {
      console.error("Error creating custom author:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid author data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create custom author" });
    }
  });

  // Update custom author
  app.patch("/api/custom-authors/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const userId = req.user!.id;
      const existingAuthor = await storage.getCustomAuthor(req.params.id);
      if (!existingAuthor) {
        return res.status(404).json({ error: "Author not found" });
      }
      // Ensure user can only update their own custom authors
      if (existingAuthor.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }
      // Validate without userId (it comes from session, not client)
      const validatedData = insertCustomAuthorSchema.omit({ userId: true }).parse(req.body);
      const author = await storage.updateCustomAuthor(req.params.id, { ...validatedData, userId });
      res.json(author);
    } catch (error: any) {
      console.error("Error updating custom author:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid author data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update custom author" });
    }
  });

  // Delete custom author
  app.delete("/api/custom-authors/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const author = await storage.getCustomAuthor(req.params.id);
      if (!author) {
        return res.status(404).json({ error: "Author not found" });
      }
      // Ensure user can only delete their own custom authors
      if (author.userId !== req.user!.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const success = await storage.deleteCustomAuthor(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Author not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting custom author:", error);
      res.status(500).json({ error: "Failed to delete custom author" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
