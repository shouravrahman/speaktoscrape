import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { VectorEmbeddingService } from '@/lib/vector/embeddings'
import { LRUCache } from 'lru-cache'

const cache = new LRUCache<string, any>({
  max: 100, // a hundred items
  ttl: 1000 * 60 * 5, // 5 minutes
});

export async function POST(request: NextRequest) {
  try {
    const { query, limit = 10, threshold = 0.7, dataType, page = 1 } = await request.json()
    const supabase = createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cacheKey = `${query}-${limit}-${threshold}-${dataType}-${page}`;
    if (cache.has(cacheKey)) {
      return NextResponse.json(cache.get(cacheKey));
    }

    const vectorService = new VectorEmbeddingService()
    
    const results = await vectorService.searchSimilar(query, user.id, {
      limit,
      threshold,
      dataType,
      page
    })

    const response = {
      success: true, 
      results,
      query,
      count: results.length
    }

    cache.set(cacheKey, response);

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error performing vector search:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}