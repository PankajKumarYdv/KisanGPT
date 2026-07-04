import { Router } from 'express';
import mongoose from 'mongoose';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { WeatherService } from '../integrations/weather/WeatherService.js';
import { WeatherCache } from '../integrations/weather/WeatherCache.js';
import { WeatherValidator } from '../integrations/weather/WeatherValidator.js';
import { WeatherAgent } from '../agents/agents/weather/WeatherAgent.js';
import { AgentContext } from '../agents/shared/AgentContext.js';
import { Alert } from '../models/Alert.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { OpenWeatherClient } from '../integrations/weather/OpenWeatherClient.js';

const router = Router();

/**
 * @swagger
 * /weather/current:
 *   get:
 *     summary: Retrieve current mapped weather data for a coordinate pair
 *     tags: [Weather]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: lon
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Current weather retrieved successfully
 */
router.get(
  '/current',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const lat = parseFloat(req.query.lat);
    const lon = parseFloat(req.query.lon);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({
        success: false,
        message: 'Latitude (lat) and Longitude (lon) are required query parameters and must be valid numbers.',
      });
    }

    const data = await WeatherService.getWeatherByCoordinates(lat, lon);
    new ApiResponse(200, 'Current weather retrieved successfully', data).send(res);
  })
);

/**
 * @swagger
 * /weather/forecast:
 *   get:
 *     summary: Retrieve 5-day simplified forecast for a coordinate pair
 *     tags: [Weather]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: lon
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: 5-day weather forecast retrieved successfully
 */
router.get(
  '/forecast',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const lat = parseFloat(req.query.lat);
    const lon = parseFloat(req.query.lon);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({
        success: false,
        message: 'Latitude (lat) and Longitude (lon) are required query parameters and must be valid numbers.',
      });
    }

    const data = await WeatherService.getWeatherByCoordinates(lat, lon);
    new ApiResponse(200, '5-day weather forecast retrieved successfully', data.forecast || []).send(res);
  })
);

/**
 * @swagger
 * /weather/alerts:
 *   get:
 *     summary: Retrieve active weather alerts for a farmer
 *     tags: [Weather]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: farmerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Weather alerts retrieved successfully
 */
router.get(
  '/alerts',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { farmerId } = req.query;

    if (!farmerId) {
      return res.status(400).json({
        success: false,
        message: 'farmerId is a required query parameter.',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(farmerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid farmerId format.',
      });
    }

    const alerts = await Alert.find({
      farmerId: new mongoose.Types.ObjectId(farmerId),
      type: 'weather',
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    new ApiResponse(200, 'Weather alerts retrieved successfully', alerts).send(res);
  })
);

/**
 * @swagger
 * /weather/test:
 *   post:
 *     summary: Force executes weather fetching with mock inputs
 *     tags: [Weather]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/test',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { farmer = {}, mockData } = req.body;
    const state = farmer.state || 'Punjab';
    const district = farmer.district || 'Amritsar';
    const cropType = farmer.cropType || 'Wheat';
    const farmerId = farmer.id || farmer._id || new mongoose.Types.ObjectId().toString();

    // Resolve location to coords
    const locQuery = district ? `${district}, ${state}` : state;
    let lat = null;
    let lon = null;

    try {
      const geo = await OpenWeatherClient.geocodeCity(locQuery);
      if (geo) {
        lat = geo.latitude;
        lon = geo.longitude;
      }
    } catch (err) {
      // Ignore geocoding error during test setup and use static fallback
    }

    if (lat === null || lon === null) {
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
      const stateKey = state.toLowerCase().trim();
      const fallback = stateFallbacks[stateKey] || { lat: 28.61, lon: 77.2 };
      lat = fallback.lat;
      lon = fallback.lon;
    }

    if (mockData) {
      const temperature = typeof mockData.temperature === 'number' ? mockData.temperature : 25;
      const humidity = typeof mockData.humidity === 'number' ? mockData.humidity : 60;
      const rainfall = typeof mockData.rainfall === 'number' ? mockData.rainfall : 0;
      const windSpeed = typeof mockData.windSpeed === 'number' ? mockData.windSpeed : 2;

      // Compute risks matching WeatherMapper formula
      const heatStress = temperature > 35 ? Math.min(100, Math.round((temperature - 30) * 10)) : (temperature > 30 ? 30 : 0);
      const droughtRisk = (humidity < 40 && temperature > 30) ? Math.min(100, Math.round((40 - humidity) * 1.5 + (temperature - 30) * 2)) : 0;
      const floodRisk = rainfall > 40 ? Math.min(100, Math.round(rainfall * 1.8)) : (rainfall > 10 ? 30 : 0);
      const weatherScore = Math.round((floodRisk + droughtRisk + heatStress) / 3);

      let weatherRisk = 'Low';
      if (weatherScore >= 85) weatherRisk = 'Critical';
      else if (weatherScore >= 65) weatherRisk = 'High';
      else if (weatherScore >= 35) weatherRisk = 'Medium';

      const month = new Date().getUTCMonth();
      let season = 'Winter/Rabi';
      if (month >= 5 && month <= 8) season = 'Monsoon/Kharif';
      else if (month >= 3 && month <= 4) season = 'Zaid/Summer';

      const dummyMapped = {
        temperature,
        humidity,
        rainfall,
        windSpeed,
        pressure: mockData.pressure || 1013,
        visibility: mockData.visibility || 10000,
        weatherCondition: mockData.weatherCondition || 'Clear',
        weatherDescription: mockData.weatherDescription || 'clear sky',
        forecast: mockData.forecast || [
          { day: 'Monday', date: '2026-06-29', temperature, weatherCondition: 'Clear', rainfall }
        ],
        sunrise: '06:00 AM',
        sunset: '06:30 PM',
        airQualityIndex: mockData.airQualityIndex || 1,
        season,
        heatStress,
        droughtRisk,
        floodRisk,
        weatherScore,
        weatherRisk
      };

      // Seed cache
      await WeatherCache.set(lat, lon, dummyMapped, 5); // cache for 5 mins
    }

    // Run agent execution
    const agent = new WeatherAgent();
    const context = new AgentContext({
      farmer: {
        _id: farmerId,
        state,
        district,
        cropType
      }
    });

    const agentResult = await agent.execute(context);
    
    // Fetch any created alerts for this test
    const alerts = await Alert.find({ farmerId, type: 'weather' }).sort({ createdAt: -1 });

    new ApiResponse(200, 'Weather agent test executed successfully', {
      agentResult,
      alerts
    }).send(res);
  })
);

export default router;
