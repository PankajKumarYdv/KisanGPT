import { MarketCache as MarketCacheModel } from '../../models/MarketCache.js';
import { logger } from '../../config/logger.js';

// Standard in-memory store fallback
const memoryCache = new Map();

export class MarketCache {
  /**
   * Retrieves cache key. Checks memory cache and MongoDB. Supports Redis if globally configured.
   */
  static async get(key) {
    // 1. Redis check placeholder (runs if a global redisClient exists on process or global context)
    if (global.redisClient && typeof global.redisClient.get === 'function') {
      try {
        const val = await global.redisClient.get(key);
        if (val) {
          logger.info(`[MarketCache] Redis cache HIT for key: ${key}`);
          return JSON.parse(val);
        }
      } catch (err) {
        logger.warn(`[MarketCache] Redis read failed: ${err.message}`);
      }
    }

    // 2. In-memory cache check
    const memEntry = memoryCache.get(key);
    if (memEntry) {
      if (Date.now() < memEntry.expiresAt) {
        logger.info(`[MarketCache] In-memory cache HIT for key: ${key}`);
        return memEntry.data;
      } else {
        memoryCache.delete(key);
      }
    }

    // 3. MongoDB cache check
    try {
      const cached = await MarketCacheModel.findOne({ cacheKey: key });
      if (cached) {
        if (new Date() < cached.expiresAt) {
          logger.info(`[MarketCache] MongoDB cache HIT for key: ${key}`);
          // Sync to memory
          memoryCache.set(key, {
            data: cached.data,
            expiresAt: cached.expiresAt.getTime(),
          });
          return cached.data;
        } else {
          await MarketCacheModel.deleteOne({ _id: cached._id });
        }
      }
    } catch (err) {
      logger.warn(`[MarketCache] MongoDB read failed: ${err.message}. Relying on memory cache.`);
    }

    logger.info(`[MarketCache] Cache MISS for key: ${key}`);
    return null;
  }

  /**
   * Writes key to cache with TTL in hours.
   */
  static async set(key, data, ttlHours = 6) {
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

    // 1. Redis write if available
    if (global.redisClient && typeof global.redisClient.set === 'function') {
      try {
        const ttlSeconds = Math.round(ttlHours * 60 * 60);
        await global.redisClient.set(key, JSON.stringify(data), 'EX', ttlSeconds);
        logger.info(`[MarketCache] Redis cache written for key: ${key} (TTL ${ttlHours}h)`);
      } catch (err) {
        logger.warn(`[MarketCache] Redis write failed: ${err.message}`);
      }
    }

    // 2. In-memory cache write
    memoryCache.set(key, {
      data,
      expiresAt: expiresAt.getTime(),
    });

    // 3. MongoDB cache write
    try {
      await MarketCacheModel.findOneAndUpdate(
        { cacheKey: key },
        { data, expiresAt },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      logger.info(`[MarketCache] Cache written successfully for key: ${key} (TTL ${ttlHours}h)`);
    } catch (err) {
      logger.error(`[MarketCache] MongoDB write failed: ${err.message}`);
    }
  }

  static clearAll() {
    memoryCache.clear();
  }
}

export default MarketCache;
