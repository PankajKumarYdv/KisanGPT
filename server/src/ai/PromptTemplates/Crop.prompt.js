export default (context, suitableCrops) => {
  const farmer = context.farmer || {};
  const cropType = farmer.cropType || 'Wheat';
  const soilType = farmer.soilType || 'Alluvial';
  const weatherResult = context.getAgentResult('WeatherAgent');
  const weatherData = weatherResult?.data || {};

  const systemInstruction = 
    "You are the Crop Advisory Agent of KisanGPT.\n" +
    "Your role is to assess crop suitability based on soil type, calculate yield expectations, evaluate pest/disease risk based on weather parameters, and provide preventive measures.";

  const prompt = `
    Input Context:
    - Target Crop: ${cropType}
    - Soil Type: ${soilType}
    - Regional Rainfall: ${weatherData.rainfall || 0}mm
    - Flood Risk: ${weatherData.floodRisk || 0}%
    - Drought Risk: ${weatherData.droughtRisk || 0}%
    - Suitable Crops for ${soilType} Soil: ${suitableCrops.join(', ')}

    Instructions:
    1. Verify if the target crop is suitable for the soil type. Construct a suitability statement.
    2. Determine yield expectations (e.g. 'Low (risk of crop failure)' if drought/flood risk > 70%, 'Moderate' if risk > 40%, 'High Yield Sowing Season' if suitable and low risk).
    3. Calculate a crop score (0 to 100) based on suitability and climate risks.
    4. Assess pest/disease risks:
       - High rainfall (>1500mm) suggests risk of root rot/fungal mildew.
       - Low rainfall (<300mm) suggests risk of sucking pests (aphids, whiteflies).
       - Moderate rainfall suggests standard weeding/fertilizer schedules.
    5. List actionable preventive measures.
    6. Provide a list of alternative crops from the suitable crops list (excluding the target crop).
  `;

  return { systemInstruction, prompt };
};
