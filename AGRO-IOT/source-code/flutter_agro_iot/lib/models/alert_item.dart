enum AlertType {
  disease,
  pest,
  irrigation,
  heat,
  flood,
}

enum AlertSeverity {
  critical,
  warning,
  info,
}

class AlertItem {
  final String id;
  final AlertType type;
  final AlertSeverity severity;
  final String title;
  final String message;
  final DateTime timestamp;
  final String triggerMetric;
  final String recommendedAction;
  bool acknowledged;

  AlertItem({
    required this.id,
    required this.type,
    required this.severity,
    required this.title,
    required this.message,
    required this.timestamp,
    required this.triggerMetric,
    required this.recommendedAction,
    this.acknowledged = false,
  });
}
