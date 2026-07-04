export const mockFarmers = [
  {
    id: "603f908e2f89c4e2b8c9d110",
    userId: "603f908e2f89c4e2b8c9d100",
    state: "Punjab",
    district: "Amritsar",
    village: "Jassa",
    pincode: "143001",
    farmName: "Alpha Fields",
    landSize: 5.2,
    landUnit: "acres",
    cropType: "Wheat",
    annualIncome: 320000,
    loanAmount: 80000,
    farmingExperience: 12,
    latitude: 31.634,
    longitude: 74.872
  },
  {
    id: "603f908e2f89c4e2b8c9d111",
    userId: "603f908e2f89c4e2b8c9d101",
    state: "Maharashtra",
    district: "Nashik",
    village: "Ohar",
    pincode: "422003",
    farmName: "Sahyadri Grapes",
    landSize: 8.5,
    landUnit: "acres",
    cropType: "Grapes",
    annualIncome: 650000,
    loanAmount: 150000,
    farmingExperience: 18,
    latitude: 20.005,
    longitude: 73.789
  },
  {
    id: "603f908e2f89c4e2b8c9d112",
    userId: "603f908e2f89c4e2b8c9d102",
    state: "Karnataka",
    district: "Mandya",
    village: "Kottatti",
    pincode: "571401",
    farmName: "Kaveri Sugars",
    landSize: 3.0,
    landUnit: "acres",
    cropType: "Sugarcane",
    annualIncome: 250000,
    loanAmount: 50000,
    farmingExperience: 8,
    latitude: 12.521,
    longitude: 76.897
  }
];

export const getFarmerByUserId = (userId) => {
  return mockFarmers.find(f => f.userId === userId) || mockFarmers[0];
};
