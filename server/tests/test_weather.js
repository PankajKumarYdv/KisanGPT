import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB, closeDB } from '../src/config/db.js';
import { WeatherService } from '../src/integrations/weather/WeatherService.js';
import { WeatherCache } from '../src/integrations/weather/WeatherCache.js';
import { WeatherValidator } from '../src/integrations/weather/WeatherValidator.js';
import { OpenWeatherClient } from '../src/integrations/weather/OpenWeatherClient.js';
import { WeatherAgent } from '../src/agents/agents/weather/WeatherAgent.js';
import { AgentContext } from '../src/agents/shared/AgentContext.js';
import { Alert } from '../src/models/Alert.js';
import { WeatherCache as WeatherCacheModel } from '../src/models/WeatherCache.js';

dotenv.config();

// Stub global fetch
const originalFetch = global.fetch;
let mockFetchConfig = {
  currentTemp: 25,
  currentRain: 0,
  currentHumidity: 60,
  currentWind: 5,
  shouldFail: false,
  failStatus: 500,
  failMessage: 'Internal Server Error'
};

function setupMockFetch() {
  global.fetch = async (url, options) => {
    if (url && url.includes('api.openweathermap.org')) {
      if (mockFetchConfig.shouldFail) {
        return {
          ok: false,
          status: mockFetchConfig.failStatus,
          statusText: mockFetchConfig.failMessage,
          json: async () => ({ message: mockFetchConfig.failMessage })
        };
      }

      if (url.includes('/geo/1.0/direct')) {
        return {
          ok: true,
          status: 200,
          json: async () => [
            { lat: 26.2, lon: 73.0, name: 'Jodhpur', state: 'Rajasthan' }
          ]
        };
      }

      if (url.includes('/data/2.5/weather')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            main: {
              temp: mockFetchConfig.currentTemp,
              humidity: mockFetchConfig.currentHumidity,
              pressure: 1013
            },
            wind: { speed: mockFetchConfig.currentWind },
            visibility: 10000,
            weather: [{ main: 'Clear', description: 'clear sky' }],
            timezone: 19800,
            sys: { sunrise: 1719360000, sunset: 1719410000 },
            rain: mockFetchConfig.currentRain > 0 ? { '1h': mockFetchConfig.currentRain } : undefined
          })
        };
      }

      if (url.includes('/data/2.5/forecast')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            list: [
              {
                dt_txt: '2026-06-26 12:00:00',
                main: { temp: mockFetchConfig.currentTemp },
                weather: [{ main: 'Clear' }],
                rain: mockFetchConfig.currentRain > 0 ? { '3h': mockFetchConfig.currentRain } : undefined
              }
            ]
          })
        };
      }

      if (url.includes('/data/2.5/air_pollution')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            list: [{ main: { aqi: 2 } }]
          })
        };
      }
    }
    return originalFetch(url, options);
  };
}

function restoreFetch() {
  global.fetch = originalFetch;
}

async function runAllTests() {
  console.log('\n==================================================');
  console.log('STARTING WEATHER INTEGRATION TEST SUITE');
  console.log('==================================================\n');

  // Setup DB connection
  await connectDB();

  // Clear existing weather cache and alerts related to tests
  await WeatherCacheModel.deleteMany({});
  WeatherCache.clearAll();
  
  // Set up mock fetch for controlled tests
  setupMockFetch();

  try {
    // ----------------------------------------------------
    // TEST 1: Coordinates geocoding and mapping verification
    // ----------------------------------------------------
    console.log('--- TEST 1: Geocoding & Mapping Verification ---');
    mockFetchConfig.currentTemp = 32;
    mockFetchConfig.currentHumidity = 55;
    mockFetchConfig.currentRain = 0;
    mockFetchConfig.currentWind = 4;

    const geoResult = await OpenWeatherClient.geocodeCity('Jodhpur, Rajasthan');
    if (!geoResult || geoResult.latitude !== 26.2 || geoResult.longitude !== 73.0) {
      throw new Error(`Geocoding failed to return correct coordinates: ${JSON.stringify(geoResult)}`);
    }
    console.log('✓ Geocoding returned correct coordinates:', geoResult);

    const mapped = await WeatherService.getWeatherByLocation('Rajasthan', 'Jodhpur');
    if (mapped.temperature !== 32 || mapped.humidity !== 55 || mapped.windSpeed !== 4) {
      throw new Error(`Mapping failed. Expected temp=32, humidity=55, windSpeed=4, got: ${JSON.stringify(mapped)}`);
    }
    console.log('✓ Weather mapping mapped raw payload successfully.');

    // ----------------------------------------------------
    // TEST 2: Mapped JSON format validation
    // ----------------------------------------------------
    console.log('\n--- TEST 2: Mapped JSON Format Validation ---');
    WeatherValidator.validateMappedWeather(mapped);
    console.log('✓ Mapped weather structure passed validation checks.');

    // ----------------------------------------------------
    // TEST 3: Caching hit/miss loops (checks MongoDB save/load)
    // ----------------------------------------------------
    console.log('\n--- TEST 3: Caching Hit/Miss Loops ---');
    // Clear in-memory and DB cache first
    WeatherCache.clearAll();
    await WeatherCacheModel.deleteMany({});

    // Verify cache miss
    const cacheVal1 = await WeatherCache.get(26.2, 73.0);
    if (cacheVal1 !== null) {
      throw new Error('Cache should have returned null (cache miss) before setting.');
    }
    console.log('✓ Verified Cache MISS for coordinates (26.20, 73.00)');

    // Fetch through WeatherService (should set cache)
    const serviceVal = await WeatherService.getWeatherByCoordinates(26.2, 73.0);
    
    // Now verify Cache HIT
    // We clear in-memory cache to force a MongoDB lookup
    WeatherCache.clearAll();
    const cacheVal2 = await WeatherCache.get(26.2, 73.0);
    if (!cacheVal2 || cacheVal2.temperature !== 32) {
      throw new Error(`Cache HIT failed. Expected temp=32, got: ${JSON.stringify(cacheVal2)}`);
    }
    console.log('✓ Verified Cache HIT from MongoDB');

    // Rounding coordinates resolution check (~1.1km / 2 decimals)
    const slightlyDifferentVal = await WeatherCache.get(26.204, 73.002);
    if (!slightlyDifferentVal || slightlyDifferentVal.temperature !== 32) {
      throw new Error(`Resolution rounding cache lookup failed for (26.204, 73.002)`);
    }
    console.log('✓ Checked coordinate rounding resolution (26.204, 73.002 rounded to 26.20, 73.00)');

    // ----------------------------------------------------
    // TEST 4: Weather Alerts threshold creation
    // ----------------------------------------------------
    console.log('\n--- TEST 4: Weather Alerts Threshold Creation ---');
    
    const dummyFarmerId = new mongoose.Types.ObjectId();
    const weatherAgent = new WeatherAgent();

    // Clear alerts for this dummy farmer
    await Alert.deleteMany({ farmerId: dummyFarmerId });

    // Test Scenario: Heat Wave (Jodhpur, temp > 40)
    console.log('Scenario A: Heat Wave Alert Verification');
    mockFetchConfig.currentTemp = 42;
    mockFetchConfig.currentHumidity = 30;
    mockFetchConfig.currentRain = 0;
    mockFetchConfig.currentWind = 5;
    
    // Clear cache to force live fetch (which uses mockFetchConfig values)
    WeatherCache.clearAll();
    await WeatherCacheModel.deleteMany({});

    let context = new AgentContext({
      farmer: {
        _id: dummyFarmerId,
        state: 'Rajasthan',
        district: 'Jodhpur'
      }
    });

    await weatherAgent.execute(context);
    let heatAlert = await Alert.findOne({ farmerId: dummyFarmerId, title: 'Extreme Heat Alert' });
    if (!heatAlert) {
      throw new Error('Extreme Heat Alert was not created in the database.');
    }
    console.log('✓ Extreme Heat Alert verified:', heatAlert.description);

    // Test Scenario: Heavy Rain (Wayanad, rain > 50)
    console.log('Scenario B: Heavy Rain Alert Verification');
    mockFetchConfig.currentTemp = 24;
    mockFetchConfig.currentHumidity = 95;
    mockFetchConfig.currentRain = 55; // 55mm > 50mm
    mockFetchConfig.currentWind = 6;

    WeatherCache.clearAll();
    await WeatherCacheModel.deleteMany({});

    context = new AgentContext({
      farmer: {
        _id: dummyFarmerId,
        state: 'Kerala',
        district: 'Wayanad'
      }
    });

    await weatherAgent.execute(context);
    let rainAlert = await Alert.findOne({ farmerId: dummyFarmerId, title: 'Heavy Rain Alert' });
    if (!rainAlert) {
      throw new Error('Heavy Rain Alert was not created in the database.');
    }
    console.log('✓ Heavy Rain Alert verified:', rainAlert.description);

    // Test Scenario: Storm/High Wind (Wind > 15)
    console.log('Scenario C: Storm Alert Verification');
    mockFetchConfig.currentTemp = 28;
    mockFetchConfig.currentHumidity = 80;
    mockFetchConfig.currentRain = 5;
    mockFetchConfig.currentWind = 18; // 18 m/s > 15 m/s

    WeatherCache.clearAll();
    await WeatherCacheModel.deleteMany({});

    context = new AgentContext({
      farmer: {
        _id: dummyFarmerId,
        state: 'Punjab',
        district: 'Amritsar'
      }
    });

    await weatherAgent.execute(context);
    let stormAlert = await Alert.findOne({ farmerId: dummyFarmerId, title: 'Storm Alert' });
    if (!stormAlert) {
      throw new Error('Storm Alert was not created in the database.');
    }
    console.log('✓ Storm Alert verified:', stormAlert.description);

    // Test Scenario: Cold Wave (Temp < 5)
    console.log('Scenario D: Cold Wave Alert Verification');
    mockFetchConfig.currentTemp = 3; // 3°C < 5°C
    mockFetchConfig.currentHumidity = 60;
    mockFetchConfig.currentRain = 0;
    mockFetchConfig.currentWind = 4;

    WeatherCache.clearAll();
    await WeatherCacheModel.deleteMany({});

    context = new AgentContext({
      farmer: {
        _id: dummyFarmerId,
        state: 'Haryana',
        district: 'Karnal'
      }
    });

    await weatherAgent.execute(context);
    let coldAlert = await Alert.findOne({ farmerId: dummyFarmerId, title: 'Cold Wave Alert' });
    if (!coldAlert) {
      throw new Error('Cold Wave Alert was not created in the database.');
    }
    console.log('✓ Cold Wave Alert verified:', coldAlert.description);

    // ----------------------------------------------------
    // TEST 5: Fallback behavior on invalid API key or network failure
    // ----------------------------------------------------
    console.log('\n--- TEST 5: Fallback Behavior ---');
    // Simulate connection failure (should cause live fetches to throw error,
    // which the agent catches and then gracefully falls back to rule-based profiles)
    mockFetchConfig.shouldFail = true;

    WeatherCache.clearAll();
    await WeatherCacheModel.deleteMany({});

    context = new AgentContext({
      farmer: {
        _id: dummyFarmerId,
        state: 'Punjab',
        district: 'Amritsar',
        cropType: 'Wheat'
      }
    });

    console.log('Running agent with failing weather API client...');
    const resultData = await weatherAgent.execute(context);
    if (!resultData || !resultData.data || typeof resultData.data.weatherScore !== 'number') {
      throw new Error(`Rule-based fallback failed to return valid data: ${JSON.stringify(resultData)}`);
    }
    console.log('✓ Agent successfully fell back to deterministic rules.');
    console.log('Fallback data sample:', {
      temperature: resultData.data.temperature,
      rainfall: resultData.data.rainfall,
      season: resultData.data.season,
      weatherRisk: resultData.data.weatherRisk,
      weatherSummary: resultData.data.weatherSummary
    });

    console.log('\n==================================================');
    console.log('ALL WEATHER INTEGRATION TESTS PASSED SUCCESSFULLY!');
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
