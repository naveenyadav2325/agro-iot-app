enum DemoScenario {
  normal,
  lowMoisture,
  heatStress,
  disease,
  pest,
  flood,
}

extension DemoScenarioExtension on DemoScenario {
  String get displayName {
    switch (this) {
      case DemoScenario.normal:
        return 'NORMAL';
      case DemoScenario.lowMoisture:
        return 'LOW MOISTURE';
      case DemoScenario.heatStress:
        return 'HEAT STRESS';
      case DemoScenario.disease:
        return 'DISEASE';
      case DemoScenario.pest:
        return 'PEST';
      case DemoScenario.flood:
        return 'FLOOD';
    }
  }
}

class SensorReading {
  final double soilMoisture; // 0 - 100 %
  final double temperature;  // °C
  final double humidity;     // 0 - 100 %
  final double rainProbability; // 0 - 100 %
  final DateTime timestamp;
  final int lightLux;
  final int batteryPercent;

  SensorReading({
    required this.soilMoisture,
    required this.temperature,
    required this.humidity,
    required this.rainProbability,
    required this.timestamp,
    this.lightLux = 45000,
    this.batteryPercent = 90,
  });

  SensorReading copyWith({
    double? soilMoisture,
    double? temperature,
    double? humidity,
    double? rainProbability,
    DateTime? timestamp,
    int? lightLux,
    int? batteryPercent,
  }) {
    return SensorReading(
      soilMoisture: soilMoisture ?? this.soilMoisture,
      temperature: temperature ?? this.temperature,
      humidity: humidity ?? this.humidity,
      rainProbability: rainProbability ?? this.rainProbability,
      timestamp: timestamp ?? this.timestamp,
      lightLux: lightLux ?? this.lightLux,
      batteryPercent: batteryPercent ?? this.batteryPercent,
    );
  }
}
