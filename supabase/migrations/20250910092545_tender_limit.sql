/*
  # Enhanced Agentic Scraper Database Schema

  1. New Tables
    - `chat_sessions` - Chat conversation management
    - `chat_messages` - Individual chat messages
    - `vector_embeddings` - Vector embeddings for semantic search
    - Enhanced `scraping_tasks` with more metadata
    - Enhanced `scraping_results` with processing info

  2. Functions
    - Vector similarity search functions
    - Data aggregation functions
    - Search optimization functions

  3. Security
    - Enhanced RLS policies
    - Vector search permissions
    - Chat data isolation
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  last_message text,
  message_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_session_id uuid REFERENCES chat_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message_type text NOT NULL CHECK (message_type IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  task_id uuid REFERENCES scraping_tasks(id) ON DELETE SET NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create vector_embeddings table
CREATE TABLE IF NOT EXISTS vector_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  embedding vector(1536), -- OpenAI text-embedding-3-small dimension
  metadata jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add new columns to existing tables
DO $$
BEGIN
  -- Add columns to scraping_tasks if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scraping_tasks' AND column_name = 'estimated_duration') THEN
    ALTER TABLE scraping_tasks ADD COLUMN estimated_duration integer;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scraping_tasks' AND column_name = 'complexity') THEN
    ALTER TABLE scraping_tasks ADD COLUMN complexity text CHECK (complexity IN ('low', 'medium', 'high'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scraping_tasks' AND column_name = 'progress') THEN
    ALTER TABLE scraping_tasks ADD COLUMN progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100);
  END IF;

  -- Add columns to scraping_results if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scraping_results' AND column_name = 'summary') THEN
    ALTER TABLE scraping_results ADD COLUMN summary text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scraping_results' AND column_name = 'data_size') THEN
    ALTER TABLE scraping_results ADD COLUMN data_size integer;
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE vector_embeddings ENABLE ROW LEVEL SECURITY;

-- RLS policies for chat_sessions
CREATE POLICY "Users can manage their own chat sessions"
  ON chat_sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS policies for chat_messages
CREATE POLICY "Users can manage their own chat messages"
  ON chat_messages
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS policies for vector_embeddings
CREATE POLICY "Users can access their own embeddings"
  ON vector_embeddings
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at ON chat_sessions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(chat_session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_vector_embeddings_user_id ON vector_embeddings(user_id);

-- Create vector similarity search index
CREATE INDEX IF NOT EXISTS vector_embeddings_embedding_idx 
ON vector_embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Create full-text search indexes
CREATE INDEX IF NOT EXISTS idx_vector_embeddings_content_fts 
ON vector_embeddings 
USING gin (to_tsvector('english', content));

-- Function to search similar embeddings
CREATE OR REPLACE FUNCTION match_embeddings(
  query_embedding vector(1536),
  user_id uuid,
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    vector_embeddings.id,
    vector_embeddings.content,
    vector_embeddings.metadata,
    1 - (vector_embeddings.embedding <=> query_embedding) AS similarity
  FROM vector_embeddings
  WHERE vector_embeddings.user_id = match_embeddings.user_id
    AND 1 - (vector_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY vector_embeddings.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to search similar tasks
CREATE OR REPLACE FUNCTION search_similar_tasks(
  query_text text,
  user_id uuid,
  similarity_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  task_data jsonb,
  created_at timestamptz,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    scraping_tasks.id,
    scraping_tasks.task_data,
    scraping_tasks.created_at,
    ts_rank(
      to_tsvector('english', scraping_tasks.task_data::text),
      plainto_tsquery('english', query_text)
    ) AS similarity
  FROM scraping_tasks
  WHERE scraping_tasks.user_id = search_similar_tasks.user_id
    AND to_tsvector('english', scraping_tasks.task_data::text) @@ plainto_tsquery('english', query_text)
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- Function to update chat session metadata
CREATE OR REPLACE FUNCTION update_chat_session_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE chat_sessions 
    SET 
      message_count = message_count + 1,
      last_message = NEW.content,
      updated_at = now()
    WHERE id = NEW.chat_session_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE chat_sessions 
    SET 
      message_count = message_count - 1,
      updated_at = now()
    WHERE id = OLD.chat_session_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for chat session stats
DROP TRIGGER IF EXISTS trigger_update_chat_session_stats ON chat_messages;
CREATE TRIGGER trigger_update_chat_session_stats
  AFTER INSERT OR DELETE ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_session_stats();

-- Function to automatically generate embeddings
CREATE OR REPLACE FUNCTION auto_generate_embeddings()
RETURNS TRIGGER AS $$
BEGIN
  -- This would be called by the application layer
  -- Placeholder for future automatic embedding generation
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create materialized view for user analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS user_scraping_analytics AS
SELECT 
  st.user_id,
  COUNT(*) as total_tasks,
  COUNT(CASE WHEN st.status = 'completed' THEN 1 END) as completed_tasks,
  COUNT(CASE WHEN st.status = 'failed' THEN 1 END) as failed_tasks,
  AVG(CASE WHEN st.status = 'completed' THEN st.estimated_duration END) as avg_duration,
  COUNT(DISTINCT DATE(st.created_at)) as active_days,
  MAX(st.created_at) as last_activity
FROM scraping_tasks st
GROUP BY st.user_id;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_analytics_user_id 
ON user_scraping_analytics(user_id);

-- Function to refresh analytics
CREATE OR REPLACE FUNCTION refresh_user_analytics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_scraping_analytics;
END;
$$ LANGUAGE plpgsql;