export default {
  type: 'object',
  properties: {
    immediateActions: {
      type: 'array',
      items: { type: 'string' },
      description: 'Urgent chronological action steps (0-2 days).'
    },
    sevenDayPlan: {
      type: 'array',
      items: { type: 'string' },
      description: 'Intermediate action steps (3-7 days).'
    },
    thirtyDayPlan: {
      type: 'array',
      items: { type: 'string' },
      description: 'Monthly action steps (8-30 days).'
    },
    longTermPlan: {
      type: 'array',
      items: { type: 'string' },
      description: 'Long term strategic and financial goals.'
    },
    financialAdvice: {
      type: 'array',
      items: { type: 'string' },
      description: 'Consolidated financial planning advisories.'
    },
    cropAdvice: {
      type: 'array',
      items: { type: 'string' },
      description: 'Consolidated crop management advisories.'
    },
    marketAdvice: {
      type: 'array',
      items: { type: 'string' },
      description: 'Consolidated mandi marketing advisories.'
    },
    governmentSchemeAdvice: {
      type: 'array',
      items: { type: 'string' },
      description: 'Consolidated application instructions for eligible schemes.'
    },
    priorityLevel: {
      type: 'string',
      enum: ['Low', 'Medium', 'High', 'Critical'],
      description: 'Urgency tier of the Action Plan.'
    },
    estimatedBenefits: {
      type: 'string',
      description: 'Direct cash estimate or subsidy summary description.'
    }
  },
  required: [
    'immediateActions', 'sevenDayPlan', 'thirtyDayPlan', 'longTermPlan',
    'financialAdvice', 'cropAdvice', 'marketAdvice', 'governmentSchemeAdvice',
    'priorityLevel', 'estimatedBenefits'
  ]
};
