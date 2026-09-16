import 'dart:async';
import 'dart:math';
import '../models/sensor_reading.dart';
import 'sensor_adapter.dart';

class MockSensorAdapter implements SensorAdapter {
  final _streamController = StreamController<SensorReading>.broadcast();
  DemoScenario _currentScenario = DemoScenario.normal;
  late SensorReading _currentReading;
  Timer? _timer;
  final Random _random = Random();

  MockSensorAdapter() {
    _currentReading = _createReadingForScenario(_currentScenario);
    _startEmulation();
  }

  @override
  Stream<SensorReading> get sensorStream => _streamController.stream;

  @override
  Future<SensorReading> getLatestReading() async {
    return _currentReading;
  }

  @override
  void setScenario(DemoScenario scenario) {
    _currentScenario = scenario;
    _currentReading = _createReadingForScenario(scenario);
    _streamController.add(_currentReading);
  }

  @override
  void overrideReading(SensorReading reading) {
    _currentReading = reading;
    _streamController.add(_currentReading);
  }

  void _startEmulation() {
    _timer = Timer.periodic(const Duration(seconds: 4), (_) {
      final jitterTemp = (_random.nextDouble() - 0.5) * 0.4;
      final jitterMoist = (_random.nextDouble() - 0.5) * 0.6;
      final jitterHum = (_random.nextDouble() - 0.5) * 0.8;

      _currentReading = _currentReading.copyWith(
        soilMoisture: (_currentReading.soilMoisture + jitterMoist).clamp(0.0, 100.0),
        temperature: (_currentReading.temperature + jitterTemp).clamp(-10.0, 60.0),
        humidity: (_currentReading.humidity + jitterHum).clamp(10.0, 100.0),
        timestamp: DateTime.now(),
      );

      _streamController.add(_currentReading);
    });
  }

  SensorReading _createReadingForScenario(DemoScenario scenario) {
    final now = DateTime.now();
    switch (scenario) {
      case DemoScenario.normal:
        return SensorReading(
          soilMoisture: 58.0,
          temperature: 26.5,
          humidity: 62.0,
          rainProbability: 15.0,
          timestamp: now,
        );
      case DemoScenario.lowMoisture:
        return SensorReading(
          soilMoisture: 23.0,
          temperature: 31.8,
          humidity: 38.0,
          rainProbability: 8.0,
          timestamp: now,
        );
      case DemoScenario.heatStress:
        return SensorReading(
          soilMoisture: 36.0,
          temperature: 41.2,
          humidity: 29.0,
          rainProbability: 4.0,
          timestamp: now,
        );
      case DemoScenario.disease:
        return SensorReading(
          soilMoisture: 69.0,
          temperature: 28.4,
          humidity: 89.0,
          rainProbability: 38.0,
          timestamp: now,
        );
      case DemoScenario.pest:
        return SensorReading(
          soilMoisture: 46.0,
          temperature: 33.2,
          humidity: 52.0,
          rainProbability: 14.0,
          timestamp: now,
        );
      case DemoScenario.flood:
        return SensorReading(
          soilMoisture: 92.0,
          temperature: 23.5,
          humidity: 94.0,
          rainProbability: 88.0,
          timestamp: now,
        );
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    _streamController.close();
  }
}
