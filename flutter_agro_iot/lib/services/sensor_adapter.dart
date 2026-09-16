import '../models/sensor_reading.dart';

abstract class SensorAdapter {
  Future<SensorReading> getLatestReading();
  Stream<SensorReading> get sensorStream;
  void setScenario(DemoScenario scenario);
  void overrideReading(SensorReading reading);
  void dispose();
}
