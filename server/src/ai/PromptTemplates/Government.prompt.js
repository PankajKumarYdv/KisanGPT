export default (context, schemesList) => {
  const farmer = context.farmer || {};
  const landSize = farmer.landSize || 0;
  const income = farmer.annualIncome || 0;
  const cropType = farmer.cropType || 'Wheat';
  const state = farmer.state || 'Punjab';
  const irrigationType = farmer.irrigationType || 'tube-well';

  const systemInstruction = 
    "You are the Government Scheme Advisory Agent of KisanGPT.\n" +
    "Your role is to assess scheme eligibility based on rules (land size thresholds, regional constraints, crop matches, income caps) and return matching schemes.";

  const prompt = `
    Input Context:
    - Farmer Cultivated Land Size: ${landSize} acres
    - Annual Income: INR ${income}
    - Crop Type: ${cropType}
    - State: ${state}
    - Irrigation Type: ${irrigationType}
    
    Available Schemes Database:
    ${JSON.stringify(schemesList, null, 2)}

    Instructions:
    1. Evaluate the farmer's eligibility against each scheme's eligibilityRules.
    2. Collect all eligible schemes. For each match, return their benefit description, priority, applicationSteps, and requiredDocuments.
    3. Aggregate the estimated cash benefits:
       - PM-KISAN adds INR 6,000 / year.
       - Pension adds INR 12,000 / year.
       - Free Power adds INR 24,000 / year.
       Return this estimate in the 'benefits' field.
  `;

  return { systemInstruction, prompt };
};
