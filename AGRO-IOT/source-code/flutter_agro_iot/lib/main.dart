import 'package:flutter/material.dart';
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
          children: [
            const Icon(Icons.eco_rounded, size: 26),
            const SizedBox(width: 8),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'AGRO-IOT',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                ),
                Text(
                  'Smart Farming Assistant • SIH 26180',
                  style: TextStyle(fontSize: 10, color: Colors.white70),
                ),
              ],
            ),
          ],
        ),
        actions: [
          Container(
            margin: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white38),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: Colors.lightGreenAccent,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 6),
                const Text(
                  'DEMO MODE',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white),
                ),
              ],
            ),
          ),
        ],
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (idx) => setState(() => _currentIndex = idx),
        destinations: [
          const NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home_rounded),
            label: 'Home',
          ),
          const NavigationDestination(
            icon: Icon(Icons.document_scanner_outlined),
            selectedIcon: Icon(Icons.document_scanner_rounded),
            label: 'Scan',
          ),
          const NavigationDestination(
            icon: Icon(Icons.water_drop_outlined),
            selectedIcon: Icon(Icons.water_drop_rounded),
            label: 'Irrigation',
          ),
          const NavigationDestination(
            icon: Icon(Icons.analytics_outlined),
            selectedIcon: Icon(Icons.analytics_rounded),
            label: 'Analytics',
          ),
          NavigationDestination(
            icon: Badge(
              isLabelVisible: unreadAlerts > 0,
              label: Text('$unreadAlerts'),
              child: const Icon(Icons.notifications_outlined),
            ),
            selectedIcon: Badge(
              isLabelVisible: unreadAlerts > 0,
              label: Text('$unreadAlerts'),
              child: const Icon(Icons.notifications_rounded),
            ),
            label: 'Alerts',
          ),
        ],
      ),
    );
  }
}
