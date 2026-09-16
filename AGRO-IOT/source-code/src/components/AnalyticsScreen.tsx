import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';
import { HistoricalDataPoint, SensorReading } from '../types';
import { mockSensorAdapter } from '../services/MockSensorAdapter';
import { 
  BarChart3, 
  Droplet, 
  Thermometer, 
  Wind, 
  Calendar, 
  Clock, 
  TrendingUp 
} from 'lucide-react';

interface AnalyticsScreenProps {
  currentReading: SensorReading;
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ currentReading }) => {
  const [timeRange, setTimeRange] = useState<'24H' | '7D'>('24H');
  const [selectedMetric, setSelectedMetric] = useState<'soilMoisture' | 'temperature' | 'humidity'>('soilMoisture');
  const [data, setData] = useState<HistoricalDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    mockSensorAdapter.getHistoricalData(timeRange).then((points) => {
      if (isMounted) {
        setData(points);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [timeRange, currentReading]);

  // Metric configuration
  const metricConfigs = {
    soilMoisture: {
      title: 'Soil Moisture Level',
      unit: '% VWC',
      color: '#059669', // emerald
      gradientId: 'moistureGradient',
      targetMin: 45,
      targetMax: 70,
      domain: [0, 100],
      icon: Droplet,
      desc: 'Field moisture capacity threshold: 45% - 70% recommended',
    },
    temperature: {
      title: 'Ambient Temperature',
      unit: '°C',
      color: '#ea580c', // orange
      gradientId: 'tempGradient',
      targetMin: 20,
      targetMax: 32,
      domain: [10, 50],
      icon: Thermometer,
      desc: 'Optimal photosynthetic enzymatic comfort: 20°C - 32°C',
    },
    humidity: {
      title: 'Relative Air Humidity',
      unit: '% RH',
      color: '#0d9488', // teal
      gradientId: 'humGradient',
      targetMin: 50,
      targetMax: 75,
      domain: [10, 100],
      icon: Wind,
      desc: 'High relative humidity (>80%) accelerates fungal spores',
    },
  };

  const activeConfig = metricConfigs[selectedMetric];
  const IconComponent = activeConfig.icon;

  // Compute min, max, avg
  const values = data.map((d) => d[selectedMetric]);
  const minVal = values.length ? Math.min(...values) : 0;
  const maxVal = values.length ? Math.max(...values) : 0;
  const avgVal = values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : '0';

  return (
    <div className="space-y-4 pb-6">
      {/* Range & Metric Selectors */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-700" />
            <h2 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              Telemetry Analytics
            </h2>
          </div>
          {/* Time range pills */}
          <div className="flex bg-stone-100 p-1 rounded-xl">
            <button
              onClick={() => setTimeRange('24H')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                timeRange === '24H'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              24 Hours
            </button>
            <button
              onClick={() => setTimeRange('7D')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                timeRange === '7D'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              7 Days
            </button>
          </div>
        </div>

        {/* 3 Metric Switchers */}
        <div className="grid grid-cols-3 gap-2">
          {(['soilMoisture', 'temperature', 'humidity'] as const).map((m) => {
            const isSelected = selectedMetric === m;
            const conf = metricConfigs[m];
            const Icon = conf.icon;
            return (
              <button
                key={m}
                onClick={() => setSelectedMetric(m)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-sm'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-1 text-[11px] text-stone-500 mb-0.5">
                  <Icon className="w-3.5 h-3.5" style={{ color: conf.color }} />
                  <span className="font-semibold truncate">
                    {m === 'soilMoisture' ? 'Moisture' : m === 'temperature' ? 'Temp' : 'Humidity'}
                  </span>
                </div>
                <div className="text-sm font-black text-stone-900">
                  {currentReading[m].toFixed(1)}{' '}
                  <span className="text-[9px] font-normal text-stone-500">{conf.unit.split(' ')[0]}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Recharts Area Chart */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <span>{activeConfig.title} Trend</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                {timeRange} History
              </span>
            </h3>
            <p className="text-[11px] text-stone-500 mt-0.5">
              {activeConfig.desc}
            </p>
          </div>
        </div>

        <div className="w-full h-56 pt-2">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">
              Loading telemetry history...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id={activeConfig.gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={activeConfig.color} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={activeConfig.color} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5E4" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 10, fill: '#78716C' }}
                  axisLine={{ stroke: '#E7E5E4' }}
                  tickLine={false}
                />
                <YAxis 
                  domain={activeConfig.domain}
                  tick={{ fontSize: 10, fill: '#78716C' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-stone-900 text-white text-xs p-2.5 rounded-xl shadow-lg border border-stone-700">
                          <p className="font-semibold text-stone-300 text-[11px]">{label}</p>
                          <p className="font-bold text-sm mt-0.5" style={{ color: activeConfig.color }}>
                            {Number(payload[0].value).toFixed(1)} {activeConfig.unit}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* Target Range Reference Lines */}
                <ReferenceLine 
                  y={activeConfig.targetMin} 
                  stroke="#10b981" 
                  strokeDasharray="4 4" 
                  label={{ value: 'Target Min', position: 'insideBottomLeft', fill: '#10b981', fontSize: 9 }} 
                />
                <ReferenceLine 
                  y={activeConfig.targetMax} 
                  stroke="#10b981" 
                  strokeDasharray="4 4" 
                  label={{ value: 'Target Max', position: 'insideTopLeft', fill: '#10b981', fontSize: 9 }} 
                />
                <Area
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke={activeConfig.color}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill={`url(#${activeConfig.gradientId})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Min / Avg / Max Summary Footer */}
        <div className="mt-3 pt-3 border-t border-stone-100 grid grid-cols-3 text-center">
          <div>
            <span className="text-[10px] text-stone-400 uppercase font-semibold">Minimum</span>
            <p className="text-sm font-bold text-stone-800 mt-0.5">
              {minVal.toFixed(1)} {activeConfig.unit.split(' ')[0]}
            </p>
          </div>
          <div className="border-x border-stone-100">
            <span className="text-[10px] text-stone-400 uppercase font-semibold">Average</span>
            <p className="text-sm font-bold text-stone-800 mt-0.5">
              {avgVal} {activeConfig.unit.split(' ')[0]}
            </p>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 uppercase font-semibold">Maximum</span>
            <p className="text-sm font-bold text-stone-800 mt-0.5">
              {maxVal.toFixed(1)} {activeConfig.unit.split(' ')[0]}
            </p>
          </div>
        </div>
      </div>

      {/* Sensor Health & Packet Telemetry Log */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-sm">
        <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
          IoT Node Diagnostics (ESP32 Node #1)
        </h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-stone-50 rounded-xl">
            <span className="text-stone-500 text-[10px] block">Battery Voltage</span>
            <span className="font-bold text-stone-800">4.12 V (92%)</span>
          </div>
          <div className="p-2 bg-stone-50 rounded-xl">
            <span className="text-stone-500 text-[10px] block">Solar Harvest Ingress</span>
            <span className="font-bold text-stone-800">180 mW Active</span>
          </div>
          <div className="p-2 bg-stone-50 rounded-xl">
            <span className="text-stone-500 text-[10px] block">Packet Interval</span>
            <span className="font-bold text-stone-800">4.0 sec (Adaptive)</span>
          </div>
          <div className="p-2 bg-stone-50 rounded-xl">
            <span className="text-stone-500 text-[10px] block">Wireless Protocol</span>
            <span className="font-bold text-stone-800">Wi-Fi / BLE 5.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};
