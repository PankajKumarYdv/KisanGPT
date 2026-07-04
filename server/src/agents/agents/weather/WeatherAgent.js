import { BaseAgent } from '../../base/BaseAgent.js';
import { RuleEngine } from '../../shared/RuleEngine.js';
import weatherConfig from '../../config/weather.config.js';
import { GeminiClient } from '../../../ai/GeminiClient.js';
import { PromptManager } from '../../../ai/PromptManager.js';
import WeatherSchema from '../../../ai/ResponseSchemas/Weather.schema.js';
import { logger } from '../../../config/logger.js';
import { WeatherService } from '../../../integrations/weather/WeatherService.js';
import { Alert } from '../../../models/Alert.js';

export class WeatherAgent extends BaseAgent {
  constructor() {
    super('WeatherAgent', 'Retrieves and analyzes current weather conditions and forecasts based on location.');
  }

  validateInput(context) {
    super.validateInput(context);
    const farmer = context.farmer;
    if (!farmer.state) {
      throw new Error('[WeatherAgent] Farmer state is required for weather modeling.');
    }
  }

  getConfidence(context) {
    return context.farmer.district ? 0.95 : 0.80;
  }

  async _run(context) {
    const farmer = context.farmer;
    const state = farmer.state;
    const district = farmer.district;
    const farmerId = farmer._id || farmer.id;

    try {
      // 1. Fetch live mapped weather parameters
      const liveWeather = await WeatherService.getWeatherByLocation(state, district);

      // 2. Dispatch Alerts if thresholds are exceeded
      if (liveWeather.rainfall > 50) {
        await this.dispatchAlert(farmerId, 'Heavy Rain Alert', `Expect heavy rainfall of ${liveWeather.rainfall}mm. Please ensure proper field drainage.`, 'High');
      }
      if (liveWeather.temperature > 40) {
        await this.dispatchAlert(farmerId, 'Extreme Heat Alert', `Extreme temperature of ${liveWeather.temperature}°C detected. Sowing activities should be avoided during peak sun hours.`, 'Critical');
      }
      if (liveWeather.windSpeed > 15) {
        await this.dispatchAlert(farmerId, 'Storm Alert', `High wind speed of ${liveWeather.windSpeed}m/s detected. Secure lightweight structures and post sifting tasks.`, 'High');
      }
      if (liveWeather.temperature < 5) {
        await this.dispatchAlert(farmerId, 'Cold Wave Alert', `Temperature has dropped to ${liveWeather.temperature}°C. Guard sensitive winter crops against frost.`, 'Medium');
      }

      // 3. Get prompt using live weather as profile
      const { systemInstruction, prompt } = PromptManager.getPrompt(this.name, context, liveWeather);

      const validateFn = (data) => {
        if (typeof data.weatherScore !== 'number' || data.weatherScore < 0 || data.weatherScore > 100) {
          throw new Error('weatherScore must be a number between 0 and 100.');
        }
        if (!data.weatherRisk) {
          throw new Error('Missing weatherRisk.');
        }
      };

      const result = await GeminiClient.generateWithCorrection(
        prompt,
        systemInstruction,
        WeatherSchema,
        validateFn
      );

      logger.info(`[WeatherAgent] Live weather analysis via Gemini succeeded. Model: ${result.model}`);
      return result.data;
    } catch (err) {
      logger.warn(`[WeatherAgent] Gemini weather call failed. Reverting to rule-based fallback. Error: ${err.message}`);
      return this._runDeterministic(context);
    }
  }

  async dispatchAlert(farmerId, title, description, severity = 'Medium') {
    try {
      if (!farmerId) return;
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry
      await Alert.create({
        farmerId,
        title,
        description,
        type: 'weather',
        severity,
        isRead: false,
        expiresAt
      });
      logger.info(`[WeatherAgent] Dispatched weather alert: "${title}" to DB for farmer ${farmerId}`);
    } catch (err) {
      logger.error(`[WeatherAgent] Failed to create alert: ${err.message}`);
    }
  }

  async _runDeterministic(context) {
    const state = (context.farmer.state || '').toLowerCase();
    const profile = weatherConfig.stateWeatherProfiles[state] || weatherConfig.stateWeatherProfiles.default;

    const { temperature, rainfall, humidity, windSpeed, season, floodRisk, droughtRisk, heatStress } = profile;

    // Evaluate rainfall suitability depending on crop requirements
    const cropType = (context.farmer.cropType || 'wheat').toLowerCase();
    let rainfallSuitability = 'Suitable';

    if (cropType === 'rice' || cropType === 'paddy') {
      if (rainfall < 1000) {
        rainfallSuitability = 'Deficient (Rice requires heavy rainfall or intensive irrigation)';
      }
    } else if (cropType === 'wheat') {
      if (rainfall > 1000) {
        rainfallSuitability = 'Excessive (Wheat requires drier weather during maturity)';
      }
    }

    // Weather Risk Score is calculated as an average of flood, drought, and heat stress risks
    const weatherScore = Math.round((floodRisk + droughtRisk + heatStress) / 3);

    // Risk classification using RuleEngine
    const weatherRisk = RuleEngine.classifyRisk(weatherScore, weatherConfig.weatherScoreThresholds);

    // Weather Summary construction
    let weatherSummary = `Currently in ${season} season with temperature ${temperature}°C, rainfall ${rainfall}mm, humidity ${humidity}%, and wind speed ${windSpeed}km/h. `;
    if (weatherRisk === 'Critical' || weatherRisk === 'High') {
      weatherSummary += `Severe climate hazards detected. Risks: Flood (${floodRisk}%), Drought (${droughtRisk}%), Heat (${heatStress}%).`;
    } else if (weatherRisk === 'Medium') {
      weatherSummary += `Moderate climatic conditions. Monitor local weather alerts.`;
    } else {
      weatherSummary += `Highly favorable weather conditions for general farming activities.`;
    }

    return {
      temperature,
      rainfall,
      humidity,
      windSpeed,
      season,
      floodRisk,
      droughtRisk,
      heatStress,
      rainfallSuitability,
      weatherScore,
      weatherRisk,
      weatherSummary
    };
  }
}
