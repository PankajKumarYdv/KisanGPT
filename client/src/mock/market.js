export const mockMarketData = {
  trends: [
    { month: "Jan", wheat: 2150, paddy: 1960, sugarcane: 305 },
    { month: "Feb", wheat: 2200, paddy: 1980, sugarcane: 305 },
    { month: "Mar", wheat: 2100, paddy: 2020, sugarcane: 310 },
    { month: "Apr", wheat: 1975, paddy: 2040, sugarcane: 310 }, // New wheat harvest arrival drops price
    { month: "May", wheat: 2050, paddy: 2100, sugarcane: 315 },
    { month: "Jun", wheat: 2180, paddy: 2180, sugarcane: 315 }
  ],
  commodities: [
    {
      name: "Wheat",
      msp: 2275,
      currentPrice: 2180,
      dailyChange: 15,
      direction: "up",
      volume: "12,500 Tons",
      mandi: "Khanna Mandi, Punjab",
      predictions: [
        { scenario: "Low Rain", price: 2450, likelihood: "High" },
        { scenario: "Normal Supply", price: 2250, likelihood: "Medium" },
        { scenario: "Excess Imports", price: 2100, likelihood: "Low" }
      ]
    },
    {
      name: "Paddy (Common)",
      msp: 2183,
      currentPrice: 2180,
      dailyChange: -8,
      direction: "down",
      volume: "8,200 Tons",
      mandi: "Karnal Mandi, Haryana",
      predictions: [
        { scenario: "Delayed Monsoon", price: 2300, likelihood: "Medium" },
        { scenario: "Timely Monsoon", price: 2150, likelihood: "High" }
      ]
    },
    {
      name: "Sugarcane (FRP)",
      msp: 315,
      currentPrice: 315,
      dailyChange: 0,
      direction: "stable",
      volume: "35,000 Tons",
      mandi: "Mandya Mandi, Karnataka",
      predictions: [
        { scenario: "FRP Revision", price: 330, likelihood: "Medium" },
        { scenario: "Mill Overload", price: 310, likelihood: "Low" }
      ]
    },
    {
      name: "Grapes (Thompson)",
      msp: 0, // No MSP for Grapes
      currentPrice: 7200, // per quintal
      dailyChange: 180,
      direction: "up",
      volume: "1,800 Tons",
      mandi: "Nashik APMC, Maharashtra",
      predictions: [
        { scenario: "Thunderstorm damage", price: 8500, likelihood: "Medium" },
        { scenario: "Good Export Demand", price: 7800, likelihood: "High" }
      ]
    }
  ]
};
