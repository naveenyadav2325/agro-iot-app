class CropScanResult {
  final String id;
  final DateTime timestamp;
  final String? imagePath;
  final String cropName;
  final String healthStatus;
  final String diseaseDetected;
  final String pestDetected;
  final double confidencePercent;
  final String recommendation;
  final String organicRemedy;
  final String chemicalRemedy;
  final bool isMock;

  CropScanResult({
    required this.id,
    required this.timestamp,
    this.imagePath,
    required this.cropName,
    required this.healthStatus,
    required this.diseaseDetected,
    required this.pestDetected,
    required this.confidencePercent,
    required this.recommendation,
    required this.organicRemedy,
    required this.chemicalRemedy,
    this.isMock = true,
  });
}
