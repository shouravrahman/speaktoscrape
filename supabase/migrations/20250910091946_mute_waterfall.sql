/*
  # Agentic Scraper Database Schema

  1. New Tables
    - `scraping_tasks`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `task_data` (jsonb, stores parsed task information)
      - `execution_plan` (jsonb, stores execution steps)
      - `status` (enum: pending, running, completed, failed)
      - `error_message` (text, error details if failed)
      - `created_at` (timestamp)
      - `completed_at` (timestamp)
    
    - `scraping_results`
      - `id` (uuid, primary key)
      - `task_id` (uuid, references scraping_tasks)
      - `data` (jsonb, raw scraped data)
      - `format` (text, requested export format)
      - `file_path` (text, path to exported file if applicable)
      - `created_at` (timestamp)
    
    - `processed_data`
      - `id` (uuid, primary key)
      - `result_id` (uuid, references scraping_results)
      - `processed_data` (jsonb, LLM-processed structured data)
      - `processing_options` (jsonb, processing configuration)
      - `vector_embeddings` (vector, for semantic search)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- Create custom types
CREATE TYPE task_status AS ENUM ('pending', 'running', 'completed', 'failed');

-- Create scraping_tasks table
CREATE TABLE IF NOT EXISTS scraping_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  task_data jsonb NOT NULL,
  execution_plan jsonb,
  status task_status DEFAULT 'pending',
  error_message text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create scraping_results table
CREATE TABLE IF NOT EXISTS scraping_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES scraping_tasks(id) ON DELETE CASCADE NOT NULL,
  data jsonb NOT NULL,
  format text DEFAULT 'json',
  file_path text,
  created_at timestamptz DEFAULT now()
);

-- Create processed_data table with vector support
CREATE TABLE IF NOT EXISTS processed_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id uuid REFERENCES scraping_results(id) ON DELETE CASCADE NOT NULL,
  processed_data jsonb NOT NULL,
  processing_options jsonb,
  vector_embeddings vector(1536), -- OpenAI embeddings dimension
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE scraping_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraping_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for scraping_tasks
CREATE POLICY "Users can create their own scraping tasks"
  ON scraping_tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own scraping tasks"
  ON scraping_tasks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own scraping tasks"
  ON scraping_tasks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for scraping_results
CREATE POLICY "Users can view their own scraping results"
  ON scraping_results
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM scraping_tasks 
      WHERE scraping_tasks.id = scraping_results.task_id 
      AND scraping_tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert scraping results"
  ON scraping_results
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM scraping_tasks 
      WHERE scraping_tasks.id = scraping_results.task_id 
      AND scraping_tasks.user_id = auth.uid()
    )
  );

-- Create RLS policies for processed_data
CREATE POLICY "Users can view their own processed data"
  ON processed_data
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM scraping_results 
      JOIN scraping_tasks ON scraping_tasks.id = scraping_results.task_id
      WHERE scraping_results.id = processed_data.result_id 
      AND scraping_tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert processed data"
  ON processed_data
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM scraping_results 
      JOIN scraping_tasks ON scraping_tasks.id = scraping_results.task_id
      WHERE scraping_results.id = processed_data.result_id 
      AND scraping_tasks.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_scraping_tasks_user_id ON scraping_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_scraping_tasks_status ON scraping_tasks(status);
CREATE INDEX IF NOT EXISTS idx_scraping_tasks_created_at ON scraping_tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scraping_results_task_id ON scraping_results(task_id);
CREATE INDEX IF NOT EXISTS idx_processed_data_result_id ON processed_data(result_id);

-- Create vector similarity search index (if using pgvector)
-- CREATE INDEX IF NOT EXISTS processed_data_vector_idx ON processed_data 
-- USING hnsw (vector_embeddings vector_cosine_ops);