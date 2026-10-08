-- Add structured pedigree data to dogs table
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS pedigree JSONB DEFAULT '{}';
