import { LRUCache } from 'lru-cache';

const cache = new LRUCache<string, any>({
    max: 100, // maximum number of items in the cache
    ttl: 1000 * 60 * 5, // 5 minutes
});

export function getFromCache(key: string): any | undefined {
    return cache.get(key);
}

export function setInCache(key: string, value: any) {
    cache.set(key, value);
}

export async function retry<T>(
    fn: () => Promise<T>,
    retries = 3,
    delay = 1000,
    backoff = 2
): Promise<T> {
    let lastError: Error | undefined;
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;
            if (i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= backoff;
            }
        }
    }
    throw lastError;
}
