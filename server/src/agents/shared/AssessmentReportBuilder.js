export class AssessmentReportBuilder {
  constructor() {
    this.farmer = null;
    this.assessment = null;
    this.financial = null;
    this.weather = null;
    this.crop = null;
    this.market = null;
    this.governmentSchemes = null;
    this.wellness = null;
    this.overallRisk = null;
    this.actionPlan = null;
    this.executionSummary = null;
  }

  setFarmer(farmer) {
    this.farmer = farmer;
    return this;
  }

  setAssessment(assessment) {
    this.assessment = assessment;
    return this;
  }

  setFinancial(financial) {
    this.financial = financial;
    return this;
  }

  setWeather(weather) {
    this.weather = weather;
    return this;
  }

  setCrop(crop) {
    this.crop = crop;
    return this;
  }

  setMarket(market) {
    this.market = market;
    return this;
  }

  setGovernmentSchemes(governmentSchemes) {
    this.governmentSchemes = governmentSchemes;
    return this;
  }

  setWellness(wellness) {
    this.wellness = wellness;
    return this;
  }

  setOverallRisk(overallRisk) {
    this.overallRisk = overallRisk;
    return this;
  }

  setActionPlan(actionPlan) {
    this.actionPlan = actionPlan;
    return this;
  }

  setExecutionSummary(executionSummary) {
    this.executionSummary = executionSummary;
    return this;
  }

  build() {
    return {
      farmer: this.farmer,
      assessment: this.assessment,
      financial: this.financial,
      weather: this.weather,
      crop: this.crop,
      market: this.market,
      governmentSchemes: this.governmentSchemes,
      wellness: this.wellness,
      overallRisk: this.overallRisk,
      actionPlan: this.actionPlan,
      executionSummary: this.executionSummary
    };
  }
}
