import React, { useState } from 'react';
import { EdgeAIStatusInfo } from '../types';
import { mockEdgeAIAdapter } from '../services/MockEdgeAIAdapter';
import { 
  Cpu, 
  WifiOff, 
  Activity, 
  Database, 
  Clock, 
  Zap, 
  ShieldCheck, 
  Power, 
  Info, 
  Code2, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  ChevronRight,
  Layers,
  X
} from 'lucide-react';

interface EdgeAIStatusCardProps {
  status: EdgeAIStatusInfo;
  onToggleEngine?: (newState: boolean) => void;
  onOpenScanner?: () => void;
  compact?: boolean;
}

export const EdgeAIStatusCard: React.FC<EdgeAIStatusCardProps> = ({
  status,
  onToggleEngine,
  onOpenScanner,
  compact = false,
}) => {
  const [showDocsModal, setShowDocsModal] = useState(false);

  const handleToggle = () => {
    const next = !status.engineOn;
    if (onToggleEngine) {
      onToggleEngine(next);
    } else {
      mockEdgeAIAdapter.setEngineOn(next);
    }
  };

  return (
    <>
      <div 
        id="edge-ai-status-section"
        className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-sm relative overflow-hidden"
      >
        {/* Subtle Decorative Edge Circuit Accent */}
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-50 rounded-full pointer-events-none opacity-60 flex items-center justify-center">
          <Cpu className="w-12 h-12 text-emerald-200" />
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 relative z-10">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-xl flex items-center justify-center transition-colors ${
              status.engineOn ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
            }`}>
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Edge AI Status
                </h3>
                {/* Clear Edge AI / Local Inference Badge */}
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-800 text-white flex items-center gap-1 shadow-2xs">
                  <WifiOff className="w-2.5 h-2.5 text-emerald-300" />
                  <span>Edge AI / Local Inference</span>
                </span>
              </div>
              <p className="text-[10px] text-stone-500 mt-0.5">
                On-device INT8 Neural Network • Zero Cloud Latency
              </p>
            </div>
          </div>

          {/* AI Engine ON/OFF Switch */}
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-bold ${
              status.engineOn ? 'text-emerald-700' : 'text-stone-400'
            }`}>
              {status.engineOn ? 'ON' : 'OFF'}
            </span>
            <button
              id="toggle-edge-ai-engine"
              onClick={handleToggle}
              role="switch"
              aria-checked={status.engineOn}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                status.engineOn ? 'bg-emerald-600' : 'bg-stone-300'
              }`}
              title={`Switch Edge AI Engine ${status.engineOn ? 'OFF' : 'ON'}`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 flex items-center justify-center ${
                  status.engineOn ? 'translate-x-5' : 'translate-x-0'
                }`}
              >
                <Power className={`w-3 h-3 ${status.engineOn ? 'text-emerald-700' : 'text-stone-400'}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Status Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5 pt-3 relative z-10">
          {/* 1. Inference Status */}
          <div className="p-2.5 bg-stone-50/80 rounded-xl border border-stone-200/60">
            <div className="flex items-center gap-1.5 text-[10px] text-stone-500 font-semibold uppercase tracking-wider mb-1">
              <Activity className="w-3 h-3 text-emerald-600" />
              <span>Inference Status</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${
                !status.engineOn
                  ? 'bg-stone-400'
                  : status.inferenceStatus === 'Inferring (Local INT8)'
                  ? 'bg-amber-500 animate-ping'
                  : status.inferenceStatus === 'Completed'
                  ? 'bg-emerald-600'
                  : 'bg-emerald-500 animate-pulse'
              }`} />
              <span className="text-xs font-bold text-stone-900 truncate">
                {!status.engineOn ? 'Engine Offline' : status.inferenceStatus}
              </span>
            </div>
          </div>

          {/* 2. Model Status */}
          <div className="p-2.5 bg-stone-50/80 rounded-xl border border-stone-200/60">
            <div className="flex items-center gap-1.5 text-[10px] text-stone-500 font-semibold uppercase tracking-wider mb-1">
              <Database className="w-3 h-3 text-emerald-600" />
              <span>Model Status</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-stone-900 truncate">
                {status.modelStatus}
              </span>
            </div>
          </div>

          {/* 3. Last Inference */}
          <div className="p-2.5 bg-stone-50/80 rounded-xl border border-stone-200/60">
            <div className="flex items-center gap-1.5 text-[10px] text-stone-500 font-semibold uppercase tracking-wider mb-1">
              <Clock className="w-3 h-3 text-emerald-600" />
              <span>Last Inference</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-bold text-stone-900">
                {status.lastInferenceLatencyMs ? `${status.lastInferenceLatencyMs} ms` : 'Ready'}
              </span>
              {status.lastInferenceTime && (
                <span className="text-[10px] text-stone-500 truncate">
                  ({status.lastInferenceTime.split(' ')[0]})
                </span>
              )}
            </div>
          </div>

          {/* 4. Confidence */}
          <div className="p-2.5 bg-stone-50/80 rounded-xl border border-stone-200/60">
            <div className="flex items-center gap-1.5 text-[10px] text-stone-500 font-semibold uppercase tracking-wider mb-1">
              <Zap className="w-3 h-3 text-emerald-600" />
              <span>Confidence</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-extrabold text-emerald-700">
                {status.confidence ? `${status.confidence.toFixed(1)}%` : 'No scan yet'}
              </span>
              {status.confidence && (
                <span className="text-[9px] text-stone-400 font-medium">
                  (Softmax)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Offline Assurance & TFLite Info Bar */}
        <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px] relative z-10">
          <div className="flex items-center gap-1.5 text-stone-600">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
            <span className="text-[10.5px]">
              100% Offline • Works in zero-connectivity fields
            </span>
          </div>

          <button
            onClick={() => setShowDocsModal(true)}
            className="text-[10.5px] font-bold text-emerald-800 hover:text-emerald-900 underline flex items-center gap-0.5"
          >
            <span>TFLite/ONNX Code</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* TFLite & ONNX Integration Details Modal */}
      {showDocsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
          <div className="bg-stone-50 w-full max-w-lg max-h-[85vh] rounded-3xl shadow-2xl border border-stone-300 flex flex-col overflow-hidden">
            <div className="p-4 bg-emerald-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-300" />
                <h3 className="font-bold text-xs uppercase tracking-wider">
                  Edge AI Integration Architecture
                </h3>
              </div>
              <button
                onClick={() => setShowDocsModal(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 text-xs text-stone-700">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <h4 className="font-bold text-emerald-950 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Decoupled EdgeAIAdapter Architecture</span>
                </h4>
                <p className="text-[11px] text-emerald-900 leading-relaxed">
                  The AGRO-IOT app adheres strictly to offline-first principles. The current <code className="font-mono text-emerald-800 bg-emerald-100/80 px-1 py-0.5 rounded">MockEdgeAIAdapter</code> mirrors the exact lifecycle of the production on-device model without claiming synthetic 100% accuracy.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 mb-1">Flutter & Android Deployment Path:</h4>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-stone-600">
                  <li>Place quantized <code className="font-mono text-stone-800">agro_vision_int8.tflite</code> in Flutter <code className="font-mono text-stone-800">assets/models/</code>.</li>
                  <li>Import <code className="font-mono text-stone-800">package:tflite_flutter/tflite_flutter.dart</code>.</li>
                  <li>Enable Android NNAPI delegate (<code className="font-mono text-stone-800">useNnapiForAndroid = true</code>) for hardware NPU acceleration.</li>
                  <li>Execute local inference in &lt;60ms latency without transmitting images over the internet.</li>
                </ol>
              </div>

              <div>
                <span className="font-bold text-stone-800 block mb-1">Dart / Flutter Integration Implementation:</span>
                <pre className="p-3 bg-stone-900 text-emerald-400 rounded-xl text-[10px] font-mono overflow-x-auto leading-tight">
                  {mockEdgeAIAdapter.getIntegrationDocs()}
                </pre>
              </div>

              <div className="p-2.5 bg-stone-200/70 rounded-xl text-[10px] text-stone-600">
                <strong>Agronomic Sensor Fusion:</strong> The output logits are passed alongside real-time soil moisture and humidity telemetry into <code className="font-mono text-stone-800">DecisionEngine</code> to issue holistic fertigation and pest management recommendations.
              </div>
            </div>

            <div className="p-3 bg-stone-100 border-t border-stone-200 flex justify-end">
              <button
                onClick={() => setShowDocsModal(false)}
                className="px-4 py-2 bg-emerald-800 text-white text-xs font-bold rounded-xl hover:bg-emerald-700"
              >
                Close Integration Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
