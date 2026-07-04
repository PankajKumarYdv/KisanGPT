export default {
  stateWeatherProfiles: {
    rajasthan: {
      temperature: 42, // Celsius
      rainfall: 100,   // mm
      humidity: 15,    // %
      windSpeed: 25,   // km/h
      season: 'Summer',
      floodRisk: 10,
      droughtRisk: 90,
      heatStress: 95
    },
    kerala: {
      temperature: 28,
      rainfall: 2500,
      humidity: 90,
      windSpeed: 18,
      season: 'Monsoon',
      floodRisk: 85,
      droughtRisk: 5,
      heatStress: 30
    },
    punjab: {
      temperature: 26,
      rainfall: 600,
      humidity: 45,
      windSpeed: 10,
      season: 'Kharif',
      floodRisk: 25,
      droughtRisk: 40,
      heatStress: 50
    },
    maharashtra: {
      temperature: 32,
      rainfall: 1200,
      humidity: 75,
      windSpeed: 12,
      season: 'Rabi',
      floodRisk: 30,
      droughtRisk: 60,
      heatStress: 70
    },
    gujarat: {
      temperature: 38,
      rainfall: 400,
      humidity: 30,
      windSpeed: 20,
      season: 'Summer',
      floodRisk: 20,
      droughtRisk: 80,
      heatStress: 85
    },
    default: {
      temperature: 30,
      rainfall: 800,
      humidity: 50,
      windSpeed: 15,
      season: 'Spring',
      floodRisk: 30,
      droughtRisk: 30,
      heatStress: 40
    }
  },
  weatherScoreThresholds: {
    low: 30,
    medium: 60,
    high: 80
  }
};
