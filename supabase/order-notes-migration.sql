-- Add internal notes column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';
