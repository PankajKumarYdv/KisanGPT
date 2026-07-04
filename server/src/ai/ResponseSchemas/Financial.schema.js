export default {
  type: 'object',
  properties: {
    debtRatio: {
      type: 'number',
      description: 'Debt-to-income ratio calculated from loanAmount and annualIncome.'
    },
    incomeStability: {
      type: 'string',
      description: 'Stability description based on landSize (e.g., Stable, Low Stability, Highly Stable).'
    },
    financialRiskScore: {
      type: 'integer',
      description: 'Numerical financial risk score bounded between 0 and 100.'
    },
    financialRiskLevel: {
      type: 'string',
      enum: ['Low', 'Medium', 'High', 'Critical'],
      description: 'Categorical risk level classification.'
    },
    reasoning: {
      type: 'string',
      description: 'Detailed analysis explanation including debt exposure details.'
    },
    recommendedActions: {
      type: 'array',
      items: { type: 'string' },
      description: 'Actionable financial recommendations.'
    }
  },
  required: ['debtRatio', 'incomeStability', 'financialRiskScore', 'financialRiskLevel', 'reasoning', 'recommendedActions']
};
