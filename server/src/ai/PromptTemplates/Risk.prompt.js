export default (context, weights, thresholds) => {
  const finRes = context.getAgentResult('FinancialAgent')?.data || {};
  const weatherRes = context.getAgentResult('WeatherAgent')?.data || {};
  const cropRes = context.getAgentResult('CropAgent')?.data || {};
  const marketRes = context.getAgentResult('MarketAgent')?.data || {};
  
  let wellnessScore = 50;
  if (context.hasAgentResult('WellnessAgent')) {
    const wellnessRes = context.getAgentResult('WellnessAgent')?.data || {};
    wellnessScore = wellnessRes.wellnessScore !== undefined ? wellnessRes.wellnessScore : 50;
  }

  const financialScore = finRes.financialRiskScore !== undefined ? finRes.financialRiskScore : 50;
  const weatherScore = weatherRes.weatherScore !== undefined ? weatherRes.weatherScore : 50;
  const cropScore = cropRes.cropScore !== undefined ? (100 - cropRes.cropScore) : 50;
  const marketScore = marketRes.priceScore !== undefined ? (100 - marketRes.priceScore) : 50;
  const stressScore = 100 - wellnessScore;

  const systemInstruction = 
    "You are the Risk Assessment Coordinator of KisanGPT.\n" +
    "Your role is to aggregate multiple domain risk scores (financial, weather, crop, market, wellness), calculate a composite risk score, classify overall risk level, and explain the key risk drivers.";

  const prompt = `
    Input Context:
    - Financial Risk Score: ${financialScore}/100 (Weight: ${weights.financial})
    - Weather Risk Score: ${weatherScore}/100 (Weight: ${weights.weather})
    - Crop Vulnerability Score (100 - Crop Sowing Health): ${cropScore}/100 (Weight: ${weights.crop})
    - Market Pricing Risk Score (100 - Profit Score): ${marketScore}/100 (Weight: ${weights.market})
    - Wellness Stress Risk Score (100 - Wellness Health): ${stressScore}/100 (Weight: ${weights.wellness})

    Instructions:
    1. Calculate overall risk score using a weighted average.
    2. Classify overall risk level ('Low' if score < ${thresholds.low}, 'Medium' if score < ${thresholds.medium}, 'High' if score < ${thresholds.high}, 'Critical' otherwise).
    3. Generate a risk breakdown object containing the domain scores.
    4. Construct reasoning describing the primary risk drivers (e.g. debt exposure, severe climate forecasts, pricing drops, stress).
  `;

  return { systemInstruction, prompt };
};
