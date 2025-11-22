import { generateObject, generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { DynamicTool } from '@langchain/core/tools';
import { getHtmlWithFirecrawl, scrapeWithFirecrawl } from './firecrawl-scraper';
import {
	getHtmlWithBrightData,
	scrapeWithBrightData,
} from './brightdata-scraper';
import { ScrapingTask, ScrapingTaskSchema } from './types';
import { z } from 'zod';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from '@langchain/core/prompts';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

const google = createGoogleGenerativeAI({
	apiKey: process.env.GOOGLE_API_KEY,
});

export class ScraperAgent {

	public async parseTask(
		query: string,
		userId: string
	): Promise<ScrapingTask> {
		const { object } = await generateObject({
			model: google('models/gemini-1.5-flash'),
			schema: ScrapingTaskSchema,
			prompt: query,
			system: `You are an expert at parsing user queries into structured data.
      Given the user's query, extract the necessary information and format it into a JSON object that conforms to the provided schema.
      Today's date is ${new Date().toLocaleDateString()}.
      If the user asks for something to be done "today" or "now", use this date.
      If the user wants to scrape a website and then search or ask questions about it, set the 'intent' to 'SCRAPE' and 'postProcessing.generateEmbeddings' to true.
      If the user only wants to search the internet, set the 'intent' to 'SEARCH_INTERNET'.
      If the user is asking a question about data that has already been scraped, set the 'intent' to 'QUERY_SCRAPED_DATA'.
      If the target URL belongs to a social media platform, a job portal, or any other website that typically requires a login to view content (e.g., linkedin.com, facebook.com, instagram.com), set the 'requiresAuth' field to the website's domain name (e.g., 'linkedin.com').
      Respond ONLY with a valid JSON object.`,
		});

		if (object.requiresAuth) {
			object.disclaimer = "Scraping social media sites is a powerful feature for advanced users. Please use it responsibly and be aware of the terms of service of the websites you are scraping. There is a risk of account suspension.";
		}

		return object;
	}

	public async run(task: ScrapingTask): Promise<any> {
		let finalTask = task;

		if (task.should_find_selectors && task.fields && task.target) {
			const html = await this._getHtmlContent(task.target);
			const selectors = await this._findSelectors(
				html,
				task.fields.map((f) => f.name),
				task.itemSelector
			);

			finalTask.fields = task.fields.map((field, index) => ({
				...field,
				selector: selectors[index] || "",
			}));
		}

		const scraperExecutor = await this._createScraperExecutor(finalTask);
		const result = await scraperExecutor.invoke({
			url: finalTask.target,
		});

		return result;
	}

	private async _getHtmlContent(url: string): Promise<string> {
		try {
			const firecrawlHtml = await getHtmlWithFirecrawl(url);
			if (
				firecrawlHtml &&
				firecrawlHtml.length > 1000 &&
				firecrawlHtml.includes("</body>")
				) {
				return firecrawlHtml;
			}
		} catch (error) {
			console.log("Firecrawl failed to get HTML, trying Bright Data...");
		}
		return await getHtmlWithBrightData(url);
	}

	private async _findSelectors(
		htmlContent: string,
		fieldNames: string[],
		itemSelector?: string
	): Promise<string[]> {
		const itemSelectorPrompt = itemSelector
			? `The selector for each item in the list is '${itemSelector}'. All field selectors should be relative to this item selector.`
			: "This is not a list, so selectors should be unique for the page.";

		const { text } = await generateText({
			model: google('models/gemini-1.5-flash'),
			system: `You are an expert at extracting CSS selectors from HTML.
      Given the following HTML content, provide the best CSS selector for each of the requested fields.
      ${itemSelectorPrompt}
      Return a JSON object where the keys are the field names and the values are the CSS selectors.
      The fields are: ${fieldNames.join(", ")}

      HTML:
				---
				${ htmlContent }
      ---

				Respond ONLY with a valid JSON object.`,
      prompt: `Find selectors for: ${
			fieldNames.join(", ")}`,
    });

		try {
			const selectorsJson = JSON.parse(text);
			return fieldNames.map((name) => selectorsJson[name]);
		} catch (error) {
			console.error(
				"Failed to parse selectors from LLM response:",
				error
			);
			throw new Error("Could not automatically determine selectors for the given URL.");
		}
	}

	private async _createScraperExecutor(task: ScrapingTask) {
		const firecrawlTool = new DynamicTool({
			name: "firecrawl_scraper",
			description:
		"A tool for simple, fast, and cost-effective scraping of static content. Use this as the primary tool.",
		func: async (url: string) =>
			JSON.stringify(await scrapeWithFirecrawl(task, url)),
		});

	const brightdataTool = new DynamicTool({
		name: "brightdata_scraper",
			description:
		"A tool for scraping complex, dynamic websites with anti-bot measures. Use this as a fallback if the primary tool fails.",
			func: async(url: string) =>
		JSON.stringify(await scrapeWithBrightData(task, url)),
	});

	const tools = [firecrawlTool, brightdataTool];

	const prompt = ChatPromptTemplate.fromMessages([
		SystemMessagePromptTemplate.fromTemplate(
			"You are a powerful web scraping agent. Your goal is to scrape the requested information from the given URL. You have access to two tools: a simple, fast scraper (firecrawl_scraper) and an advanced, more robust scraper (brightdata_scraper). Always try the simple scraper first. If it fails or the content seems incomplete or dynamic, use the advanced scraper."
		),
		HumanMessagePromptTemplate.fromTemplate(
			"Scrape the content from this URL: {url}"
		),
		["placeholder", "{agent_scratchpad}"],
		]);

	const llm = new ChatGoogleGenerativeAI({
		model: "gemini-1.5-flash",
		temperature: 0.1,
		maxOutputTokens: 2000,
		apiKey: process.env.GOOGLE_API_KEY,
	});

	const agent = await createToolCallingAgent({
		llm,
		tools,
		prompt,
	});

		return new AgentExecutor({
		agent,
		tools,
	});
	}
}
