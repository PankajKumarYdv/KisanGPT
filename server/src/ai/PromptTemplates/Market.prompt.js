export default (context, marketData) => {
  const farmer = context.farmer || {};
  const cropType = farmer.cropType || 'Wheat';
  const state = farmer.state || 'Punjab';
  const district = farmer.district || 'Amritsar';

  const systemInstruction = 
    "You are the Market Intelligence Agent of KisanGPT.\n" +
    "Your role is to analyze mandi commodity prices, assess price trends, and provide marketing advisories on whether the farmer should sell now or hold.";

  const prompt = `
    Input Context:
    - Target Crop: ${cropType}
    - Farmer Location: ${district}, ${state}
    
    Live Market Parameters (from Agmarknet / Data.gov.in):
    - Current Mandi Modal Price: INR ${marketData.modalPrice} / quintal
    - Mandi Minimum Price: INR ${marketData.minimumPrice} / quintal
    - Mandi Maximum Price: INR ${marketData.maximumPrice} / quintal
    - Arrival Quantity: ${marketData.arrivalQuantity} quintals
    - Source Mandi: ${marketData.mandi}
    - Production Cost: INR ${marketData.productionCost} / quintal
    - Last Updated: ${marketData.lastUpdated}

    Instructions:
    1. Perform a Current Price Analysis using modal, min, and max prices against production cost.
    2. Assess the Price Trend (enum: 'Rising', 'Falling', 'Stable') based on arrival volumes and recent mandi rates.
    3. Formulate an actionable advisory recommendation including:
       - Best Selling Time / advisory (e.g. "Hold for 5 days", "Sell Now")
       - Nearby Better Markets (alternative mandis in the state)
       - Expected Profit margins
       - Storage Recommendation (e.g. warehousing options, moisture guards)
       - Transportation Considerations
    4. Compile a numerical marketScore (0 to 100). Higher profit margin and rising trends yield higher scores.
    5. Forecast expectedPrice per quintal.
    6. Specify your confidence percentage (0 to 100) in this prediction.
  `;

  return { systemInstruction, prompt };
};
