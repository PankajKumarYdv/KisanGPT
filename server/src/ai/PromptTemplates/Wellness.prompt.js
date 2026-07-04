export default (context) => {
  const farmer = context.farmer || {};
  const experience = farmer.farmingExperience || 0;
  
  const finRes = context.getAgentResult('FinancialAgent')?.data || {};
  const debtRatio = finRes.debtRatio || 0;

  const riskRes = context.getAgentResult('RiskAssessmentAgent')?.data || {};
  const overallRiskScore = riskRes.overallScore !== undefined ? riskRes.overallScore : 50;

  const systemInstruction = 
    "You are the Wellness Advisory Agent of KisanGPT.\n" +
    "Your role is to assess farmer stress level based on risk score, debt levels, and experience, provide supportive encouragement, and list local helpline resources.";

  const prompt = `
    Input Context:
    - Farming Experience: ${experience} years
    - Debt-to-income Ratio: ${debtRatio}
    - Composite Agricultural Risk Score: ${overallRiskScore}/100

    Instructions:
    1. Calculate a wellnessScore (base is 100 - overallRiskScore, penalize by 15 if debt ratio > 2, boost by 10 if experience >= 15 years).
    2. Classify stressIndicator ('Severe' if wellnessScore < 40, 'High' if score < 60, 'Moderate' if score < 80, 'Low' otherwise).
    3. Construct a compassionate, local-culture supportive supportMessage.
    4. Provide positiveSuggestions based on stress level (e.g. sleep hours, breaks, community meetings).
    5. Include default helpline contacts:
       - Kisan Call Centre: 1800-180-1551 (Kisan Mitra)
       - Kiran Mental Health Helpline: 1800-599-0019
       - Local Agriculture Office/Advisor contacts.
  `;

  return { systemInstruction, prompt };
};
