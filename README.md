# SpeakToScrape - Autonomous Web Scraping Platform

A production-ready autonomous web scraping platform with a natural language interface, powered by AI agents, Next.js, and Supabase.

## 🚀 Features

- **Natural Language Interface**: Describe what you want to scrape in plain English.
- **Autonomous AI Agent**: Powered by Google Gemini and the Vercel AI SDK for intelligent task planning.
- **Advanced Scraping**: Playwright with stealth mode, anti-bot detection, and proxy support via Bright Data.
- **Vector Search**: Semantic search across all your scraped data using pgvector.
- **Real-time Progress**: Live updates on scraping tasks.
- **Multiple Export Formats**: JSON, CSV, XML, Markdown with one-click downloads.
- **Background Processing**: Scalable job queue with Inngest for large scraping tasks.
- **Data Management**: Complete history of chats, tasks, and generated data.
- **Production Ready**: Authentication, rate limiting, and error handling.

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js App   │────│  Supabase DB    │────│   Inngest Jobs  │
│   (Frontend)    │    │  (PostgreSQL)   │    │  (Background)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌──────────────────┐             │
         └──────────────│   Vercel AI SDK  │─────────────┘
                        │ (Google Gemini)  │
                        └──────────────────┘
                                 │
                        ┌──────────────────┐
                        │   Scraping Tools │
                        │(Playwright/Axios)│
                        └──────────────────┘
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Supabase (PostgreSQL + Auth)
- **AI/ML**: Google Gemini, Vercel AI SDK, pgvector for embeddings
- **Scraping**: Playwright, Bright Data, Firecrawl
- **Queue**: Inngest for background job processing
- **Deployment**: Vercel (recommended) or any Node.js hosting

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Google API Key (for Gemini)
- Inngest account (free tier available)
- Bright Data account (optional, for advanced scraping)
- Firecrawl account (optional, for simple scraping)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo>
cd speaktoscrape
npm install
```

### 2. Environment Setup

Create `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google AI Configuration
GOOGLE_API_KEY=your_google_api_key

# Firecrawl Configuration
FIRECRAWL_API_KEY=your_firecrawl_api_key

# Inngest Configuration
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Bright Data Configuration
BRIGHTDATA_USERNAME=
BRIGHTDATA_PASSWORD=
BRIGHTDATA_HOST=

# Lemonsqueezy Configuration
LEMONSQUEEZY_API_KEY=sk_YOUR_LEMONSQUEEZY_API_KEY
LEMONSQUEEZY_STORE_ID=YOUR_LEMONSQUEEZY_STORE_ID
LEMONSQUEEZY_WEBHOOK_SECRET=YOUR_LEMONSQUEEZY_WEBHOOK_SECRET
NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID=YOUR_LEMONSQUEEZY_STORE_ID
NEXT_PUBLIC_LEMONSQUEEZY_PRO_VARIANT_ID=YOUR_LEMONSQUEEZY_PRO_VARIANT_ID
```

### 3. Database Setup

1. Create a new Supabase project
2. Enable the pgvector extension in SQL Editor:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
3. Run the database migrations from the `supabase/migrations` directory.

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to start scraping!


## 🔧 Configuration

### Supabase Setup

1. **Create Project**: Go to [supabase.com](https://supabase.com) and create a new project
2. **Get Credentials**: Copy your project URL and anon key from Settings > API
3. **Enable Extensions**: Run in SQL Editor:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   CREATE EXTENSION IF NOT EXISTS pg_trgm;
   ```

### OpenAI Setup

1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add to `.env.local` as `OPENAI_API_KEY`

### Inngest Setup

1. Sign up at [inngest.com](https://inngest.com)
2. Create a new app and get your keys
3. Add to `.env.local`

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**:
   ```bash
   vercel --prod
   ```

2. **Environment Variables**: Add all `.env.local` variables in Vercel dashboard

3. **Custom Domain**: Configure your domain in Vercel settings

### Alternative Deployments

#### Railway
```bash
railway login
railway init
railway add
railway deploy
```

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 Usage Examples

### Basic Scraping
```
"Scrape all product titles from the first page of Amazon search for 'wireless headphones'"
```

### Advanced Scraping
```
"Get the first 5 pages of Hacker News posts with titles, URLs, and scores, export as CSV"
```

### Documentation Scraping
```
"Scrape the entire Next.js documentation and create a searchable knowledge base"
```

### E-commerce Monitoring
```
"Monitor prices for iPhone 15 on Amazon, Best Buy, and Target daily"
```

## 🔍 Vector Search

Search across all your scraped data:

```
"Find all mentions of 'authentication' in my scraped documentation"
"Show me products under $100 from my e-commerce scrapes"
"What are the common themes in the blog posts I scraped?"
```

## 🛡️ Security & Best Practices

### Rate Limiting
- Built-in rate limiting per user
- Configurable delays between requests
- Respect robots.txt automatically

### Anti-Bot Measures
- Rotating user agents and headers
- Proxy rotation support
- Session management
- CAPTCHA detection and handling

### Data Privacy
- All data encrypted at rest
- Row-level security (RLS) enabled
- User data isolation
- GDPR compliance ready

## 📈 Monitoring & Analytics

### Built-in Metrics
- Scraping success rates
- Response times
- Error tracking
- Usage analytics

### Integration Options
- Sentry for error tracking
- PostHog for analytics
- Custom webhooks for notifications

## 🔧 Advanced Configuration

### Custom Scrapers
Add custom scraping logic in `lib/scraping/custom-scrapers.ts`:

```typescript
export class CustomScraper extends PlaywrightScraper {
  async scrapeSpecialSite(url: string) {
    // Your custom logic here
  }
}
```

### Custom AI Prompts
Modify agent behavior in `lib/agents/scraping-agent.ts`:

```typescript
const customPrompt = `You are a specialized scraping agent for...`
```

## 🐛 Troubleshooting

### Common Issues

1. **Supabase Connection Error**
   - Check your environment variables
   - Verify project URL and keys
   - Ensure database is accessible

2. **OpenAI API Errors**
   - Verify API key is valid
   - Check rate limits and billing
   - Monitor token usage

3. **Scraping Failures**
   - Check target site's robots.txt
   - Verify selectors are correct
   - Consider using proxies for blocked sites

### Debug Mode
Enable debug logging:
```env
DEBUG=true
LOG_LEVEL=debug
```

## 📚 API Reference

### REST Endpoints

- `POST /api/scraping/task` - Create scraping task
- `GET /api/scraping/task` - Get task status
- `GET /api/scraping/download` - Download results
- `POST /api/search/vector` - Vector search
- `GET /api/chat/history` - Chat history

### WebSocket Events

- `task:progress` - Real-time progress updates
- `task:complete` - Task completion notification
- `task:error` - Error notifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- 📧 Email: support@your-domain.com
- 💬 Discord: [Your Discord Server]
- 📖 Docs: [Your Documentation Site]
- 🐛 Issues: [GitHub Issues]

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Chrome extension
- [ ] Zapier integration
- [ ] Advanced scheduling
- [ ] Team collaboration features
- [ ] Enterprise SSO
- [ ] Custom model fine-tuning