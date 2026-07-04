export const mockAssessments = [
  {
    id: "603f908e2f89c4e2b8c9d210",
    farmerId: "603f908e2f89c4e2b8c9d110",
    financialRisk: 25,
    weatherRisk: 42,
    cropRisk: 30,
    marketRisk: 55,
    wellnessRisk: 15,
    overallRisk: 33,
    recommendation: "Switch 20% of your wheat field to high-yield drought-resistant strains. Secure mandi pre-purchase contracts for 40% of harvest to mitigate market price volatility. Schedule irrigation strictly in early mornings.",
    summary: "Medium risk overall. Market factors show moderate volatility due to regional crop surpluses. Monitor weather for late heatwaves.",
    assessmentStatus: "Completed",
    createdAt: "2026-06-20T10:15:30.000Z"
  },
  {
    id: "603f908e2f89c4e2b8c9d211",
    farmerId: "603f908e2f89c4e2b8c9d111",
    financialRisk: 60,
    weatherRisk: 75,
    cropRisk: 45,
    marketRisk: 30,
    wellnessRisk: 40,
    overallRisk: 58,
    recommendation: "Install anti-hail nets immediately as the pre-monsoon Nashik corridor forecasts intense thunderstorms. Re-negotiate bank loan under crop insurance schemes. Apply organic sulphur sprays for powdery mildew control.",
    summary: "High risk overall. Critical weather risks dominate grape crops during maturity. Financial burden is high due to capital intensive nets.",
    assessmentStatus: "Completed",
    createdAt: "2026-06-22T08:30:00.000Z"
  },
  {
    id: "603f908e2f89c4e2b8c9d212",
    farmerId: "603f908e2f89c4e2b8c9d112",
    financialRisk: 10,
    weatherRisk: 20,
    cropRisk: 15,
    marketRisk: 12,
    wellnessRisk: 5,
    overallRisk: 12,
    recommendation: "Maintain standard crop rotation cycles. Soil moisture levels are highly stable. Apply nitrogen fertilizer in split doses.",
    summary: "Low risk overall. Sugarcane shows exceptional stability under kaveri canal network. Market demand remains steady.",
    assessmentStatus: "Completed",
    createdAt: "2026-06-24T14:45:00.000Z"
  }
];

export const getAssessmentsByFarmerId = (farmerId) => {
  return mockAssessments.filter(a => a.farmerId === farmerId);
};
