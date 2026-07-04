// Sample documents representing realistic Indian farmer data contexts.

export const sampleUsers = [
  {
    fullName: "Rajesh Kumar",
    email: "rajesh.kumar@example.com",
    password: "Password123!", // Will be hashed in database save hooks
    phone: "+919876543210",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=rajesh",
    role: "farmer",
    preferredLanguage: "hi",
    isVerified: true,
  },
  {
    fullName: "Sukhwinder Singh",
    email: "sukhwinder.singh@example.com",
    password: "SecurePassword789!",
    phone: "+919812345678",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=sukhwinder",
    role: "farmer",
    preferredLanguage: "pa",
    isVerified: true,
  },
  {
    fullName: "Dr. Amit Sharma",
    email: "amit.sharma@example.com",
    password: "AdvisorSecure456!",
    phone: "+919911223344",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=amit",
    role: "advisor",
    preferredLanguage: "en",
    isVerified: true,
  }
];

export const sampleFarmers = [
  {
    // User reference ID will be linked dynamically
    state: "Punjab",
    district: "Ludhiana",
    village: "Jodhan",
    pincode: "141116",
    farmName: "Kumar Organic Farms",
    landSize: 4.5,
    landUnit: "acres",
    cropType: "Wheat",
    irrigationType: "Tubewell",
    soilType: "Alluvial",
    annualIncome: 380000,
    loanAmount: 75000,
    farmingExperience: 18,
    livestock: ["Cow", "Buffalo"],
    latitude: 30.9010,
    longitude: 75.8573,
  },
  {
    state: "Haryana",
    district: "Karnal",
    village: "Gharaunda",
    pincode: "132114",
    farmName: "Singh Dairy & Agro",
    landSize: 8.2,
    landUnit: "acres",
    cropType: "Rice",
    irrigationType: "Canal",
    soilType: "Loamy",
    annualIncome: 650000,
    loanAmount: 150000,
    farmingExperience: 22,
    livestock: ["Buffalo", "Buffalo", "Cow"],
    latitude: 29.5401,
    longitude: 76.9734,
  }
];

export const sampleAssessments = [
  {
    financialRisk: 30,
    weatherRisk: 65,
    cropRisk: 45,
    marketRisk: 50,
    wellnessRisk: 20,
    overallRisk: 42,
    recommendation: "Apply potash fertilizer to strengthen wheat stems against lodging before forecast rain. Postpone harvest by 4 days to allow ground moisture to settle. Explore Ludhiana Mandi where prices are trending 3% higher than Khanna.",
    summary: "Moderate overall risk. Rain forecast on Day 5 poses lodging risk to ready wheat crop. Prices in nearby markets remain strong.",
    assessmentStatus: "Completed"
  }
];

export const sampleAlerts = [
  {
    title: "Heavy Rainfall & Thunderstorm Advisory",
    description: "Moderate to heavy rain accompanied by gusty winds expected in Ludhiana district over the next 48 hours. Protect harvested crops.",
    type: "weather",
    severity: "High",
    isRead: false,
    expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Expirable in 48 hours
  },
  {
    title: "Pest Attack Warning (Yellow Rust)",
    description: "Yellow Rust sightings reported in neighboring farm clusters. Inspect wheat leaves for yellow powdery stripes immediately.",
    type: "pest",
    severity: "Critical",
    isRead: false,
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  }
];

export const sampleGovernmentSchemes = [
  {
    schemeName: "PM-KISAN Samman Nidhi",
    description: "Central sector scheme that provides direct income support to all landholding farmer families across the country.",
    category: "Direct Benefit Transfer",
    state: "National",
    eligibility: {
      minLandSize: 0,
      maxLandSize: 2.0, // Small and marginal farmers criteria
      maxAnnualIncome: 9999999,
      description: "Must be a landholder and not belong to institutional tax paying categories.",
    },
    benefits: "Direct payment of ₹6,000 per year in three equal installments of ₹2,000 directly into bank accounts.",
    applicationLink: "https://pmkisan.gov.in/",
    officialWebsite: "https://pmkisan.gov.in/",
    isActive: true,
  },
  {
    schemeName: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    description: "Government-sponsored crop insurance scheme that integrates multi-risk coverage for safety nets.",
    category: "Crop Insurance",
    state: "National",
    eligibility: {
      minLandSize: 0,
      maxLandSize: 9999,
      maxAnnualIncome: 9999999,
      description: "Available for all farmers sowing notified crops in notified areas.",
    },
    benefits: "Financial support to stabilize income during crop loss caused by natural calamities and pests.",
    applicationLink: "https://pmfby.gov.in/",
    officialWebsite: "https://pmfby.gov.in/",
    isActive: true,
  }
];

export const sampleMarketHistory = [
  {
    crop: "wheat",
    mandi: "Khanna Mandi",
    district: "ludhiana",
    state: "Punjab",
    marketPrice: 2275,
    minimumPrice: 2150,
    maximumPrice: 2320,
    arrivalQuantity: 2800,
    priceDate: new Date("2026-06-24T00:00:00Z"),
  },
  {
    crop: "wheat",
    mandi: "Amritsar Mandi",
    district: "amritsar",
    state: "Punjab",
    marketPrice: 2340,
    minimumPrice: 2200,
    maximumPrice: 2400,
    arrivalQuantity: 1500,
    priceDate: new Date("2026-06-24T00:00:00Z"),
  },
  {
    crop: "paddy",
    mandi: "Gharaunda Mandi",
    district: "karnal",
    state: "Haryana",
    marketPrice: 2180,
    minimumPrice: 2060,
    maximumPrice: 2220,
    arrivalQuantity: 4200,
    priceDate: new Date("2026-06-24T00:00:00Z"),
  }
];

export const sampleWeatherCache = [
  {
    latitude: 30.9010,
    longitude: 75.8573,
    weatherData: {
      temperature: 32.8,
      humidity: 58,
      clouds: 20,
      forecast: [
        { day: "Thursday", condition: "Sunny", rainProbability: 10 },
        { day: "Friday", condition: "Partly Cloudy", rainProbability: 25 },
        { day: "Saturday", condition: "Thundershowers", rainProbability: 80 }
      ]
    },
    expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // Expirable in 6 hours
  }
];

export const sampleActivityLogs = [
  {
    action: "User Login",
    module: "Auth",
    ipAddress: "192.168.1.1",
    metadata: { browser: "Chrome", OS: "Android" },
  },
  {
    action: "Run Farm Assessment",
    module: "Assessment",
    ipAddress: "192.168.1.1",
    metadata: { cropSelected: "Wheat", state: "Punjab" },
  }
];
