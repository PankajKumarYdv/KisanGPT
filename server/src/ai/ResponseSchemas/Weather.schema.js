export default {
  type: 'object',
  properties: {
    temperature: {
      type: 'number',
      description: 'Air temperature in Celsius.'
    },
    rainfall: {
      type: 'number',
      description: 'Rainfall in mm.'
    },
    humidity: {
      type: 'number',
      description: 'Humidity level in percentage.'
    },
    windSpeed: {
      type: 'number',
      description: 'Wind speed in km/h.'
    },
    season: {
      type: 'string',
      description: 'Climatic season (e.g. Rabi, Kharif, Sowing, monsoon).'
    },
    floodRisk: {
      type: 'integer',
      description: 'Estimated risk of flooding (0 to 100).'
    },
    droughtRisk: {
      type: 'integer',
      description: 'Estimated risk of drought (0 to 100).'
    },
    heatStress: {
      type: 'integer',
      description: 'Estimated risk of heat stress (0 to 100).'
    },
    rainfallSuitability: {
      type: 'string',
      description: 'Suitability of rainfall levels for the target crop.'
    },
    weatherScore: {
      type: 'integer',
      description: 'Numerical weather risk score bounded between 0 and 100.'
    },
    weatherRisk: {
      type: 'string',
      enum: ['Low', 'Medium', 'High', 'Critical'],
      description: 'Categorical risk level classification based on weatherScore.'
    },
    weatherSummary: {
      type: 'string',
      description: 'Chronological summary of weather conditions and risk alerts.'
    }
  },
  required: [
    'temperature', 'rainfall', 'humidity', 'windSpeed', 'season',
    'floodRisk', 'droughtRisk', 'heatStress', 'rainfallSuitability',
    'weatherScore', 'weatherRisk', 'weatherSummary'
  ]
};
