-- Add source_url, agent_used, and cost columns to scraping_results table
ALTER TABLE scraping_results
ADD COLUMN source_url TEXT,
ADD COLUMN agent_used TEXT,
ADD COLUMN cost DECIMAL(10, 4);

-- Optional: Add indexes for the new columns if they will be frequently queried
CREATE INDEX IF NOT EXISTS idx_scraping_results_source_url ON scraping_results(source_url);
CREATE INDEX IF NOT EXISTS idx_scraping_results_agent_used ON scraping_results(agent_used);