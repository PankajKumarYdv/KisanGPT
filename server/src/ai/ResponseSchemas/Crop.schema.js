export default {
  type: 'object',
  properties: {
    cropSuitability: {
      type: 'string',
      description: 'Analysis of soil type and crop suitability.'
    },
    expectedYield: {
      type: 'string',
      description: 'Estimated yield expectations based on weather and soil factors.'
    },
    diseaseRisk: {
      type: 'string',
      description: 'Disease/pest risk level and description.'
    },
    alternativeCrops: {
      type: 'array',
      items: { type: 'string' },
      description: 'Alternative crop options suitable for the same soil type.'
    },
    preventiveMeasures: {
      type: 'array',
      items: { type: 'string' },
      description: 'Actionable preventative measures for crop disease and pest control.'
    },
    cropScore: {
      type: 'integer',
      description: 'Numerical crop health score bounded between 0 and 100.'
    }
  },
  required: ['cropSuitability', 'expectedYield', 'diseaseRisk', 'alternativeCrops', 'preventiveMeasures', 'cropScore']
};
