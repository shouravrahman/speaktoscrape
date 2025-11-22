import { chromium } from 'playwright';
import { ScrapingTask } from './types';

const AUTH = `${process.env.BRIGHTDATA_USERNAME}:${process.env.BRIGHTDATA_PASSWORD}`;
const SBR_WS_ENDPOINT = `wss://${AUTH}@${process.env.BRIGHTDATA_HOST}`;

export async function scrapeWithBrightData(task: ScrapingTask, url: string): Promise<any[]> {
    console.log(`Attempting Bright Data scrape for ${url}`);
    let browser;
    try {
        browser = await chromium.connect(SBR_WS_ENDPOINT);
        const page = await browser.newPage();
        await page.goto(url, { timeout: 120000 });

        let scrapedData: any[] = [];

        const extractData = async () => {
            const extractedData = await page.evaluate((task) => {
                const results: any[] = [];
                const items = document.querySelectorAll(task.itemSelector || 'body');

                items.forEach(item => {
                    const data: { [key: string]: any } = {};
                    let passesAllFilters = true;

                    // 1. Extract all field data first
                    task.fields?.forEach(field => {
                        const element = item.querySelector(field.selector);
                        if (element) {
                            data[field.name] = element.textContent?.trim() || null;
                        }
                    });

                    // 2. Apply filters to the extracted data
                    if (task.filters && task.filters.length > 0) {
                        for (const filter of task.filters) {
                            const fieldValue = data[filter.name];
                            if (fieldValue === undefined || fieldValue === null) {
                                passesAllFilters = false;
                                break;
                            }

                            const numericFieldValue = parseFloat(String(fieldValue).replace(/[^0-9.-]+/g, ""));
                            const numericFilterValue = typeof filter.value === 'number' ? filter.value : parseFloat(String(filter.value).replace(/[^0-9.-]+/g, ""));

                            let conditionMet = false;
                            if (!isNaN(numericFieldValue) && !isNaN(numericFilterValue)) {
                                switch (filter.operator) {
                                    case 'eq': conditionMet = numericFieldValue === numericFilterValue; break;
                                    case 'neq': conditionMet = numericFieldValue !== numericFilterValue; break;
                                    case 'lt': conditionMet = numericFieldValue < numericFilterValue; break;
                                    case 'lte': conditionMet = numericFieldValue <= numericFilterValue; break;
                                    case 'gt': conditionMet = numericFieldValue > numericFilterValue; break;
                                    case 'gte': conditionMet = numericFieldValue >= numericFilterValue; break;
                                    case 'contains': conditionMet = String(fieldValue).includes(String(filter.value)); break;
                                }
                            } else {
                                // String contains check
                                if (filter.operator === 'contains' && String(fieldValue).includes(String(filter.value))) {
                                    conditionMet = true;
                                }
                            }

                            if (!conditionMet) {
                                passesAllFilters = false;
                                break;
                            }
                        }
                    }

                    // 3. If all filters passed, add to results
                    if (passesAllFilters && Object.keys(data).length > 0) {
                        results.push(data);
                    }
                });
                return results;
            }, task);
            scrapedData.push(...extractedData);
        };

        if (task.paginationStrategy === 'INFINITE_SCROLL') {
            let previousHeight;
            for (let i = 0; i < (task.maxPages || 1); i++) {
                await extractData();
                const newHeight = await page.evaluate('document.body.scrollHeight');
                await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
                await page.waitForTimeout(2000); // Wait for content to load
                if (newHeight === previousHeight) {
                    break;
                }
                previousHeight = newHeight;
            }
        } else if (task.paginationStrategy === 'ALL_PAGES') {
            for (let i = 0; i < (task.maxPages || 1); i++) {
                await extractData();
                // This placeholder should be replaced by a selector from the task
                const nextButton = await page.$(task.nextButtonSelector || 'a:has-text("Next")'); 
                if (nextButton) {
                    await nextButton.click();
                    await page.waitForLoadState('domcontentloaded');
                    await page.waitForTimeout(2000);
                } else {
                    break;
                }
            }
        } else {
            await extractData();
        }

        return scrapedData.map(data => ({
            data,
            source_url: url,
            agent_used: 'Bright Data',
            timestamp: new Date().toISOString(),
        }));

    } catch (error) {
        console.error(`Bright Data scrape failed for ${url}:`, error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

export async function getHtmlWithBrightData(url: string): Promise<string> {
    console.log(`Fetching HTML with Bright Data for ${url}`);
    let browser;
    try {
        browser = await chromium.connect(SBR_WS_ENDPOINT);
        const page = await browser.newPage();
        await page.goto(url, { timeout: 120000 });
        const content = await page.content();
        if (!content) {
            throw new Error("Bright Data failed to fetch HTML.");
        }
        return content;
    } catch (error) {
        console.error(`Bright Data HTML fetch failed for ${url}:`, error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}
