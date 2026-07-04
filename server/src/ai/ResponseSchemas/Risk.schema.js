export default {
  type: 'object',
  properties: {
    overallScore: {
      type: 'integer',
      description: 'Numerical composite agricultural risk score bounded between 0 and 100.'
    },
    overallRisk: {
      type: 'string',
      enum: ['Low', 'Medium', 'High', 'Critical'],
      description: 'Categorical composite risk classification level.'
    },
    riskBreakdown: {
      type: 'object',
      properties: {
        financial: { type: 'number', description: 'Financial risk score (0 to 100).' },
        weather: { type: 'number', description: 'Weather risk score (0 to 100).' },
        crop: { type: 'number', description: 'Crop disease/yield risk score (0 to 100).' },
        market: { type: 'number', description: 'Market price risk score (0 to 100).' },
        wellness: { type: 'number', description: 'Stress risk score (0 to 100).' }
      },
      required: ['financial', 'weather', 'crop', 'market', 'wellness'],
      description: 'Individual domain risk values.'
    },
    reasoning: {
      type: 'string',
      description: 'Explanatory text detailing composite risk indicators.'
    }
  },
  required: ['overallScore', 'overallRisk', 'riskBreakdown', 'reasoning']
};
