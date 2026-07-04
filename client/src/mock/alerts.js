export const mockAlerts = [
  {
    id: "603f908e2f89c4e2b8c9d310",
    farmerId: "603f908e2f89c4e2b8c9d110",
    title: "Rust Advisory Warning",
    description: "Yellow rust sightings detected within a 15km radius of your Amritsar farm. Inspect wheat leaf undersides for bright yellow powdery stripes. Apply Propiconazole 25 EC (0.1%) immediately if yellow patches appear.",
    type: "pest",
    severity: "High",
    isRead: false,
    expiresAt: "2026-06-28T00:00:00.000Z",
    createdAt: "2026-06-24T12:00:00.000Z"
  },
  {
    id: "603f908e2f89c4e2b8c9d311",
    farmerId: "603f908e2f89c4e2b8c9d111",
    title: "Nashik Storm & Hail Watch",
    description: "Severe weather alert: High probability of localized convective storm cells and hail over Nashik grapes cluster on 26th June afternoon. Wrap fruit clusters or pull up protective nets to prevent skin split and physical damage.",
    type: "weather",
    severity: "Critical",
    isRead: false,
    expiresAt: "2026-06-27T00:00:00.000Z",
    createdAt: "2026-06-25T06:00:00.000Z"
  },
  {
    id: "603f908e2f89c4e2b8c9d312",
    farmerId: "603f908e2f89c4e2b8c9d110",
    title: "Diesel Subsidy Form Deadline",
    description: "Punjab government diesel subsidy registration for wheat farmers closes on 30th June. Submit bills via Mandi portal to claim 50% refund on diesel costs.",
    type: "government",
    severity: "Medium",
    isRead: true,
    expiresAt: "2026-06-30T18:00:00.000Z",
    createdAt: "2026-06-22T09:00:00.000Z"
  },
  {
    id: "603f908e2f89c4e2b8c9d313",
    farmerId: "603f908e2f89c4e2b8c9d112",
    title: "System Update: Soil Sensors",
    description: "KisanGPT integrated satellite monitoring successfully updated soil moisture indices for Mandya sub-basin. Sensor calibrations are verified.",
    type: "system",
    severity: "Low",
    isRead: true,
    expiresAt: "2026-07-05T00:00:00.000Z",
    createdAt: "2026-06-23T15:30:00.000Z"
  }
];

export const getAlertsByFarmerId = (farmerId) => {
  return mockAlerts.filter(a => a.farmerId === farmerId);
};
