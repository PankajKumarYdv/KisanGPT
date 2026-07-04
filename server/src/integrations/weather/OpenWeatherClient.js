import { logger } from '../../config/logger.js';

export class OpenWeatherClient {
  static getApiKey() {
    return process.env.OPENWEATHERMAP_API_KEY;
  }

  static getBaseUrl() {
    return 'https://api.openweathermap.org';
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
        logger.info(`[OpenWeatherClient] HTTP request to ${url.split('?')[0]} completed in ${latency}ms`);

        if (response.status === 404) {
          throw new Error('OpenWeather API Resource Not Found (404)');
        }

        if (response.status === 401) {
          throw new Error('OpenWeather API Key is Unauthorized (401)');
        }

        if (response.status === 429) {
          // Rate limit hit
          throw new Error('OpenWeather API Rate Limit exceeded (429)');
        }

        if (!response.ok) {
          throw new Error(`OpenWeather API error: Status ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        clearTimeout(timeoutId);
        attempt++;
        const errMsg = error.name === 'AbortError' ? 'Request Timeout' : error.message;
        logger.warn(`[OpenWeatherClient] Request failed (attempt ${attempt}/${maxRetries + 1}). Error: ${errMsg}`);

        if (attempt <= maxRetries) {
          // Exponential backoff
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2;
        } else {
          throw new Error(errMsg);
        }
      }
    }
  }

  /**
   * Geocoding: Direct City/District to Coordinates.
   */
  static async geocodeCity(cityQuery) {
    const key = this.getApiKey();
    const query = encodeURIComponent(`${cityQuery},IN`);
    const url = `${this.getBaseUrl()}/geo/1.0/direct?q=${query}&limit=1&appid=${key}`;
    try {
      const data = await this.request(url);
      if (Array.isArray(data) && data.length > 0) {
        return {
          latitude: data[0].lat,
          longitude: data[0].lon,
          name: data[0].name,
          state: data[0].state
        };
      }
      return null;
    } catch (error) {
      logger.error(`[OpenWeatherClient] Geocoding failed for "${cityQuery}": ${error.message}`);
      throw error;
    }
  }

  /**
   * Fetch current weather.
   */
  static async fetchCurrentWeather(lat, lon) {
    const key = this.getApiKey();
    const url = `${this.getBaseUrl()}/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${key}`;
    return this.request(url);
  }

  /**
   * Fetch 5-Day / 3-Hour Forecast.
   */
  static async fetchForecast(lat, lon) {
    const key = this.getApiKey();
    const url = `${this.getBaseUrl()}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${key}`;
    return this.request(url);
  }

  /**
   * Fetch Air Pollution details.
   */
  static async fetchAirPollution(lat, lon) {
    const key = this.getApiKey();
    const url = `${this.getBaseUrl()}/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${key}`;
    try {
      return await this.request(url);
    } catch (err) {
      // Return null or empty structure on failure since air pollution is optional
      logger.warn(`[OpenWeatherClient] Air pollution fetch failed: ${err.message}`);
      return null;
    }
  }
}
export default OpenWeatherClient;
