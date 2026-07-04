export class WeatherValidator {
  /**
   * Validates latitude and longitude values.
   */
  static validateCoordinates(lat, lon) {
    if (lat === undefined || lat === null || isNaN(lat)) {
      throw new Error('Latitude is required and must be a number');
    }
    if (lon === undefined || lon === null || isNaN(lon)) {
      throw new Error('Longitude is required and must be a number');
    }
    if (lat < -90 || lat > 90) {
      throw new Error('Latitude must be between -90 and 90');
    }
    if (lon < -180 || lon > 180) {
      throw new Error('Longitude must be between -180 and 180');
    }
    return true;
  }

  /**
   * Validates that mapped weather data conforms to structural specifications.
   */
  static validateMappedWeather(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Weather data is missing or not an object');
    }
    const requiredKeys = ['temperature', 'humidity', 'rainfall', 'windSpeed', 'weatherCondition', 'forecast'];
    for (const key of requiredKeys) {
      if (!(key in data)) {
        throw new Error(`Mapped weather data is missing required key "${key}"`);
      }
    }
    if (typeof data.temperature !== 'number') {
      throw new Error('temperature must be a number');
    }
    if (typeof data.humidity !== 'number') {
      throw new Error('humidity must be a number');
    }
    if (typeof data.rainfall !== 'number') {
      throw new Error('rainfall must be a number');
    }
    if (typeof data.windSpeed !== 'number') {
      throw new Error('windSpeed must be a number');
    }
    if (!Array.isArray(data.forecast)) {
      throw new Error('forecast must be an array');
    }
    return true;
  }
}
export default WeatherValidator;
