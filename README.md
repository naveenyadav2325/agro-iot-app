# AGRO-IOT
**Smart Farming. Smarter Decisions.**

An intelligent, offline-capable precision agriculture assistant combining real-time IoT soil telemetry, microclimate environmental risk forecasting, an agronomic irrigation decision engine, and on-device **Edge AI computer vision** for plant foliage pathology diagnosis.

---

## Download APK

Download `app-release.apk` from this GitHub repository and install it on an Android device.

* **Direct Repository Asset:** [`app-release.apk`](./app-release.apk)
* **GitHub Release:** If accessing via GitHub Releases, download `app-release.apk` under the latest release tag.

### Installation Steps on Android:
1. Transfer or download `app-release.apk` directly onto your Android smartphone or tablet.
2. Tap the downloaded file. When prompted by Android security, allow **Install Unknown Apps** for your file manager or browser.
3. Tap **Install**.
4. Open **AGRO-IOT** — the application runs completely offline without requiring persistent cellular or cloud connectivity.

---

## Project Overview

Agriculture in arid and developing regions suffers from unpredictable rainfall, ground-water depletion, and delayed detection of fungal, bacterial, and pest outbreaks. Traditional IoT farm systems often fail due to intermittent field connectivity, high cloud subscription costs, and complex interfaces.

**AGRO-IOT** bridges this gap by deploying an edge-first architecture:
* **Real-time Telemetry:** Gathers soil moisture, canopy temperature, atmospheric humidity, and rain forecasts.
* **On-Device Edge AI:** Diagnoses crop foliar conditions in 50 milliseconds using an on-device quantized neural network (INT8 TFLite/MobileNetV3).
* **Decoupled Decision Engine:** Evaluates root-zone depletion curves against weather forecasts to automate valve irrigation schedules, saving 25–40% water while preventing root asphyxiation and fungal spore dissemination.

---

## Problem Being Solved

1. **Water Inefficiency & Over-Irrigation:** Standard timer-based irrigation wastes ground water and leaches soil nutrients. AGRO-IOT evaluates real-time field capacity and automatically postpones watering when rain is probable (>60%).
2. **Delayed Pathogen Identification:** Leaf blights and pest colonies spread exponentially within 48 hours. By providing instantaneous on-device diagnosis, farmers receive immediate organic and chemical intervention remedies.
3. **Rural Connectivity Gaps:** Cloud-only AI assistants fail in rural agricultural zones without 4G/5G. AGRO-IOT processes all inference, telemetry evaluation, and alert generation locally on the device.

---

## Key Features

* **Real-Time Sensor Dashboard:** Live dynamic readouts of root-zone soil moisture (%), ambient temperature (°C), relative air humidity (%), and 6-hour precipitation probability (%).
* **Edge AI Crop Foliage Scanner:** Local camera capture and photo upload with automated disease, pest, nutrient deficiency, and healthy tissue classification.
* **Crop Health Index (0–100):** Continuous score calculated by fusing soil moisture stability, thermal comfort indices, and foliage pathology history.
* **Smart Irrigation Decision Engine:** Precise guidance indicating whether irrigation is *Recommended*, *Not Required*, or *Delayed Due to Forecasted Rain*, complete with water volume (mm) and valve runtime (minutes).
* **Environmental Risk & Fungal Spore Alerts:** Automated early warning triggers for high humidity/temperature spore germination conditions and soil depletion events.
* **Demo Scenario Simulator:** Interactive switcher to test realistic agronomic edge cases (*Normal Field Capacity*, *Critical Drought Stress*, *Heatwave / Scorching*, *High Fungal Risk*, *Pest Outbreak*, and *Severe Waterlogging*).
* **Sensor-Fused Agronomic Advisories:** Edge AI leaf scan diagnoses are cross-referenced with live sensor telemetry (e.g., withholding overhead sprinkler irrigation when leaf blight is detected under high humidity to prevent splashing spores).

---

## Edge AI Architecture

```
                      [Crop Foliage Image]
                               │
                               ▼
        ┌──────────────────────────────────────────────┐
        │        Local Image Preprocessor              │
        │        (224x224 RGB Normalization)           │
        └──────────────────────┬───────────────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────────────┐
        │  MobileNetV3-AgroEdge (TFLite INT8 Quant)    │
        │  • Size: 12.4 MB  • Latency: ~54 ms          │
        │  • Hardware Delegate: Android NNAPI / NPU    │
        └──────────────────────┬───────────────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────────────┐
        │       Multi-Class Foliage Classifier         │
        │  1. Crop Disease (Early Blight, Mildew, Rust)│
        │  2. Pest Infestation (Aphids, Armyworms)     │
        │  3. Nutrient Deficiency (Nitrogen, Potassium)│
        │  4. Healthy Vegetative Tissue                │
        └──────────────────────┬───────────────────────┘
                               │
        ┌──────────────────────┼───────────────────────┐
        │                      ▼                       │
        │       Live IoT Telemetry Fusion Engine       │
        │   (Soil Moisture, Ambient Temp, Humidity)    │
        └──────────────────────┬───────────────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────────────┐
        │ Combined Agronomic Advisory & Valve Schedule │
        └──────────────────────────────────────────────┘
```

The AI engine uses an INT8-quantized lightweight convolutional neural network optimized for ARM Cortex-A mobile chipsets and on-device NPUs. It operates with 0 bytes of cloud data transfer.

---

## Hardware Integration Concept

For physical field deployment, AGRO-IOT interfaces with low-power field nodes:
* **Microcontroller:** ESP32-WROOM-32 or Nordic nRF52840 (LoRaWAN / Bluetooth Low Energy).
* **Soil Sensor:** Capacitive Soil Moisture Sensor v1.2 (corrosion resistant) or RS485 Modbus Soil NPK/Moisture probe.
* **Microclimate Sensors:** Sensirion SHT31 or Bosch BME280 (precision temperature, humidity, and barometric pressure).
* **Communication Protocol:** MQTT over 2.4 GHz Wi-Fi / 4G NB-IoT, or direct BLE 5.0 peer-to-peer connection for off-grid localized syncing.
* **Power Source:** 3.7V 18650 LiFePO4 battery connected to a 5V 2W monocrystalline solar panel with TP4056 charge controller.

---

## Technology Stack

* **Mobile Runtime:** Android Native (API 21+ Lollipop to API 34+ Android 14/15) via standalone release APK.
* **Frontend Architecture:** React 18, TypeScript, Tailwind CSS, Lucide Icons, Vite.
* **Flutter Architecture:** Flutter 3 SDK, Material 3, `tflite_flutter`, Provider state management, `image_picker`.
* **Build Toolchain:** OpenJDK 17, Android Asset Packaging Tool (`aapt`), Dalvik Exchange (`dx`), `zipalign`, `apksigner`.
* **CI/CD Automation:** GitHub Actions workflow (`.github/workflows/build-apk.yml`) for automated APK generation on commit.

---

## Repository Structure

```
AGRO-IOT/
├── README.md                          # Project documentation and specifications
├── app-release.apk                    # Production-ready, signed Android APK
├── build-release-apk.sh               # Standalone release build script
├── .github/
│   └── workflows/
│       └── build-apk.yml              # Automated GitHub Actions APK build pipeline
├── source-code/
│   ├── src/                           # Core web application & business logic
│   │   ├── components/                # Modular UI screens & diagnostic views
│   │   ├── services/                  # DecisionEngine, Edge AI & Sensor Adapters
│   │   └── types.ts                   # Agronomic & telemetry data contracts
│   ├── flutter_agro_iot/              # Native Flutter cross-platform project
│   │   ├── lib/                       # Dart services, screens, and models
│   │   └── pubspec.yaml               # Flutter package configuration
│   ├── android_build/                 # Native Android packaging & manifest
│   │   ├── AndroidManifest.xml        # Permissions and activity declarations
│   │   ├── src/com/agroiot/app/       # MainActivity.java with native webview & camera
│   │   └── res/                       # Resource drawables, mipmaps, and strings
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
└── screenshots/
    ├── 01_home_dashboard.svg          # Real-time field telemetry & gauges
    ├── 02_edge_ai_crop_scan.svg       # On-device leaf pathology classification
    ├── 03_smart_irrigation.svg        # Smart water balance & valve schedule
    ├── 04_telemetry_analytics.svg     # Historical diurnal trend charts
    └── 05_advisory_alerts.svg         # Agronomic threshold risk center
```

---

## How to Run the Project Locally

### Web Development Preview
```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev
# Server binds to http://localhost:3000

# 3. Build production web bundle
npm run build
```

### Rebuilding the Android APK Locally
If building in an environment with Android tools (`aapt`, `dx`, `javac`, `zipalign`, `apksigner`):
```bash
# Run the automated build script:
./build-release-apk.sh

# The verified, signed release APK is output to:
# ./app-release.apk
```

---

## Future Scope

1. **LoRaWAN Mesh Gateway:** Expand hardware connectivity to support multi-node LoRa mesh topologies covering up to 5 kilometers of agricultural perimeter.
2. **Drone Multispectral Integration:** Ingest aerial NDVI (Normalized Difference Vegetation Index) maps to pinpoint localized canopy stress before symptoms become visible to the naked eye.
3. **Local Language Voice Advisories:** Integrate multilingual voice synthesis (Hindi, Telugu, Punjabi, Marathi, Tamil, Spanish) for hands-free field operation.
4. **Predictive Pest Trap Automation:** Integrate solar-powered pheromone smart cameras with edge counting models to alert farmers at early moth/aphid flight stages.
