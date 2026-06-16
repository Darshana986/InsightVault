-- Add atomic processing lock column
-- Allows serverless instances to safely claim exclusive processing rights

ALTER TABLE articles
ADD COLUMN processing_started_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Optional: Add index for faster expiry checks if processing many articles
-- CREATE INDEX idx_articles_processing_started_at ON articles(processing_started_at);
