import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../main.dart';
import '../models/sensor_reading.dart';
import '../services/decision_engine.dart';
import '../models/irrigation_decision.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AgroAppState>();
    final reading = state.currentReading;
    final irrigation = DecisionEngine.evaluateIrrigation(reading);
    final envRisk = DecisionEngine.evaluateEnvironmentalRisk(reading);

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Farm Header & Field Info
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.location_on, color: Color(0xFF2E7D32), size: 20),
                        SizedBox(width: 6),
                        Text(
                          'Greenfield Organic Farm',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.green.shade50,
                        border: Border.all(color: Colors.green.shade300),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Text(
                        'Sector 4 • North Block',
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF2E7D32)),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                const Text(
                  'Simulation Scenarios (Demo Mode):',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.black54),
                ),
                const SizedBox(height: 8),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: DemoScenario.values.map((sc) {
                      final isSelected = state.currentScenario == sc;
                      return Padding(
                        padding: const EdgeInsets.only(right: 6),
                        child: ChoiceChip(
                          label: Text(sc.displayName, style: TextStyle(fontSize: 11, fontWeight: isSelected ? FontWeight.bold : FontWeight.normal)),
                          selected: isSelected,
                          onSelected: (_) => state.setScenario(sc),
                          selectedColor: const Color(0xFFC8E6C9),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],
            ),
          ),
        ),

        const SizedBox(height: 12),

        // Overall Health & Status Overview
        Row(
          children: [
            Expanded(
              child: Card(
                color: const Color(0xFFE8F5E9),
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Crop Health Index', style: TextStyle(fontSize: 12, color: Colors.black54)),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Icon(
                            state.currentScenario == DemoScenario.normal ? Icons.check_circle_rounded : Icons.warning_rounded,
                            color: state.currentScenario == DemoScenario.normal ? Colors.green : Colors.orange,
                            size: 28,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            state.currentScenario == DemoScenario.normal ? '94%' : state.currentScenario == DemoScenario.disease ? '48%' : '65%',
                            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF1B5E20)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        state.currentScenario == DemoScenario.normal ? 'Optimal Condition' : 'Attention Required',
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Card(
                color: irrigation.status == IrrigationStatus.recommended
                    ? const Color(0xFFE3F2FD)
                    : irrigation.status == IrrigationStatus.delay
                        ? const Color(0xFFFFF3E0)
                        : const Color(0xFFF1F8E9),
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Irrigation Status', style: TextStyle(fontSize: 12, color: Colors.black54)),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Icon(
                            irrigation.status == IrrigationStatus.recommended
                                ? Icons.water_drop_rounded
                                : irrigation.status == IrrigationStatus.delay
                                    ? Icons.schedule_rounded
                                    : Icons.spa_rounded,
                            color: irrigation.status == IrrigationStatus.recommended
                                ? Colors.blue.shade700
                                : irrigation.status == IrrigationStatus.delay
                                    ? Colors.orange.shade800
                                    : Colors.green.shade700,
                            size: 28,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              irrigation.title.replaceAll(' Irrigation', ''),
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: irrigation.status == IrrigationStatus.recommended ? Colors.blue.shade900 : Colors.black87,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        irrigation.status == IrrigationStatus.recommended ? '${irrigation.waterAmountMm}mm Needed' : 'No Action Required',
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),

        const SizedBox(height: 12),

        // 4 Sensor Telemetry Cards
        Row(
          children: [
            Expanded(
              child: _buildSensorCard(
                title: 'Soil Moisture',
                value: '${reading.soilMoisture.toStringAsFixed(1)}%',
                icon: Icons.grass_rounded,
                color: reading.soilMoisture < 35 ? Colors.red : reading.soilMoisture > 80 ? Colors.blue : Colors.green,
                subtitle: reading.soilMoisture < 35 ? 'Low (Dry Soil)' : reading.soilMoisture > 80 ? 'Saturated' : 'Optimal Field Cap.',
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _buildSensorCard(
                title: 'Temperature',
                value: '${reading.temperature.toStringAsFixed(1)}°C',
                icon: Icons.thermostat_rounded,
                color: reading.temperature > 36 ? Colors.deepOrange : Colors.green,
                subtitle: reading.temperature > 36 ? 'Thermal Stress' : 'Favorable Canopy',
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: _buildSensorCard(
                title: 'Air Humidity',
                value: '${reading.humidity.toStringAsFixed(1)}%',
                icon: Icons.cloud_outlined,
                color: reading.humidity > 80 ? Colors.purple : Colors.teal,
                subtitle: reading.humidity > 80 ? 'High (Spore Risk)' : 'Vegetative Standard',
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _buildSensorCard(
                title: 'Rain Forecast',
                value: '${reading.rainProbability.toStringAsFixed(0)}%',
                icon: Icons.umbrella_rounded,
                color: reading.rainProbability > 60 ? Colors.indigo : Colors.blueGrey,
                subtitle: reading.rainProbability > 60 ? 'Precipitation Probable' : 'Clear Sky',
              ),
            ),
          ],
        ),

        const SizedBox(height: 16),

        // Farmer Advisory Card
        Card(
          color: const Color(0xFFFFFDE7),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: const BorderSide(color: Color(0xFFFFF59D)),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.lightbulb_rounded, color: Color(0xFFF57F17), size: 22),
                    SizedBox(width: 8),
                    Text(
                      'Farmer Advisory & Action Plan',
                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFFF57F17)),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  irrigation.reason,
                  style: const TextStyle(fontSize: 13, height: 1.4, color: Colors.black87),
                ),
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.amber.shade200),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.access_time_rounded, size: 16, color: Colors.black54),
                      const SizedBox(width: 6),
                      Text(
                        'Optimal Window: ${irrigation.optimalTimeWindow}',
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),

        const SizedBox(height: 16),

        // Environmental Stress Bar
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Environmental Stress Monitoring',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                _buildRiskRow('Heat Stress', envRisk.heatStressLevel, envRisk.heatStressAdvice),
                const Divider(height: 16),
                _buildRiskRow('Water Stress', envRisk.waterStressLevel, envRisk.waterStressAdvice),
                const Divider(height: 16),
                _buildRiskRow('Flood Risk', envRisk.floodRiskLevel, envRisk.floodRiskAdvice),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSensorCard({
    required String title,
    required String value,
    required IconData icon,
    required Color color,
    required String subtitle,
  }) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(title, style: const TextStyle(fontSize: 12, color: Colors.black54)),
                Icon(icon, size: 18, color: color),
              ],
            ),
            const SizedBox(height: 6),
            Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text(
              subtitle,
              style: TextStyle(fontSize: 10, color: color, fontWeight: FontWeight.w600),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRiskRow(String label, String level, String advice) {
    Color badgeColor = Colors.green;
    if (level == 'Critical') badgeColor = Colors.red;
    if (level == 'High') badgeColor = Colors.orange;
    if (level == 'Moderate') badgeColor = Colors.amber.shade700;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          flex: 2,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
              const SizedBox(height: 2),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: badgeColor.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  level,
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: badgeColor),
                ),
              ),
            ],
          ),
        ),
        Expanded(
          flex: 3,
          child: Text(
            advice,
            style: const TextStyle(fontSize: 12, color: Colors.black87),
          ),
        ),
      ],
    );
  }
}
