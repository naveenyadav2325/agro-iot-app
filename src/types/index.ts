export type DemoScenario = 
  | 'NORMAL'
  | 'LOW_MOISTURE'
  | 'HEAT_STRESS'
  | 'DISEASE'
  | 'PEST'
  | 'FLOOD';

export interface SensorReading {
  soilMoisture: number; // 0 - 100 %
  temperature: number;  // °C
  humidity: number;     // 0 - 100 %
  rainProbability: number; // 0 - 100 %
  timestamp: string;
  lightLux?: number;
  batteryPercent?: number;
  rssi?: number; // dBm
}

export type IrrigationStatus = 'RECOMMENDED' | 'NOT_REQUIRED' | 'DELAY';

export interface IrrigationDecision {
  status: IrrigationStatus;
  title: string;
  reason: string;
  waterAmountMm: number;
  recommendedDurationMinutes: number;
  optimalTimeWindow: string;
  urgency: 'low' | 'medium' | 'high';
  estimatedWaterLitersPerAcre: number;
}

export interface RiskMetric {
  level: 'Low' | 'Moderate' | 'High' | 'Critical';
  score: number; // 0 to 100
  title: string;
  description: string;
  actionableAdvice: string;
}

export interface EnvironmentalRiskAnalysis {
  heatStress: RiskMetric;
  waterStress: RiskMetric;
  floodRisk: RiskMetric;
  overallScore: number; // 0 to 100 (100 = safe, 0 = severe risk)
}

export interface CropHealthOverview {
  overallHealthScore: number; // 0 to 100%
  healthStatus: 'Optimal' | 'Good' | 'Moderate' | 'Critical';
  diseaseRisk: 'Low' | 'Moderate' | 'High';
  pestRisk: 'Low' | 'Moderate' | 'High';
  advisoryText: string;
  activeAlertCount: number;
}

export interface CropScanResult {
  id: string;
  timestamp: string;
  imageUri: string;
  cropName: string;
  healthStatus: 'Healthy' | 'Early Warning' | 'Infected' | 'Damaged';
  diseaseDetected: string;
  pestDetected: string;
  confidencePercent: number;
  recommendation: string;
  organicRemedy: string;
  chemicalRemedy: string;
  affectedAreaPercent: number;
  isMock: boolean;
}

export type AlertType = 'disease' | 'pest' | 'irrigation' | 'heat' | 'flood';
export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface AlertItem {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: string;
  metricTrigger: string;
  recommendedAction: string;
  acknowledged: boolean;
}

export interface HistoricalDataPoint {
  time: string;
  soilMoisture: number;
  temperature: number;
  humidity: number;
  rainProbability: number;
}
