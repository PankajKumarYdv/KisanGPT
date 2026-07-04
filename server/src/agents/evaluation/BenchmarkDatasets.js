export const BenchmarkDatasets = {
  smallFarmer: {
    name: 'Small Farmer Scenario',
    description: 'A typical small farmer with moderate debt and stable conditions.',
    farmer: {
      state: 'Punjab',
      district: 'Amritsar',
      landSize: 2.5,
      cropType: 'Wheat',
      annualIncome: 180000,
      loanAmount: 50000,
      farmingExperience: 8,
      soilType: 'Alluvial',
      irrigationType: 'tube-well'
    },
    expected: {
      financialRiskLevel: 'Medium',
      weatherRisk: 'Low',
      overallRisk: 'Medium'
    }
  },
  marginalFarmer: {
    name: 'Marginal Farmer Scenario',
    description: 'A farmer with small land holding and high leverage.',
    farmer: {
      state: 'Rajasthan',
      district: 'Jodhpur',
      landSize: 1.2,
      cropType: 'Cotton',
      annualIncome: 90000,
      loanAmount: 220000,
      farmingExperience: 5,
      soilType: 'Sandy',
      irrigationType: 'drip'
    },
    expected: {
      financialRiskLevel: 'Critical',
      weatherRisk: 'High',
      overallRisk: 'High'
    }
  },
  floodScenario: {
    name: 'Flood Scenario',
    description: 'Heavy monsoonal rains leading to flood threat.',
    farmer: {
      state: 'Kerala',
      district: 'Wayanad',
      landSize: 10,
      cropType: 'Rice',
      annualIncome: 400000,
      loanAmount: 80000,
      farmingExperience: 15,
      soilType: 'Clayey',
      irrigationType: 'canal'
    },
    expected: {
      weatherRisk: 'High',
      cropDiseaseRisk: 'High (Risk of root rot and downy mildew)',
      overallRisk: 'High'
    }
  },
  droughtScenario: {
    name: 'Drought Scenario',
    description: 'High heat index and drought conditions.',
    farmer: {
      state: 'Rajasthan',
      district: 'Jaisalmer',
      landSize: 8,
      cropType: 'Cotton',
      annualIncome: 120000,
      loanAmount: 50000,
      farmingExperience: 12,
      soilType: 'Sandy',
      irrigationType: 'drip'
    },
    expected: {
      weatherRisk: 'High',
      droughtRiskMin: 80,
      overallRisk: 'High'
    }
  },
  highDebt: {
    name: 'High Debt Scenario',
    description: 'Extreme loan profile compared to annual income.',
    farmer: {
      state: 'Punjab',
      district: 'Ludhiana',
      landSize: 5,
      cropType: 'Wheat',
      annualIncome: 150000,
      loanAmount: 600000, // Ratio = 4.0
      farmingExperience: 10,
      soilType: 'Alluvial',
      irrigationType: 'tube-well'
    },
    expected: {
      financialRiskLevel: 'Critical',
      overallRisk: 'High'
    }
  },
  excellentFinancial: {
    name: 'Excellent Financial Health Scenario',
    description: 'Farmer with minimal debt and high income relative to debt.',
    farmer: {
      state: 'Maharashtra',
      district: 'Nashik',
      landSize: 15,
      cropType: 'Sugarcane',
      annualIncome: 950000,
      loanAmount: 20000, // negligible
      farmingExperience: 22,
      soilType: 'Black',
      irrigationType: 'sprinkler'
    },
    expected: {
      financialRiskLevel: 'Low',
      overallRisk: 'Low'
    }
  },
  cropFailure: {
    name: 'Crop Failure Scenario',
    description: 'Combination of sub-optimal soil and harsh weather.',
    farmer: {
      state: 'Rajasthan',
      district: 'Bikaner',
      landSize: 4.0,
      cropType: 'Rice', // sub-optimal on sandy soil, high drought
      annualIncome: 150000,
      loanAmount: 100000,
      farmingExperience: 7,
      soilType: 'Sandy',
      irrigationType: 'sprinkler'
    },
    expected: {
      expectedYield: 'Low (risk of crop failure)',
      overallRisk: 'High'
    }
  },
  excellentMarket: {
    name: 'Excellent Market Conditions Scenario',
    description: 'Commodity price index displaying positive upward trends.',
    farmer: {
      state: 'Punjab',
      district: 'Bathinda',
      landSize: 6.0,
      cropType: 'Wheat', // high market price trend
      annualIncome: 300000,
      loanAmount: 50000,
      farmingExperience: 14,
      soilType: 'Alluvial',
      irrigationType: 'tube-well'
    },
    expected: {
      marketTrend: 'Upward',
      priceScoreMin: 70
    }
  }
};
