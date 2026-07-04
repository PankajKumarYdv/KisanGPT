import { OpenWeatherClient } from './OpenWeatherClient.js';
import { WeatherMapper } from './WeatherMapper.js';
import { WeatherCache } from './WeatherCache.js';
import { WeatherValidator } from './WeatherValidator.js';
import { logger } from '../../config/logger.js';

// Pre-defined fallback coordinates for Indian states
const stateFallbacks = {
  punjab: { lat: 30.9, lon: 75.85 },
  rajasthan: { lat: 26.2, lon: 73.0 },
  kerala: { lat: 11.6, lon: 76.1 },
  maharashtra: { lat: 19.99, lon: 73.78 },
  gujarat: { lat: 22.56, lon: 72.93 },
  karnataka: { lat: 12.97, lon: 77.59 },
  haryana: { lat: 29.68, lon: 76.99 },
  'uttar pradesh': { lat: 26.85, lon: 80.94 },
  bihar: { lat: 25.09, lon: 85.31 }
};

export class WeatherService {
  /**
   * Fetches weather information using coordinates. Checks cache first.
   */
  static async getWeatherByCoordinates(lat, lon) {
    WeatherValidator.validateCoordinates(lat, lon);
    const start = Date.now();

    // 1. Try Cache
    const cachedData = await WeatherCache.get(lat, lon);
    if (cachedData) {
      const cacheLatency = Date.now() - start;
      logger.info(`[WeatherService] Cache HIT for coords: (${lat}, ${lon}). Completed in ${cacheLatency}ms`);
      return cachedData;
    }

    // 2. Fetch Live Weather Data from OpenWeatherMap
    logger.info(`[WeatherService] Cache MISS. Fetching live data for (${lat}, ${lon})`);
    try {
      const [currentRaw, forecastRaw, pollutionRaw] = await Promise.all([
        OpenWeatherClient.fetchCurrentWeather(lat, lon),
        OpenWeatherClient.fetchForecast(lat, lon),
        OpenWeatherClient.fetchAirPollution(lat, lon)
      ]);

      // 3. Map Data
      const mapped = WeatherMapper.mapWeatherData(currentRaw, forecastRaw, pollutionRaw);
      
      // 4. Validate
      WeatherValidator.validateMappedWeather(mapped);

      // 5. Save in Cache
      await WeatherCache.set(lat, lon, mapped, 15); // cache for 15 minutes

      const totalLatency = Date.now() - start;
      logger.info(`[WeatherService] Live weather fetched and cached in ${totalLatency}ms`);
      return mapped;
    } catch (error) {
      logger.error(`[WeatherService] Live fetch failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Resolves state/district to coordinates and fetches weather data.
   */
  static async getWeatherByLocation(state, district) {
    const locQuery = district ? `${district}, ${state}` : state;
    logger.info(`[WeatherService] Resolving coordinates for: "${locQuery}"`);

    let lat = null;
    let lon = null;

    // 1. Attempt geocoding lookup
    try {
      const geo = await OpenWeatherClient.geocodeCity(locQuery);
      if (geo) {
        lat = geo.latitude;
        lon = geo.longitude;
        logger.info(`[WeatherService] Geocoding resolved "${locQuery}" to (${lat}, ${lon})`);
      }
    } catch (err) {
      logger.warn(`[WeatherService] Geocoding failed for "${locQuery}": ${err.message}. Resorting to static fallbacks.`);
    }

    // 2. Fall back to static coordinates if geocoding yields nothing
    if (lat === null || lon === null) {
      const stateKey = (state || '').toLowerCase().trim();
      const fallback = stateFallbacks[stateKey] || { lat: 28.61, lon: 77.2 }; // Default to New Delhi
      lat = fallback.lat;
      lon = fallback.lon;
      logger.warn(`[WeatherService] Using static fallback coordinates for "${state}": (${lat}, ${lon})`);
    }

    return this.getWeatherByCoordinates(lat, lon);
  }
}
export default WeatherService;
