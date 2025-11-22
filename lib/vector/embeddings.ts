import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'
import { createAdminClient } from '@/lib/supabase/admin'

export class VectorEmbeddingService {
  private embeddings: GoogleGenerativeAIEmbeddings
  private supabase: any

  constructor() {
    this.embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY,
      model: 'models/embedding-001',
    })
    this.supabase = createAdminClient()
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const embedding = await this.embeddings.embedQuery(text)
    return embedding
  }

  async storeEmbedding(
    content: string,
    metadata: {
      taskId: string
      userId: string
      dataType: string
      source: string
    }
  ): Promise<void> {
    const embedding = await this.generateEmbedding(content)

    await this.supabase
      .from('vector_embeddings')
      .insert({
        content,
        embedding,
        metadata,
        created_at: new Date().toISOString()
      })
  }

  async searchSimilar(
    query: string,
    userId: string,
    options: {
      limit?: number
      threshold?: number
      dataType?: string
      page?: number
    } = {}
  ): Promise<any[]> {
    const { limit = 10, threshold = 0.7, dataType, page = 1 } = options
    const offset = (page - 1) * limit;

    const queryEmbedding = await this.generateEmbedding(query)

    let rpcQuery = this.supabase.rpc('match_embeddings', {
      query_embedding: queryEmbedding,
      user_id: userId,
      match_threshold: threshold,
      match_count: limit,
      match_offset: offset
    })

    if (dataType) {
      rpcQuery = rpcQuery.eq('metadata->dataType', dataType)
    }

    const { data, error } = await rpcQuery

    if (error) {
      console.error('Vector search error:', error)
      return []
    }

    return data || []
  }

  async processScrapedData(taskId: string, data: any): Promise<void> {
    const { data: task } = await this.supabase
      .from('scraping_tasks')
      .select('user_id, task_data')
      .eq('id', taskId)
      .single()

    if (!task) return

    // Extract text content for embedding
    const textContent = this.extractTextContent(data)

    if (textContent.length > 0) {
      // Split into chunks for better search granularity
      const chunks = this.chunkText(textContent, 1000)

      for (const chunk of chunks) {
        await this.storeEmbedding(chunk, {
          taskId,
          userId: task.user_id,
          dataType: task.task_data.dataType,
          source: task.task_data.target
        })
      }
    }
  }

  private extractTextContent(data: any): string {
    if (typeof data === 'string') return data
    if (Array.isArray(data)) {
      return data.map(item => this.extractTextContent(item)).join(' ')
    }
    if (typeof data === 'object' && data !== null) {
      return Object.values(data).map(value => this.extractTextContent(value)).join(' ')
    }
    return String(data)
  }

  private chunkText(text: string, chunkSize: number): string[] {
    const chunks: string[] = []
    const sentences = text.split(/[.!?]+/)
    let currentChunk = ''

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > chunkSize && currentChunk) {
        chunks.push(currentChunk.trim())
        currentChunk = sentence
      } else {
        currentChunk += sentence + '. '
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim())
    }

    return chunks
  }
}