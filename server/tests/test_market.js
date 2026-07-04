import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB, closeDB } from '../src/config/db.js';
import { MarketService } from '../src/integrations/market/MarketService.js';
import { MarketCache } from '../src/integrations/market/MarketCache.js';
import { MarketValidator } from '../src/integrations/market/MarketValidator.js';
import { OpenWeatherClient } from '../src/integrations/weather/OpenWeatherClient.js';
import { MarketClient } from '../src/integrations/market/MarketClient.js';
import { MarketAgent } from '../src/agents/agents/market/MarketAgent.js';
import { AgentContext } from '../src/agents/shared/AgentContext.js';
import { MarketCache as MarketCacheModel } from '../src/models/MarketCache.js';
import { MarketHistory } from '../src/models/MarketHistory.js';

dotenv.config();

// Stub global fetch
const originalFetch = global.fetch;
let mockFetchConfig = {
  modalPrice: 2200,
  minPrice: 2100,
  maxPrice: 2300,
  arrivals: 150,
  shouldFail: false,
  failStatus: 500,
  failMessage: 'Internal Server Error'
};

function setupMockFetch() {
  global.fetch = async (url, options) => {
    if (url && url.includes('api.data.gov.in')) {
      if (mockFetchConfig.shouldFail) {
        return {
          ok: false,
          status: mockFetchConfig.failStatus,
          statusText: mockFetchConfig.failMessage,
          json: async () => ({ message: mockFetchConfig.failMessage })
        };
      }

      let state = 'Punjab';
      const stateMatch = url.match(/filters\[state\]=([^&]+)/);
      if (stateMatch) {
        state = decodeURIComponent(stateMatch[1]);
      }

      let district = 'Amritsar';
      const distMatch = url.match(/filters\[district\]=([^&]+)/);
      if (distMatch) {
        district = decodeURIComponent(distMatch[1]);
      }

      let commodity = 'Wheat';
      const commMatch = url.match(/filters\[commodity\]=([^&]+)/);
      if (commMatch) {
        commodity = decodeURIComponent(commMatch[1]);
      }

      return {
        ok: true,
        status: 200,
        json: async () => ({
          records: [
            {
              state,
              district,
              market: `${district} Mandi`,
              commodity,
              variety: 'Dara',
              arrival_date: new Date().toISOString().split('T')[0],
              min_price: mockFetchConfig.minPrice,
              max_price: mockFetchConfig.maxPrice,
              modal_price: mockFetchConfig.modalPrice,
              arrival_quantity: mockFetchConfig.arrivals
            }
          ]
        })
      };
    }

    return originalFetch(url, options);
  };
}

function restoreFetch() {
  global.fetch = originalFetch;
}

async function runAllTests() {
  console.log('\n==================================================');
  console.log('STARTING MARKET INTELLIGENCE INTEGRATION TEST SUITE');
  console.log('==================================================\n');

  // Setup DB connection
  await connectDB();

  // Clear existing market cache and history records related to tests
  await MarketCacheModel.deleteMany({});
  await MarketHistory.deleteMany({});
  MarketCache.clearAll();
  
  // Set up mock fetch for controlled tests
  setupMockFetch();

  try {
    // ----------------------------------------------------
    // TEST 1: Cache Miss / Live Fetch & Mapped Validation
    // ----------------------------------------------------
    console.log('--- TEST 1: Cache Miss / Live Fetch & Mapper Validation ---');
    mockFetchConfig.modalPrice = 2500;
    mockFetchConfig.minPrice = 2400;
    mockFetchConfig.maxPrice = 2600;
    mockFetchConfig.arrivals = 200;

    const priceData = await MarketService.getMarketPrice('Wheat', 'Punjab', 'Amritsar');
    if (!priceData || priceData.modalPrice !== 2500 || priceData.minimumPrice !== 2400) {
      throw new Error(`Mapper failed to parse raw attributes correctly: ${JSON.stringify(priceData)}`);
    }
    console.log('✓ Successfully fetched and mapped live mandi prices:', priceData);

    MarketValidator.validateMappedRecord(priceData);
    console.log('✓ Mapped record validated successfully.');

    // Verify background history DB upsert
    // Sleep briefly to allow background promise to complete
    await new Promise(resolve => setTimeout(resolve, 200));
    const histRecord = await MarketHistory.findOne({ crop: 'wheat', district: 'amritsar' });
    if (!histRecord || histRecord.marketPrice !== 2500) {
      throw new Error(`Historical price was not recorded in MongoDB: ${JSON.stringify(histRecord)}`);
    }
    console.log('✓ Verified live records are persisted to MarketHistory collection.');

    // ----------------------------------------------------
    // TEST 2: Cache Hit Loop
    // ----------------------------------------------------
    console.log('\n--- TEST 2: Cache Hit Loop ---');
    // Clear memory cache but leave MongoDB cache
    MarketCache.clearAll();

    const priceDataCached = await MarketService.getMarketPrice('Wheat', 'Punjab', 'Amritsar');
    if (!priceDataCached || priceDataCached.modalPrice !== 2500) {
      throw new Error(`Cache lookup failed to return stored modalPrice: ${JSON.stringify(priceDataCached)}`);
    }
    console.log('✓ Cache hit verified successfully from MongoDB.');

    // ----------------------------------------------------
    // TEST 3: Market Agent rule-based fallback and fallback mapping
    // ----------------------------------------------------
    console.log('\n--- TEST 3: Fallback on Client Failures ---');
    mockFetchConfig.shouldFail = true;
    MarketCache.clearAll();
    await MarketCacheModel.deleteMany({});

    const agent = new MarketAgent();
    const context = new AgentContext({
      farmer: {
        cropType: 'Wheat',
        state: 'Punjab',
        district: 'Amritsar'
      }
    });

    console.log('Executing agent under complete network failure conditions...');
    const fallbackResult = await agent.execute(context);
    if (fallbackResult.status !== 'success') {
      throw new Error(`Agent execution failed completely instead of falling back: ${JSON.stringify(fallbackResult)}`);
    }

    const fallbackData = fallbackResult.data;
    if (!fallbackData || fallbackData.marketScore === undefined || fallbackData.priceScore === undefined) {
      throw new Error(`Fallback data structure lacks required compatibility fields: ${JSON.stringify(fallbackData)}`);
    }
    console.log('✓ Fallback executed successfully with fully compatible schema properties.');
    console.log('Fallback data structure sample:', {
      marketScore: fallbackData.marketScore,
      priceScore: fallbackData.priceScore,
      trend: fallbackData.trend,
      recommendation: fallbackData.recommendation,
      currentPrice: fallbackData.currentPrice,
      expectedPrice: fallbackData.expectedPrice,
      sellNow: fallbackData.sellNow,
      hold: fallbackData.hold
    });

    // ----------------------------------------------------
    // TEST 4: Pricing Scenarios (Price Increase vs Price Crash)
    // ----------------------------------------------------
    console.log('\n--- TEST 4: Price Trends & Advisory Scenarios ---');
    mockFetchConfig.shouldFail = false;

    // Scenario A: Price Increase (Wheat at 2500, production cost 1500)
    console.log('Scenario A: Sizable Profit Margin (Wheat modalPrice = 2500)');
    mockFetchConfig.modalPrice = 2500;
    mockFetchConfig.minPrice = 2400;
    mockFetchConfig.maxPrice = 2600;
    
    MarketCache.clearAll();
    await MarketCacheModel.deleteMany({});
    
    const liveMarketA = {
      modalPrice: 2500,
      minimumPrice: 2400,
      maximumPrice: 2600,
      arrivalQuantity: 200,
      mandi: 'Amritsar Mandi',
      district: 'amritsar',
      state: 'Punjab',
      productionCost: 1500,
      lastUpdated: new Date().toISOString()
    };

    // We execute the fallback deterministic runner to verify the threshold mappings
    const profitData = await agent._runDeterministic(context, liveMarketA);
    if (!profitData.hold || profitData.priceScore < 80) {
      throw new Error(`Expected high score and hold advisory for good profits, got: ${JSON.stringify(profitData)}`);
    }
    console.log(`✓ Trend A threshold classifications: priceScore=${profitData.priceScore}, hold=${profitData.hold}`);

    // Scenario B: Price Crash (Wheat at 1300, below production cost 1500)
    console.log('Scenario B: Poor Profit Margin / Price Crash (Wheat modalPrice = 1300)');
    mockFetchConfig.modalPrice = 1300;
    mockFetchConfig.minPrice = 1200;
    mockFetchConfig.maxPrice = 1400;

    MarketCache.clearAll();
    await MarketCacheModel.deleteMany({});

    const liveMarketB = {
      modalPrice: 1300,
      minimumPrice: 1200,
      maximumPrice: 1400,
      arrivalQuantity: 200,
      mandi: 'Amritsar Mandi',
      district: 'amritsar',
      state: 'Punjab',
      productionCost: 1500,
      lastUpdated: new Date().toISOString()
    };

    const crashData = await agent._runDeterministic(context, liveMarketB);
    if (!crashData.sellNow || crashData.priceScore > 20) {
      throw new Error(`Expected low score and sellNow advisory during price crash, got: ${JSON.stringify(crashData)}`);
    }
    console.log(`✓ Trend B threshold classifications: priceScore=${crashData.priceScore}, sellNow=${crashData.sellNow}`);

    // ----------------------------------------------------
    // TEST 5: Multiple Crops (Wheat vs Cotton)
    // ----------------------------------------------------
    console.log('\n--- TEST 5: Multiple Crops Support ---');
    mockFetchConfig.modalPrice = 7500;
    mockFetchConfig.minPrice = 7300;
    mockFetchConfig.maxPrice = 7700;

    MarketCache.clearAll();
    await MarketCacheModel.deleteMany({});

    const cottonContext = new AgentContext({
      farmer: {
        cropType: 'Cotton',
        state: 'Punjab',
        district: 'Bhatinda'
      }
    });

    const cottonPrice = await MarketService.getMarketPrice('Cotton', 'Punjab', 'Bhatinda');
    if (cottonPrice.crop !== 'cotton' || cottonPrice.modalPrice !== 7500) {
      throw new Error(`Multiple crop fetch failed: ${JSON.stringify(cottonPrice)}`);
    }
    console.log('✓ Cotton pricing mapped and parsed successfully.');

    const cottonResult = await agent.execute(cottonContext);
    if (cottonResult.status !== 'success' || cottonResult.data.priceScore === undefined) {
      throw new Error(`Cotton agent run failed: ${JSON.stringify(cottonResult)}`);
    }
    console.log('✓ Cotton agent advisory generated successfully.');

    console.log('\n==================================================');
    console.log('ALL MARKET INTEGRATION TESTS PASSED SUCCESSFULLY!');
    console.log('==================================================\n');
  } catch (error) {
    console.error('\n❌ TEST SUITE FAILED with error:', error);
    process.exit(1);
  } finally {
    restoreFetch();
    await closeDB();
  }
}

runAllTests();
