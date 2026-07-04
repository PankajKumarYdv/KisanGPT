export default {
  type: 'object',
  properties: {
    eligibleSchemes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Name of the scheme.' },
          benefit: { type: 'string', description: 'Financial or subsidy benefits description.' },
          priority: { type: 'string', description: 'Urgency/priority (High, Medium, Low).' },
          applicationSteps: { type: 'array', items: { type: 'string' }, description: 'Application workflow steps.' },
          requiredDocuments: { type: 'array', items: { type: 'string' }, description: 'Required submission documents.' }
        },
        required: ['name', 'benefit', 'priority', 'applicationSteps', 'requiredDocuments']
      },
      description: 'List of matching central or state agricultural assistance schemes.'
    },
    benefits: {
      type: 'string',
      description: 'Aggregate direct cash DBT estimate or description of in-kind subsidies.'
    }
  },
  required: ['eligibleSchemes', 'benefits']
};
