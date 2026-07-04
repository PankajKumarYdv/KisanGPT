export default (context) => {
  const finRes = context.getAgentResult('FinancialAgent')?.data || {};
  const weatherRes = context.getAgentResult('WeatherAgent')?.data || {};
  const cropRes = context.getAgentResult('CropAgent')?.data || {};
  const marketRes = context.getAgentResult('MarketAgent')?.data || {};
  const govRes = context.getAgentResult('GovernmentSchemeAgent')?.data || {};
  const riskRes = context.getAgentResult('RiskAssessmentAgent')?.data || {};
  const wellnessRes = context.getAgentResult('WellnessAgent')?.data || {};

  const systemInstruction = 
    "You are the Action Planning Specialist of KisanGPT.\n" +
    "Your role is to synthesize all domain assessments, financial strategies, weather alerts, crop preventative advice, mandi trends, and wellness suggestions into a prioritized chronological action plan for the farmer.";

  const prompt = `
    Input Context:
    - Financial Recommended Actions: ${JSON.stringify(finRes.recommendedActions || [])}
    - Weather Status: Risk level ${weatherRes.weatherRisk || 'Low'} (${weatherRes.weatherSummary || ''})
    - Crop Preventative Measures: ${JSON.stringify(cropRes.preventiveMeasures || [])}
    - Market advisory trend: ${marketRes.trend || 'Stable'} (best local market: ${marketRes.bestMarket || ''})
    - Government Schemes Matched: ${JSON.stringify(govRes.eligibleSchemes || [])} (DBT Benefits Estimate: ${govRes.benefits || ''})
    - Overall Risk Level: ${riskRes.overallRisk || 'Low'} (score: ${riskRes.overallScore || 50}/100)
    - Stress Level: ${wellnessRes.stressIndicator || 'Low'} (suggestions: ${JSON.stringify(wellnessRes.positiveSuggestions || [])})

    Instructions:
    1. Organize recommendations into a chronological timeline:
       - immediateActions (0 to 2 days): Focus on weather hazard protection and urgent crop sanitation.
       - sevenDayPlan (3 to 7 days): Focus on preventative crop sprays and wellness/self-care breaks.
       - thirtyDayPlan (8 to 30 days): Focus on marketing crops or starting applications for government schemes.
       - longTermPlan (strategic/financial): Focus on debt restructuring, investing in drip systems, or diversifying non-farm income.
    2. Determine priorityLevel ('Low', 'Medium', 'High', 'Critical') matching overall risk level.
    3. Include estimated benefits summary description.
  `;

  return { systemInstruction, prompt };
};
