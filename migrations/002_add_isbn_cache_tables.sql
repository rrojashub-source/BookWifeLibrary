-- Migration 002: Add ISBN Cache and Search History Tables
-- Date: 2025-10-24
-- Description: Creates isbn_cache and search_history tables for ISBN lookup optimization
-- Author: NEXUS (executed by Ricardo Rojas)

-- ISBN Cache table - stores successful ISBN lookups
CREATE TABLE IF NOT EXISTS isbn_cache (
    isbn TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT,
    pages INTEGER,
    cover_url TEXT,
    genre TEXT,
    language TEXT,
    edition TEXT,
    synopsis TEXT,
    series TEXT,
    series_number INTEGER,
    publisher TEXT,
    published_date TEXT,
    sources TEXT NOT NULL,
    cached_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Search History table - tracks recent ISBN searches by user
CREATE TABLE IF NOT EXISTS search_history (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    isbn TEXT NOT NULL,
    title TEXT,
    searched_at TIMESTAMP NOT NULL DEFAULT NOW(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Verify tables were created
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('isbn_cache', 'search_history')
ORDER BY table_name, ordinal_position;

-- Migration completed successfully
