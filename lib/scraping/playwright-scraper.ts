import { chromium, Browser, Page } from 'playwright'

export interface ScrapingOptions {
  userAgent?: string
  viewport?: { width: number; height: number }
  stealth?: boolean
  proxy?: string
  cookies?: Array<{ name: string; value: string; domain: string }>
  timeout?: number
}

export class PlaywrightScraper {
  private browser: Browser | null = null
  private page: Page | null = null

  async initialize(options: ScrapingOptions = {}) {
    const {
      userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport = { width: 1920, height: 1080 },
      stealth = true,
      proxy,
      timeout = 30000
    } = options

    this.browser = await chromium.launch({
      headless: true,
      proxy: proxy ? { server: proxy } : undefined
    })

    const context = await this.browser.newContext({
      userAgent,
      viewport,
      extraHTTPHeaders: {
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      }
    })

    if (options.cookies) {
      await context.addCookies(options.cookies)
    }

    this.page = await context.newPage()

    // Stealth mode configurations
    if (stealth) {
      await this.page.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
        })
        
        // Remove webdriver traces
        delete (window as any).navigator.webdriver
      })
    }

    this.page.setDefaultTimeout(timeout)
  }

  async scrapeUrl(url: string, selectors?: Record<string, string>): Promise<any> {
    if (!this.page) {
      throw new Error('Scraper not initialized')
    }

    await this.page.goto(url, { waitUntil: 'networkidle' })
    
    // Wait for page to be fully loaded
    await this.page.waitForLoadState('networkidle')

    if (selectors) {
      const results: Record<string, any> = {}
      
      for (const [key, selector] of Object.entries(selectors)) {
        try {
          const elements = await this.page.$$(selector)
          if (elements.length > 1) {
            results[key] = await Promise.all(
              elements.map(el => el.textContent())
            )
          } else {
            const element = await this.page.$(selector)
            results[key] = element ? await element.textContent() : null
          }
        } catch (error) {
          console.error(`Error extracting ${key}:`, error)
          results[key] = null
        }
      }
      
      return results
    }

    // Default: return page content and metadata
    const content = await this.page.content()
    const title = await this.page.title()
    const url_final = this.page.url()
    
    return {
      content,
      title,
      url: url_final,
      timestamp: new Date().toISOString()
    }
  }

  async scrollAndLoadMore(maxScrolls: number = 5): Promise<void> {
    if (!this.page) return

    for (let i = 0; i < maxScrolls; i++) {
      await this.page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight)
      })
      
      await this.page.waitForTimeout(2000)
      
      // Check if "Load More" button exists and click it
      const loadMoreButton = await this.page.$('button:has-text("Load More"), button:has-text("Show More")')
      if (loadMoreButton) {
        await loadMoreButton.click()
        await this.page.waitForTimeout(3000)
      }
    }
  }

  async handlePagination(paginationSelector: string, maxPages: number = 5): Promise<any[]> {
    if (!this.page) return []

    const results: any[] = []
    let currentPage = 1

    while (currentPage <= maxPages) {
      console.log(`Scraping page ${currentPage}...`)
      
      // Scrape current page
      const pageData = await this.scrapeUrl(this.page.url())
      results.push({
        page: currentPage,
        data: pageData
      })

      // Try to find and click next button
      const nextButton = await this.page.$(paginationSelector)
      if (!nextButton) break

      const isDisabled = await nextButton.getAttribute('disabled')
      if (isDisabled) break

      await nextButton.click()
      await this.page.waitForLoadState('networkidle')
      await this.page.waitForTimeout(2000) // Be nice to servers
      
      currentPage++
    }

    return results
  }

  async close() {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
      this.page = null
    }
  }
}