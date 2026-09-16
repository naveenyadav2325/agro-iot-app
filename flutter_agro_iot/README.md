# AGRO-IOT: Smart Farming Assistant
**SIH Problem Statement 26180 Solution**
Built with **Flutter + Dart + Material 3**

AGRO-IOT is an intelligent, edge-ready agricultural assistant designed to empower farmers with automated microclimate telemetry, precision irrigation advisory, disease/pest foliar diagnosis, environmental risk early-warnings, and demo simulation.

---

## 🏗️ Architecture Overview

The codebase is built strictly adhering to clean architecture and dependency inversion principles:

```
flutter_agro_iot/
├── lib/
│   ├── main.dart                  # Material 3 Navigation shell & Provider state
│   ├── theme/
│   │   └── app_theme.dart         # Material 3 agricultural emerald green design tokens
│   ├── models/
│   │   ├── sensor_reading.dart    # Soil moisture, temp, humidity, rain probability
│   │   ├── irrigation_decision.dart # Recommended / Not Required / Delay data structures
│   │   ├── crop_scan_result.dart  # AI inference diagnosis & remedies
│   │   └── alert_item.dart        # Severity alerts & acknowledgment state
│   ├── services/
│   │   ├── sensor_adapter.dart    # Abstract contract for real/mock IoT telemetry
│   │   ├── mock_sensor_adapter.dart # Jitter simulation & 6 demo scenario presets
│   │   ├── ai_inference_adapter.dart # Decoupled AI interface (ready for TFLite/Edge Impulse)
│   │   ├── mock_ai_inference_adapter.dart # Offline mobile neural net inference simulation
│   │   └── decision_engine.dart   # Pure agronomic decision logic (FAO-56 derived)
│   └── screens/
│       ├── home_screen.dart       # Field overview, quick scenario chips, advisory
│       ├── crop_scan_screen.dart  # Camera/gallery scanner, confidence, remedies
│       ├── irrigation_screen.dart # 3-state irrigation advisor & interactive sliders
│       ├── analytics_screen.dart  # 24H & 7D historical moisture/temp/humidity curves
│       └── alerts_screen.dart     # Categorized alerts (Disease, Pest, Heat, Flood)
└── pubspec.yaml                   # Flutter SDK & package dependencies
```

---

## 🚀 How to Run and Build the Android APK

### 1. Prerequisites
- Install Flutter SDK (3.0 or newer)
- Android Studio / Android SDK with platform-tools and build-tools
- Java JDK 17

### 2. Verify Code Quality with Flutter Analyze
```bash
cd flutter_agro_iot
flutter pub get
flutter analyze
```

### 3. Run Locally on an Android Emulator or Connected Device
```bash
flutter run
```

### 4. Command to Generate Release APK
To build the production-ready Android APK:
```bash
flutter build apk --release
```

The compiled APK will be generated at:
```
build/app/outputs/flutter-apk/app-release.apk
```

For split per-ABI APKs (smaller file size for arm64-v8a):
```bash
flutter build apk --split-per-abi --release
```

---

## 🌾 Core Features in MVP
1. **Home**: Real-time soil moisture, temperature, humidity, rain forecast, crop health index, and proactive farmer advisory.
2. **Crop Scan**: Dual camera/gallery input, leaf diagnosis with disease identification, pest detection, confidence percentage, and organic/chemical remedies.
3. **Irrigation**: Automated decision engine outputting **Irrigation Recommended**, **Irrigation Not Required**, or **Delay Irrigation** based on root-zone moisture, heat, and rain probability.
4. **Environmental Stress**: Real-time evaluation of Heat Stress, Water Stress (Drought), and Flood/Waterlogging risk.
5. **Analytics**: Diurnal historical trends for microclimate parameters.
6. **Alerts**: Real-time alerts with severity ranking and single-tap acknowledgment.
7. **Demo Scenarios**: Instant 1-tap switching between `NORMAL`, `LOW MOISTURE`, `HEAT STRESS`, `DISEASE`, `PEST`, and `FLOOD` to demonstrate dynamic adaptation without needing hardware.
