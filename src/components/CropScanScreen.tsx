import React, { useState, useRef } from 'react';
import { CropScanResult } from '../types';
import { mockAIInferenceAdapter, SAMPLE_CROP_LEAVES, SampleCropLeaf } from '../services/MockAIInferenceAdapter';
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
  X
} from 'lucide-react';

interface CropScanScreenProps {
  onScanCompleted: (result: CropScanResult) => void;
  recentScans: CropScanResult[];
}

export const CropScanScreen: React.FC<CropScanScreenProps> = ({
  onScanCompleted,
  recentScans,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(SAMPLE_CROP_LEAVES[1].imageUri);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(SAMPLE_CROP_LEAVES[1].id);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<CropScanResult | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle sample selection
  const handleSelectSample = (sample: SampleCropLeaf) => {
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
      alert('Camera access not granted or unsupported in this frame. Please select a photo or sample.');
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

  // Perform AI analysis
  const runAnalysis = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    try {
      const result = await mockAIInferenceAdapter.analyzeCrop(
        selectedImage,
        selectedPresetId || undefined
      );
      setCurrentResult(result);
      onScanCompleted(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Mock AI Architectural Disclosure */}
      <div className="bg-emerald-950 text-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-800 rounded-xl mt-0.5">
            <Sparkles className="w-4 h-4 text-emerald-300" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white tracking-wide uppercase">
                Mock AI Inference Engine
              </h3>
              <span className="text-[10px] bg-emerald-800/80 text-emerald-200 px-2 py-0.5 rounded-full font-mono">
                v0.9.4 • SIH PS 26180
              </span>
            </div>
            <p className="text-[11px] text-emerald-200/80 mt-1 leading-relaxed">
              Decoupled <code className="text-emerald-300 font-mono">AIInferenceAdapter</code> interface. Uses offline agronomic heuristics for prototype evaluation, ready for TensorFlow Lite / Edge Impulse deployment without paid cloud dependencies.
            </p>
          </div>
        </div>
      </div>

      {/* Foliage Image Capture & Preview Card */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
            Foliage Scanner & Camera
          </h3>
          <span className="text-[11px] text-stone-500 font-medium">RGB Leaf Analysis</span>
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
                <span className="text-white text-xs bg-black/50 px-2 py-1 rounded">Position Leaf in Center</span>
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
              <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded text-[10px] font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Ready for Inference</span>
              </div>
            </div>
          ) : (
            <div className="text-center p-6 text-stone-400">
              <Camera className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-xs">Take a photo or pick a sample leaf below</p>
            </div>
          )}
        </div>

        {/* Input Buttons (Camera, Gallery, File) */}
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
            <span>Upload Photo</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        {/* Big Analyze Button */}
        <button
          id="btn-analyze-crop"
          disabled={!selectedImage || isAnalyzing}
          onClick={runAnalysis}
          className="w-full mt-3 py-3 rounded-xl bg-emerald-700 text-white font-bold text-sm shadow-sm hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>Analyzing Leaf Cellular Patterns...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>Analyze Crop Foliage</span>
            </>
          )}
        </button>
      </div>

      {/* Preset Crop Specimens Carousel for rapid testing */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-sm">
        <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2.5">
          Select Sample Crop Leaves
        </h3>
        <div className="grid grid-cols-2 gap-2.5">
          {SAMPLE_CROP_LEAVES.map((sample) => {
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
                  <span className="text-xs font-bold text-stone-900 block truncate">
                    {sample.crop.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-stone-500 block truncate">
                    {sample.expectedDisease.split('(')[0]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Inference Diagnostic Result Card */}
      {currentResult && (
        <div className="bg-white rounded-2xl p-4 border-2 border-emerald-500/80 shadow-md animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Diagnostic Report
              </span>
              <h3 className="text-base font-extrabold text-stone-900 mt-1">
                {currentResult.cropName}
              </h3>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                currentResult.healthStatus === 'Healthy'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {currentResult.healthStatus === 'Healthy' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertOctagon className="w-3.5 h-3.5" />}
                {currentResult.healthStatus}
              </span>
            </div>
          </div>

          {/* Diagnosis Breakdown */}
          <div className="grid grid-cols-2 gap-3 py-3 border-b border-stone-100">
            <div>
              <span className="text-[11px] text-stone-500 font-medium">Disease Identification</span>
              <p className="text-xs font-bold text-stone-800 mt-0.5">
                {currentResult.diseaseDetected}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-stone-500 font-medium">Pest Assessment</span>
              <p className="text-xs font-bold text-stone-800 mt-0.5">
                {currentResult.pestDetected}
              </p>
            </div>
          </div>

          {/* Confidence Meter */}
          <div className="py-3 border-b border-stone-100">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-stone-600 font-medium">Model Inference Confidence</span>
              <span className="font-extrabold text-emerald-700">{currentResult.confidencePercent}%</span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-700"
                style={{ width: `${currentResult.confidencePercent}%` }}
              />
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div className="pt-3 space-y-2.5">
            <div>
              <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Sprout className="w-3.5 h-3.5 text-emerald-700" />
                <span>Agronomic Recommendation</span>
              </h4>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                {currentResult.recommendation}
              </p>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <h5 className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide">
                🌿 Organic Bio-Remedy
              </h5>
              <p className="text-xs text-emerald-950 mt-0.5">
                {currentResult.organicRemedy}
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
              <h5 className="text-[11px] font-bold text-amber-900 uppercase tracking-wide">
                🧪 Chemical Treatment (If Severity Escalates)
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
