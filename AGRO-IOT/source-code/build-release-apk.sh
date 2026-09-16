#!/usr/bin/env bash
set -e

echo "========================================="
echo "   AGRO-IOT Android Release APK Builder  "
echo "========================================="

# 1. Build Vite Web Assets
echo "[1/6] Building production web bundle..."
npm run build

# 2. Setup build directory & copy web bundle
echo "[2/6] Preparing assets and directories..."
mkdir -p android_build/gen android_build/bin android_build/assets/www
rm -rf android_build/assets/www/*
cp -r dist/* android_build/assets/www/

# 3. Generate R.java with aapt
echo "[3/6] Generating R.java via aapt..."
aapt package -f -m \
  -J android_build/gen \
  -M android_build/AndroidManifest.xml \
  -S android_build/res \
  -I /usr/lib/android-sdk/platforms/android-23/android.jar

# 4. Compile Java sources
echo "[4/6] Compiling Java source files..."
rm -rf android_build/bin/classes android_build/bin/classes.dex
mkdir -p android_build/bin/classes
javac -source 1.8 -target 1.8 \
  -bootclasspath /usr/lib/android-sdk/platforms/android-23/android.jar \
  -d android_build/bin/classes \
  -cp /usr/lib/android-sdk/platforms/android-23/android.jar \
  android_build/gen/com/agroiot/app/R.java \
  android_build/src/com/agroiot/app/MainActivity.java

# 5. Compile to Dalvik bytecode (classes.dex)
echo "[5/6] Converting classes to Dalvik executable (classes.dex)..."
dx --dex --output=android_build/bin/classes.dex android_build/bin/classes/

# 6. Package, Align, and Sign APK
echo "[6/6] Packaging, 4-byte zipaligning, and signing with release key..."
rm -f android_build/bin/app-unaligned.apk android_build/bin/app-aligned.apk
aapt package -f \
  -M android_build/AndroidManifest.xml \
  -S android_build/res \
  -A android_build/assets \
  -I /usr/lib/android-sdk/platforms/android-23/android.jar \
  -F android_build/bin/app-unaligned.apk

cd android_build/bin
aapt add app-unaligned.apk classes.dex
cd ../..

zipalign -f -p 4 android_build/bin/app-unaligned.apk android_build/bin/app-aligned.apk

if [ ! -f android_build/release.jks ]; then
  keytool -genkeypair -validity 10000 \
    -dname "CN=AGRO-IOT, OU=AgroTech, O=AgroIoT, C=IN" \
    -keystore android_build/release.jks \
    -storepass agroiot2026 -keypass agroiot2026 \
    -alias agrokey -keyalg RSA -keysize 2048
fi

apksigner sign --ks android_build/release.jks \
  --ks-pass pass:agroiot2026 --key-pass pass:agroiot2026 \
  --out app-release.apk android_build/bin/app-aligned.apk

apksigner verify --verbose app-release.apk

# Copy to AGRO-IOT directory
mkdir -p AGRO-IOT
cp app-release.apk AGRO-IOT/app-release.apk

echo "========================================="
echo "  SUCCESS: app-release.apk is ready!     "
echo "  Location: ./app-release.apk            "
echo "========================================="
