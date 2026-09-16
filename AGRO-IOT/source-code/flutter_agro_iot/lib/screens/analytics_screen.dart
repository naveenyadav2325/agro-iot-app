import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../main.dart';

class AnalyticsScreen extends StatefulWidget {
  const AnalyticsScreen({super.key});

  @override
  State<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends State<AnalyticsScreen> {
  String _selectedMetric = 'soilMoisture'; // 'soilMoisture' | 'temperature' | 'humidity'
  String _selectedRange = '24H';

  // Realistic mock curve points
  final List<double> _moisture24h = [58, 57, 57, 56, 55, 55, 54, 53, 52, 50, 49, 48, 48, 49, 52, 56, 58, 59, 59, 58, 58, 58, 57, 58];
  final List<double> _temp24h = [22, 21, 21, 20, 20, 21, 23, 25, 28, 30, 32, 33, 33, 32, 30, 28, 27, 26, 25, 24, 24, 23, 23, 22];
  final List<double> _hum24h = [78, 80, 82, 85, 84, 80, 75, 68, 60, 52, 48, 45, 46, 50, 55, 62, 66, 70, 72, 74, 75, 76, 77, 78];

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AgroAppState>();
    final reading = state.currentReading;

    List<double> activeData = _moisture24h;
    String unit = '%';
    String title = 'Soil Moisture History';
    Color metricColor = const Color(0xFF2E7D32);

    if (_selectedMetric == 'temperature') {
      activeData = _temp24h;
      unit = '°C';
      title = 'Ambient Temperature Trend';
      metricColor = Colors.deepOrange;
    } else if (_selectedMetric == 'humidity') {
      activeData = _hum24h;
      unit = '%';
      title = 'Relative Humidity Trend';
      metricColor = Colors.teal;
    }

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Metric Switcher Chips
        Row(
          children: [
            Expanded(
              child: ChoiceChip(
                label: const Text('Moisture'),
                selected: _selectedMetric == 'soilMoisture',
                onSelected: (_) => setState(() => _selectedMetric = 'soilMoisture'),
                selectedColor: const Color(0xFFC8E6C9),
              ),
            ),
            const SizedBox(width: 6),
            Expanded(
              child: ChoiceChip(
                label: const Text('Temp'),
                selected: _selectedMetric == 'temperature',
                onSelected: (_) => setState(() => _selectedMetric = 'temperature'),
                selectedColor: Colors.orange.shade100,
              ),
            ),
            const SizedBox(width: 6),
            Expanded(
              child: ChoiceChip(
                label: const Text('Humidity'),
                selected: _selectedMetric == 'humidity',
                onSelected: (_) => setState(() => _selectedMetric = 'humidity'),
                selectedColor: Colors.teal.shade100,
              ),
            ),
          ],
        ),

        const SizedBox(height: 14),

        // Chart Card
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(_selectedRange, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  'Current Telemetry: ${_selectedMetric == 'soilMoisture' ? reading.soilMoisture.toStringAsFixed(1) : _selectedMetric == 'temperature' ? reading.temperature.toStringAsFixed(1) : reading.humidity.toStringAsFixed(1)} $unit',
                  style: TextStyle(fontSize: 12, color: metricColor, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 20),

                // Visual Sparkline / Bar Chart representation
                SizedBox(
                  height: 160,
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: activeData.asMap().entries.map((entry) {
                      final val = entry.value;
                      final maxVal = _selectedMetric == 'temperature' ? 45.0 : 100.0;
                      final heightFraction = (val / maxVal).clamp(0.05, 1.0);

                      return Expanded(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 1.5),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              Container(
                                height: 130 * heightFraction,
                                decoration: BoxDecoration(
                                  color: entry.key == activeData.length - 1 ? metricColor : metricColor.withOpacity(0.55),
                                  borderRadius: const BorderRadius.vertical(top: Radius.circular(3)),
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                entry.key % 6 == 0 ? '${entry.key}h' : '',
                                style: const TextStyle(fontSize: 8, color: Colors.black45),
                              ),
                            ],
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),

                const SizedBox(height: 12),
                const Divider(),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildStatCol('Minimum', '${activeData.reduce((a, b) => a < b ? a : b).toStringAsFixed(0)} $unit'),
                    _buildStatCol('Average', '${(activeData.reduce((a, b) => a + b) / activeData.length).toStringAsFixed(1)} $unit'),
                    _buildStatCol('Maximum', '${activeData.reduce((a, b) => a > b ? a : b).toStringAsFixed(0)} $unit'),
                  ],
                ),
              ],
            ),
          ),
        ),

        const SizedBox(height: 16),

        // Agronomic Threshold Analysis
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Agronomic Threshold Safety Zones', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                const SizedBox(height: 10),
                _buildThresholdRow('Soil Moisture Target', '45% - 70%', 'Optimum field capacity for root respiration', Colors.green),
                const SizedBox(height: 8),
                _buildThresholdRow('Thermal Comfort', '20°C - 32°C', 'Max photosynthetic rate window', Colors.orange),
                const SizedBox(height: 8),
                _buildThresholdRow('Humidity Range', '50% - 75%', 'Prevents fungal sporulation & desiccation', Colors.teal),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStatCol(String label, String value) {
    return Column(
      children: [
        Text(label, style: const TextStyle(fontSize: 11, color: Colors.black54)),
        const SizedBox(height: 2),
        Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildThresholdRow(String title, String range, String note, Color color) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 10,
          height: 10,
          margin: const EdgeInsets.only(top: 4, right: 8),
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12)),
                  Text(range, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: color)),
                ],
              ),
              Text(note, style: const TextStyle(fontSize: 11, color: Colors.black54)),
            ],
          ),
        ),
      ],
    );
  }
}
