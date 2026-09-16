enum IrrigationStatus {
  recommended,
  notRequired,
  delay,
}

extension IrrigationStatusExtension on IrrigationStatus {
  String get label {
    switch (this) {
      case IrrigationStatus.recommended:
        return 'Irrigation Recommended';
      case IrrigationStatus.notRequired:
        return 'Irrigation Not Required';
      case IrrigationStatus.delay:
        return 'Delay Irrigation';
    }
  }
}

class IrrigationDecision {
  final IrrigationStatus status;
  final String title;
  final String reason;
  final double waterAmountMm;
  final int recommendedDurationMinutes;
  final String optimalTimeWindow;
  final String urgency; // 'low', 'medium', 'high'

  IrrigationDecision({
    required this.status,
    required this.title,
    required this.reason,
    required this.waterAmountMm,
    required this.recommendedDurationMinutes,
    required this.optimalTimeWindow,
    required this.urgency,
  });
}

class EnvironmentalRiskAnalysis {
  final String heatStressLevel; // 'Low', 'Moderate', 'High', 'Critical'
  final String heatStressAdvice;
  final String waterStressLevel; // 'Low', 'Moderate', 'High', 'Critical'
  final String waterStressAdvice;
  final String floodRiskLevel; // 'Low', 'Moderate', 'High', 'Critical'
  final String floodRiskAdvice;

  EnvironmentalRiskAnalysis({
    required this.heatStressLevel,
    required this.heatStressAdvice,
    required this.waterStressLevel,
    required this.waterStressAdvice,
    required this.floodRiskLevel,
    required this.floodRiskAdvice,
  });
}
