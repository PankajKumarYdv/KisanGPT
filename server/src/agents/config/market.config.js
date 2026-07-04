export default {
  mandiDatabase: {
    wheat: {
      currentPrice: 2275, // per quintal (INR)
      expectedPrice: 2450,
      trend: 'Upward',
      bestMarket: 'Khanna Mandi, Punjab',
      productionCost: 1500
    },
    rice: {
      currentPrice: 2183,
      expectedPrice: 2200,
      trend: 'Stable',
      bestMarket: 'Nalgonda Mandi, Telangana',
      productionCost: 1400
    },
    cotton: {
      currentPrice: 7120,
      expectedPrice: 6800,
      trend: 'Downward',
      bestMarket: 'Adoni Mandi, Andhra Pradesh',
      productionCost: 4500
    },
    sugarcane: {
      currentPrice: 315,
      expectedPrice: 315,
      trend: 'Stable',
      bestMarket: 'Cooperative Mill, Maharashtra',
      productionCost: 200
    },
    default: {
      currentPrice: 3000,
      expectedPrice: 3100,
      trend: 'Stable',
      bestMarket: 'Local District Mandi',
      productionCost: 2000
    }
  },
  priceThresholds: {
    lowProfit: 10,  // % profit margin
    highProfit: 40  // % profit margin
  }
};
