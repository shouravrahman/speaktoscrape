import Firecrawl from "@mendable/firecrawl-js";
import { ScrapingTask } from "./types";

const firecrawlClient = new Firecrawl({
    apiKey: process.env.FIRECRAWL_API_KEY,
});

export async function scrapeWithFirecrawl(task: ScrapingTask, url: string): Promise<any[]> {
    console.log(`Attempting Firecrawl scrape for ${url}`);

    const scrapeOptions: any = {
        url,
        params: {
            pageOptions: { onlyMainContent: true },
        },
    };

    if (task.dataType === "structured" && task.format === "json" && task.extractor) {
        scrapeOptions.params.extractor = task.extractor;
    }

    let firecrawlResult: any;
    if (task.paginationStrategy === "ALL_PAGES" || task.paginationStrategy === "INFINITE_SCROLL") {
        scrapeOptions.params.crawlerOptions = {
            maxPagesToCrawl: task.maxPages || 10, // Default to 10 pages for crawling
        };
        firecrawlResult = await firecrawlClient.crawlUrl(scrapeOptions.url, scrapeOptions.params);
    } else {
        // Default to FIRST_PAGE_ONLY or if pagination is false
        firecrawlResult = await firecrawlClient.scrapeUrl(scrapeOptions.url, scrapeOptions.params);
    }

    if (!firecrawlResult || firecrawlResult.length === 0) {
        throw new Error("Firecrawl returned no data.");
    }

    const resultsArray = Array.isArray(firecrawlResult) ? firecrawlResult : [firecrawlResult];

    return resultsArray.map((result: any) => ({
        data: result.content || result.data, // Firecrawl returns content for markdown, data for structured
        source_url: result.sourceURL || url,
        agent_used: "Firecrawl",
        timestamp: new Date().toISOString(),
    }));
}

export async function getHtmlWithFirecrawl(url: string): Promise<string> {
    console.log(`Fetching HTML for ${url}`);
    const response = await firecrawlClient.scrapeUrl(url, {
        pageOptions: {
            onlyMainContent: false // We want the full HTML to find selectors
        }
    });
    if (!response || !response.html) {
        throw new Error("Firecrawl failed to fetch HTML.");
    }
    return response.html;
}
