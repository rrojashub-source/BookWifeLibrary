# Biblioteca Moi

## Overview
Biblioteca Moi is a web application for personal library management, specifically designed for Catholic and spiritual books. It allows users to track their collection, monitor reading progress, and view statistics. The application features a clean turquoise and white design, optimized for responsive use across devices, and can be installed as a Progressive Web App (PWA) for a native app-like experience, including offline functionality and quick access shortcuts. Its core purpose is to provide a dedicated tool for spiritual reading management, offering features like ISBN scanning, reading goals, a personal dictionary, curated author resources, and a recommendation system. The project aims to deliver a robust, user-friendly, and spiritually enriching platform for book enthusiasts.

## User Preferences
I prefer simple language and clear explanations. I want iterative development, with regular updates and opportunities for feedback. Ask before making major changes to the codebase or design. I value elegant and clean UI/UX with specific color palettes (turquoise and white) and religious iconography. I expect the agent to maintain the spiritual and personalized branding ("Biblioteca Moi" with a romantic dedication and an image of the Virgin Mary).

## System Architecture
The application employs a modern full-stack architecture with a focus on robust data handling, intuitive UI, and seamless user experience.

### UI/UX Decisions
- **Theme**: Elegant turquoise (#2ba09f) and white color palette.
- **Typography**: Playfair Display (serif) and Inter (sans-serif).
- **Branding**: "Biblioteca Moi" with a personal dedication and religious iconography (Virgin Mary Queen of Peace image).
- **Responsive Design**: Mobile-first approach with a collapsible sidebar, optimized for iPhone PWA with safe area padding.
- **Dark/Light Mode**: Full support for both themes.

### Technical Implementations
- **PWA Capabilities**: App installable, custom icon, standalone mode, offline functionality via Service Worker, **immediate installation prompt on login page** (no delay), iOS compatibility, and quick shortcuts.
- **Book Management**: Comprehensive catalog with card views, manual ISBN entry with automatic data fetching from multiple sources, custom cover URLs, three reading states, 1-5 star rating, and personal reviews.
- **Enhanced ISBN Search**: Automatic normalization and validation, real-time progress indicators, cover quality verification, intelligent cache system, search history tracking, extended metadata enrichment from Open Library, Google Books, and Firecrawl.
- **Statistics Dashboard**: Displays monthly/annual book/page counts, interactive charts, monthly/annual comparisons (with delta indicators), year selector for historical data, and an annual goal progress card. Robustness is ensured with Zod validation, skeleton loading, enhanced error handling, and empty state components.
- **Reading History**: A dedicated tab showing finished books by year, including cover, title, author, finish date, pages, rating, genre.
- **Filters and Search**: Search by title/author, filter by reading status and genre.
- **Personal Dictionary**: Manual entry for words, custom Spanish definitions, optional book association, and personal notes.
- **Wishlist Management**: Separate wishlist functionality, with ability to move books to the main library.
- **Reading Goals**: Annual goals (books or pages) with progress visualization.
- **Catholic Authors**: Curated resources for predefined spiritual authors, plus user-addable custom authors.
- **Recommendation System**: Intelligent analysis of reading habits to recommend genres, authors, and wishlist items.

### System Design Choices
- **Frontend**: React with TypeScript, Wouter for routing, TanStack Query for server state management, React Hook Form with Zod for validation, Shadcn UI + Tailwind CSS for components, Recharts for data visualization, and date-fns for date handling.
- **Backend**: Express.js REST API server.
- **Database**: PostgreSQL (Neon) for data persistence, managed with Drizzle ORM for type-safe queries. Zod is used for schema validation across the stack.

### Database Schema Highlights
- `users`: User authentication.
- `books`: Book details, reading status, ratings, wishlist flag, and extended metadata.
- `dictionary_entries`: User-defined words and definitions.
- `reading_goals`: Annual reading goals.
- `custom_authors`: User-added author information.
- `isbn_cache`: Stores successful ISBN lookups for performance.
- `search_history`: Tracks recent ISBN searches.

## External Dependencies
- **Open Library API**: Primary source for ISBN-based book data.
- **Google Books API**: Secondary source for ISBN-based book data.
- **Firecrawl API**: Tertiary source for ISBN-based book data, particularly for regional and self-published editions, using ethical web scraping.
- **PostgreSQL (Neon)**: Primary database for data persistence.
- **Express.js**: Backend framework.
- **React**: Frontend library.
- **Wouter**: Client-side routing.
- **TanStack Query**: Data fetching and state management.
- **React Hook Form**: Form management.
- **Zod**: Schema validation.
- **Shadcn UI / Tailwind CSS**: UI component library and styling.
- **Recharts**: Charting library.
- **date-fns**: Date utility library.
- **PM2**: Process manager for Node.js (production).
- **Nginx**: Reverse proxy (production).
- **Let's Encrypt**: SSL certificate management.