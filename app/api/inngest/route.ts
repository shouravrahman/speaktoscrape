import { serve } from 'inngest/next'
import { inngest } from '@/lib/inngest/client'
import { scrapingJob, dataProcessingJob } from '@/lib/inngest/scraping-functions'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    scrapingJob,
    dataProcessingJob,
  ],
})