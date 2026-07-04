export default {
  type: 'object',
  properties: {
    wellnessScore: {
      type: 'integer',
      description: 'Numerical wellness/resilience score bounded between 0 and 100.'
    },
    stressIndicator: {
      type: 'string',
      enum: ['Low', 'Moderate', 'High', 'Severe'],
      description: 'Stress risk classification level.'
    },
    supportMessage: {
      type: 'string',
      description: 'Encouraging mental health and stress support message.'
    },
    positiveSuggestions: {
      type: 'array',
      items: { type: 'string' },
      description: 'Actionable wellness suggestions.'
    },
    localResources: {
      type: 'object',
      properties: {
        kisanCallCentre: { type: 'string' },
        kiranSupport: { type: 'string' },
        districtAdvisor: { type: 'string' }
      },
      required: ['kisanCallCentre', 'kiranSupport', 'districtAdvisor'],
      description: 'Mental health and agricultural advisor helplines.'
    }
  },
  required: ['wellnessScore', 'stressIndicator', 'supportMessage', 'positiveSuggestions', 'localResources']
};
