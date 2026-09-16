import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../main.dart';
import '../models/alert_item.dart';

class AlertsScreen extends StatefulWidget {
  const AlertsScreen({super.key});

  @override
  State<AlertsScreen> createState() => _AlertsScreenState();
}

class _AlertsScreenState extends State<AlertsScreen> {
  String _selectedFilter = 'ALL';

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AgroAppState>();
    final allAlerts = state.alerts;

    final filteredAlerts = allAlerts.where((a) {
      if (_selectedFilter == 'ALL') return true;
      if (_selectedFilter == 'DISEASE' && a.type == AlertType.disease) return true;
      if (_selectedFilter == 'PEST' && a.type == AlertType.pest) return true;
      if (_selectedFilter == 'IRRIGATION' && a.type == AlertType.irrigation) return true;
      if (_selectedFilter == 'HEAT' && a.type == AlertType.heat) return true;
      if (_selectedFilter == 'FLOOD' && a.type == AlertType.flood) return true;
      return false;
    }).toList();

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Category Filter Chips
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              _buildFilterChip('ALL', 'All Alerts (${allAlerts.length})'),
              _buildFilterChip('DISEASE', 'Disease'),
              _buildFilterChip('PEST', 'Pest'),
              _buildFilterChip('IRRIGATION', 'Irrigation'),
              _buildFilterChip('HEAT', 'Heat'),
              _buildFilterChip('FLOOD', 'Flood'),
            ],
          ),
        ),

        const SizedBox(height: 14),

        if (filteredAlerts.isEmpty)
          Center(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                children: [
                  Icon(Icons.verified_user_outlined, size: 48, color: Colors.green.shade400),
                  const SizedBox(height: 12),
                  const Text('No Active Alerts in this Category', style: TextStyle(fontWeight: FontWeight.bold)),
                  const Text('Field telemetry is within safe operating margins.', style: TextStyle(fontSize: 12, color: Colors.black54)),
                ],
              ),
            ),
          )
        else
          ...filteredAlerts.map((alert) {
            Color sevColor = Colors.green;
            IconData sevIcon = Icons.info_outline;

            if (alert.severity == AlertSeverity.critical) {
              sevColor = Colors.red;
              sevIcon = Icons.error_outline_rounded;
            } else if (alert.severity == AlertSeverity.warning) {
              sevColor = Colors.orange;
              sevIcon = Icons.warning_amber_rounded;
            }

            return Card(
              margin: const EdgeInsets.only(bottom: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
                side: BorderSide(color: alert.acknowledged ? Colors.grey.shade300 : sevColor.withOpacity(0.5)),
              ),
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(sevIcon, color: sevColor, size: 22),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                alert.title,
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                  color: alert.acknowledged ? Colors.black54 : Colors.black87,
                                ),
                              ),
                              Text(
                                alert.triggerMetric,
                                style: const TextStyle(fontSize: 11, color: Colors.black45),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: sevColor.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            alert.severity.name.toUpperCase(),
                            style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: sevColor),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      alert.message,
                      style: const TextStyle(fontSize: 12, color: Colors.black87, height: 1.3),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade50,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Action: ', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                          Expanded(
                            child: Text(alert.recommendedAction, style: const TextStyle(fontSize: 11)),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '${alert.timestamp.hour.toString().padLeft(2, '0')}:${alert.timestamp.minute.toString().padLeft(2, '0')}',
                          style: const TextStyle(fontSize: 10, color: Colors.black45),
                        ),
                        if (!alert.acknowledged)
                          TextButton.icon(
                            style: TextButton.styleFrom(visualDensity: VisualDensity.compact),
                            icon: const Icon(Icons.check, size: 14),
                            label: const Text('Acknowledge', style: TextStyle(fontSize: 11)),
                            onPressed: () => state.acknowledgeAlert(alert.id),
                          )
                        else
                          const Row(
                            children: [
                              Icon(Icons.done_all, size: 14, color: Colors.green),
                              SizedBox(width: 4),
                              Text('Acknowledged', style: TextStyle(fontSize: 11, color: Colors.green)),
                            ],
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          }),
      ],
    );
  }

  Widget _buildFilterChip(String key, String label) {
    final isSelected = _selectedFilter == key;
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: ChoiceChip(
        label: Text(label, style: TextStyle(fontSize: 11, fontWeight: isSelected ? FontWeight.bold : FontWeight.normal)),
        selected: isSelected,
        onSelected: (_) => setState(() => _selectedFilter = key),
        selectedColor: const Color(0xFFC8E6C9),
      ),
    );
  }
}
