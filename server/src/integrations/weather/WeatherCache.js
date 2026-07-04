import { WeatherCache as WeatherCacheModel } from '../../models/WeatherCache.js';
import { logger } from '../../config/logger.js';

// In-memory fallback store
const memoryCache = new Map();

export class WeatherCache {
  /**
   * Helper to round coordinate resolution to 2 decimal places (~1.1km).
   */
  static roundCoord(val) {
    if (val === undefined || val === null || isNaN(val)) return 0;
    return parseFloat(val.toFixed(2));
  }

  /**
   * Retrieves weather block for coordinates.
   */
  static async get(lat, lon) {
    const rLat = this.roundCoord(lat);
    const rLon = this.roundCoord(lon);
    const key = `${rLat}:${rLon}`;

    // 1. In-memory check
    const memEntry = memoryCache.get(key);
    if (memEntry) {
      if (Date.now() < memEntry.expiresAt) {
        logger.info(`[WeatherCache] In-memory cache HIT for ${key}`);
        return memEntry.data;
      } else {
        memoryCache.delete(key);
      }
    }

    // 2. MongoDB check
    try {
      const cached = await WeatherCacheModel.findOne({ latitude: rLat, longitude: rLon });
      if (cached) {
        if (new Date() < cached.expiresAt) {
          logger.info(`[WeatherCache] MongoDB cache HIT for ${key}`);
          // Sync to memory
          memoryCache.set(key, {
            data: cached.weatherData,
            expiresAt: cached.expiresAt.getTime()
          });
          return cached.weatherData;
        } else {
          // Manual clean if TTL index hasn't run yet
          await WeatherCacheModel.deleteOne({ _id: cached._id });
        }
      }
    } catch (err) {
      logger.warn(`[WeatherCache] MongoDB read failed: ${err.message}. Relying on memory cache.`);
    }

    logger.info(`[WeatherCache] Cache MISS for ${key}`);
    return null;
  }

  /**
   * Caches weather data block.
   */
  static async set(lat, lon, weatherData, ttlMinutes = 15) {
    const rLat = this.roundCoord(lat);
    const rLon = this.roundCoord(lon);
    const key = `${rLat}:${rLon}`;
    
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    // Write to memory cache
    memoryCache.set(key, {
      data: weatherData,
      expiresAt: expiresAt.getTime()
    });

    // Write to MongoDB
    try {
      await WeatherCacheModel.findOneAndUpdate(
        { latitude: rLat, longitude: rLon },
        { weatherData, expiresAt },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      logger.info(`[WeatherCache] Cache written successfully for ${key} (TTL ${ttlMinutes}m)`);
    } catch (err) {
      logger.error(`[WeatherCache] MongoDB write failed: ${err.message}`);
    }
  }

  static clearAll() {
    memoryCache.clear();
  }
}
export default WeatherCache;
