import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../main.dart';
import '../models/sensor_reading.dart';
import '../models/irrigation_decision.dart';
import '../services/decision_engine.dart';

class IrrigationScreen extends StatefulWidget {
  const IrrigationScreen({super.key});

  @override
  State<IrrigationScreen> createState() => _IrrigationScreenState();
}

class _IrrigationScreenState extends State<IrrigationScreen> {
  bool _customSimulationMode = false;
  double _simSoilMoisture = 55.0;
  double _simTemp = 28.0;
  double _simHumidity = 60.0;
  double _simRain = 10.0;

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AgroAppState>();
    
    final effectiveReading = _customSimulationMode
        ? SensorReading(
            soilMoisture: _simSoilMoisture,
            temperature: _simTemp,
            humidity: _simHumidity,
            rainProbability: _simRain,
            timestamp: DateTime.now(),
          )
        : state.currentReading;

    final decision = DecisionEngine.evaluateIrrigation(effectiveReading);

    Color statusColor = Colors.green;
    IconData statusIcon = Icons.check_circle_outline;
    if (decision.status == IrrigationStatus.recommended) {
      statusColor = Colors.blue.shade700;
      statusIcon = Icons.water_drop_rounded;
    } else if (decision.status == IrrigationStatus.delay) {
      statusColor = Colors.orange.shade800;
      statusIcon = Icons.schedule_rounded;
    }

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Primary Decision Card
        Card(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: BorderSide(color: statusColor.withOpacity(0.5), width: 2),
          ),
          color: statusColor.withOpacity(0.08),
          child: Padding(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(statusIcon, color: statusColor, size: 32),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            decision.status.label,
                            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: statusColor),
                          ),
                          Text(
                            'Engine: FAO-56 Penman-Monteith Rule System',
                            style: TextStyle(fontSize: 11, color: Colors.grey.shade700),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  decision.reason,
                  style: const TextStyle(fontSize: 13, height: 1.4, color: Colors.black87),
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    _buildMetricChip(
                      icon: Icons.opacity,
                      label: 'Water Volume',
                      value: '${decision.waterAmountMm.toStringAsFixed(0)} mm',
                    ),
                    const SizedBox(width: 8),
                    _buildMetricChip(
                      icon: Icons.timer_outlined,
                      label: 'Drip Duration',
                      value: '${decision.recommendedDurationMinutes} min',
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),

        const SizedBox(height: 16),

        // Live Sensor Telemetry Input Grid
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Input Sensor Parameters', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    Row(
                      children: [
                        const Text('Manual Sliders', style: TextStyle(fontSize: 11, color: Colors.black54)),
                        Switch(
                          value: _customSimulationMode,
                          onChanged: (val) {
                            setState(() {
                              _customSimulationMode = val;
                              if (val) {
                                _simSoilMoisture = state.currentReading.soilMoisture;
                                _simTemp = state.currentReading.temperature;
                                _simHumidity = state.currentReading.humidity;
                                _simRain = state.currentReading.rainProbability;
                              }
                            });
                          },
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                // 1. Soil Moisture
                _buildSlider(
                  label: 'Soil Moisture',
                  value: effectiveReading.soilMoisture,
                  unit: '%',
                  min: 0,
                  max: 100,
                  enabled: _customSimulationMode,
                  onChanged: (v) => setState(() => _simSoilMoisture = v),
                ),
                // 2. Temperature
                _buildSlider(
                  label: 'Temperature',
                  value: effectiveReading.temperature,
                  unit: '°C',
                  min: 10,
                  max: 50,
                  enabled: _customSimulationMode,
                  onChanged: (v) => setState(() => _simTemp = v),
                ),
                // 3. Humidity
                _buildSlider(
                  label: 'Humidity',
                  value: effectiveReading.humidity,
                  unit: '%',
                  min: 10,
                  max: 100,
                  enabled: _customSimulationMode,
                  onChanged: (v) => setState(() => _simHumidity = v),
                ),
                // 4. Rain Probability
                _buildSlider(
                  label: 'Rain Probability',
                  value: effectiveReading.rainProbability,
                  unit: '%',
                  min: 0,
                  max: 100,
                  enabled: _customSimulationMode,
                  onChanged: (v) => setState(() => _simRain = v),
                ),
              ],
            ),
          ),
        ),

        const SizedBox(height: 16),

        // Zone Valve & Schedule Card
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Field Zone Control', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                const SizedBox(height: 12),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const CircleAvatar(
                    backgroundColor: Color(0xFFE8F5E9),
                    child: Icon(Icons.tune_rounded, color: Color(0xFF2E7D32)),
                  ),
                  title: const Text('Zone 1 (Root Drip Irrigation)'),
                  subtitle: Text('Status: ${decision.status == IrrigationStatus.recommended ? 'Queue Ready' : 'Idle'}'),
                  trailing: ElevatedButton(
                    onPressed: decision.status == IrrigationStatus.recommended
                        ? () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Command sent: Zone 1 Valve opened for 45 min')),
                            );
                          }
                        : null,
                    child: const Text('Run Valve'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSlider({
    required String label,
    required double value,
    required String unit,
    required double min,
    required double max,
    required bool enabled,
    required ValueChanged<double> onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
            Text('${value.toStringAsFixed(1)} $unit', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
          ],
        ),
        Slider(
          value: value.clamp(min, max),
          min: min,
          max: max,
          onChanged: enabled ? onChanged : null,
          activeColor: const Color(0xFF2E7D32),
        ),
      ],
    );
  }

  Widget _buildMetricChip({required IconData icon, required String label, required String value}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey.shade300),
      ),
      child: Row(
        children: [
          Icon(icon, size: 16, color: const Color(0xFF2E7D32)),
          const SizedBox(width: 6),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(fontSize: 9, color: Colors.black54)),
              Text(value, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
            ],
          ),
        ],
      ),
    );
  }
}
