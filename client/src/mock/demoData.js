export const demoFarmers = [
  {
    _id: "demo-farmer-1",
    fullName: "Ramesh Prasad",
    farmName: "Prasad Smallholding",
    state: "Bihar",
    district: "Patna",
    village: "Mithapur",
    landSize: 1.2,
    soilType: "Clay",
    cropType: "Rice",
    farmingExperience: 8,
    annualIncome: 90000,
    loanAmount: 180000, // Loan-to-income = 2.0 (High Debt)
    contactNumber: "9876543210"
  },
  {
    _id: "demo-farmer-2",
    fullName: "Sidda Gowda",
    farmName: "Gowda Veg Farm",
    state: "Karnataka",
    district: "Chikmagalur",
    village: "Kadur",
    landSize: 2.5,
    soilType: "Sandy",
    cropType: "Vegetables",
    farmingExperience: 12,
    annualIncome: 240000,
    loanAmount: 120000, // Medium risk
    contactNumber: "9876543211"
  },
  {
    _id: "demo-farmer-3",
    fullName: "Sanjay Patil",
    farmName: "Patil Organic Farm",
    state: "Maharashtra",
    district: "Nashik",
    village: "Pimpalgaon",
    landSize: 5.0,
    soilType: "Black",
    cropType: "Grapes",
    farmingExperience: 20,
    annualIncome: 600000,
    loanAmount: 50000, // Low risk
    contactNumber: "9876543212"
  },
  {
    _id: "demo-farmer-4",
    fullName: "Harish Singh",
    farmName: "Singh Sugarcane Estate",
    state: "Uttar Pradesh",
    district: "Meerut",
    village: "Daurala",
    landSize: 8.5,
    soilType: "Alluvial",
    cropType: "Sugarcane",
    farmingExperience: 15,
    annualIncome: 450000,
    loanAmount: 220000, // Cold wave risk, moderate debt
    contactNumber: "9876543213"
  },
  {
    _id: "demo-farmer-5",
    fullName: "Gurpreet Singh",
    farmName: "Khalsa Wheat Fields",
    state: "Punjab",
    district: "Amritsar",
    village: "Ajnala",
    landSize: 12.0,
    soilType: "Alluvial",
    cropType: "Wheat",
    farmingExperience: 25,
    annualIncome: 950000,
    loanAmount: 150000, // Excellent market opportunity, water stress
    contactNumber: "9876543214"
  }
];

export const demoAssessments = {
  "demo-farmer-1": {
    _id: "demo-ass-1",
    farmerId: "demo-farmer-1",
    overallRisk: 82,
    financialRisk: 90,
    weatherRisk: 75,
    cropRisk: 80,
    wellnessRisk: 65,
    marketRisk: 85,
    assessmentStatus: "Critical",
    recommendation: "Switch immediately to high-yield short-duration rice seeds. Drain fields aggressively using trench channels to combat upcoming flood warnings. Seek low-interest cooperative refinancing to offset high private debt rates.",
    summary: "Critical alerts: Sizable flood threat and extreme private loan interest burden. Soil moisture levels are high, raising crop rot risks.",
    priceScore: 20,
    weatherScore: 75,
    financialRiskScore: 90,
    wellnessScore: 35,
    cropScore: 80,
    createdAt: new Date().toISOString()
  },
  "demo-farmer-2": {
    _id: "demo-ass-2",
    farmerId: "demo-farmer-2",
    overallRisk: 55,
    financialRisk: 50,
    weatherRisk: 60,
    cropRisk: 55,
    wellnessRisk: 45,
    marketRisk: 65,
    assessmentStatus: "High",
    recommendation: "Apply organic nitrogen inputs to correct sandy soil depletion. Diversify vegetable categories to secure stable daily income. Implement storage covers against sudden high precipitation forecast.",
    summary: "High volatility: Fluctuating local mandi rates and soil moisture depletion in Kadur. Ensure proper packaging before transport.",
    priceScore: 45,
    weatherScore: 60,
    financialRiskScore: 50,
    wellnessScore: 55,
    cropScore: 55,
    createdAt: new Date().toISOString()
  },
  "demo-farmer-3": {
    _id: "demo-ass-3",
    farmerId: "demo-farmer-3",
    overallRisk: 22,
    financialRisk: 15,
    weatherRisk: 20,
    cropRisk: 25,
    wellnessRisk: 30,
    marketRisk: 30,
    assessmentStatus: "Low",
    recommendation: "Capitalize on high grape market export opportunities at Nashik APMC. Refine drip irrigation timing to pre-dawn hours. Maintain low debt reserves.",
    summary: "Excellent prospects: Highly stable weather, fertile black soil, and high organic export margins.",
    priceScore: 85,
    weatherScore: 20,
    financialRiskScore: 15,
    wellnessScore: 80,
    cropScore: 25,
    createdAt: new Date().toISOString()
  },
  "demo-farmer-4": {
    _id: "demo-ass-4",
    farmerId: "demo-farmer-4",
    overallRisk: 68,
    financialRisk: 55,
    weatherRisk: 85,
    cropRisk: 65,
    wellnessRisk: 60,
    marketRisk: 40,
    assessmentStatus: "High",
    recommendation: "Protect sensitive winter sugarcane shoots from frost using trash mulching. Apply light pre-frost irrigation to regulate soil temperature. Secure cooperative APMC milling pre-purchases.",
    summary: "Weather Warning: Impending regional cold wave forecast in Meerut. Ensure proper insulation shielding on young sugarcane.",
    priceScore: 60,
    weatherScore: 85,
    financialRiskScore: 55,
    wellnessScore: 40,
    cropScore: 65,
    createdAt: new Date().toISOString()
  },
  "demo-farmer-5": {
    _id: "demo-ass-5",
    farmerId: "demo-farmer-5",
    overallRisk: 35,
    financialRisk: 25,
    weatherRisk: 50,
    cropRisk: 30,
    wellnessRisk: 20,
    marketRisk: 15,
    assessmentStatus: "Low",
    recommendation: "Sell wheat stocks at Amritsar Mandi within 5 days to lock in 52% profit margins. Reduce groundwater pump reliance by scaling micro-drip networks. Hold cash reserves.",
    summary: "Favorable market: Wheat rates are hitting record highs in Punjab. Guard against summer heat waves using soil mulching techniques.",
    priceScore: 92,
    weatherScore: 50,
    financialRiskScore: 25,
    wellnessScore: 85,
    cropScore: 30,
    createdAt: new Date().toISOString()
  }
};

export const demoAlerts = {
  "demo-farmer-1": [
    {
      _id: "demo-alert-1-1",
      farmerId: "demo-farmer-1",
      title: "Heavy Rain Alert",
      description: "Expect heavy rainfall of 65mm in Patna. Please ensure proper field drainage.",
      type: "weather",
      severity: "High",
      isRead: false,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    },
    {
      _id: "demo-alert-1-2",
      farmerId: "demo-farmer-1",
      title: "Debt Re-financing Advisory",
      description: "Private lending rate is above 24%. Refinance via NABARD crop loans at 7% now.",
      type: "system",
      severity: "Critical",
      isRead: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    }
  ],
  "demo-farmer-2": [
    {
      _id: "demo-alert-2-1",
      farmerId: "demo-farmer-2",
      title: "Soil Deficiency Warning",
      description: "Sandy soil showing severe nitrogen depletion. Apply bio-fertilizers immediately.",
      type: "general",
      severity: "Medium",
      isRead: false,
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    }
  ],
  "demo-farmer-3": [],
  "demo-farmer-4": [
    {
      _id: "demo-alert-4-1",
      farmerId: "demo-farmer-4",
      title: "Cold Wave Alert",
      description: "Meerut temperatures expected to hit 3.5°C. Guard sensitive winter sugarcane shoots against frost.",
      type: "weather",
      severity: "High",
      isRead: false,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    }
  ],
  "demo-farmer-5": [
    {
      _id: "demo-alert-5-1",
      farmerId: "demo-farmer-5",
      title: "Market Price Advisory",
      description: "Amritsar Wheat APMC price hits ₹2,550/quintal. Consider selling within 48 hours.",
      type: "market",
      severity: "Low",
      isRead: false,
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    }
  ]
};

export const demoTimelineData = {
  "demo-farmer-1": [
    { time: "Today", task: "Open drainage trenches to clear stagnant surface water.", priority: "High", savings: "₹15,000", yield: "+5%", impact: 85 },
    { time: "Tomorrow", task: "Procure short-duration rice seeds (Pusa-1509) from local cooperative.", priority: "High", savings: "₹10,000", yield: "+12%", impact: 90 },
    { time: "Next 7 Days", task: "Apply for cooperative loan refinancing to close private loan.", priority: "Medium", savings: "₹45,000", yield: "N/A", impact: 75 }
  ],
  "demo-farmer-2": [
    { time: "Today", task: "Apply bio-nitrogen organic inputs to Kadur sandy plot.", priority: "Medium", savings: "₹5,000", yield: "+8%", impact: 70 },
    { time: "Tomorrow", task: "Cover harvested vegetables with tarpaulin protection sheets.", priority: "High", savings: "₹12,000", yield: "+3%", impact: 80 }
  ],
  "demo-farmer-3": [
    { time: "Today", task: "Schedule grape drip cycles at 5:00 AM.", priority: "Low", savings: "₹2,000", yield: "+2%", impact: 40 },
    { time: "Next Month", task: "Initiate grape export shipping paperwork for EU compliance.", priority: "High", savings: "₹1,20,000", yield: "+15%", impact: 95 }
  ],
  "demo-farmer-4": [
    { time: "Today", task: "Lay trash mulching layer onMeerut sugarcane rows.", priority: "High", savings: "₹20,000", yield: "+8%", impact: 88 },
    { time: "Tomorrow", task: "Initiate light pre-frost evening sprinkler cycle.", priority: "High", savings: "₹15,000", yield: "+4%", impact: 82 }
  ],
  "demo-farmer-5": [
    { time: "Today", task: "Register wheat transport token for Amritsar Mandi arrival.", priority: "High", savings: "₹35,000", yield: "N/A", impact: 92 },
    { time: "Next 7 Days", task: "Seal final APMC trade contract at ₹2,550/quintal.", priority: "High", savings: "₹80,000", yield: "N/A", impact: 96 }
  ]
};
