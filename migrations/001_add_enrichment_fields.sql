-- Migration 001: Add Book Enrichment Fields
-- Date: 2025-10-24
-- Description: Adds new metadata fields to books table for enhanced book information
-- Author: NEXUS (executed by Ricardo Rojas)
-- Status: Applied on 2025-10-24 19:30 UTC

-- Add new enrichment columns to books table
ALTER TABLE books ADD COLUMN IF NOT EXISTS language TEXT;
ALTER TABLE books ADD COLUMN IF NOT EXISTS edition TEXT;
ALTER TABLE books ADD COLUMN IF NOT EXISTS synopsis TEXT;
ALTER TABLE books ADD COLUMN IF NOT EXISTS series TEXT;
ALTER TABLE books ADD COLUMN IF NOT EXISTS series_number INTEGER;
ALTER TABLE books ADD COLUMN IF NOT EXISTS publisher TEXT;
ALTER TABLE books ADD COLUMN IF NOT EXISTS published_date TEXT;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'books' 
  AND column_name IN ('language', 'edition', 'synopsis', 'series', 'series_number', 'publisher', 'published_date')
ORDER BY ordinal_position;

-- Migration completed successfully
-- Note: These fields are optional and can be NULL
-- Future enhancement: Populate these fields via ISBN API enrichment
