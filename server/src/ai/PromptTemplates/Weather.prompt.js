export default (context, profile) => {
  const farmer = context.farmer || {};
  const cropType = farmer.cropType || 'Wheat';
  const state = farmer.state || 'Punjab';
  const district = farmer.district || '';

  const systemInstruction = 
    "You are the Weather Advisory Agent of KisanGPT.\n" +
    "Your role is to analyze weather conditions and assess climate risks (flood, drought, heat stress) for agricultural activities.\n" +
    "You must classify the weather risk level into 'Low', 'Medium', 'High', or 'Critical'.\n\n" +
    "Safety guidelines:\n" +
    "- Advise on safety precautions if severe hazards are detected.\n" +
    "- Keep instructions clear and actionable.";

  const prompt = `
    Input Context:
    - State: ${state}
    - District: ${district}
    - Target Crop: ${cropType}
    
    Regional Weather Profile:
    - Season: ${profile.season}
    - Temperature: ${profile.temperature}°C
    - Annual/Season Rainfall: ${profile.rainfall}mm
    - Humidity: ${profile.humidity}%
    - Wind Speed: ${profile.windSpeed}km/h
    - Flood Risk: ${profile.floodRisk}%
    - Drought Risk: ${profile.droughtRisk}%
    - Heat Stress: ${profile.heatStress}%

    Instructions:
    1. Parse the Regional Weather Profile.
    2. Assess rainfall suitability for the target crop (e.g., Rice requires heavy rain/irrigation, Wheat requires drier conditions during maturity).
    3. Calculate weatherScore as an average of floodRisk, droughtRisk, and heatStress.
    4. Classify weatherRisk ('Low' if score < 35, 'Medium' if score < 65, 'High' if score < 85, 'Critical' if score >= 85).
    5. Construct a detailed weatherSummary describing current conditions and risk warnings.
  `;

  return { systemInstruction, prompt };
};
