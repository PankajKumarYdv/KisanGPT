import { MarketClient } from './MarketClient.js';
import { MarketMapper } from './MarketMapper.js';
import { MarketCache } from './MarketCache.js';
import { MarketValidator } from './MarketValidator.js';
import { MarketHistory } from '../../models/MarketHistory.js';
import marketConfig from '../../agents/config/market.config.js';
import { logger } from '../../config/logger.js';

export class MarketService {
  /**
   * Fetches current market prices for a crop at a location. Checks cache first.
   */
  static async getMarketPrice(crop, state, district) {
    const normCrop = (crop || 'wheat').toLowerCase().trim();
    const normState = (state || '').trim();
    const normDistrict = (district || '').toLowerCase().trim();

    const cacheKey = `current:${normCrop}:${normState.replace(/\s+/g, '_')}:${normDistrict.replace(/\s+/g, '_')}`;
    const start = Date.now();

    // 1. Try cache
    const cached = await MarketCache.get(cacheKey);
    if (cached) {
      logger.info(`[MarketService] Cache HIT for key: ${cacheKey}`);
      return cached;
    }

    // 2. Fetch live data from API
    logger.info(`[MarketService] Cache MISS. Fetching live market prices for crop="${normCrop}", state="${normState}", district="${normDistrict}"`);
    try {
      const rawData = await MarketClient.fetchCurrentPrices(normCrop, normState, normDistrict);
      
      let records = [];
      if (rawData && Array.isArray(rawData.records)) {
        records = rawData.records;
      }

      const mappedRecords = MarketMapper.mapRecords(records);
      MarketValidator.validateMappedRecords(mappedRecords);

      // Find the specific record matching our crop/district/state, or get the best/most recent one, or average them.
      let result = null;
      if (mappedRecords.length > 0) {
        // Try exact match on district
        result = mappedRecords.find(r => r.district === normDistrict);
        if (!result) {
          // Fall back to state match
          result = mappedRecords[0];
        }
      }

      if (result) {
        // Log/Save to history database in the background to build up timeseries
        this.saveToHistory(mappedRecords).catch(err => {
          logger.warn(`[MarketService] Background saveToHistory failed: ${err.message}`);
        });

        // Add production cost from config for margin calculations
        const configCrop = marketConfig.mandiDatabase[normCrop] || marketConfig.mandiDatabase.default;
        result.productionCost = configCrop.productionCost;

        // Save to cache (6 hours)
        await MarketCache.set(cacheKey, result, 6);

        const latency = Date.now() - start;
        logger.info(`[MarketService] Live fetch succeeded and cached in ${latency}ms`);
        return result;
      } else {
        logger.warn(`[MarketService] No records returned for crop="${normCrop}", location="${normDistrict}, ${normState}". Falling back to static config.`);
      }
    } catch (err) {
      logger.warn(`[MarketService] Live fetch failed: ${err.message}. Resorting to static configurations.`);
    }

    // 3. Fallback to static config-based profiles
    const configData = marketConfig.mandiDatabase[normCrop] || marketConfig.mandiDatabase.default;
    const fallbackMapped = {
      crop: normCrop,
      mandi: configData.bestMarket.split(',')[0],
      district: normDistrict || 'local',
      state: normState || 'Punjab',
      arrivalQuantity: 120,
      minimumPrice: Math.round(configData.currentPrice * 0.95),
      maximumPrice: Math.round(configData.currentPrice * 1.05),
      modalPrice: configData.currentPrice,
      productionCost: configData.productionCost,
      lastUpdated: new Date().toISOString()
    };

    // Save to cache briefly (5 minutes) so transient network errors don't hammer the client
    await MarketCache.set(cacheKey, fallbackMapped, 0.08);
    return fallbackMapped;
  }

  /**
   * Retrieves historical prices list for a crop in a district.
   */
  static async getHistoricalPrices(crop, district, limit = 10) {
    const normCrop = (crop || 'wheat').toLowerCase().trim();
    const normDistrict = (district || '').toLowerCase().trim();

    const cacheKey = `history:${normCrop}:${normDistrict.replace(/\s+/g, '_')}:${limit}`;
    
    // 1. Try cache
    const cached = await MarketCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // 2. Query MongoDB MarketHistory collection
    try {
      const records = await MarketHistory.find({
        crop: normCrop,
        district: normDistrict
      })
      .sort({ priceDate: -1 })
      .limit(limit);

      if (records && records.length > 0) {
        await MarketCache.set(cacheKey, records, 24); // Cache for 24 hours
        return records;
      }
    } catch (err) {
      logger.error(`[MarketService] Failed to query historical price DB: ${err.message}`);
    }

    // 3. Generate mock historical time-series if DB is empty to ensure frontend charts load correctly
    logger.info(`[MarketService] Generating mock historical time-series for crop="${normCrop}", district="${normDistrict}"`);
    const configData = marketConfig.mandiDatabase[normCrop] || marketConfig.mandiDatabase.default;
    const mockHistory = [];
    const basePrice = configData.currentPrice;

    for (let i = 0; i < limit; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i * 2); // every 2 days
      
      // Calculate random price variation depending on trend
      let variation = 0;
      if (configData.trend === 'Upward') {
        variation = -i * (Math.random() * 25 + 10); // prices increase towards present
      } else if (configData.trend === 'Downward') {
        variation = i * (Math.random() * 25 + 10);  // prices decrease towards present
      } else {
        variation = (Math.random() - 0.5) * 50;     // stable fluctuation
      }

      const marketPrice = Math.max(100, Math.round(basePrice + variation));

      mockHistory.push({
        crop: normCrop,
        mandi: configData.bestMarket.split(',')[0],
        district: normDistrict || 'local',
        state: 'Punjab',
        marketPrice,
        minimumPrice: Math.round(marketPrice * 0.95),
        maximumPrice: Math.round(marketPrice * 1.05),
        arrivalQuantity: Math.round(100 + Math.random() * 200),
        priceDate: date
      });
    }

    await MarketCache.set(cacheKey, mockHistory, 24); // Cache for 24 hours
    return mockHistory;
  }

  /**
   * Helper to write raw mapped records to history collection.
   */
  static async saveToHistory(records) {
    if (!Array.isArray(records)) return;
    for (const record of records) {
      await MarketHistory.findOneAndUpdate(
        {
          crop: record.crop,
          mandi: record.mandi,
          district: record.district,
          priceDate: new Date(record.lastUpdated)
        },
        {
          state: record.state,
          marketPrice: record.modalPrice,
          minimumPrice: record.minimumPrice,
          maximumPrice: record.maximumPrice,
          arrivalQuantity: record.arrivalQuantity
        },
        { upsert: true, new: true }
      );
    }
  }
}

export default MarketService;
