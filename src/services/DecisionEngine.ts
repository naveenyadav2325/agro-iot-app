import { 
  SensorReading, 
  IrrigationDecision, 
  EnvironmentalRiskAnalysis, 
  CropHealthOverview, 
  DemoScenario, 
  AlertItem, 
  RiskMetric,
  CropScanResult,
  CropConditionType 
} from '../types';

export class DecisionEngine {
  /**
   * Combines Edge AI local inference diagnosis with real-time sensor telemetry
   * to produce a high-value, sensor-fused agronomic recommendation.
   */
  public static generateCombinedRecommendation(
    aiDiagnosis: {
      conditionCategory: CropConditionType;
      diseaseDetected?: string;
      pestDetected?: string;
      nutrientDeficiencyDetected?: string;
      confidencePercent: number;
    },
    reading: SensorReading
  ): string {
    const { conditionCategory, diseaseDetected, pestDetected, nutrientDeficiencyDetected, confidencePercent } = aiDiagnosis;
    const { soilMoisture, temperature, humidity, rainProbability } = reading;

    if (conditionCategory === 'disease') {
      const diseaseName = diseaseDetected || 'Fungal Pathogen';
      if (humidity > 70 || rainProbability > 50) {
        return `⚠️ CRITICAL FUNGAL VECTOR: Edge AI identified ${diseaseName} (${confidencePercent.toFixed(1)}% local confidence) while ambient humidity is high (${humidity.toFixed(0)}%). Humid microclimates accelerate spore germination within 4-6 hours. Withhold overhead sprinkler irrigation immediately to minimize leaf wetness duration; switch strictly to sub-surface drip and apply preventative bio-fungicide.`;
      }
      if (soilMoisture > 78) {
        return `⚠️ DISEASE + ROOT SATURATION: Elevated soil moisture (${soilMoisture.toFixed(0)}%) combined with ${diseaseName} creates anaerobic conditions favoring collar and root rot. Suspend irrigation for 48 hours and inspect furrow drainage.`;
      }
      return `🌿 DISEASE MANAGEMENT: ${diseaseName} detected with ${confidencePercent.toFixed(1)}% edge confidence. Soil moisture (${soilMoisture.toFixed(0)}%) is within safe thresholds. Proceed with targeted bio-fungicide spray while avoiding wetting upper canopy foliage.`;
    }

    if (conditionCategory === 'nutrient_deficiency') {
      const defName = nutrientDeficiencyDetected || 'Nutrient Chlorosis';
      if (soilMoisture < 35) {
        return `⚠️ MOISTURE-INDUCED NUTRIENT BLOCK: Edge AI identified ${defName}, but soil moisture is depleted (${soilMoisture.toFixed(0)}%). Low moisture halts root transpiration and osmotic ion uptake. DO NOT apply dry granular nitrogen/fertilizer directly (risk of root salt burn). First run a 30-minute drip irrigation cycle, then apply water-soluble foliar chelated nutrients.`;
      }
      if (soilMoisture > 80) {
        return `⚠️ WATERLOGGING HYPOXIA: Foliar ${defName} detected alongside saturated soil (${soilMoisture.toFixed(0)}%). Saturated roots lack oxygen for active ion transport. Clear field furrows immediately to aerate root zone before administering foliar supplements.`;
      }
      return `🌱 BALANCED NUTRIENT UPTAKE: Soil moisture is at prime assimilation level (${soilMoisture.toFixed(0)}%). Apply recommended organic bio-fertilizer or foliar micronutrient spray to reverse ${defName}.`;
    }

    if (conditionCategory === 'pest') {
      const pestName = pestDetected || 'Insect Infestation';
      if (temperature > 34) {
        return `⚠️ THERMAL PEST MULTIPLICATION: Edge AI detected ${pestName} under elevated temperature (${temperature.toFixed(1)}°C). High temperatures shorten nymph hatching intervals. Avoid midday pesticide spraying due to volatilization risk and phytotoxicity; spray cold-pressed neem kernel extract (5ml/L) during cool evening hours (18:00 - 19:30).`;
      }
      if (rainProbability > 60) {
        return `⚠️ RAIN DELAY FOR PEST CONTROL: Pest infestation detected (${pestName}), but rain probability is high (${rainProbability.toFixed(0)}%). Postpone foliar application until after rainfall to avoid chemical wash-off.`;
      }
      return `🐛 PEST INTERVENTION: ${pestName} detected with ${confidencePercent.toFixed(1)}% confidence. Current microclimate is suitable for immediate application of bio-insecticide and deployment of yellow sticky pheromone traps.`;
    }

    // Healthy
    if (soilMoisture < 32) {
      return `💧 PREVENTATIVE MOISTURE ALERT: Crop foliage is currently healthy, but root zone is entering moisture stress (${soilMoisture.toFixed(0)}%). Initiate irrigation within 4 hours to sustain cellular turgor and prevent premature wilting.`;
    }
    if (temperature > 38) {
      return `☀️ HEAT VIGOR MONITORING: Foliage is healthy, but extreme ambient temperature (${temperature.toFixed(1)}°C) demands watchful root moisture buffering against thermal stress.`;
    }
    return `✅ HARMONIC EQUILIBRIUM: Edge AI confirms healthy photosynthetic tissues (${confidencePercent.toFixed(1)}% confidence), and all live IoT sensor parameters are within optimal agronomic field capacity. Maintain regular fertigation schedule.`;
  }
  /**
   * Evaluates irrigation requirements based on Soil Moisture, Temperature, Humidity, and Rain Probability.
   */
  public static evaluateIrrigation(reading: SensorReading): IrrigationDecision {
    const { soilMoisture, temperature, humidity, rainProbability } = reading;

    // Rule 1: High rain forecasted (> 60%) -> DELAY irrigation to conserve water and prevent nutrient leaching
    if (rainProbability >= 60) {
      return {
        status: 'DELAY',
        title: 'Delay Irrigation',
        reason: `Rain forecasted (${rainProbability}% probability). Withholding watering to prevent waterlogging, soil compaction, and fertilizer run-off.`,
        waterAmountMm: 0,
        recommendedDurationMinutes: 0,
        optimalTimeWindow: 'Re-evaluate in 6 hours after rainfall',
        urgency: 'low',
        estimatedWaterLitersPerAcre: 0,
      };
    }

    // Rule 2: Critically low moisture (< 32%)
    if (soilMoisture < 32) {
      const extraWater = temperature > 34 ? 30 : 25;
      const duration = temperature > 34 ? 60 : 45;
      return {
        status: 'RECOMMENDED',
        title: 'Urgent Irrigation Recommended',
        reason: `Soil moisture is at a critical deficit (${soilMoisture.toFixed(1)}%). Crops are approaching wilting point under ${temperature.toFixed(1)}°C temperature.`,
        waterAmountMm: extraWater,
        recommendedDurationMinutes: duration,
        optimalTimeWindow: 'Immediate or early dawn (05:00 - 07:00 AM)',
        urgency: 'high',
        estimatedWaterLitersPerAcre: extraWater * 1000, // 1mm = ~1,000 L/acre
      };
    }

    // Rule 3: Moderate soil moisture (32% - 46%) + High temperature (> 32°C) or Low humidity (< 40%)
    if (soilMoisture < 46 && (temperature > 32 || humidity < 40)) {
      return {
        status: 'RECOMMENDED',
        title: 'Irrigation Recommended',
        reason: `High atmospheric vapor pressure deficit (Temp: ${temperature.toFixed(1)}°C, Humidity: ${humidity.toFixed(1)}%). Moisture depletion is accelerating.`,
        waterAmountMm: 18,
        recommendedDurationMinutes: 35,
        optimalTimeWindow: 'Evening (05:30 - 07:30 PM) or early morning',
        urgency: 'medium',
        estimatedWaterLitersPerAcre: 18000,
      };
    }

    // Rule 4: Standard depleted moisture (< 45%) without rain forecast
    if (soilMoisture < 45) {
      return {
        status: 'RECOMMENDED',
        title: 'Maintenance Irrigation Recommended',
        reason: `Soil moisture (${soilMoisture.toFixed(1)}%) has dropped below standard crop field capacity (50-70%).`,
        waterAmountMm: 15,
        recommendedDurationMinutes: 30,
        optimalTimeWindow: 'Next scheduled window: 06:00 AM',
        urgency: 'medium',
        estimatedWaterLitersPerAcre: 15000,
      };
    }

    // Rule 5: Excess moisture (> 75%)
    if (soilMoisture >= 75) {
      return {
        status: 'NOT_REQUIRED',
        title: 'Irrigation Not Required',
        reason: `Soil moisture is saturated (${soilMoisture.toFixed(1)}%). Root-zone aeration requires drying out.`,
        waterAmountMm: 0,
        recommendedDurationMinutes: 0,
        optimalTimeWindow: 'Next check in 24 hours',
        urgency: 'low',
        estimatedWaterLitersPerAcre: 0,
      };
    }

    // Rule 6: Optimal range (45% - 75%)
    return {
      status: 'NOT_REQUIRED',
      title: 'Irrigation Not Required',
      reason: `Soil moisture (${soilMoisture.toFixed(1)}%) is within the optimal vegetative comfort zone (50-70%).`,
      waterAmountMm: 0,
      recommendedDurationMinutes: 0,
      optimalTimeWindow: 'Monitoring active. Soil moisture stable.',
      urgency: 'low',
      estimatedWaterLitersPerAcre: 0,
    };
  }

  /**
   * Evaluates environmental stress metrics: Heat Stress, Water Stress, Flood/Waterlogging Risk.
   */
  public static evaluateEnvironmentalRisk(reading: SensorReading): EnvironmentalRiskAnalysis {
    const { temperature, humidity, soilMoisture, rainProbability } = reading;

    // --- 1. Heat Stress ---
    // Heat index calculation approximation
    let heatScore = 15; // baseline low risk
    let heatLevel: RiskMetric['level'] = 'Low';
    let heatDesc = 'Optimal ambient conditions for photosynthesis and vegetative vigor.';
    let heatAdvice = 'Maintain routine field scouting. No thermal protection necessary.';

    if (temperature >= 40) {
      heatLevel = 'Critical';
      heatScore = 92;
      heatDesc = `Extreme heatwave (${temperature.toFixed(1)}°C). High pollen sterility and thermal wilting risk.`;
      heatAdvice = 'Activate overhead micro-sprinklers for canopy cooling. Avoid midday pesticide applications.';
    } else if (temperature >= 35) {
      heatLevel = 'High';
      heatScore = 75;
      heatDesc = `Elevated heat (${temperature.toFixed(1)}°C) accelerating transpiration and stomatal closure.`;
      heatAdvice = 'Irrigate in early morning to buffer soil temperatures. Consider shade cloth in high-value plots.';
    } else if (temperature >= 30 && humidity < 40) {
      heatLevel = 'Moderate';
      heatScore = 50;
      heatDesc = `Moderate heat (${temperature.toFixed(1)}°C) combined with dry air (${humidity.toFixed(1)}% RH).`;
      heatAdvice = 'Monitor shallow-rooted crops for leaf curl during peak 12:00-15:00 hours.';
    }

    // --- 2. Water Stress ---
    let waterScore = 10;
    let waterLevel: RiskMetric['level'] = 'Low';
    let waterDesc = `Adequate moisture reserve (${soilMoisture.toFixed(1)}% VWC). No water stress detected.`;
    let waterAdvice = 'Maintain consistent soil moisture balance.';

    if (soilMoisture < 22) {
      waterLevel = 'Critical';
      waterScore = 95;
      waterDesc = `Severe root-zone drought (${soilMoisture.toFixed(1)}%). Crop is entering permanent wilting point.`;
      waterAdvice = 'Initiate drip cycle immediately to salvage yield. Avoid heavy fertilizer applications.';
    } else if (soilMoisture < 35) {
      waterLevel = 'High';
      waterScore = 70;
      waterDesc = `Moisture deficit (${soilMoisture.toFixed(1)}%). Stunted vegetative growth occurring.`;
      waterAdvice = 'Queue irrigation within 4-6 hours. Check drip line pressure.';
    } else if (soilMoisture < 45) {
      waterLevel = 'Moderate';
      waterScore = 45;
      waterDesc = `Mild deficit (${soilMoisture.toFixed(1)}%). Lower foliage may experience early stress.`;
      waterAdvice = 'Plan irrigation cycle before tomorrow noon.';
    }

    // --- 3. Flood & Waterlogging Risk ---
    let floodScore = 10;
    let floodLevel: RiskMetric['level'] = 'Low';
    let floodDesc = 'Soil drainage is normal. No waterlogging danger.';
    let floodAdvice = 'Drainage channels clear. Standard operations safe.';

    if (soilMoisture > 85 && rainProbability > 70) {
      floodLevel = 'Critical';
      floodScore = 94;
      floodDesc = `Saturated soil (${soilMoisture.toFixed(1)}%) with imminent heavy rainfall (${rainProbability}%).`;
      floodAdvice = 'Open perimeter drainage trenches immediately to prevent root asphyxiation & collar rot.';
    } else if (soilMoisture > 80 || (soilMoisture > 75 && rainProbability > 60)) {
      floodLevel = 'High';
      floodScore = 72;
      floodDesc = `High moisture saturation (${soilMoisture.toFixed(1)}%). Extended saturation risks fungal proliferation.`;
      floodAdvice = 'Halt all irrigation pumps. Inspect furrow drainage points.';
    } else if (soilMoisture > 72 || rainProbability > 65) {
      floodLevel = 'Moderate';
      floodScore = 48;
      floodDesc = `Elevated soil moisture (${soilMoisture.toFixed(1)}%) with possible rain.`;
      floodAdvice = 'Monitor field depressions for standing pools.';
    }

    // Overall resilience score (100 - average risk)
    const overallRisk = (heatScore + waterScore + floodScore) / 3;
    const overallScore = Math.max(5, Math.round(100 - overallRisk));

    return {
      heatStress: {
        level: heatLevel,
        score: heatScore,
        title: 'Heat Stress Risk',
        description: heatDesc,
        actionableAdvice: heatAdvice,
      },
      waterStress: {
        level: waterLevel,
        score: waterScore,
        title: 'Water Stress (Drought)',
        description: waterDesc,
        actionableAdvice: waterAdvice,
      },
      floodRisk: {
        level: floodLevel,
        score: floodScore,
        title: 'Flood & Waterlogging',
        description: floodDesc,
        actionableAdvice: floodAdvice,
      },
      overallScore,
    };
  }

  /**
   * Computes holistic crop health overview for dashboard, dynamically infusing
   * Edge AI local inference scans if available.
   */
  public static evaluateCropHealth(
    reading: SensorReading, 
    scenario: DemoScenario,
    activeAlerts: AlertItem[],
    latestScan?: CropScanResult | null
  ): CropHealthOverview {
    let healthScore = 94;
    let healthStatus: CropHealthOverview['healthStatus'] = 'Optimal';
    let diseaseRisk: CropHealthOverview['diseaseRisk'] = 'Low';
    let pestRisk: CropHealthOverview['pestRisk'] = 'Low';
    let advisory = 'Field parameters are favorable. Maintain routine scouting and standard fertigation schedule.';

    switch (scenario) {
      case 'NORMAL':
        healthScore = 95;
        healthStatus = 'Optimal';
        diseaseRisk = 'Low';
        pestRisk = 'Low';
        advisory = 'Optimal vegetative conditions. Soil moisture and canopy temperature are in equilibrium. Keep routine checks.';
        break;

      case 'LOW_MOISTURE':
        healthScore = 64;
        healthStatus = 'Moderate';
        diseaseRisk = 'Low';
        pestRisk = 'Moderate';
        advisory = 'Moisture deficit observed in root zone. Irrigate in early morning to prevent stomatal shock and leaf wilt.';
        break;

      case 'HEAT_STRESS':
        healthScore = 58;
        healthStatus = 'Moderate';
        diseaseRisk = 'Low';
        pestRisk = 'Moderate';
        advisory = 'High thermal index (>38°C). Avoid chemical spraying during sun peak. Run intermittent sprinkler pulses for evaporative cooling.';
        break;

      case 'DISEASE':
        healthScore = 48;
        healthStatus = 'Critical';
        diseaseRisk = 'High';
        pestRisk = 'Low';
        advisory = 'High relative humidity combined with warm soil creates prime fungal blight conditions. Inspect lower canopy leaves and apply organic fungicide.';
        break;

      case 'PEST':
        healthScore = 52;
        healthStatus = 'Critical';
        diseaseRisk = 'Moderate';
        pestRisk = 'High';
        advisory = 'Pest activity threshold exceeded (aphid / borer cluster detected in sector 4). Deploy pheromone traps and localized neem oil spray.';
        break;

      case 'FLOOD':
        healthScore = 42;
        healthStatus = 'Critical';
        diseaseRisk = 'High';
        pestRisk = 'Moderate';
        advisory = 'Severe soil saturation detected (>85%). Dig drainage outlets to avoid root rot and anaerobic soil hypoxia.';
        break;
    }

    // Blend in recent Edge AI on-device diagnostic scan if available
    if (latestScan) {
      if (latestScan.conditionCategory === 'disease') {
        diseaseRisk = 'High';
        healthScore = Math.min(healthScore, 48);
        healthStatus = 'Critical';
        advisory = `[Edge AI Detected: ${latestScan.diseaseDetected}] ${latestScan.combinedRecommendation || latestScan.recommendation}`;
      } else if (latestScan.conditionCategory === 'pest') {
        pestRisk = 'High';
        healthScore = Math.min(healthScore, 54);
        healthStatus = 'Critical';
        advisory = `[Edge AI Detected: ${latestScan.pestDetected}] ${latestScan.combinedRecommendation || latestScan.recommendation}`;
      } else if (latestScan.conditionCategory === 'nutrient_deficiency') {
        healthScore = Math.min(healthScore, 62);
        healthStatus = 'Moderate';
        advisory = `[Edge AI Detected: ${latestScan.nutrientDeficiencyDetected || 'Nutrient Deficiency'}] ${latestScan.combinedRecommendation || latestScan.recommendation}`;
      } else if (latestScan.conditionCategory === 'healthy') {
        if (scenario === 'NORMAL') {
          healthScore = Math.max(healthScore, 96);
          healthStatus = 'Optimal';
          diseaseRisk = 'Low';
          pestRisk = 'Low';
          advisory = `[Edge AI Verified Healthy] Intact photosynthetic foliage verified on-device. Sensor conditions are in prime balance.`;
        }
      }
    }

    return {
      overallHealthScore: healthScore,
      healthStatus,
      diseaseRisk,
      pestRisk,
      advisoryText: advisory,
      activeAlertCount: activeAlerts.filter(a => !a.acknowledged).length,
    };
  }

  /**
   * Generates dynamic alerts based on telemetry and scenario.
   */
  public static generateAlerts(reading: SensorReading, scenario: DemoScenario): AlertItem[] {
    const alerts: AlertItem[] = [];
    const timeStr = 'Just now';

    if (scenario === 'DISEASE' || (reading.humidity > 82 && reading.temperature > 26)) {
      alerts.push({
        id: 'alt-disease-1',
        type: 'disease',
        severity: 'critical',
        title: 'Fungal Blight Risk Critical',
        message: `High relative humidity (${reading.humidity.toFixed(0)}%) with warm canopy encourages Alternaria / Late Blight spore development.`,
        timestamp: timeStr,
        metricTrigger: `Humidity: ${reading.humidity.toFixed(0)}%, Temp: ${reading.temperature.toFixed(0)}°C`,
        recommendedAction: 'Perform crop scan inspection on lower leaves; apply preventative bio-fungicide (Trichoderma viride).',
        acknowledged: false,
      });
    }

    if (scenario === 'PEST') {
      alerts.push({
        id: 'alt-pest-1',
        type: 'pest',
        severity: 'critical',
        title: 'Pest Infestation Risk Alert',
        message: 'Telemetry & microclimate indicate accelerated pest incubation rate for sap-sucking insects (Aphids & Thrips).',
        timestamp: timeStr,
        metricTrigger: 'Canopy temperature anomaly + Pest index > 78%',
        recommendedAction: 'Install yellow sticky traps and spray 5ml/L cold-pressed neem kernel extract at dusk.',
        acknowledged: false,
      });
    }

    if (scenario === 'LOW_MOISTURE' || reading.soilMoisture < 32) {
      alerts.push({
        id: 'alt-irr-1',
        type: 'irrigation',
        severity: 'warning',
        title: 'Soil Moisture Deficit Alert',
        message: `Soil moisture dropped to ${reading.soilMoisture.toFixed(0)}%, which is below the 40% crop safety threshold.`,
        timestamp: timeStr,
        metricTrigger: `Soil Moisture: ${reading.soilMoisture.toFixed(0)}% (Safety min: 40%)`,
        recommendedAction: 'Activate Zone 2 irrigation valve for 45 minutes.',
        acknowledged: false,
      });
    }

    if (scenario === 'HEAT_STRESS' || reading.temperature > 37) {
      alerts.push({
        id: 'alt-heat-1',
        type: 'heat',
        severity: 'critical',
        title: 'Thermal Heat Stress Warning',
        message: `Field ambient temperature reached ${reading.temperature.toFixed(1)}°C. High evapotranspiration rate.`,
        timestamp: timeStr,
        metricTrigger: `Temperature: ${reading.temperature.toFixed(1)}°C (Stress limit: 35°C)`,
        recommendedAction: 'Ensure shade cloth deployment and avoid foliar fertilization during noon hours.',
        acknowledged: false,
      });
    }

    if (scenario === 'FLOOD' || (reading.soilMoisture > 82 && reading.rainProbability > 65)) {
      alerts.push({
        id: 'alt-flood-1',
        type: 'flood',
        severity: 'critical',
        title: 'Flood & Root Hypoxia Warning',
        message: `Volumetric moisture at ${reading.soilMoisture.toFixed(0)}% with ${reading.rainProbability.toFixed(0)}% storm probability.`,
        timestamp: timeStr,
        metricTrigger: `Soil Saturation: ${reading.soilMoisture.toFixed(0)}%, Rain Prob: ${reading.rainProbability.toFixed(0)}%`,
        recommendedAction: 'Clear field perimeter furrows to evacuate excess standing water.',
        acknowledged: false,
      });
    }

    if (alerts.length === 0) {
      // Normal routine alert
      alerts.push({
        id: 'alt-normal-1',
        type: 'irrigation',
        severity: 'info',
        title: 'Optimal Field Balance',
        message: 'All sensor telemetry parameters (Moisture, Temp, Humidity) are within prime agronomic ranges.',
        timestamp: '15 mins ago',
        metricTrigger: `Moisture: ${reading.soilMoisture.toFixed(0)}%, Temp: ${reading.temperature.toFixed(0)}°C`,
        recommendedAction: 'No immediate action required. Scheduled monitoring ongoing.',
        acknowledged: false,
      });
    }

    return alerts;
  }
}
