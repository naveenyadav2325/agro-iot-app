import React, { useState } from 'react';
import { SensorReading, IrrigationDecision } from '../types';
import { DecisionEngine } from '../services/DecisionEngine';
import { 
  Droplet, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Calendar, 
  Sliders, 
  Volume2, 
  Play, 
  Power,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface IrrigationScreenProps {
  reading: SensorReading;
  onOverrideReading?: (reading: Partial<SensorReading>) => void;
}

export const IrrigationScreen: React.FC<IrrigationScreenProps> = ({
  reading,
  onOverrideReading,
}) => {
  // Local slider overrides to let user play with sensor parameters freely
  const [sliderMoisture, setSliderMoisture] = useState<number>(reading.soilMoisture);
  const [sliderTemp, setSliderTemp] = useState<number>(reading.temperature);
  const [sliderHumidity, setSliderHumidity] = useState<number>(reading.humidity);
  const [sliderRain, setSliderRain] = useState<number>(reading.rainProbability);
  const [useSliders, setUseSliders] = useState<boolean>(false);

  // Field Valve execution simulation
  const [isValveActive, setIsValveActive] = useState(false);
  const [valveFeedback, setValveFeedback] = useState<string | null>(null);

  // Derive decision dynamically
  const activeReading: SensorReading = useSliders
    ? {
        ...reading,
        soilMoisture: sliderMoisture,
        temperature: sliderTemp,
        humidity: sliderHumidity,
        rainProbability: sliderRain,
      }
    : reading;

  const decision: IrrigationDecision = DecisionEngine.evaluateIrrigation(activeReading);

  const toggleValve = () => {
    if (isValveActive) {
      setIsValveActive(false);
      setValveFeedback('Zone 1 Solenoid Valve Closed.');
    } else {
      setIsValveActive(true);
      setValveFeedback(`Zone 1 Valve Active. Dispensing ${decision.waterAmountMm || 15}mm drip cycle.`);
    }
    setTimeout(() => setValveFeedback(null), 3500);
  };

  const resetSliders = () => {
    setSliderMoisture(reading.soilMoisture);
    setSliderTemp(reading.temperature);
    setSliderHumidity(reading.humidity);
    setSliderRain(reading.rainProbability);
    setUseSliders(false);
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Primary Decision Banner */}
      <div 
        className={`rounded-2xl p-4 shadow-sm border transition-all ${
          decision.status === 'RECOMMENDED'
            ? 'bg-blue-600 text-white border-blue-500'
            : decision.status === 'DELAY'
            ? 'bg-amber-500 text-stone-950 border-amber-400'
            : 'bg-emerald-700 text-white border-emerald-600'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider opacity-90">
            Automated Decision Engine
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/20 text-white">
            FAO-56 Soil Moisture Balance
          </span>
        </div>

        <div className="mt-2 flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-sm">
            <Droplet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold leading-tight">
              {decision.title}
            </h2>
            <p className="text-xs opacity-90 mt-0.5">
              Status: <span className="font-bold">{decision.status.replace('_', ' ')}</span>
            </p>
          </div>
        </div>

        <p className="text-xs mt-3 pt-3 border-t border-white/20 leading-relaxed font-medium">
          {decision.reason}
        </p>

        {/* Quantified stats */}
        <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-white/20 text-xs">
          <div className="bg-black/10 rounded-xl p-2.5">
            <span className="text-[10px] opacity-80 block">Recommended Dose</span>
            <span className="text-sm font-black mt-0.5 block">
              {decision.waterAmountMm} mm <span className="text-[10px] font-normal">({decision.estimatedWaterLitersPerAcre.toLocaleString()} L/Acre)</span>
            </span>
          </div>
          <div className="bg-black/10 rounded-xl p-2.5">
            <span className="text-[10px] opacity-80 block">Optimal Window</span>
            <span className="text-sm font-bold mt-0.5 block truncate">
              {decision.optimalTimeWindow}
            </span>
          </div>
        </div>
      </div>

      {/* Valve Controller Card */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              Field Solenoid Actuator
            </h3>
            <p className="text-[11px] text-stone-500">Zone 1 Root-Zone Drip Line</p>
          </div>
          <button
            onClick={toggleValve}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm ${
              isValveActive
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-emerald-700 text-white hover:bg-emerald-800'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isValveActive ? 'Close Valve' : 'Trigger Valve'}</span>
          </button>
        </div>

        {valveFeedback && (
          <div className="p-2.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-semibold mt-2 animate-fadeIn">
            {valveFeedback}
          </div>
        )}
      </div>

      {/* Live Telemetry Inputs & Interactive Sliders */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-emerald-700" />
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              Telemetry Parameters
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUseSliders(!useSliders)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors ${
                useSliders
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : 'bg-stone-100 text-stone-600 border-stone-200'
              }`}
            >
              {useSliders ? 'Custom Sliders ON' : 'Live Sync ON'}
            </button>
            {useSliders && (
              <button
                onClick={resetSliders}
                title="Reset to Live Telemetry"
                className="p-1 rounded-lg text-stone-500 hover:bg-stone-100"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <p className="text-[11px] text-stone-500 mb-3">
          {useSliders 
            ? 'Drag any slider to test how the DecisionEngine recalculates irrigation actions in real time.'
            : 'Displaying instantaneous telemetry from active IoT node.'}
        </p>

        <div className="space-y-3.5">
          {/* 1. Soil Moisture */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-stone-700">1. Soil Moisture</span>
              <span className="font-extrabold text-emerald-700">{activeReading.soilMoisture.toFixed(1)}% VWC</span>
            </div>
            <input
              type="range"
              min="5"
              max="98"
              step="1"
              disabled={!useSliders}
              value={useSliders ? sliderMoisture : reading.soilMoisture}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setSliderMoisture(val);
                setUseSliders(true);
              }}
              className="w-full accent-emerald-600 h-2 bg-stone-100 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 mt-0.5">
              <span>Severe Drought (10%)</span>
              <span>Field Cap. (55%)</span>
              <span>Waterlogged (90%)</span>
            </div>
          </div>

          {/* 2. Temperature */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-stone-700">2. Ambient Temperature</span>
              <span className="font-extrabold text-orange-600">{activeReading.temperature.toFixed(1)}°C</span>
            </div>
            <input
              type="range"
              min="10"
              max="50"
              step="0.5"
              disabled={!useSliders}
              value={useSliders ? sliderTemp : reading.temperature}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setSliderTemp(val);
                setUseSliders(true);
              }}
              className="w-full accent-orange-500 h-2 bg-stone-100 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 mt-0.5">
              <span>Cool (15°C)</span>
              <span>Comfort (28°C)</span>
              <span>Extreme Heat (45°C)</span>
            </div>
          </div>

          {/* 3. Humidity */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-stone-700">3. Relative Humidity</span>
              <span className="font-extrabold text-teal-700">{activeReading.humidity.toFixed(1)}% RH</span>
            </div>
            <input
              type="range"
              min="15"
              max="98"
              step="1"
              disabled={!useSliders}
              value={useSliders ? sliderHumidity : reading.humidity}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setSliderHumidity(val);
                setUseSliders(true);
              }}
              className="w-full accent-teal-600 h-2 bg-stone-100 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 mt-0.5">
              <span>Arid (20%)</span>
              <span>Vegetative (60%)</span>
              <span>Saturated (95%)</span>
            </div>
          </div>

          {/* 4. Rain Probability */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-stone-700">4. Rain Probability</span>
              <span className="font-extrabold text-indigo-700">{activeReading.rainProbability.toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              disabled={!useSliders}
              value={useSliders ? sliderRain : reading.rainProbability}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setSliderRain(val);
                setUseSliders(true);
              }}
              className="w-full accent-indigo-600 h-2 bg-stone-100 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 mt-0.5">
              <span>Clear Sky (0%)</span>
              <span>Overcast (40%)</span>
              <span>Rain Likely (&gt;60%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
