import { CropScanResult, EdgeAIStatusInfo, SensorReading, CropConditionType } from '../types';
import { EdgeAIAdapter, EdgeAIModelMetadata } from './EdgeAIAdapter';
import { DecisionEngine } from './DecisionEngine';

export interface EdgeCropSample {
  id: string;
  name: string;
  crop: string;
  conditionCategory: CropConditionType;
  condition: string;
  imageUri: string;
  diseaseDetected: string;
  pestDetected: string;
  nutrientDeficiencyDetected?: string;
  healthStatus: CropScanResult['healthStatus'];
  confidence: number;
  recommendation: string;
  organicRemedy: string;
  chemicalRemedy: string;
  affectedAreaPercent: number;
}

export const EDGE_CROP_SAMPLES: EdgeCropSample[] = [
  {
    id: 'sample-healthy',
    name: 'Healthy Wheat / Maize Foliage',
    crop: 'Wheat (Triticum aestivum)',
    conditionCategory: 'healthy',
    condition: 'Optimal Vigorous Leaf Structure',
    imageUri: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80',
    diseaseDetected: 'None (Clean photosynthetic tissue)',
    pestDetected: 'None detected',
    nutrientDeficiencyDetected: 'None (Balanced N-P-K levels)',
    healthStatus: 'Healthy',
    confidence: 94.6,
    recommendation: 'Foliage exhibits vigorous chlorophyll concentration and intact stomatal margins. Continue regular fertigation schedule.',
    organicRemedy: 'Prophylactic cold-pressed neem oil (2ml/L) once every 14 days as biosecurity barrier.',
    chemicalRemedy: 'No synthetic chemicals required.',
    affectedAreaPercent: 0,
  },
  {
    id: 'sample-blight',
    name: 'Tomato Early Blight (Alternaria solani)',
    crop: 'Tomato (Solanum lycopersicum)',
    conditionCategory: 'disease',
    condition: 'Concentric Target Rings on Lower Leaves',
    imageUri: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb22511?auto=format&fit=crop&w=600&q=80',
    diseaseDetected: 'Early Blight (Alternaria solani)',
    pestDetected: 'None detected',
    nutrientDeficiencyDetected: 'None',
    healthStatus: 'Infected',
    confidence: 93.2,
    recommendation: 'Targeted bio-fungicide required immediately. Prune lower canopy foliage touching the soil to restrict rain-splash spore transmission.',
    organicRemedy: 'Copper oxychloride or Trichoderma viride @ 4g/L sprayed during morning hours.',
    chemicalRemedy: 'Mancozeb 75% WP @ 2.5g/L or Azoxystrobin 23% SC @ 1ml/L applied on foliage undersides.',
    affectedAreaPercent: 28,
  },
  {
    id: 'sample-aphid',
    name: 'Cotton / Maize Aphid Infestation',
    crop: 'Cotton / Maize',
    conditionCategory: 'pest',
    condition: 'Sucking Pest Colonization on Ventral Surface',
    imageUri: 'https://images.unsplash.com/photo-1598030304671-5aa1d6f21128?auto=format&fit=crop&w=600&q=80',
    diseaseDetected: 'Secondary Sooty Mold Risk',
    pestDetected: 'Aphids (Aphis gossypii) - Nymph Cluster',
    nutrientDeficiencyDetected: 'None',
    healthStatus: 'Damaged',
    confidence: 91.8,
    recommendation: 'Sap-sucking colony causing leaf curling and honeydew exudation. Intervene quickly before aphids transmit viral mosaic.',
    organicRemedy: 'Spray 5% Neem Seed Kernel Extract (NSKE) or Beauveria bassiana @ 5g/L.',
    chemicalRemedy: 'Imidacloprid 17.8% SL @ 0.5ml/L or Acetamiprid 20% SP @ 0.2g/L with surfactant.',
    affectedAreaPercent: 22,
  },
  {
    id: 'sample-nitrogen',
    name: 'Nitrogen Deficiency Chlorosis',
    crop: 'Rice / Maize (Zea mays)',
    conditionCategory: 'nutrient_deficiency',
    condition: 'V-Shaped Yellowing from Leaf Tip Down Midrib',
    imageUri: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=600&q=80',
    diseaseDetected: 'None (Non-pathogenic physiological chlorosis)',
    pestDetected: 'None detected',
    nutrientDeficiencyDetected: 'Nitrogen (N) Deficiency Chlorosis',
    healthStatus: 'Early Warning',
    confidence: 89.4,
    recommendation: 'Foliar chlorosis along central midrib indicates nitrogen mobilization to younger shoots. Boost nitrogen availability safely.',
    organicRemedy: 'Well-rotted farmyard compost tea or vermicompost leachate foliar spray (10% solution).',
    chemicalRemedy: 'Foliar urea spray @ 1.5% - 2.0% concentration or fertigation with ammonium nitrate.',
    affectedAreaPercent: 35,
  },
  {
    id: 'sample-potassium',
    name: 'Potassium (K) Marginal Scorch',
    crop: 'Soybean / Legumes',
    conditionCategory: 'nutrient_deficiency',
    condition: 'Marginal Leaf Scorch & Necrotic Edges',
    imageUri: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=600&q=80',
    diseaseDetected: 'None',
    pestDetected: 'None detected',
    nutrientDeficiencyDetected: 'Potassium (K) Deficiency',
    healthStatus: 'Early Warning',
    confidence: 88.7,
    recommendation: 'Marginal browning and necrosis on older leaf rims indicates potassium deficiency, compromising crop drought and disease tolerance.',
    organicRemedy: 'Wood ash suspension (5g/L) or potassium sulfate from organic vinasse sources.',
    chemicalRemedy: 'Muriate of Potash (MOP) or soluble Potassium Nitrate (13-0-45) foliar spray @ 1%.',
    affectedAreaPercent: 20,
  },
  {
    id: 'sample-mildew',
    name: 'Cucurbit Powdery Mildew',
    crop: 'Cucurbits / Squash',
    conditionCategory: 'disease',
    condition: 'White Talcum-like Mycelial Patches',
    imageUri: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=600&q=80',
    diseaseDetected: 'Powdery Mildew (Podosphaera xanthii)',
    pestDetected: 'None detected',
    nutrientDeficiencyDetected: 'None',
    healthStatus: 'Infected',
    confidence: 94.1,
    recommendation: 'Ectophytic fungal mycelium covering adaxial leaf surface. Increase air circulation and avoid overhead sprinkler splash.',
    organicRemedy: 'Potassium bicarbonate (3g/L) or diluted milk whey solution (1:9 ratio) sprayed in direct sunlight.',
    chemicalRemedy: 'Sulfur 80% WDG @ 3g/L or Difenoconazole 25% EC @ 0.5ml/L.',
    affectedAreaPercent: 30,
  },
];

/**
 * MockEdgeAIAdapter implements EdgeAIAdapter.
 * 
 * Provides offline-first on-device AI inference emulation, designed to simulate
 * a quantized MobileNetV3 / EfficientNet-Lite INT8 model running on local
 * Android hardware (NNAPI / CPU delegate) without needing an active internet connection.
 * 
 * =========================================================================
 * CLEAR INTEGRATION POINT FOR REAL TENSORFLOW LITE / ONNX MODEL:
 * =========================================================================
 * When integrating the actual Edge AI model into Flutter/Android:
 * 
 * 1. Put model file in Android/Flutter asset path:
 *    `assets/models/agro_vision_mobilenetv3_int8.tflite` (approx 12.4 MB)
 * 
 * 2. In Flutter pubspec.yaml:
 *    dependencies:
 *      tflite_flutter: ^0.10.4
 *      image: ^4.1.7
 * 
 * 3. Initialize interpreter:
 *    final interpreter = await Interpreter.fromAsset(
 *      'assets/models/agro_vision_mobilenetv3_int8.tflite',
 *      options: InterpreterOptions()..useNnapiForAndroid = true,
 *    );
 * 
 * 4. Image Preprocessing:
 *    Resize camera frame to 224x224 RGB, normalize uint8/float32 [0..1 or -1..1].
 * 
 * 5. Run inference:
 *    var output = List.filled(NUM_CLASSES, 0.0).reshape([1, NUM_CLASSES]);
 *    interpreter.run(inputTensor, output);
 * 
 * 6. Softmax & Class Mapping:
 *    Extract top prediction, confidence, and map to [Healthy, Disease, Pest, NutrientDeficiency].
 * =========================================================================
 */
export class MockEdgeAIAdapter implements EdgeAIAdapter {
  private status: EdgeAIStatusInfo = {
    engineOn: true,
    inferenceStatus: 'Idle - Ready',
    modelStatus: 'Loaded (TFLite INT8 • 12.4 MB)',
    lastInferenceTime: null,
    lastInferenceLatencyMs: null,
    confidence: null,
    offlineMode: true,
    quantization: 'INT8 Quantized',
    modelArchitecture: 'MobileNetV3-AgroEdge-INT8',
  };

  private metadata: EdgeAIModelMetadata = {
    modelName: 'AgroVision-MobileNetV3-Edge',
    version: 'v1.2.0-int8',
    quantization: 'INT8',
    modelSizeBytes: 12984128, // 12.4 MB
    runtimeEngine: 'TFLite Edge Delegate (NPU/NNAPI)',
    targetProblemStatement: 'SIH PS 26180 - Smart Farming Assistant',
    supportedConditions: {
      diseases: [
        'Early Blight (Alternaria solani)',
        'Late Blight (Phytophthora infestans)',
        'Powdery Mildew (Podosphaera xanthii)',
        'Leaf Rust (Puccinia triticina)',
      ],
      pests: [
        'Aphids (Aphis gossypii)',
        'Fall Armyworm (Spodoptera frugiperda)',
        'Thrips & Whitefly Clusters',
      ],
      nutrientDeficiencies: [
        'Nitrogen (N) Deficiency Chlorosis',
        'Potassium (K) Marginal Scorch',
        'Phosphorus (P) Purpling Deficiency',
        'Iron (Fe) Interveinal Chlorosis',
      ],
      healthy: [
        'Healthy Wheat / Maize Foliage',
        'Optimal Vegetative Canopy',
      ],
    },
  };

  private listeners: Set<(status: EdgeAIStatusInfo) => void> = new Set();

  public getStatus(): EdgeAIStatusInfo {
    return { ...this.status };
  }

  public setEngineOn(enabled: boolean): void {
    this.status = {
      ...this.status,
      engineOn: enabled,
      inferenceStatus: enabled ? 'Idle - Ready' : 'Engine Offline',
      modelStatus: enabled ? 'Loaded (TFLite INT8 • 12.4 MB)' : 'Engine Suspended (Battery Saver)',
    };
    this.notifyListeners();
  }

  public subscribeStatus(listener: (status: EdgeAIStatusInfo) => void): () => void {
    this.listeners.add(listener);
    listener(this.getStatus());
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const current = this.getStatus();
    this.listeners.forEach((fn) => fn(current));
  }

  public isMock(): boolean {
    return true;
  }

  public getModelMetadata(): EdgeAIModelMetadata {
    return { ...this.metadata };
  }

  public getIntegrationDocs(): string {
    return `
// Flutter & Dart Edge AI Integration (SIH PS 26180)
// File: lib/services/edge_ai_service.dart

import 'dart:io';
import 'package:tflite_flutter/tflite_flutter.dart';
import 'package:image/image.dart' as img;

class EdgeAIService {
  Interpreter? _interpreter;
  bool _isModelLoaded = false;

  Future<void> loadModel() async {
    final options = InterpreterOptions()..useNnapiForAndroid = true;
    _interpreter = await Interpreter.fromAsset(
      'assets/models/agro_vision_mobilenetv3_int8.tflite',
      options: options,
    );
    _isModelLoaded = true;
  }

  Future<Map<String, dynamic>> inferLeafImage(File imageFile) async {
    if (!_isModelLoaded || _interpreter == null) throw Exception("Edge AI model not initialized");

    final stopwatch = Stopwatch()..start();
    // 1. Preprocess image
    final imageBytes = await imageFile.readAsBytes();
    final decoded = img.decodeImage(imageBytes)!;
    final resized = img.copyResize(decoded, width: 224, height: 224);
    
    // 2. Prepare 4D tensor [1, 224, 224, 3]
    var input = List.generate(1, (i) => List.generate(224, (y) => List.generate(224, (x) => List.filled(3, 0))));
    for (int y = 0; y < 224; y++) {
      for (int x = 0; x < 224; x++) {
        final pixel = resized.getPixel(x, y);
        input[0][y][x][0] = pixel.r.toInt();
        input[0][y][x][1] = pixel.g.toInt();
        input[0][y][x][2] = pixel.b.toInt();
      }
    }

    // 3. Run Inference on local NPU/CPU
    var output = List.filled(8, 0).reshape([1, 8]);
    _interpreter!.run(input, output);
    stopwatch.stop();

    // 4. Return results with real latency
    return {
      'latencyMs': stopwatch.elapsedMilliseconds,
      'outputLogits': output[0],
      'offlineEngine': true
    };
  }
}
    `.trim();
  }

  /**
   * Performs local edge AI inference on an image.
   * Cross-references live sensor reading for sensor-fused agronomic recommendations.
   */
  public async analyzeCropLocally(
    imageSource: string | File,
    presetHint?: string,
    sensorContext?: SensorReading
  ): Promise<CropScanResult> {
    if (!this.status.engineOn) {
      throw new Error('Edge AI Engine is currently switched OFF. Please toggle the Edge AI Engine ON in status bar.');
    }

    // Update status to inferring
    this.status = {
      ...this.status,
      inferenceStatus: 'Inferring (Local INT8)',
    };
    this.notifyListeners();

    // Emulate realistic edge inference latency (e.g. 52ms local INT8 hardware execution, with 600ms UI perception)
    const simulatedHardwareLatencyMs = Math.floor(Math.random() * 25) + 42; // 42ms - 66ms on mobile NPU
    await new Promise((resolve) => setTimeout(resolve, 850));

    const defaultSensor: SensorReading = sensorContext || {
      soilMoisture: 58,
      temperature: 26.5,
      humidity: 62,
      rainProbability: 15,
      timestamp: new Date().toLocaleTimeString(),
    };

    let sampleMatch: EdgeCropSample | undefined;
    if (presetHint) {
      sampleMatch = EDGE_CROP_SAMPLES.find((s) => s.id === presetHint);
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    let scanResult: CropScanResult;

    if (sampleMatch) {
      const combinedRec = DecisionEngine.generateCombinedRecommendation(
        {
          conditionCategory: sampleMatch.conditionCategory,
          diseaseDetected: sampleMatch.diseaseDetected,
          pestDetected: sampleMatch.pestDetected,
          nutrientDeficiencyDetected: sampleMatch.nutrientDeficiencyDetected,
          confidencePercent: sampleMatch.confidence,
        },
        defaultSensor
      );

      scanResult = {
        id: `edge-scan-${Date.now()}`,
        timestamp: timeStr,
        imageUri: sampleMatch.imageUri,
        cropName: sampleMatch.crop,
        conditionCategory: sampleMatch.conditionCategory,
        healthStatus: sampleMatch.healthStatus,
        diseaseDetected: sampleMatch.diseaseDetected,
        pestDetected: sampleMatch.pestDetected,
        nutrientDeficiencyDetected: sampleMatch.nutrientDeficiencyDetected,
        confidencePercent: sampleMatch.confidence,
        recommendation: sampleMatch.recommendation,
        organicRemedy: sampleMatch.organicRemedy,
        chemicalRemedy: sampleMatch.chemicalRemedy,
        combinedRecommendation: combinedRec,
        sensorContextSnapshot: {
          soilMoisture: defaultSensor.soilMoisture,
          temperature: defaultSensor.temperature,
          humidity: defaultSensor.humidity,
          rainProbability: defaultSensor.rainProbability,
        },
        inferenceLatencyMs: simulatedHardwareLatencyMs,
        edgeModelType: 'MobileNetV3-AgroEdge (INT8 Local)',
        affectedAreaPercent: sampleMatch.affectedAreaPercent,
        isMock: true,
      };
    } else {
      // Custom uploaded photo or live camera snapshot analysis
      const isFile = typeof imageSource !== 'string';
      const uri = isFile ? URL.createObjectURL(imageSource as File) : imageSource;

      // Realistic non-perfect confidence
      const realisticConfidence = 89.2;
      const combinedRec = DecisionEngine.generateCombinedRecommendation(
        {
          conditionCategory: 'disease',
          diseaseDetected: 'Suspected Cercospora Leaf Spot (Early Stage)',
          confidencePercent: realisticConfidence,
        },
        defaultSensor
      );

      scanResult = {
        id: `edge-scan-${Date.now()}`,
        timestamp: timeStr,
        imageUri: uri,
        cropName: 'Foliage Specimen (Solanaceae)',
        conditionCategory: 'disease',
        healthStatus: 'Early Warning',
        diseaseDetected: 'Suspected Cercospora Leaf Spot (Early Stage)',
        pestDetected: 'No active insect nymphs detected',
        nutrientDeficiencyDetected: 'Slight Nitrogen chlorosis on periphery',
        confidencePercent: realisticConfidence,
        recommendation: 'Localized circular necrotic spots identified along secondary veins. Isolate affected plot quadrant and avoid wetting leaves during irrigation.',
        organicRemedy: 'Foliar application of fermented cow urine + neem extract (10% solution) at 5-day intervals.',
        chemicalRemedy: 'Chlorothalonil 75% WP @ 2g/L if spotting spreads past 15% canopy area.',
        combinedRecommendation: combinedRec,
        sensorContextSnapshot: {
          soilMoisture: defaultSensor.soilMoisture,
          temperature: defaultSensor.temperature,
          humidity: defaultSensor.humidity,
          rainProbability: defaultSensor.rainProbability,
        },
        inferenceLatencyMs: simulatedHardwareLatencyMs,
        edgeModelType: 'MobileNetV3-AgroEdge (INT8 Local)',
        affectedAreaPercent: 14,
        isMock: true,
      };
    }

    // Update state to completed
    this.status = {
      ...this.status,
      inferenceStatus: 'Completed',
      lastInferenceTime: timeStr,
      lastInferenceLatencyMs: simulatedHardwareLatencyMs,
      confidence: scanResult.confidencePercent,
    };
    this.notifyListeners();

    return scanResult;
  }
}

export const mockEdgeAIAdapter = new MockEdgeAIAdapter();
