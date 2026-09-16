import '../models/crop_scan_result.dart';

abstract class AIInferenceAdapter {
  Future<CropScanResult> analyzeCrop(String imagePath, {String? sampleHint});
  bool get isMock;
  String get engineName;
}
