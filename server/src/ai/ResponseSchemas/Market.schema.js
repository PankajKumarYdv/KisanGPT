export default {
  type: 'object',
  properties: {
    marketScore: {
      type: 'integer',
      description: 'Numerical market price profitability and advisability score bounded between 0 and 100.'
    },
    trend: {
      type: 'string',
      enum: ['Rising', 'Falling', 'Stable'],
      description: 'Mandi price forecast trend direction.'
    },
    recommendation: {
      type: 'string',
      description: 'Actionable advisor recommendation on holding, selling, timing, storage and transportation details (e.g. Hold for 5 days due to rising local arrivals).'
    },
    bestMarket: {
      type: 'string',
      description: 'Best local Mandi market name and location.'
    },
    expectedPrice: {
      type: 'number',
      description: 'Forecasted mandi price of commodity per quintal.'
    },
    confidence: {
      type: 'integer',
      description: 'Confidence score percentage from 0 to 100.'
    }
  },
  required: ['marketScore', 'trend', 'recommendation', 'bestMarket', 'expectedPrice', 'confidence']
};
