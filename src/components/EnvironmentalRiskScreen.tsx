import React from 'react';
import { EnvironmentalRiskAnalysis, SensorReading } from '../types';
import { 
  Flame, 
  Droplet, 
  Waves, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  ThermometerSnowflake,
  ArrowRight
} from 'lucide-react';

interface EnvironmentalRiskScreenProps {
  envRisk: EnvironmentalRiskAnalysis;
  reading: SensorReading;
  onNavigateToIrrigation: () => void;
}

export const EnvironmentalRiskScreen: React.FC<EnvironmentalRiskScreenProps> = ({
  envRisk,
  reading,
  onNavigateToIrrigation,
}) => {
  const getBadgeClass = (level: string) => {
    switch (level) {
      case 'Critical':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Moderate':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  const getProgressColor = (score: number) => {
    if (score >= 75) return 'bg-rose-600';
    if (score >= 50) return 'bg-orange-500';
    if (score >= 25) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Overall Resilience Index Header */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Ecological Vulnerability Assessment
            </span>
            <h2 className="text-lg font-extrabold text-stone-900 mt-0.5">
              Microclimate Stress Index
            </h2>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-stone-900">{envRisk.overallScore}</span>
              <span className="text-xs text-stone-400">/ 100</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700">Resilience Index</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-stone-100 text-xs text-stone-600">
          Telemetry inputs: Ambient Temp <span className="font-bold text-stone-800">{reading.temperature.toFixed(1)}°C</span>, Humidity <span className="font-bold text-stone-800">{reading.humidity.toFixed(1)}%</span>, Root Moisture <span className="font-bold text-stone-800">{reading.soilMoisture.toFixed(1)}%</span>, Rain Forecast <span className="font-bold text-stone-800">{reading.rainProbability.toFixed(0)}%</span>.
        </div>
      </div>

      {/* 1. Heat Stress Card */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-100 text-orange-700">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">{envRisk.heatStress.title}</h3>
              <p className="text-[11px] text-stone-500">Canopy Transpiration & Vapor Deficit</p>
            </div>
          </div>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getBadgeClass(envRisk.heatStress.level)}`}>
            {envRisk.heatStress.level}
          </span>
        </div>

        {/* Meter */}
        <div className="mt-3">
          <div className="flex justify-between text-[11px] text-stone-500 mb-1">
            <span>Thermal Load Score</span>
            <span className="font-bold text-stone-800">{envRisk.heatStress.score} / 100</span>
          </div>
          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getProgressColor(envRisk.heatStress.score)}`}
              style={{ width: `${envRisk.heatStress.score}%` }}
            />
          </div>
        </div>

        <p className="text-xs text-stone-700 mt-2.5 leading-relaxed font-medium">
          {envRisk.heatStress.description}
        </p>

        <div className="mt-3 p-2.5 bg-orange-50/70 border border-orange-200/70 rounded-xl text-xs text-orange-950 font-medium">
          <span className="font-bold block text-[11px] uppercase tracking-wide text-orange-800 mb-0.5">
            Mitigation Guidance:
          </span>
          {envRisk.heatStress.actionableAdvice}
        </div>
      </div>

      {/* 2. Water Stress Card */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <Droplet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">{envRisk.waterStress.title}</h3>
              <p className="text-[11px] text-stone-500">Root-Zone Available Water Capacity</p>
            </div>
          </div>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getBadgeClass(envRisk.waterStress.level)}`}>
            {envRisk.waterStress.level}
          </span>
        </div>

        {/* Meter */}
        <div className="mt-3">
          <div className="flex justify-between text-[11px] text-stone-500 mb-1">
            <span>Deficit Stress Score</span>
            <span className="font-bold text-stone-800">{envRisk.waterStress.score} / 100</span>
          </div>
          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getProgressColor(envRisk.waterStress.score)}`}
              style={{ width: `${envRisk.waterStress.score}%` }}
            />
          </div>
        </div>

        <p className="text-xs text-stone-700 mt-2.5 leading-relaxed font-medium">
          {envRisk.waterStress.description}
        </p>

        <div className="mt-3 p-2.5 bg-blue-50/70 border border-blue-200/70 rounded-xl text-xs text-blue-950 font-medium flex items-center justify-between">
          <div>
            <span className="font-bold block text-[11px] uppercase tracking-wide text-blue-800 mb-0.5">
              Mitigation Guidance:
            </span>
            {envRisk.waterStress.actionableAdvice}
          </div>
          <button
            onClick={onNavigateToIrrigation}
            className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-lg ml-2"
            title="Open Irrigation"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Flood / Waterlogging Risk Card */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <Waves className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">{envRisk.floodRisk.title}</h3>
              <p className="text-[11px] text-stone-500">Soil Saturation & Anaerobic Rot</p>
            </div>
          </div>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getBadgeClass(envRisk.floodRisk.level)}`}>
            {envRisk.floodRisk.level}
          </span>
        </div>

        {/* Meter */}
        <div className="mt-3">
          <div className="flex justify-between text-[11px] text-stone-500 mb-1">
            <span>Waterlogging Hazard Score</span>
            <span className="font-bold text-stone-800">{envRisk.floodRisk.score} / 100</span>
          </div>
          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getProgressColor(envRisk.floodRisk.score)}`}
              style={{ width: `${envRisk.floodRisk.score}%` }}
            />
          </div>
        </div>

        <p className="text-xs text-stone-700 mt-2.5 leading-relaxed font-medium">
          {envRisk.floodRisk.description}
        </p>

        <div className="mt-3 p-2.5 bg-indigo-50/70 border border-indigo-200/70 rounded-xl text-xs text-indigo-950 font-medium">
          <span className="font-bold block text-[11px] uppercase tracking-wide text-indigo-800 mb-0.5">
            Drainage Protocol:
          </span>
          {envRisk.floodRisk.actionableAdvice}
        </div>
      </div>
    </div>
  );
};
