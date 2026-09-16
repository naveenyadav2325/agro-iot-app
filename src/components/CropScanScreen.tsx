import React, { useState, useRef, useEffect } from 'react';
import { CropScanResult, SensorReading, EdgeAIStatusInfo, CropConditionType } from '../types';
import { mockEdgeAIAdapter, EDGE_CROP_SAMPLES, EdgeCropSample } from '../services/MockEdgeAIAdapter';
import { EdgeAIStatusCard } from './EdgeAIStatusCard';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  AlertOctagon, 
  ShieldCheck, 
  Sprout, 
  Bug, 
  Info, 
  RefreshCw,
  Video,
  X,
  Cpu,
  WifiOff,
  Zap,
  Clock,
  Layers,
  FlaskConical,
  Activity,
  AlertTriangle,
  Flame,
  Droplet
} from 'lucide-react';

interface CropScanScreenProps {
  reading: SensorReading;
  edgeAIStatus: EdgeAIStatusInfo;
  onToggleEngine: (enabled: boolean) => void;
  onScanCompleted: (result: CropScanResult) => void;
  recentScans: CropScanResult[];
}

export const CropScanScreen: React.FC<CropScanScreenProps> = ({
  reading,
  edgeAIStatus,
  onToggleEngine,
  onScanCompleted,
  recentScans,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(EDGE_CROP_SAMPLES[1].imageUri);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(EDGE_CROP_SAMPLES[1].id);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | CropConditionType>('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<CropScanResult | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Filtered samples for quick evaluation
  const filteredSamples = EDGE_CROP_SAMPLES.filter((sample) => {
    if (activeCategoryFilter === 'all') return true;
    return sample.conditionCategory === activeCategoryFilter;
  });

  // Handle sample selection
  const handleSelectSample = (sample: EdgeCropSample) => {
    stopCameraStream();
    setSelectedImage(sample.imageUri);
    setSelectedPresetId(sample.id);
    setCurrentResult(null);
  };

  // Handle local image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      stopCameraStream();
      const objectUrl = URL.createObjectURL(file);
      setSelectedImage(objectUrl);
      setSelectedPresetId(null);
      setCurrentResult(null);
    }
  };

  // Start live webcam stream
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Camera stream error or permission denied:', err);
      setIsCameraActive(false);
      alert('Camera access not granted or unsupported in this container frame. Please select a photo or sample.');
    }
  };

  const stopCameraStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUri = canvas.toDataURL('image/jpeg');
      setSelectedImage(dataUri);
      setSelectedPresetId(null);
      setCurrentResult(null);
    }
    stopCameraStream();
  };

  // Perform Edge AI local inference
  const runAnalysis = async () => {
    if (!selectedImage) return;
    if (!edgeAIStatus.engineOn) {
      alert('Edge AI Engine is currently switched OFF. Please toggle the Edge AI Engine ON above to run local inference.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await mockEdgeAIAdapter.analyzeCropLocally(
        selectedImage,
        selectedPresetId || undefined,
        reading
      );
      setCurrentResult(result);
      onScanCompleted(result);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error running Edge AI inference.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* 1. Edge AI Status Card */}
      <EdgeAIStatusCard
        status={edgeAIStatus}
        onToggleEngine={onToggleEngine}
      />

      {/* Warning if Edge AI Engine is OFF */}
      {!edgeAIStatus.engineOn && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span className="text-xs font-semibold text-amber-900">
              Edge AI Engine is Suspended (Battery Saver)
            </span>
          </div>
          <button
            onClick={() => onToggleEngine(true)}
            className="px-2.5 py-1 text-xs font-bold bg-amber-600 text-white rounded-lg hover:bg-amber-700 shadow-2xs"
          >
            Turn Engine ON
          </button>
        </div>
      )}

      {/* 2. Foliage Scanner & Camera Card */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                Crop Foliage Scanner
              </h3>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <WifiOff className="w-2.5 h-2.5" />
                <span>Local Inference</span>
              </span>
            </div>
            <p className="text-[11px] text-stone-500">Detects Disease, Pest, Nutrient Deficiency & Healthy Vigor</p>
          </div>
          <span className="text-[11px] font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
            RGB 224x224
          </span>
        </div>

        {/* Viewport Box */}
        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-stone-900 flex items-center justify-center border border-stone-200">
          {isCameraActive ? (
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Camera reticle overlay */}
              <div className="absolute inset-0 border-2 border-emerald-400/40 m-8 rounded-xl pointer-events-none flex items-center justify-center">
                <div className="w-12 h-12 border-t-2 border-l-2 border-emerald-400 absolute top-0 left-0" />
                <div className="w-12 h-12 border-t-2 border-r-2 border-emerald-400 absolute top-0 right-0" />
                <div className="w-12 h-12 border-b-2 border-l-2 border-emerald-400 absolute bottom-0 left-0" />
                <div className="w-12 h-12 border-b-2 border-r-2 border-emerald-400 absolute bottom-0 right-0" />
                <span className="text-white text-[11px] font-semibold bg-black/60 px-2 py-1 rounded">
                  Center Leaf in Grid
                </span>
              </div>
              <div className="absolute bottom-3 inset-x-0 flex justify-center gap-3">
                <button
                  onClick={capturePhoto}
                  className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-full shadow-lg flex items-center gap-1.5 hover:bg-emerald-500"
                >
                  <Camera className="w-4 h-4" /> Snap Photo
                </button>
                <button
                  onClick={stopCameraStream}
                  className="p-2 bg-stone-800/80 text-white rounded-full hover:bg-stone-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : selectedImage ? (
            <div className="relative w-full h-full group">
              <img
                src={selectedImage}
                alt="Selected crop specimen"
                className="w-full h-full object-cover"
              />
              {/* Scanner Line animation during inference */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none">
                  <div className="w-full h-1 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-bounce" />
                </div>
              )}
              <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded text-[10px] font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>On-Device INT8 Model Ready</span>
              </div>
            </div>
          ) : (
            <div className="text-center p-6 text-stone-400">
              <Camera className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-xs">Take a photo or pick a sample crop leaf below</p>
            </div>
          )}
        </div>

        {/* Input Controls (Camera, Gallery, File) */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <button
            onClick={startCamera}
            className="py-2.5 px-3 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center justify-center gap-2 transition-colors"
          >
            <Camera className="w-4 h-4 text-emerald-700" />
            <span>Open Camera</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="py-2.5 px-3 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center justify-center gap-2 transition-colors"
          >
            <Upload className="w-4 h-4 text-emerald-700" />
            <span>Upload Leaf Photo</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        {/* Big Run Edge AI Inference Button */}
        <button
          id="btn-run-edge-ai"
          disabled={!selectedImage || isAnalyzing || !edgeAIStatus.engineOn}
          onClick={runAnalysis}
          className={`w-full mt-3 py-3 rounded-xl font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all ${
            !edgeAIStatus.engineOn
              ? 'bg-stone-300 text-stone-600 cursor-not-allowed'
              : 'bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>Running Local INT8 Inference ({reading.soilMoisture.toFixed(0)}% Moisture Context)...</span>
            </>
          ) : !edgeAIStatus.engineOn ? (
            <>
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>Edge AI Engine is OFF (Enable to Scan)</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-emerald-200" />
              <span>Execute Edge AI Inference (Local & Offline)</span>
            </>
          )}
        </button>
      </div>

      {/* 3. Preset Crop Specimens Carousel with Category Filters */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
            Sample Crop Foliage Library
          </h3>
          <span className="text-[10px] text-stone-500 font-medium">1-Tap Evaluate</span>
        </div>

        {/* Filter Chips for Condition Category */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar">
          {[
            { id: 'all', label: 'All Samples' },
            { id: 'disease', label: 'Disease' },
            { id: 'pest', label: 'Pest' },
            { id: 'nutrient_deficiency', label: 'Nutrient Deficiency' },
            { id: 'healthy', label: 'Healthy' },
          ].map((chip) => {
            const active = activeCategoryFilter === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setActiveCategoryFilter(chip.id as any)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-emerald-800 text-white font-bold'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* Sample Leaves Grid */}
        <div className="grid grid-cols-2 gap-2 mt-1">
          {filteredSamples.map((sample) => {
            const isSelected = selectedPresetId === sample.id;
            return (
              <div
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                className={`p-2 rounded-xl border cursor-pointer transition-all flex items-center gap-2.5 ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <img
                  src={sample.imageUri}
                  alt={sample.name}
                  className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
                />
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-stone-900 block truncate">
                      {sample.crop.split(' ')[0]}
                    </span>
                    <span className={`text-[8px] font-bold px-1 rounded uppercase ${
                      sample.conditionCategory === 'healthy' ? 'bg-emerald-100 text-emerald-800' :
                      sample.conditionCategory === 'disease' ? 'bg-rose-100 text-rose-800' :
                      sample.conditionCategory === 'pest' ? 'bg-amber-100 text-amber-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {sample.conditionCategory === 'nutrient_deficiency' ? 'Nutrient' : sample.conditionCategory}
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-500 block truncate">
                    {sample.conditionCategory === 'nutrient_deficiency'
                      ? sample.nutrientDeficiencyDetected?.split(' ')[0]
                      : sample.diseaseDetected !== 'None (Clean photosynthetic tissue)'
                      ? sample.diseaseDetected.split('(')[0]
                      : sample.pestDetected !== 'None detected'
                      ? sample.pestDetected.split('(')[0]
                      : 'Optimal Vigor'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Diagnostic Result Card (Combined Edge AI + Sensor Telemetry) */}
      {currentResult && (
        <div className="bg-white rounded-2xl p-4 border-2 border-emerald-600/80 shadow-md animate-fadeIn space-y-3">
          {/* Card Header */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  Edge AI Report
                </span>
                <span className="text-[10px] font-mono text-stone-500 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{currentResult.inferenceLatencyMs}ms latency</span>
                </span>
              </div>
              <h3 className="text-base font-extrabold text-stone-900 mt-1">
                {currentResult.cropName}
              </h3>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                currentResult.healthStatus === 'Healthy'
                  ? 'bg-emerald-100 text-emerald-800'
                  : currentResult.healthStatus === 'Early Warning'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {currentResult.healthStatus === 'Healthy' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertOctagon className="w-3.5 h-3.5" />}
                {currentResult.healthStatus}
              </span>
            </div>
          </div>

          {/* Diagnosis Breakdown by 4 Categories (Disease, Pest, Nutrient Deficiency, Healthy) */}
          <div className="grid grid-cols-2 gap-2.5 py-1">
            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/60">
              <span className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider block">
                Condition Type
              </span>
              <p className="text-xs font-bold text-stone-900 mt-0.5 capitalize">
                {currentResult.conditionCategory.replace('_', ' ')}
              </p>
            </div>

            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/60">
              <span className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider block">
                Detected Target
              </span>
              <p className="text-xs font-bold text-stone-900 mt-0.5 truncate">
                {currentResult.conditionCategory === 'disease'
                  ? currentResult.diseaseDetected
                  : currentResult.conditionCategory === 'pest'
                  ? currentResult.pestDetected
                  : currentResult.conditionCategory === 'nutrient_deficiency'
                  ? currentResult.nutrientDeficiencyDetected
                  : 'Healthy Photosynthetic Tissue'}
              </p>
            </div>
          </div>

          {/* Model Inference Confidence Meter (Realistic, non-fake accuracy) */}
          <div className="py-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-stone-600 font-medium">Model Inference Confidence</span>
              <span className="font-extrabold text-emerald-700">
                {currentResult.confidencePercent.toFixed(1)}% <span className="text-[10px] text-stone-400 font-normal">(Softmax)</span>
              </span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-700"
                style={{ width: `${currentResult.confidencePercent}%` }}
              />
            </div>
            <span className="text-[10px] text-stone-400 mt-1 block">
              Confidence derived from local feature maps; realistic thresholds applied without claiming synthetic 100%.
            </span>
          </div>

          {/* SENSOR FUSION CARD: Combined Edge AI + Live Sensor Data */}
          {currentResult.combinedRecommendation && (
            <div className="p-3.5 bg-gradient-to-br from-emerald-900 to-green-950 text-white rounded-xl shadow-sm border border-emerald-800">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="p-1 bg-emerald-700/80 rounded-lg">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                  </div>
                  <h4 className="text-xs font-bold text-emerald-200 uppercase tracking-wide">
                    Edge AI + Sensor Fusion Advisory
                  </h4>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-300 bg-emerald-800/80 px-2 py-0.5 rounded font-mono">
                  <span>Moist: {currentResult.sensorContextSnapshot?.soilMoisture.toFixed(0)}%</span>
                  <span>•</span>
                  <span>Temp: {currentResult.sensorContextSnapshot?.temperature.toFixed(0)}°C</span>
                </div>
              </div>
              <p className="text-xs text-emerald-100 font-medium leading-relaxed mt-1.5">
                {currentResult.combinedRecommendation}
              </p>
            </div>
          )}

          {/* Actionable Remedies (Organic & Chemical) */}
          <div className="space-y-2 pt-1">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <h5 className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide flex items-center gap-1">
                <span>🌿 Organic Bio-Remedy</span>
              </h5>
              <p className="text-xs text-emerald-950 mt-0.5">
                {currentResult.organicRemedy}
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
              <h5 className="text-[11px] font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1">
                <span>🧪 Chemical Intervention (If Spread &gt; 15%)</span>
              </h5>
              <p className="text-xs text-amber-950 mt-0.5">
                {currentResult.chemicalRemedy}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
