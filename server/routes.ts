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
      
      // Check for duplicate ISBN if provided
      if (validatedData.isbn) {
        const existingBook = await storage.getBookByISBN(validatedData.isbn);
        if (existingBook) {
          return res.status(409).json({ 
            error: "Ya existe un libro con este ISBN",
            details: `El libro "${existingBook.title}" ya está en tu ${existingBook.isWishlist ? 'lista de deseos' : 'biblioteca'}`,
            existingBook: existingBook
          });
        }
      }
      
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

  // Search ISBN using Firecrawl (Amazon scraping)
  // Requires authentication to prevent API key abuse
  app.get("/api/books/search-isbn/:isbn", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const isbn = req.params.isbn;
      const apiKey = process.env.FIRECRAWL_API_KEY;

      if (!apiKey) {
        console.error("Firecrawl API key not configured");
        return res.status(500).json({ error: "Book search service not available" });
      }

      // Build Amazon URL for ISBN
      const amazonUrl = `https://www.amazon.com/dp/${isbn}`;

      // Call Firecrawl API to scrape Amazon
      const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          url: amazonUrl,
          formats: ["extract"],
          extract: {
            schema: {
              type: "object",
              properties: {
                title: { 
                  type: "string",
                  description: "The book title"
                },
                author: { 
                  type: "string",
                  description: "The author name(s) as a single string"
                },
                pages: { 
                  type: "number",
                  description: "Total number of pages in the book"
                },
                coverUrl: { 
                  type: "string",
                  description: "Direct URL to the book cover image (high resolution preferred). Look for images in <img> tags with class containing 'book-image' or 'product-image' or in the main product gallery."
                },
                genre: { 
                  type: "string",
                  description: "Primary genre or category of the book (e.g., Fiction, Religion, Self-Help, Biography)"
                },
              },
              required: ["title"],
            },
            systemPrompt: "You are a book data extraction assistant specialized in extracting structured data from Amazon product pages. Extract ONLY the requested fields. For cover images, find the highest quality image URL available in the page. Return valid JSON matching the schema exactly.",
            prompt: "Extract book information from this Amazon page:\n\n1. Title: The complete book title\n2. Author: Author name(s) as a single string (comma-separated if multiple)\n3. Pages: Total page count (look in product details or book description)\n4. Cover Image URL: The direct URL to the book's cover image. Look for the main product image, typically found in <img> tags. Extract the full, high-resolution URL (not thumbnails). Common patterns: images with src containing 'amazon.com/images' or data-old-hires attribute.\n5. Genre: The primary category or genre (look in breadcrumbs, product details, or categories section)\n\nIMPORTANT: For the cover image, extract the actual image URL from the src or data-old-hires attribute of the main product <img> tag. Do not include placeholder text.",
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Firecrawl API error:", response.status, response.statusText, errorText);
        return res.status(404).json({ error: "Book not found on Amazon" });
      }

      const data = await response.json();

      // Firecrawl v1 returns data in extract array
      if (data.success && data.data?.extract && Array.isArray(data.data.extract)) {
        const extractedData = data.data.extract[0];
        
        // Handle both direct object and stringified JSON
        let bookInfo;
        if (typeof extractedData === 'string') {
          try {
            bookInfo = JSON.parse(extractedData);
          } catch {
            console.error("Failed to parse Firecrawl extract response");
            return res.status(500).json({ error: "Failed to parse book information" });
          }
        } else if (extractedData?.content) {
          // Content might be stringified JSON
          try {
            bookInfo = typeof extractedData.content === 'string' 
              ? JSON.parse(extractedData.content) 
              : extractedData.content;
          } catch {
            bookInfo = extractedData.content;
          }
        } else {
          bookInfo = extractedData;
        }

        // Validate that we have at least a title
        if (!bookInfo || !bookInfo.title) {
          console.error("No title found in Firecrawl response:", bookInfo);
          return res.status(404).json({ error: "Could not extract book title" });
        }

        res.json({
          title: bookInfo.title || "",
          author: bookInfo.author || "",
          pages: bookInfo.pages ? parseInt(String(bookInfo.pages)) : undefined,
          coverUrl: bookInfo.coverUrl || "",
          genre: bookInfo.genre || "",
        });
      } else {
        console.error("Unexpected Firecrawl response structure:", JSON.stringify(data, null, 2));
        res.status(500).json({ error: "Could not extract book information" });
      }
    } catch (error: any) {
      console.error("Error searching ISBN with Firecrawl:", error.message || error);
      res.status(500).json({ error: "Failed to search ISBN" });
    }
  });

  // Get recommendations based on reading habits
  app.get("/api/recommendations", async (req, res) => {
    try {
      const libraryBooks = await storage.getLibraryBooks();
      const wishlistBooks = await storage.getWishlistBooks();

      // Filter only finished books with ratings
      const finishedBooks = libraryBooks.filter(b => b.status === "terminado");
      const ratedBooks = finishedBooks.filter(b => b.rating && b.rating >= 4);

      // Analyze favorite genres
      const genreCount: Record<string, { count: number; avgRating: number; totalRating: number }> = {};
      finishedBooks.forEach(book => {
        if (book.genre) {
          if (!genreCount[book.genre]) {
            genreCount[book.genre] = { count: 0, avgRating: 0, totalRating: 0 };
          }
          genreCount[book.genre].count++;
          if (book.rating) {
            genreCount[book.genre].totalRating += book.rating;
          }
        }
      });

      // Calculate average ratings for genres
      Object.keys(genreCount).forEach(genre => {
        const data = genreCount[genre];
        data.avgRating = data.totalRating / data.count;
      });

      // Get top 3 favorite genres (by count and rating)
      const topGenres = Object.entries(genreCount)
        .sort((a, b) => {
          // Sort by count first, then by average rating
          if (b[1].count !== a[1].count) {
            return b[1].count - a[1].count;
          }
          return b[1].avgRating - a[1].avgRating;
        })
        .slice(0, 3)
        .map(([genre, data]) => ({
          genre,
          count: data.count,
          avgRating: data.avgRating,
        }));

      // Analyze favorite authors
      const authorStats: Record<string, { count: number; avgRating: number; totalRating: number; ratedCount: number }> = {};
      finishedBooks.forEach(book => {
        if (book.author) {
          if (!authorStats[book.author]) {
            authorStats[book.author] = { count: 0, avgRating: 0, totalRating: 0, ratedCount: 0 };
          }
          authorStats[book.author].count++;
          if (book.rating) {
            authorStats[book.author].totalRating += book.rating;
            authorStats[book.author].ratedCount++;
          }
        }
      });

      // Calculate average ratings for authors
      Object.keys(authorStats).forEach(author => {
        const data = authorStats[author];
        if (data.ratedCount > 0) {
          data.avgRating = data.totalRating / data.ratedCount;
        }
      });

      // Get top 5 favorite authors (must have at least 1 book with rating >= 4)
      const topAuthors = Object.entries(authorStats)
        .filter(([_, data]) => data.ratedCount > 0 && data.avgRating >= 4)
        .sort((a, b) => {
          // Sort strictly by average rating first, then by count only on exact ties
          if (b[1].avgRating !== a[1].avgRating) {
            return b[1].avgRating - a[1].avgRating;
          }
          return b[1].count - a[1].count;
        })
        .slice(0, 5)
        .map(([author, data]) => ({
          author,
          count: data.count,
          avgRating: data.avgRating,
        }));

      // Suggest books from wishlist based on preferences
      const wishlistSuggestions = wishlistBooks.filter(book => {
        const matchesGenre = book.genre && topGenres.some(g => g.genre === book.genre);
        const matchesAuthor = book.author && topAuthors.some(a => a.author === book.author);
        return matchesGenre || matchesAuthor;
      });

      // Get some random wishlist books if no matches
      const otherWishlistBooks = wishlistBooks
        .filter(book => !wishlistSuggestions.includes(book))
        .slice(0, 3);

      const recommendations = {
        topGenres,
        topAuthors,
        wishlistSuggestions: wishlistSuggestions.slice(0, 6),
        otherWishlistBooks,
        hasFinishedBooks: finishedBooks.length > 0,
        hasRatedBooks: ratedBooks.length > 0,
        hasWishlist: wishlistBooks.length > 0,
      };

      res.json(recommendations);
    } catch (error) {
      console.error("Error generating recommendations:", error);
      res.status(500).json({ error: "Failed to generate recommendations" });
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
