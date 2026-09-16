import '../models/crop_scan_result.dart';
import 'ai_inference_adapter.dart';

class MockAIInferenceAdapter implements AIInferenceAdapter {
  @override
  bool get isMock => true;

  @override
  String get engineName => 'AgroVision MobileNetV3 (SIH PS 26180 Mock Engine)';

  @override
  Future<CropScanResult> analyzeCrop(String imagePath, {String? sampleHint}) async {
    // Simulate mobile neural network edge inference latency
    await Future.delayed(const Duration(milliseconds: 1200));

    if (sampleHint == 'blight') {
      return CropScanResult(
        id: 'scan_${DateTime.now().millisecondsSinceEpoch}',
        timestamp: DateTime.now(),
        imagePath: imagePath,
        cropName: 'Tomato (Solanum lycopersicum)',
        healthStatus: 'Infected',
        diseaseDetected: 'Early Blight (Alternaria solani)',
        pestDetected: 'None detected',
        confidencePercent: 93.4,
        recommendation: 'Target rings detected. Prune infected foliage immediately to halt spread.',
        organicRemedy: 'Foliar spray of Trichoderma viride or Copper Oxychloride @ 3g/L.',
        chemicalRemedy: 'Mancozeb 75% WP @ 2g/L or Azoxystrobin 23% SC @ 1ml/L.',
      );
    } else if (sampleHint == 'aphid') {
      return CropScanResult(
        id: 'scan_${DateTime.now().millisecondsSinceEpoch}',
        timestamp: DateTime.now(),
        imagePath: imagePath,
        cropName: 'Cotton / Maize',
        healthStatus: 'Damaged',
        diseaseDetected: 'Secondary Sooty Mold Risk',
        pestDetected: 'Aphid Colony (Aphis gossypii)',
        confidencePercent: 91.8,
        recommendation: 'Sap-sucking pest colonization causing leaf curl. Act before viral spread.',
        organicRemedy: 'Apply 5% Neem Seed Kernel Extract (NSKE) with soap surfactant.',
        chemicalRemedy: 'Imidacloprid 17.8% SL @ 0.5ml/L at early morning.',
      );
    }

    return CropScanResult(
      id: 'scan_${DateTime.now().millisecondsSinceEpoch}',
      timestamp: DateTime.now(),
      imagePath: imagePath,
      cropName: 'Wheat / Cereal Foliage',
      healthStatus: 'Healthy',
      diseaseDetected: 'None (Clean photosynthetic tissue)',
      pestDetected: 'None detected',
      confidencePercent: 96.2,
      recommendation: 'Optimal vegetative health. Maintain balanced nitrogen/potassium fertigation.',
      organicRemedy: 'Bi-weekly prophylactic neem oil spray (2ml/L).',
      chemicalRemedy: 'No synthetic intervention warranted.',
    );
  }
}
