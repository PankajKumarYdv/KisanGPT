export class WeatherMapper {
  /**
   * Transforms raw current weather and forecast responses into a simplified KisanGPT structure.
   */
  static mapWeatherData(rawCurrent, rawForecast, rawPollution = null) {
    if (!rawCurrent) return null;

    const timezone = rawCurrent.timezone || 0;
    const sunrise = this.formatTime(rawCurrent.sys?.sunrise, timezone);
    const sunset = this.formatTime(rawCurrent.sys?.sunset, timezone);

    // Rainfall volume
    const rainfall = rawCurrent.rain?.['1h'] || rawCurrent.rain?.['3h'] || 0;

    // Air Quality Index (AQI from 1 to 5)
    const airQualityIndex = rawPollution?.list?.[0]?.main?.aqi || null;

    const forecast = this.mapForecast(rawForecast);

    // Derive season based on month
    const month = new Date().getUTCMonth();
    let season = 'Winter/Rabi';
    if (month >= 5 && month <= 8) {
      season = 'Monsoon/Kharif';
    } else if (month >= 3 && month <= 4) {
      season = 'Zaid/Summer';
    }

    const temp = rawCurrent.main?.temp || 0;
    const humidity = rawCurrent.main?.humidity || 50;

    // Derive risks
    const heatStress = temp > 35 ? Math.min(100, Math.round((temp - 30) * 10)) : (temp > 30 ? 30 : 0);
    const droughtRisk = (humidity < 40 && temp > 30) ? Math.min(100, Math.round((40 - humidity) * 1.5 + (temp - 30) * 2)) : 0;
    const floodRisk = rainfall > 40 ? Math.min(100, Math.round(rainfall * 1.8)) : (rainfall > 10 ? 30 : 0);

    const weatherScore = Math.round((floodRisk + droughtRisk + heatStress) / 3);

    let weatherRisk = 'Low';
    if (weatherScore >= 85) {
      weatherRisk = 'Critical';
    } else if (weatherScore >= 65) {
      weatherRisk = 'High';
    } else if (weatherScore >= 35) {
      weatherRisk = 'Medium';
    }

    return {
      temperature: parseFloat(temp.toFixed(1)) || 0,
      humidity,
      rainfall: parseFloat(rainfall.toFixed(1)),
      windSpeed: rawCurrent.wind?.speed || 0,
      pressure: rawCurrent.main?.pressure || 0,
      visibility: rawCurrent.visibility || 0,
      weatherCondition: rawCurrent.weather?.[0]?.main || 'Clear',
      weatherDescription: rawCurrent.weather?.[0]?.description || 'clear sky',
      forecast,
      sunrise,
      sunset,
      airQualityIndex,
      season,
      heatStress,
      droughtRisk,
      floodRisk,
      weatherScore,
      weatherRisk
    };
  }

  /**
   * Helper: Formats Unix timestamp to time string, adjusted by timezone offset.
   */
  static formatTime(unixTimestamp, timezoneOffsetSeconds) {
    if (!unixTimestamp) return '';
    // Adjust timestamp to target timezone (using UTC to print absolute formatted local time)
    const adjustedDate = new Date((unixTimestamp + timezoneOffsetSeconds) * 1000);
    return adjustedDate.toISOString().substr(11, 5) + ' ' + (adjustedDate.getUTCHours() >= 12 ? 'PM' : 'AM');
  }

  /**
   * Maps 3-hour forecast lists into simplified 5-day summaries.
   */
  static mapForecast(rawForecast) {
    if (!rawForecast || !Array.isArray(rawForecast.list)) return [];

    const daysMap = {};

    rawForecast.list.forEach(item => {
      const dateStr = item.dt_txt.split(' ')[0]; // yyyy-mm-dd
      if (!daysMap[dateStr]) {
        daysMap[dateStr] = {
          temps: [],
          conditions: [],
          rain: 0
        };
      }

      daysMap[dateStr].temps.push(item.main.temp);
      if (item.weather?.[0]?.main) {
        daysMap[dateStr].conditions.push(item.weather[0].main);
      }
      if (item.rain?.['3h']) {
        daysMap[dateStr].rain += item.rain['3h'];
      }
    });

    const days = Object.keys(daysMap).sort();
    return days.slice(0, 5).map(date => {
      const dayData = daysMap[date];
      const avgTemp = parseFloat((dayData.temps.reduce((sum, t) => sum + t, 0) / dayData.temps.length).toFixed(1));

      // Calculate dominant weather condition
      const counts = {};
      let dominantCondition = 'Clear';
      let maxCount = 0;
      dayData.conditions.forEach(c => {
        counts[c] = (counts[c] || 0) + 1;
        if (counts[c] > maxCount) {
          maxCount = counts[c];
          dominantCondition = c;
        }
      });

      const dateObj = new Date(date);
      const dayLabel = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

      return {
        day: dayLabel,
        date: date,
        temperature: avgTemp,
        weatherCondition: dominantCondition,
        rainfall: parseFloat(dayData.rain.toFixed(1))
      };
    });
  }
}
export default WeatherMapper;
