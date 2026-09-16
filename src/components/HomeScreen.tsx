import React from 'react';
import { 
  SensorReading, 
  DemoScenario, 
  IrrigationDecision, 
  CropHealthOverview, 
  AlertItem, 
  EnvironmentalRiskAnalysis,
  EdgeAIStatusInfo,
  CropScanResult 
} from '../types';
import { EdgeAIStatusCard } from './EdgeAIStatusCard';
import { 
  Droplet, 
  Thermometer, 
  CloudRain, 
  Wind, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Lightbulb, 
  ChevronRight, 
  Bug, 
  Sparkles,
  MapPin,
  Cpu,
  WifiOff
} from 'lucide-react';

interface HomeScreenProps {
  reading: SensorReading;
  scenario: DemoScenario;
  onScenarioChange: (s: DemoScenario) => void;
  irrigation: IrrigationDecision;
  cropHealth: CropHealthOverview;
  envRisk: EnvironmentalRiskAnalysis;
  alerts: AlertItem[];
  edgeAIStatus: EdgeAIStatusInfo;
  onToggleEngine: (enabled: boolean) => void;
  latestScan?: CropScanResult | null;
  onAcknowledgeAlert: (id: string) => void;
  onNavigateTab: (tabIndex: number) => void;
  onOpenEnvRisk: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  reading,
  scenario,
  onScenarioChange,
  irrigation,
  cropHealth,
  envRisk,
  alerts,
  edgeAIStatus,
  onToggleEngine,
  latestScan,
  onAcknowledgeAlert,
  onNavigateTab,
  onOpenEnvRisk,
}) => {
  const scenarios: { id: DemoScenario; label: string; desc: string }[] = [
    { id: 'NORMAL', label: 'Normal', desc: 'Optimal conditions' },
    { id: 'LOW_MOISTURE', label: 'Low Moisture', desc: 'Soil deficit (<25%)' },
    { id: 'HEAT_STRESS', label: 'Heat Stress', desc: 'High temp (>41°C)' },
    { id: 'DISEASE', label: 'Disease Risk', desc: 'Warm & humid spores' },
    { id: 'PEST', label: 'Pest Outbreak', desc: 'Aphid threshold' },
    { id: 'FLOOD', label: 'Flood Risk', desc: 'Waterlogged (>90%)' },
  ];

  const unreadAlerts = alerts.filter(a => !a.acknowledged);

  return (
    <div className="space-y-4 pb-6">
      {/* Field & Live Status Card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900">Greenfield Farm • Plot #4</h2>
              <p className="text-[11px] text-stone-500">North Agro Block • Sandy-Loam Soil</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold text-emerald-800">DEMO TELEMETRY</span>
          </div>
        </div>

        {/* Demo Scenario Selector */}
        <div className="pt-2 border-t border-stone-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
              Demo Simulation Scenario:
            </span>
            <span className="text-[10px] text-emerald-700 font-medium">1-Tap Live Adapt</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
            {scenarios.map((s) => {
              const active = scenario === s.id;
              return (
                <button
                  key={s.id}
                  id={`scenario-btn-${s.id.toLowerCase()}`}
                  onClick={() => onScenarioChange(s.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 ${
                    active
                      ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-600/30'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Overview Cards (Crop Health & Irrigation Status) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Crop Health Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500">Crop Health</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                cropHealth.healthStatus === 'Optimal' ? 'bg-emerald-100 text-emerald-800' :
                cropHealth.healthStatus === 'Good' ? 'bg-green-100 text-green-800' :
                cropHealth.healthStatus === 'Moderate' ? 'bg-amber-100 text-amber-800' :
                'bg-rose-100 text-rose-800'
              }`}>
                {cropHealth.healthStatus}
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-stone-900">
                {cropHealth.overallHealthScore}%
              </span>
              <span className="text-[11px] text-stone-400">Vigor</span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-stone-400" />
              <span className="text-stone-600">Disease:</span>
              <span className={`font-semibold ${
                cropHealth.diseaseRisk === 'High' ? 'text-rose-600' :
                cropHealth.diseaseRisk === 'Moderate' ? 'text-amber-600' : 'text-emerald-700'
              }`}>{cropHealth.diseaseRisk}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bug className="w-3.5 h-3.5 text-stone-400" />
              <span className="text-stone-600">Pest:</span>
              <span className={`font-semibold ${
                cropHealth.pestRisk === 'High' ? 'text-rose-600' :
                cropHealth.pestRisk === 'Moderate' ? 'text-amber-600' : 'text-emerald-700'
              }`}>{cropHealth.pestRisk}</span>
            </div>
          </div>
        </div>

        {/* Irrigation Status Card */}
        <div 
          onClick={() => onNavigateTab(2)}
          className={`rounded-2xl p-4 shadow-sm border transition-all cursor-pointer flex flex-col justify-between ${
            irrigation.status === 'RECOMMENDED' 
              ? 'bg-blue-50/70 border-blue-200 hover:bg-blue-50' 
              : irrigation.status === 'DELAY'
              ? 'bg-amber-50/70 border-amber-200 hover:bg-amber-50'
              : 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-600">Irrigation</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                irrigation.status === 'RECOMMENDED' ? 'bg-blue-200 text-blue-900' :
                irrigation.status === 'DELAY' ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200 text-emerald-900'
              }`}>
                {irrigation.status === 'RECOMMENDED' ? 'Active Need' : irrigation.status === 'DELAY' ? 'Hold Off' : 'Satisfied'}
              </span>
            </div>
            <div className="mt-2">
              <span className={`text-base font-bold leading-tight block ${
                irrigation.status === 'RECOMMENDED' ? 'text-blue-900' :
                irrigation.status === 'DELAY' ? 'text-amber-900' : 'text-emerald-900'
              }`}>
                {irrigation.title}
              </span>
              <p className="text-[11px] text-stone-600 mt-1 line-clamp-1">
                {irrigation.status === 'RECOMMENDED' ? `${irrigation.waterAmountMm}mm cycle queued` : irrigation.optimalTimeWindow}
              </p>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-stone-200/50 flex items-center justify-between text-[11px] font-medium text-stone-700">
            <span>Open Controls</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Edge AI Status Section */}
      <EdgeAIStatusCard
        status={edgeAIStatus}
        onToggleEngine={onToggleEngine}
        onOpenScanner={() => onNavigateTab(1)}
      />

      {/* Latest Edge AI Scan Diagnosis Card (If a scan has been run) */}
      {latestScan && (
        <div 
          onClick={() => onNavigateTab(1)}
          className="bg-emerald-900 text-white rounded-2xl p-4 shadow-sm border border-emerald-800 cursor-pointer hover:bg-emerald-850 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-800 text-emerald-200">
                Latest Edge AI Scan
              </span>
              <span className="text-[11px] text-emerald-300 font-mono">
                {latestScan.inferenceLatencyMs}ms • {latestScan.confidencePercent.toFixed(1)}% Conf
              </span>
            </div>
            <span className="text-[10px] text-emerald-300 flex items-center gap-0.5">
              View Scan <ChevronRight className="w-3 h-3" />
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">
                {latestScan.conditionCategory === 'disease'
                  ? latestScan.diseaseDetected
                  : latestScan.conditionCategory === 'pest'
                  ? latestScan.pestDetected
                  : latestScan.conditionCategory === 'nutrient_deficiency'
                  ? latestScan.nutrientDeficiencyDetected
                  : 'Healthy Foliage Verified'}
              </h4>
              <p className="text-[11px] text-emerald-200 line-clamp-2 mt-1">
                {latestScan.combinedRecommendation || latestScan.recommendation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4 Sensor Telemetry Grid */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">Live Sensor Telemetry</h3>
          <span className="text-[10px] text-stone-400">Updated: {reading.timestamp}</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {/* Soil Moisture */}
          <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-stone-500 font-medium">Soil Moisture</span>
              <div className="p-1 rounded-lg bg-emerald-50 text-emerald-700">
                <Droplet className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-stone-900">{reading.soilMoisture.toFixed(1)}</span>
              <span className="text-xs font-bold text-stone-500">% VWC</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-stone-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  reading.soilMoisture < 30 ? 'bg-rose-500' :
                  reading.soilMoisture > 80 ? 'bg-blue-500' : 'bg-emerald-600'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, reading.soilMoisture))}%` }}
              />
            </div>
            <span className="text-[10px] font-medium text-stone-500 mt-1 block">
              {reading.soilMoisture < 30 ? 'Deficit below field cap.' : reading.soilMoisture > 80 ? 'Root saturation high' : 'Comfortable root range'}
            </span>
          </div>

          {/* Temperature */}
          <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-stone-500 font-medium">Temperature</span>
              <div className="p-1 rounded-lg bg-orange-50 text-orange-600">
                <Thermometer className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-stone-900">{reading.temperature.toFixed(1)}</span>
              <span className="text-xs font-bold text-stone-500">°C</span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  reading.temperature > 37 ? 'bg-rose-500' :
                  reading.temperature > 32 ? 'bg-amber-500' : 'bg-emerald-600'
                }`}
                style={{ width: `${Math.min(100, (reading.temperature / 50) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] font-medium text-stone-500 mt-1 block">
              {reading.temperature > 38 ? 'High heat stress' : reading.temperature > 32 ? 'Elevated transpiration' : 'Photosynthetic sweetspot'}
            </span>
          </div>

          {/* Humidity */}
          <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-stone-500 font-medium">Air Humidity</span>
              <div className="p-1 rounded-lg bg-teal-50 text-teal-700">
                <Wind className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-stone-900">{reading.humidity.toFixed(1)}</span>
              <span className="text-xs font-bold text-stone-500">% RH</span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  reading.humidity > 80 ? 'bg-purple-500' : 'bg-teal-600'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, reading.humidity))}%` }}
              />
            </div>
            <span className="text-[10px] font-medium text-stone-500 mt-1 block">
              {reading.humidity > 80 ? 'Fungal spore incubation' : 'Standard vapor range'}
            </span>
          </div>

          {/* Rain Forecast */}
          <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-stone-500 font-medium">Rain Probability</span>
              <div className="p-1 rounded-lg bg-indigo-50 text-indigo-700">
                <CloudRain className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-stone-900">{reading.rainProbability.toFixed(0)}</span>
              <span className="text-xs font-bold text-stone-500">% Prob</span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  reading.rainProbability > 60 ? 'bg-indigo-600' : 'bg-stone-400'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, reading.rainProbability))}%` }}
              />
            </div>
            <span className="text-[10px] font-medium text-stone-500 mt-1 block">
              {reading.rainProbability > 60 ? 'Rain imminent: Hold drip' : 'Low precipitation chance'}
            </span>
          </div>
        </div>
      </div>

      {/* Environmental Stress Quick Banner */}
      <div 
        onClick={onOpenEnvRisk}
        className="bg-stone-900 text-white rounded-2xl p-3.5 shadow-sm flex items-center justify-between cursor-pointer hover:bg-stone-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
            {envRisk.overallScore}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-200">Environmental Risk Index</span>
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                {envRisk.overallScore > 75 ? 'Safe' : envRisk.overallScore > 50 ? 'Moderate' : 'Stressed'}
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Heat: {envRisk.heatStress.level} • Water: {envRisk.waterStress.level} • Flood: {envRisk.floodRisk.level}
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-stone-400" />
      </div>

      {/* Farmer Advisory Card */}
      <div className="bg-amber-50/80 rounded-2xl p-4 border border-amber-200 shadow-sm">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 bg-amber-200/70 text-amber-900 rounded-xl mt-0.5">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
              Agronomic Action Advisory
            </h4>
            <p className="text-xs text-amber-900/90 mt-1 font-medium leading-relaxed">
              {cropHealth.advisoryText}
            </p>
            <div className="mt-2.5 pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px] text-amber-800">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Window: {irrigation.optimalTimeWindow}</span>
              </div>
              <button 
                onClick={() => onNavigateTab(1)}
                className="font-bold underline flex items-center gap-0.5"
              >
                Scan Foliage <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Alerts Drawer */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-stone-700" />
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              Recent Alerts ({unreadAlerts.length})
            </h3>
          </div>
          <button 
            onClick={() => onNavigateTab(4)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
          >
            View All <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {alerts.slice(0, 2).map((alert) => (
          <div 
            key={alert.id}
            className={`p-3 rounded-xl border mb-2 last:mb-0 transition-all ${
              alert.acknowledged 
                ? 'bg-stone-50 border-stone-200/60 opacity-70' 
                : alert.severity === 'critical'
                ? 'bg-rose-50/70 border-rose-200'
                : 'bg-amber-50/70 border-amber-200'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    alert.severity === 'critical' ? 'bg-rose-600' : 'bg-amber-600'
                  }`} />
                  <span className="text-xs font-bold text-stone-900">{alert.title}</span>
                  <span className="text-[10px] text-stone-400 ml-auto">{alert.timestamp}</span>
                </div>
                <p className="text-[11px] text-stone-600 mt-1 leading-snug line-clamp-2">
                  {alert.message}
                </p>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-stone-200/50 flex items-center justify-between text-[11px]">
              <span className="text-stone-500 font-medium">Trigger: {alert.metricTrigger}</span>
              {!alert.acknowledged ? (
                <button
                  onClick={() => onAcknowledgeAlert(alert.id)}
                  className="px-2 py-0.5 text-[10px] font-bold bg-white text-emerald-800 border border-emerald-300 rounded hover:bg-emerald-50"
                >
                  Acknowledge
                </button>
              ) : (
                <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Done
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
