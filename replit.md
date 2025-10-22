# Biblioteca Moi

## Overview
Biblioteca Moi is a web application designed for personal library management, focusing on Catholic and spiritual books. It enables users to track their collection, monitor reading progress, and view monthly and annual statistics. The application features a clean turquoise and white design, optimized for responsive use across iPhone, tablet, and desktop. Its core purpose is to provide a dedicated tool for spiritual reading management, offering features like ISBN scanning, reading goals, a personal dictionary, and curated author resources.

## User Preferences
I prefer simple language and clear explanations. I want iterative development, with regular updates and opportunities for feedback. Ask before making major changes to the codebase or design. I value elegant and clean UI/UX with specific color palettes (turquoise and white) and religious iconography. I expect the agent to maintain the spiritual and personalized branding ("Biblioteca Moi" with a romantic dedication and an image of the Virgin Mary).

## System Architecture
The application employs a modern full-stack architecture.

### UI/UX Decisions
- **Theme**: Elegant turquoise (#2ba09f) and white color palette, designed for a sophisticated and calming spiritual reading experience.
- **Typography**: Playfair Display (serif) and Inter (sans-serif).
- **Branding**: "Biblioteca Moi" with a personal dedication and religious iconography (Virgin Mary Queen of Peace image).
- **Responsive Design**: Mobile-first approach with a collapsible sidebar, optimized for iPhone PWA with safe area padding.
- **Dark/Light Mode**: Full support for both themes.

### Technical Implementations
- **Book Management**: Features a comprehensive catalog with card views, manual ISBN entry with automatic data fetching via Open Library API, custom cover URLs, three reading states (To Read, Reading, Finished), 1-5 star rating system, and personal reviews.
- **Statistics Dashboard**: Displays books and pages read monthly/annually, interactive charts (bar and line), monthly comparisons, real-time current month stats, and an annual goal progress card.
- **Filters and Search**: Search by title/author, filter by reading status and genre.
- **Personal Dictionary**: Manual entry for words, custom Spanish definitions, optional book association, and personal notes.
- **Wishlist Management**: Separate wishlist functionality, ability to move books between wishlist and main library.
- **Reading Goals**: Annual reading goals (books or pages) with progress visualization on the Dashboard.
- **Catholic Authors**: Curated resources for 13 predefined spiritual authors with external links, plus a system for users to add, edit, and delete their own favorite authors.
- **Recommendation System**: Intelligent analysis of reading habits, recommending genres and authors based on completed books and ratings, and suggesting wishlist items.

### System Design Choices
- **Frontend**: React with TypeScript, Wouter for routing, TanStack Query for server state management, React Hook Form with Zod for validation, Shadcn UI + Tailwind CSS for components, Recharts for data visualization, and date-fns for date handling.
- **Backend**: Express.js REST API server.
- **Database**: PostgreSQL (Neon) for data persistence, managed with Drizzle ORM for type-safe queries. Zod is used for schema validation.

### Database Schema Highlights
- `users`: Stores user authentication details.
- `books`: Contains book details, reading status, ratings, and wishlist flag.
- `dictionary_entries`: Stores user-defined dictionary words and definitions.
- `reading_goals`: Manages annual reading goals per user.
- `custom_authors`: Stores user-added author information.

### API Endpoints
Comprehensive RESTful API for authentication, book management, wishlist operations, statistics, dictionary, reading goals, and custom authors.

## External Dependencies
- **Open Library API**: Used for automatic book data retrieval via ISBN.
- **PostgreSQL (Neon)**: The primary database for data persistence.
- **Express.js**: Backend framework.
- **React**: Frontend library.
- **Wouter**: Client-side routing.
- **TanStack Query**: Data fetching and state management.
- **React Hook Form**: Form management.
- **Zod**: Schema validation (both frontend and backend).
- **Shadcn UI / Tailwind CSS**: UI component library and styling framework.
- **Recharts**: Charting library for data visualization.
- **date-fns**: Date utility library.
- **PM2**: Process manager for Node.js applications in production.
- **Nginx**: Reverse proxy for deployment.
- **Let's Encrypt**: For SSL certificate management.

## Deployment

### Production Deployment
- **Platform**: Replit deployment (currently active)
- **URL**: https://book-wife-library-rrojashub.replit.app/auth
- **Status**: ✅ Live and operational
- **Database**: PostgreSQL production database on Replit

### VPS Deployment (Learning Resource)
- **Server**: Hostinger KVM 1, Ubuntu 24.04, IP: 72.60.115.169
- **Intended Domain**: bibliotecamoi.com
- **Status**: Prepared for deployment
- **Purpose**: Educational resource for future enterprise projects

### Deployment Lessons Learned

**Critical Fixes for Successful Deployment:**

1. **Health Check Endpoint**: Added `/health` endpoint in `server/index.ts` to enable platform health checks during deployment initialization.

2. **Password Hashing**: Application uses scrypt for password hashing with format `hash.salt`. Production database users must have properly hashed passwords (not plain text).

3. **PM2 Configuration with ES Modules**: Created `ecosystem.config.cjs` that uses tsx interpreter to handle TypeScript and ES modules correctly. PM2 doesn't support ES modules by default.

4. **Error Handling**: Improved server startup error handling with try-catch blocks and proper logging to identify initialization failures.

5. **Database Initialization**: Created `init-database.sql` to properly initialize users with correct password hashes in production environments.

**Key Files for Deployment:**
- `deploy-vps.sh`: Automated VPS deployment script
- `ecosystem.config.cjs`: PM2 configuration for ES modules
- `init-database.sql`: Database user initialization
- `GUIA-VPS-COMPLETA.md`: Comprehensive educational guide for VPS deployment
- `DEPLOYMENT.md`: General deployment documentation

**Authentication Credentials (Production):**
- Username: `moi`
- Password: `Delgado1509#` (stored as scrypt hash in database)