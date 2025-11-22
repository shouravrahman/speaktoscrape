import { z } from "zod";

export const ScrapingTaskSchema = z.object({
	intent: z.enum(["SCRAPE", "QUERY_SCRAPED_DATA", "SEARCH_INTERNET"]).describe("The user's intent."),
	query: z.string().optional().describe("The natural language query for search or data extraction."),
	target: z.string().optional().describe("The URL to scrape."),
	fields: z.array(z.object({
		name: z.string(),
		selector: z.string(),
	})).optional().describe("Specific fields to extract with their CSS selectors"),
    itemSelector: z.string().optional().describe("Selector for the repeating item container on a page"),
    nextButtonSelector: z.string().optional().describe("Selector for the 'next' button in pagination"),
    should_find_selectors: z.boolean().optional().describe("Whether the agent needs to find the selectors."),
	pagination: z.boolean().optional().describe("Whether to handle pagination"),
	maxPages: z.number().optional().describe("Maximum pages to scrape"),
    filters: z.array(z.object({
        name: z.string(),
        operator: z.enum(["eq", "neq", "lt", "lte", "gt", "gte", "contains"]),
        value: z.union([z.string(), z.number()]),
    })).optional().describe("Filters to apply to the scraped data"),
    dataType: z.enum([
		"text",
		"structured",
		"images",
		"links",
		"tables",
		"forms",
	]).optional(),
	format: z.enum(["json", "csv", "markdown", "xml", "excel"]).optional(),
    paginationStrategy: z
		.enum(["ALL_PAGES", "INFINITE_SCROLL", "FIRST_PAGE_ONLY"])
		.optional(),
	schedule: z
		.object({
			enabled: z.boolean(),
			frequency: z.enum(["once", "hourly", "daily", "weekly", "monthly"]),
			startDate: z.string().optional(),
		})
		.optional(),
	antiBot: z
		.object({
			useProxy: z.boolean(),
			rotateSessions: z.boolean(),
			respectRobots: z.boolean(),
			delayRange: z.tuple([z.number(), z.number()]),
		})
		.optional(),
	postProcessing: z
		.object({
			deduplicate: z.boolean(),
			validateData: z.boolean(),
			enrichData: z.boolean(),
			generateEmbeddings: z.boolean(),
		})
		.optional(),
	extractor: z
		.record(z.string(), z.any())
		.optional(),
    requiresAuth: z.string().optional().describe("The domain that requires authentication, e.g., 'linkedin.com'"),
    authentication: z.object({
        strategy: z.enum(["cookies", "credentials"]),
        cookies: z.any().optional(),
        credentials: z.object({ username: z.string(), password: z.string() }).optional(),
    }).optional(),
    disclaimer: z.string().optional().describe("A disclaimer to show to the user."),
});

export type ScrapingTask = z.infer<typeof ScrapingTaskSchema>;
