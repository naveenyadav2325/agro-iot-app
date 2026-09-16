import '../models/sensor_reading.dart';
import '../models/irrigation_decision.dart';
import '../models/alert_item.dart';

class DecisionEngine {
  static IrrigationDecision evaluateIrrigation(SensorReading reading) {
    if (reading.rainProbability >= 60.0) {
      return IrrigationDecision(
        status: IrrigationStatus.delay,
        title: 'Delay Irrigation',
        reason: 'Rain forecasted (${reading.rainProbability.toStringAsFixed(0)}%). Postponing watering avoids waterlogging and nutrient leaching.',
        waterAmountMm: 0.0,
        recommendedDurationMinutes: 0,
        optimalTimeWindow: 'Re-evaluate in 6 hours',
        urgency: 'low',
      );
    }

    if (reading.soilMoisture < 32.0) {
      final isHot = reading.temperature > 34.0;
      return IrrigationDecision(
        status: IrrigationStatus.recommended,
        title: 'Urgent Irrigation Recommended',
        reason: 'Critical root-zone moisture deficit (${reading.soilMoisture.toStringAsFixed(1)}%). Thermal stress at ${reading.temperature.toStringAsFixed(1)}°C.',
        waterAmountMm: isHot ? 30.0 : 25.0,
        recommendedDurationMinutes: isHot ? 60 : 45,
        optimalTimeWindow: 'Immediate or dawn (05:00 - 07:00 AM)',
        urgency: 'high',
      );
    }

    if (reading.soilMoisture < 45.0) {
      return IrrigationDecision(
        status: IrrigationStatus.recommended,
        title: 'Maintenance Irrigation Recommended',
        reason: 'Soil moisture (${reading.soilMoisture.toStringAsFixed(1)}%) is below optimal field capacity.',
        waterAmountMm: 15.0,
        recommendedDurationMinutes: 30,
        optimalTimeWindow: 'Evening (05:30 - 07:30 PM)',
        urgency: 'medium',
      );
    }

    return IrrigationDecision(
      status: IrrigationStatus.notRequired,
      title: 'Irrigation Not Required',
      reason: 'Soil moisture (${reading.soilMoisture.toStringAsFixed(1)}%) is within the optimal vegetative comfort range.',
      waterAmountMm: 0.0,
      recommendedDurationMinutes: 0,
      optimalTimeWindow: 'Monitoring active',
      urgency: 'low',
    );
  }

  static EnvironmentalRiskAnalysis evaluateEnvironmentalRisk(SensorReading reading) {
    String heatLevel = 'Low';
    String heatAdvice = 'No thermal protection necessary.';
    if (reading.temperature >= 40.0) {
      heatLevel = 'Critical';
      heatAdvice = 'Run intermittent sprinkler cooling. Avoid midday operations.';
    } else if (reading.temperature >= 35.0) {
      heatLevel = 'High';
      heatAdvice = 'Irrigate in early morning to buffer root temperature.';
    } else if (reading.temperature >= 30.0 && reading.humidity < 40.0) {
      heatLevel = 'Moderate';
      heatAdvice = 'Monitor for afternoon leaf curl.';
    }

    String waterLevel = 'Low';
    String waterAdvice = 'Adequate soil water reserve.';
    if (reading.soilMoisture < 22.0) {
      waterLevel = 'Critical';
      waterAdvice = 'Initiate drip cycle immediately to salvage crop yield.';
    } else if (reading.soilMoisture < 35.0) {
      waterLevel = 'High';
      waterAdvice = 'Queue irrigation within 4-6 hours.';
    } else if (reading.soilMoisture < 45.0) {
      waterLevel = 'Moderate';
      waterAdvice = 'Plan irrigation before tomorrow noon.';
    }

    String floodLevel = 'Low';
    String floodAdvice = 'Drainage channels clear. Operations safe.';
    if (reading.soilMoisture > 85.0 && reading.rainProbability > 70.0) {
      floodLevel = 'Critical';
      floodAdvice = 'Open perimeter drainage trenches to prevent root asphyxiation.';
    } else if (reading.soilMoisture > 80.0) {
      floodLevel = 'High';
      floodAdvice = 'Halt all irrigation pumps and check furrow drainage.';
    } else if (reading.soilMoisture > 72.0) {
      floodLevel = 'Moderate';
      floodAdvice = 'Inspect field low-lying hollows.';
    }

    return EnvironmentalRiskAnalysis(
      heatStressLevel: heatLevel,
      heatStressAdvice: heatAdvice,
      waterStressLevel: waterLevel,
      waterStressAdvice: waterAdvice,
      floodRiskLevel: floodLevel,
      floodRiskAdvice: floodAdvice,
    );
  }

  static List<AlertItem> generateAlerts(SensorReading reading, DemoScenario scenario) {
    final List<AlertItem> alerts = [];
    final now = DateTime.now();

    if (scenario == DemoScenario.disease || (reading.humidity > 82.0 && reading.temperature > 26.0)) {
      alerts.pushAlert(AlertItem(
        id: 'alt_dis_${now.millisecondsSinceEpoch}',
        type: AlertType.disease,
        severity: AlertSeverity.critical,
        title: 'Fungal Blight Risk Elevated',
        message: 'High humidity (${reading.humidity.toStringAsFixed(0)}%) fosters rapid fungal spore germination.',
        timestamp: now,
        triggerMetric: 'Humidity > 80%',
        recommendedAction: 'Inspect lower leaf canopy; apply Trichoderma viride preventative bio-spray.',
      ));
    }

    if (scenario == DemoScenario.pest) {
      alerts.pushAlert(AlertItem(
        id: 'alt_pest_${now.millisecondsSinceEpoch}',
        type: AlertType.pest,
        severity: AlertSeverity.critical,
        title: 'Pest Infestation Warning',
        message: 'Microclimate triggers aphid & thrips colony proliferation.',
        timestamp: now,
        triggerMetric: 'Pest incubation threshold exceeded',
        recommendedAction: 'Deploy yellow sticky traps and spray 5% neem extract.',
      ));
    }

    if (scenario == DemoScenario.lowMoisture || reading.soilMoisture < 32.0) {
      alerts.pushAlert(AlertItem(
        id: 'alt_irr_${now.millisecondsSinceEpoch}',
        type: AlertType.irrigation,
        severity: AlertSeverity.warning,
        title: 'Soil Moisture Depletion',
        message: 'Moisture dropped below 35% critical buffer.',
        timestamp: now,
        triggerMetric: 'Soil Moisture: ${reading.soilMoisture.toStringAsFixed(0)}%',
        recommendedAction: 'Activate Zone 2 irrigation valve for 45 mins.',
      ));
    }

    if (scenario == DemoScenario.heatStress || reading.temperature > 37.0) {
      alerts.pushAlert(AlertItem(
        id: 'alt_heat_${now.millisecondsSinceEpoch}',
        type: AlertType.heat,
        severity: AlertSeverity.critical,
        title: 'Thermal Heat Stress Alert',
        message: 'Ambient heat ${reading.temperature.toStringAsFixed(1)}°C accelerates wilting.',
        timestamp: now,
        triggerMetric: 'Temperature > 37°C',
        recommendedAction: 'Shade vulnerable beds and avoid noon chemical spraying.',
      ));
    }

    if (scenario == DemoScenario.flood || (reading.soilMoisture > 85.0 && reading.rainProbability > 70.0)) {
      alerts.pushAlert(AlertItem(
        id: 'alt_fld_${now.millisecondsSinceEpoch}',
        type: AlertType.flood,
        severity: AlertSeverity.critical,
        title: 'Waterlogging & Flood Hazard',
        message: 'Soil saturation above 85% with heavy precipitation forecasted.',
        timestamp: now,
        triggerMetric: 'Moisture > 85%, Rain > 70%',
        recommendedAction: 'Clear field ditches to prevent root rot.',
      ));
    }

    return alerts;
  }
}

extension AlertListExtension on List<AlertItem> {
  void pushAlert(AlertItem item) {
    add(item);
  }
}
