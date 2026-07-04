export const mockWeatherData = {
  current: {
    temp: 34,
    humidity: 55,
    windSpeed: 14,
    condition: "Partly Cloudy",
    soilMoisture: "38%",
    precipitationProbability: "20%",
    evaporationRate: "5.8 mm/day",
    sunshineHours: 9.5
  },
  forecast: [
    { day: "Thu", temp: 34, condition: "Cloudy", rainProb: 20 },
    { day: "Fri", temp: 31, condition: "Thunderstorms", rainProb: 85 }, // Convective storm day
    { day: "Sat", temp: 29, condition: "Scattered Rain", rainProb: 60 },
    { day: "Sun", temp: 32, condition: "Sunny", rainProb: 10 },
    { day: "Mon", temp: 33, condition: "Mostly Sunny", rainProb: 10 },
    { day: "Tue", temp: 35, condition: "Clear", rainProb: 0 },
    { day: "Wed", temp: 36, condition: "Clear", rainProb: 0 }
  ],
  soilHistory: [
    { week: "W1", moisture: 42, depth10cm: 45 },
    { week: "W2", moisture: 40, depth10cm: 44 },
    { week: "W3", moisture: 35, depth10cm: 41 },
    { week: "W4", moisture: 38, depth10cm: 42 }
  ]
};
