export default {
  schemesList: [
    {
      name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
      benefit: '₹6,000 / year (3 installments)',
      priority: 'High',
      requiredDocuments: ['Aadhaar Card', 'Land Registry Documents', 'Bank Account Passbook'],
      applicationSteps: [
        'Visit PM-KISAN portal (pmkisan.gov.in)',
        'Click on New Farmer Registration',
        'Fill details and upload land records',
        'Submit for state/district level approval'
      ],
      eligibilityRules: {
        maxLandSize: 5, // acres (~2 hectares)
        maxIncome: Infinity
      }
    },
    {
      name: 'PMFBY (Pradhan Mantri Fasal Bima Yojana)',
      benefit: 'Subsidized Crop Insurance Cover against natural calamities',
      priority: 'Medium',
      requiredDocuments: ['Land Possession Certificate', 'Sowing Certificate', 'Aadhaar Card', 'Bank details'],
      applicationSteps: [
        'Visit PMFBY official website or nearest commercial bank',
        'Select crop, area sown, and landholding category',
        'Pay standard premium (1.5% to 2% for food crops, 5% for commercial)',
        'Obtain insurance certificate'
      ],
      eligibilityRules: {
        maxLandSize: Infinity,
        maxIncome: Infinity,
        crops: ['wheat', 'rice', 'paddy', 'cotton', 'sugarcane']
      }
    },
    {
      name: 'PMKSY (Pradhan Mantri Krishi Sinchayee Yojana - Micro Irrigation)',
      benefit: 'Up to 80% cost subsidy for Drip & Sprinkler installations',
      priority: 'High',
      requiredDocuments: ['Land ownership document', 'Irrigation water source certificate', 'Soil health card', 'Electricity connection bill'],
      applicationSteps: [
        'Submit application at district horticulture/agriculture office',
        'Field inspections by government engineers',
        'Installation of sanctioned micro-irrigation system',
        'Release of subsidy directly to vendor/farmer account'
      ],
      eligibilityRules: {
        maxLandSize: 12.5,
        maxIncome: Infinity,
        irrigationTypes: ['drip', 'sprinkler']
      }
    },
    {
      name: 'State Free Power & Water Subsidy',
      benefit: 'Zero cost / highly subsidized tubewell electricity',
      priority: 'Medium',
      requiredDocuments: ['Agricultural electricity connection record', 'Land verification certificate'],
      applicationSteps: [
        'Submit connection ledger details at local electricity board office',
        'Verify agricultural tariff conversion',
        'Install direct farm grid interface'
      ],
      eligibilityRules: {
        maxLandSize: Infinity,
        maxIncome: 300000,
        states: ['punjab', 'telangana', 'haryana']
      }
    }
  ]
};
