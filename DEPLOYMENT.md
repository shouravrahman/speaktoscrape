# Deployment Guide - Agentic Scraper

This guide covers deploying your Agentic Scraper to production environments.

## 🚀 Quick Deploy Options

### Option 1: Vercel (Recommended)

Vercel provides the best experience for Next.js applications with automatic deployments and edge functions.

#### Prerequisites
- GitHub/GitLab repository
- Vercel account
- Supabase project
- OpenAI API key

#### Steps

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login and deploy
   vercel login
   vercel --prod
   ```

2. **Environment Variables**
   Add these in your Vercel dashboard (Settings → Environment Variables):
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   GOOGLE_API_KEY=your_google_api_key
   FIRECRAWL_API_KEY=your_firecrawl_api_key
   INNGEST_EVENT_KEY=your_inngest_event_key
   INNGEST_SIGNING_KEY=your_inngest_signing_key
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   BRIGHTDATA_USERNAME=
   BRIGHTDATA_PASSWORD=
   BRIGHTDATA_HOST=
   LEMONSQUEEZY_API_KEY=sk_YOUR_LEMONSQUEEZY_API_KEY
   LEMONSQUEEZY_STORE_ID=YOUR_LEMONSQUEEZY_STORE_ID
   LEMONSQUEEZY_WEBHOOK_SECRET=YOUR_LEMONSQUEEZY_WEBHOOK_SECRET
   NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID=YOUR_LEMONSQUEEZY_STORE_ID
   NEXT_PUBLIC_LEMONSQUEEZY_PRO_VARIANT_ID=YOUR_LEMONSQUEEZY_PRO_VARIANT_ID
   ```

3. **Custom Domain** (Optional)
   - Go to Vercel dashboard → Domains
   - Add your custom domain
   - Update DNS records as instructed

#### Vercel Configuration

Create `vercel.json`:
```json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 300
    }
  },
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### Option 2: Railway

Railway offers simple deployments with built-in PostgreSQL.

#### Steps

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Deploy**
   ```bash
   railway init
   railway add
   railway deploy
   ```

3. **Environment Variables**
   ```bash
   railway variables set OPENAI_API_KEY=your_key
   railway variables set NEXT_PUBLIC_SUPABASE_URL=your_url
   # ... add all other variables
   ```

### Option 3: Docker Deployment

For custom hosting or cloud providers.

#### Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - INNGEST_EVENT_KEY=${INNGEST_EVENT_KEY}
      - INNGEST_SIGNING_KEY=${INNGEST_SIGNING_KEY}
    restart: unless-stopped
```

## 🗄️ Database Setup

### Supabase Production Setup

1. **Create Production Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Choose a strong password
   - Select region closest to your users

2. **Run Migrations**
   ```sql
   -- Enable extensions
   CREATE EXTENSION IF NOT EXISTS vector;
   CREATE EXTENSION IF NOT EXISTS pg_trgm;
   
   -- Run the migration files in order
   -- Copy content from supabase/migrations/*.sql
   ```

3. **Configure Auth**
   - Go to Authentication → Settings
   - Configure email templates
   - Set up custom SMTP (recommended for production)
   - Configure redirect URLs

4. **Set up RLS Policies**
   ```sql
   -- Verify all RLS policies are active
   SELECT schemaname, tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   ```

### Self-hosted PostgreSQL

If using your own PostgreSQL:

```bash
# Install pgvector extension
git clone https://github.com/pgvector/pgvector.git
cd pgvector
make
make install

# In PostgreSQL
CREATE EXTENSION vector;
```

## 🔧 Configuration

### Environment Variables

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `OPENAI_API_KEY` - OpenAI API key for AI agent
- `NEXTAUTH_SECRET` - Random secret for session encryption

**Optional but Recommended:**
- `INNGEST_EVENT_KEY` - For background job processing
- `INNGEST_SIGNING_KEY` - Inngest webhook signature verification
- `SENTRY_DSN` - Error tracking
- `POSTHOG_KEY` - Analytics
- `PROXY_URL` - Proxy for scraping (recommended)

### Performance Optimization

#### Next.js Configuration
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['playwright'],
  },
  images: {
    domains: ['your-domain.com'],
  },
  // Enable compression
  compress: true,
  // Optimize builds
  swcMinify: true,
}

module.exports = nextConfig
```

#### Caching Strategy
```typescript
// lib/cache.ts
import { unstable_cache } from 'next/cache'

export const getCachedData = unstable_cache(
  async (key: string) => {
    // Your data fetching logic
  },
  ['data-cache'],
  { revalidate: 3600 } // 1 hour
)
```

## 🔒 Security Checklist

### Production Security

- [ ] **Environment Variables**: All secrets in environment variables, not code
- [ ] **HTTPS**: SSL certificate configured
- [ ] **CORS**: Proper CORS configuration
- [ ] **Rate Limiting**: API rate limiting enabled
- [ ] **Input Validation**: All user inputs validated
- [ ] **SQL Injection**: Using parameterized queries
- [ ] **XSS Protection**: Content Security Policy headers
- [ ] **Authentication**: Secure session management

### Supabase Security

- [ ] **RLS Enabled**: Row Level Security on all tables
- [ ] **API Keys**: Anon key for client, service key for server only
- [ ] **Database**: Strong password, restricted access
- [ ] **Auth**: Email confirmation enabled (if desired)
- [ ] **Backup**: Automated backups configured

### Headers Configuration

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}
```

## 📊 Monitoring & Analytics

### Error Tracking with Sentry

```bash
npm install @sentry/nextjs
```

```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
})
```

### Analytics with PostHog

```bash
npm install posthog-js
```

```typescript
// lib/analytics.ts
import posthog from 'posthog-js'

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: 'https://app.posthog.com'
  })
}
```

### Health Checks

Create `/api/health/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from('scraping_tasks').select('count').limit(1)
    
    if (error) throw error
    
    return NextResponse.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    })
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: error.message },
      { status: 500 }
    )
  }
}
```

## 🚀 Performance Optimization

### Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_scraping_tasks_user_status 
ON scraping_tasks(user_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_scraping_results_created_at 
ON scraping_results(created_at DESC);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM scraping_tasks WHERE user_id = $1 AND status = 'completed';
```

### Caching Strategy

```typescript
// lib/redis.ts (optional)
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

export const cache = {
  async get(key: string) {
    const value = await redis.get(key)
    return value ? JSON.parse(value) : null
  },
  
  async set(key: string, value: any, ttl = 3600) {
    await redis.setex(key, ttl, JSON.stringify(value))
  }
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🆘 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   npm run build
   ```

2. **Database Connection Issues**
   ```bash
   # Test connection
   curl -X POST https://your-project.supabase.co/rest/v1/scraping_tasks \
     -H "apikey: your-anon-key" \
     -H "Content-Type: application/json"
   ```

3. **Memory Issues**
   ```javascript
   // Increase Node.js memory limit
   "scripts": {
     "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
   }
   ```

### Monitoring Commands

```bash
# Check application logs
vercel logs your-deployment-url

# Monitor database performance
# In Supabase dashboard → Database → Logs

# Check API response times
curl -w "@curl-format.txt" -o /dev/null -s https://your-app.com/api/health
```

## 📈 Scaling Considerations

### Horizontal Scaling

- Use Vercel's automatic scaling
- Consider Redis for session storage
- Implement database read replicas
- Use CDN for static assets

### Database Scaling

- Monitor connection pool usage
- Implement connection pooling (PgBouncer)
- Consider database sharding for large datasets
- Use materialized views for analytics

### Cost Optimization

- Monitor API usage (OpenAI, Supabase)
- Implement request caching
- Use compression for large responses
- Optimize database queries

---

## 🎯 Go Live Checklist

- [ ] Domain configured and SSL active
- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] RLS policies tested
- [ ] Error tracking configured
- [ ] Analytics implemented
- [ ] Health checks working
- [ ] Backup strategy in place
- [ ] Monitoring alerts set up
- [ ] Performance tested under load
- [ ] Security headers configured
- [ ] GDPR compliance reviewed (if applicable)

Your Agentic Scraper is now ready for production! 🚀