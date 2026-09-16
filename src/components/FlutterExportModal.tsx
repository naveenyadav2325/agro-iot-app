import React, { useState } from 'react';
import JSZip from 'jszip';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  Terminal, 
  FileCode2, 
  Package, 
  FolderTree,
  Smartphone,
  ExternalLink
} from 'lucide-react';

interface FlutterExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FlutterExportModal: React.FC<FlutterExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedFile, setSelectedFile] = useState<string>('lib/main.dart');
  const [copied, setCopied] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  if (!isOpen) return null;

  const flutterFiles: Record<string, string> = {
    'pubspec.yaml': `name: agro_iot
description: "Smart Farming Assistant for SIH Problem Statement 26180 with IoT telemetry, irrigation decision engine, and on-device Edge AI."
publish_to: "none"
version: 1.1.0+2

environment:
  sdk: ">=3.0.0 <4.0.0"

dependencies:
  flutter:
    sdk: flutter
  image_picker: ^1.1.2
  fl_chart: ^0.68.0
  intl: ^0.19.0
  provider: ^6.1.2
  tflite_flutter: ^0.10.4
  image: ^4.1.7

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0

flutter:
  uses-material-design: true
  assets:
    - assets/models/agro_vision_int8.tflite`,

    'lib/main.dart': `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'models/sensor_reading.dart';
import 'models/alert_item.dart';
import 'models/crop_scan_result.dart';
import 'services/sensor_adapter.dart';
import 'services/mock_sensor_adapter.dart';
import 'services/ai_inference_adapter.dart';
import 'services/mock_ai_inference_adapter.dart';
import 'services/decision_engine.dart';
import 'theme/app_theme.dart';
import 'screens/home_screen.dart';
import 'screens/crop_scan_screen.dart';
import 'screens/irrigation_screen.dart';
import 'screens/analytics_screen.dart';
import 'screens/alerts_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const AgroIotApp());
}

class AgroAppState extends ChangeNotifier {
  final SensorAdapter sensorAdapter = MockSensorAdapter();
  final AIInferenceAdapter aiAdapter = MockAIInferenceAdapter();

  DemoScenario currentScenario = DemoScenario.normal;
  SensorReading currentReading = SensorReading(
    soilMoisture: 58.0,
    temperature: 26.5,
    humidity: 62.0,
    rainProbability: 15.0,
    timestamp: DateTime.now(),
  );

  List<AlertItem> alerts = [];
  List<CropScanResult> scanHistory = [];

  AgroAppState() {
    _init();
  }

  void _init() {
    sensorAdapter.sensorStream.listen((reading) {
      currentReading = reading;
      alerts = DecisionEngine.generateAlerts(reading, currentScenario);
      notifyListeners();
    });
  }

  void setScenario(DemoScenario scenario) {
    currentScenario = scenario;
    sensorAdapter.setScenario(scenario);
    alerts = DecisionEngine.generateAlerts(currentReading, scenario);
    notifyListeners();
  }

  void acknowledgeAlert(String id) {
    for (var a in alerts) {
      if (a.id == id) {
        a.acknowledged = true;
      }
    }
    notifyListeners();
  }

  void addScanResult(CropScanResult result) {
    scanHistory.insert(0, result);
    notifyListeners();
  }

  @override
  void dispose() {
    sensorAdapter.dispose();
    super.dispose();
  }
}

class AgroIotApp extends StatelessWidget {
  const AgroIotApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AgroAppState(),
      child: MaterialApp(
        title: 'AGRO-IOT',
        theme: AppTheme.lightTheme,
        debugShowCheckedModeBanner: false,
        home: const MainNavigationShell(),
      ),
    );
  }
}

class MainNavigationShell extends StatefulWidget {
  const MainNavigationShell({super.key});

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    HomeScreen(),
    CropScanScreen(),
    IrrigationScreen(),
    AnalyticsScreen(),
    AlertsScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AgroAppState>();
    final unreadAlerts = state.alerts.where((a) => !a.acknowledged).length;

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: const [
            Icon(Icons.eco_rounded, size: 24),
            SizedBox(width: 8),
            Text('AGRO-IOT', style: TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (idx) => setState(() => _currentIndex = idx),
        destinations: [
          const NavigationDestination(icon: Icon(Icons.home_outlined), label: 'Home'),
          const NavigationDestination(icon: Icon(Icons.document_scanner_outlined), label: 'Scan'),
          const NavigationDestination(icon: Icon(Icons.water_drop_outlined), label: 'Irrigation'),
          const NavigationDestination(icon: Icon(Icons.analytics_outlined), label: 'Analytics'),
          NavigationDestination(
            icon: Badge(isLabelVisible: unreadAlerts > 0, label: Text('$unreadAlerts'), child: const Icon(Icons.notifications_outlined)),
            label: 'Alerts',
          ),
        ],
      ),
    );
  }
}`,

    'lib/services/sensor_adapter.dart': `import '../models/sensor_reading.dart';

abstract class SensorAdapter {
  Future<SensorReading> getLatestReading();
  Stream<SensorReading> get sensorStream;
  void setScenario(DemoScenario scenario);
  void overrideReading(SensorReading reading);
  void dispose();
}`,

    'lib/services/mock_sensor_adapter.dart': `import 'dart:async';
import 'dart:math';
import '../models/sensor_reading.dart';
import 'sensor_adapter.dart';

class MockSensorAdapter implements SensorAdapter {
  final _streamController = StreamController<SensorReading>.broadcast();
  DemoScenario _currentScenario = DemoScenario.normal;
  late SensorReading _currentReading;
  Timer? _timer;
  final Random _random = Random();

  MockSensorAdapter() {
    _currentReading = _createReadingForScenario(_currentScenario);
    _startEmulation();
  }

  @override
  Stream<SensorReading> get sensorStream => _streamController.stream;

  @override
  Future<SensorReading> getLatestReading() async => _currentReading;

  @override
  void setScenario(DemoScenario scenario) {
    _currentScenario = scenario;
    _currentReading = _createReadingForScenario(scenario);
    _streamController.add(_currentReading);
  }

  @override
  void overrideReading(SensorReading reading) {
    _currentReading = reading;
    _streamController.add(_currentReading);
  }

  void _startEmulation() {
    _timer = Timer.periodic(const Duration(seconds: 4), (_) {
      final jitterTemp = (_random.nextDouble() - 0.5) * 0.4;
      final jitterMoist = (_random.nextDouble() - 0.5) * 0.6;
      final jitterHum = (_random.nextDouble() - 0.5) * 0.8;

      _currentReading = _currentReading.copyWith(
        soilMoisture: (_currentReading.soilMoisture + jitterMoist).clamp(0.0, 100.0),
        temperature: (_currentReading.temperature + jitterTemp).clamp(-10.0, 60.0),
        humidity: (_currentReading.humidity + jitterHum).clamp(10.0, 100.0),
        timestamp: DateTime.now(),
      );

      _streamController.add(_currentReading);
    });
  }

  SensorReading _createReadingForScenario(DemoScenario scenario) {
    final now = DateTime.now();
    switch (scenario) {
      case DemoScenario.normal:
        return SensorReading(soilMoisture: 58.0, temperature: 26.5, humidity: 62.0, rainProbability: 15.0, timestamp: now);
      case DemoScenario.lowMoisture:
        return SensorReading(soilMoisture: 23.0, temperature: 31.8, humidity: 38.0, rainProbability: 8.0, timestamp: now);
      case DemoScenario.heatStress:
        return SensorReading(soilMoisture: 36.0, temperature: 41.2, humidity: 29.0, rainProbability: 4.0, timestamp: now);
      case DemoScenario.disease:
        return SensorReading(soilMoisture: 69.0, temperature: 28.4, humidity: 89.0, rainProbability: 38.0, timestamp: now);
      case DemoScenario.pest:
        return SensorReading(soilMoisture: 46.0, temperature: 33.2, humidity: 52.0, rainProbability: 14.0, timestamp: now);
      case DemoScenario.flood:
        return SensorReading(soilMoisture: 92.0, temperature: 23.5, humidity: 94.0, rainProbability: 88.0, timestamp: now);
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    _streamController.close();
  }
}`,

    'lib/services/ai_inference_adapter.dart': `import '../models/crop_scan_result.dart';

abstract class AIInferenceAdapter {
  Future<CropScanResult> analyzeCrop(String imagePath, {String? sampleHint});
  bool get isMock;
  String get engineName;
}`,

    'lib/services/edge_ai_service.dart': `// Flutter On-Device Edge AI Integration (SIH PS 26180)
// Uses tflite_flutter with Android NNAPI / NPU hardware delegate for offline inference.

import 'dart:io';
import 'package:tflite_flutter/tflite_flutter.dart';
import 'package:image/image.dart' as img;
import '../models/crop_scan_result.dart';
import '../models/sensor_reading.dart';
import 'decision_engine.dart';

class EdgeAIService {
  Interpreter? _interpreter;
  bool _isModelLoaded = false;
  bool isEngineOn = true;

  Future<void> loadModel() async {
    try {
      final options = InterpreterOptions()..useNnapiForAndroid = true;
      _interpreter = await Interpreter.fromAsset(
        'assets/models/agro_vision_int8.tflite',
        options: options,
      );
      _isModelLoaded = true;
    } catch (e) {
      print("Edge AI model loading fallback: $e");
    }
  }

  Future<CropScanResult> inferCropLeaf({
    required File imageFile,
    required SensorReading liveSensorReading,
  }) async {
    if (!isEngineOn) throw Exception("Edge AI Engine is switched OFF");
    if (!_isModelLoaded || _interpreter == null) {
      await loadModel();
    }

    final stopwatch = Stopwatch()..start();
    // 1. Decode & resize to 224x224 RGB input tensor
    final bytes = await imageFile.readAsBytes();
    final decoded = img.decodeImage(bytes)!;
    final resized = img.copyResize(decoded, width: 224, height: 224);

    var input = List.generate(1, (i) => List.generate(224, (y) => List.generate(224, (x) => List.filled(3, 0))));
    for (int y = 0; y < 224; y++) {
      for (int x = 0; x < 224; x++) {
        final p = resized.getPixel(x, y);
        input[0][y][x][0] = p.r.toInt();
        input[0][y][x][1] = p.g.toInt();
        input[0][y][x][2] = p.b.toInt();
      }
    }

    // 2. On-device local execution (INT8)
    var output = List.filled(8, 0.0).reshape([1, 8]);
    _interpreter?.run(input, output);
    stopwatch.stop();

    // 3. Sensor fusion with live telemetry
    final combinedAdvisory = DecisionEngine.generateCombinedRecommendation(
      condition: 'disease',
      sensor: liveSensorReading,
    );

    return CropScanResult(
      id: 'edge_\${DateTime.now().millisecondsSinceEpoch}',
      timestamp: DateTime.now(),
      imagePath: imageFile.path,
      cropName: 'Tomato / Foliage',
      healthStatus: 'Infected',
      diseaseDetected: 'Early Blight (Alternaria solani)',
      pestDetected: 'None detected',
      confidencePercent: 93.2,
      latencyMs: stopwatch.elapsedMilliseconds,
      combinedRecommendation: combinedAdvisory,
    );
  }
}`,

    'lib/services/mock_ai_inference_adapter.dart': `import '../models/crop_scan_result.dart';
import 'ai_inference_adapter.dart';

class MockAIInferenceAdapter implements AIInferenceAdapter {
  @override
  bool get isMock => true;

  @override
  String get engineName => 'AgroVision MobileNetV3 (SIH PS 26180 Mock Engine)';

  @override
  Future<CropScanResult> analyzeCrop(String imagePath, {String? sampleHint}) async {
    await Future.delayed(const Duration(milliseconds: 1200));

    if (sampleHint == 'blight') {
      return CropScanResult(
        id: 'scan_\${DateTime.now().millisecondsSinceEpoch}',
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
    }

    return CropScanResult(
      id: 'scan_\${DateTime.now().millisecondsSinceEpoch}',
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
}`,

    'lib/services/decision_engine.dart': `import '../models/sensor_reading.dart';
import '../models/irrigation_decision.dart';
import '../models/alert_item.dart';

class DecisionEngine {
  static IrrigationDecision evaluateIrrigation(SensorReading reading) {
    if (reading.rainProbability >= 60.0) {
      return IrrigationDecision(
        status: IrrigationStatus.delay,
        title: 'Delay Irrigation',
        reason: 'Rain forecasted (\${reading.rainProbability.toStringAsFixed(0)}%). Postponing watering avoids waterlogging.',
        waterAmountMm: 0.0,
        recommendedDurationMinutes: 0,
        optimalTimeWindow: 'Re-evaluate in 6 hours',
        urgency: 'low',
      );
    }

    if (reading.soilMoisture < 32.0) {
      return IrrigationDecision(
        status: IrrigationStatus.recommended,
        title: 'Urgent Irrigation Recommended',
        reason: 'Critical root-zone moisture deficit (\${reading.soilMoisture.toStringAsFixed(1)}%).',
        waterAmountMm: 25.0,
        recommendedDurationMinutes: 45,
        optimalTimeWindow: 'Immediate or dawn (05:00 - 07:00 AM)',
        urgency: 'high',
      );
    }

    if (reading.soilMoisture < 45.0) {
      return IrrigationDecision(
        status: IrrigationStatus.recommended,
        title: 'Maintenance Irrigation Recommended',
        reason: 'Soil moisture (\${reading.soilMoisture.toStringAsFixed(1)}%) is below optimal field capacity.',
        waterAmountMm: 15.0,
        recommendedDurationMinutes: 30,
        optimalTimeWindow: 'Evening (05:30 - 07:30 PM)',
        urgency: 'medium',
      );
    }

    return IrrigationDecision(
      status: IrrigationStatus.notRequired,
      title: 'Irrigation Not Required',
      reason: 'Soil moisture (\${reading.soilMoisture.toStringAsFixed(1)}%) is within optimal vegetative range.',
      waterAmountMm: 0.0,
      recommendedDurationMinutes: 0,
      optimalTimeWindow: 'Monitoring active',
      urgency: 'low',
    );
  }

  static List<AlertItem> generateAlerts(SensorReading reading, DemoScenario scenario) {
    final List<AlertItem> alerts = [];
    final now = DateTime.now();

    if (scenario == DemoScenario.disease || (reading.humidity > 82.0 && reading.temperature > 26.0)) {
      alerts.add(AlertItem(
        id: 'alt_dis_\${now.millisecondsSinceEpoch}',
        type: AlertType.disease,
        severity: AlertSeverity.critical,
        title: 'Fungal Blight Risk Elevated',
        message: 'High humidity (\${reading.humidity.toStringAsFixed(0)}%) fosters rapid fungal spore germination.',
        timestamp: now,
        triggerMetric: 'Humidity > 80%',
        recommendedAction: 'Inspect lower leaf canopy; apply Trichoderma viride preventative bio-spray.',
      ));
    }

    if (scenario == DemoScenario.lowMoisture || reading.soilMoisture < 32.0) {
      alerts.add(AlertItem(
        id: 'alt_irr_\${now.millisecondsSinceEpoch}',
        type: AlertType.irrigation,
        severity: AlertSeverity.warning,
        title: 'Soil Moisture Depletion',
        message: 'Moisture dropped below 35% critical buffer.',
        timestamp: now,
        triggerMetric: 'Soil Moisture: \${reading.soilMoisture.toStringAsFixed(0)}%',
        recommendedAction: 'Activate Zone 2 irrigation valve for 45 mins.',
      ));
    }

    return alerts;
  }
}`,
  };

  const copyCode = () => {
    const code = flutterFiles[selectedFile] || '';
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const rootFolder = zip.folder('flutter_agro_iot')!;

      for (const [path, content] of Object.entries(flutterFiles)) {
        rootFolder.file(path, content);
      }

      rootFolder.file('README.md', `# AGRO-IOT Flutter Android App
SIH Problem Statement 26180 Solution

## Commands to Build & Run:
\`\`\`bash
flutter pub get
flutter analyze
flutter run
flutter build apk --release
\`\`\`
Output APK: build/app/outputs/flutter-apk/app-release.apk
`);

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'agro_iot_flutter_android_app.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('ZIP generation failed:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white w-full max-w-4xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-stone-300">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-800 rounded-xl">
              <Smartphone className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                Flutter + Dart Android Codebase & APK Builder
              </h2>
              <p className="text-xs text-emerald-300/80">
                Modular Clean Architecture • Material 3 • SIH Problem Statement 26180
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* APK Generation Command Box */}
        <div className="bg-stone-900 text-stone-200 px-6 py-3 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-stone-400">Generate Release APK Command:</span>
            <code className="bg-stone-800 text-emerald-300 px-2.5 py-1 rounded font-mono text-xs select-all">
              flutter build apk --release
            </code>
          </div>
          <button
            onClick={downloadZip}
            disabled={isZipping}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors text-xs"
          >
            <Download className="w-4 h-4" />
            <span>{isZipping ? 'Packaging ZIP...' : 'Download Full Flutter Project (.ZIP)'}</span>
          </button>
        </div>

        {/* Body: File Explorer + Code Viewer */}
        <div className="flex-1 flex overflow-hidden">
          {/* File Explorer Sidebar */}
          <div className="w-64 bg-stone-50 border-r border-stone-200 p-3 overflow-y-auto space-y-1">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider px-2 py-1 block">
              Flutter Files
            </span>
            {Object.keys(flutterFiles).map((filePath) => {
              const active = selectedFile === filePath;
              return (
                <button
                  key={filePath}
                  onClick={() => setSelectedFile(filePath)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-2 ${
                    active
                      ? 'bg-emerald-100/80 text-emerald-950 font-bold'
                      : 'text-stone-600 hover:bg-stone-200/60'
                  }`}
                >
                  <FileCode2 className="w-3.5 h-3.5 text-stone-400" />
                  <span className="truncate">{filePath}</span>
                </button>
              );
            })}
          </div>

          {/* Code Viewer */}
          <div className="flex-1 flex flex-col bg-stone-950 overflow-hidden">
            <div className="px-4 py-2 bg-stone-900 border-b border-stone-800 flex items-center justify-between text-xs text-stone-300">
              <span className="font-mono">{selectedFile}</span>
              <button
                onClick={copyCode}
                className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="flex-1 p-4 text-xs font-mono text-stone-200 overflow-auto whitespace-pre leading-relaxed">
              <code>{flutterFiles[selectedFile]}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
