import { logger } from '../../config/logger.js';

export class DataGovMarketProvider {
  static getBaseUrl() {
    return 'https://api.data.gov.in';
  }

  static getApiKey() {
    return process.env.DATAGOV_API_KEY;
  }

  static getResourceId() {
    // Current Daily Price of Various Commodities from Various Markets (Mandi)
    return '9ef84268-d588-465a-a308-a864a43d0070';
  }

  /**
   * Helper to perform standard fetch with timeout (5s) and retries (2x).
   */
  static async request(url, timeoutMs = 5000, maxRetries = 2) {
    let attempt = 0;
    let delay = 500;

    while (attempt <= maxRetries) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const start = Date.now();
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        const latency = Date.now() - start;
        logger.info(`[MarketClient] HTTP request to ${url.split('?')[0]} completed in ${latency}ms`);

        if (response.status === 404) {
          throw new Error('Data.gov.in Resource Not Found (404)');
        }

        if (response.status === 401) {
          throw new Error('Data.gov.in API Key is Unauthorized (401)');
        }

        if (response.status === 429) {
          throw new Error('Data.gov.in API Rate Limit exceeded (429)');
        }

        if (!response.ok) {
          throw new Error(`Data.gov.in API error: Status ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        clearTimeout(timeoutId);
        attempt++;
        const errMsg = error.name === 'AbortError' ? 'Request Timeout' : error.message;
        logger.warn(`[MarketClient] Request failed (attempt ${attempt}/${maxRetries + 1}). Error: ${errMsg}`);

        if (attempt <= maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2;
        } else {
          throw new Error(errMsg);
        }
      }
    }
  }

  /**
   * Fetch current prices from data.gov.in.
   */
  static async fetchPrices({ commodity, state, district, limit = 50 }) {
    const key = this.getApiKey();
    if (!key) {
      throw new Error('DATAGOV_API_KEY environment variable is not defined.');
    }

    const resource = this.getResourceId();
    let url = `${this.getBaseUrl()}/resource/${resource}?api-key=${key}&format=json&limit=${limit}`;

    if (state) {
      url += `&filters[state]=${encodeURIComponent(state)}`;
    }
    if (district) {
      url += `&filters[district]=${encodeURIComponent(district)}`;
    }
    if (commodity) {
      // Clean query value (e.g. "Wheat" -> "Wheat", and matches capitalization if needed)
      url += `&filters[commodity]=${encodeURIComponent(commodity)}`;
    }

    return this.request(url);
  }
}

export class MarketClient {
  static getProvider() {
    // Abstraction allowing changing provider later
    return DataGovMarketProvider;
  }

  static async fetchCurrentPrices(commodity, state, district) {
    const provider = this.getProvider();
    return provider.fetchPrices({ commodity, state, district });
  }
}

export default MarketClient;
