import React, { useState, useEffect } from 'react';
import { 
  SensorReading, 
  DemoScenario, 
  IrrigationDecision, 
  CropHealthOverview, 
  EnvironmentalRiskAnalysis, 
  AlertItem, 
  CropScanResult 
} from '../types';
import { mockSensorAdapter } from '../services/MockSensorAdapter';
import { DecisionEngine } from '../services/DecisionEngine';
import { AgroLogo } from './Logo';
import { HomeScreen } from './HomeScreen';
import { CropScanScreen } from './CropScanScreen';
import { IrrigationScreen } from './IrrigationScreen';
import { EnvironmentalRiskScreen } from './EnvironmentalRiskScreen';
import { AnalyticsScreen } from './AnalyticsScreen';
import { AlertsScreen } from './AlertsScreen';
import { FlutterExportModal } from './FlutterExportModal';

import { 
  Home, 
  Camera, 
  Droplet, 
  BarChart3, 
  Bell, 
  Wifi, 
  Battery, 
  Signal, 
  Smartphone, 
  Maximize2, 
  Minimize2, 
  Code2, 
  Sparkles, 
  HelpCircle,
  X,
  Layers
} from 'lucide-react';

export const AndroidShell: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [scenario, setScenario] = useState<DemoScenario>('NORMAL');
  const [reading, setReading] = useState<SensorReading>({
    soilMoisture: 58,
    temperature: 26.5,
    humidity: 62,
    rainProbability: 15,
    timestamp: '10:45:00 AM',
    batteryPercent: 92,
  });

  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [recentScans, setRecentScans] = useState<CropScanResult[]>([]);
  const [isFrameMode, setIsFrameMode] = useState<boolean>(true);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isEnvRiskModalOpen, setIsEnvRiskModalOpen] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('10:45');

  // Clock updater for Android status bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  // Subscribe to sensor telemetry
  useEffect(() => {
    const unsubscribe = mockSensorAdapter.subscribe((newReading) => {
      setReading(newReading);
      setAlerts((prev) => {
        const fresh = DecisionEngine.generateAlerts(newReading, scenario);
        // keep acknowledged state if id matches
        return fresh.map((f) => {
          const existing = prev.find((p) => p.id === f.id);
          return existing ? { ...f, acknowledged: existing.acknowledged } : f;
        });
      });
    });

    return () => unsubscribe();
  }, [scenario]);

  const handleScenarioChange = (newScenario: DemoScenario) => {
    setScenario(newScenario);
    mockSensorAdapter.setScenario(newScenario);
  };

  const handleAcknowledgeAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
  };

  const handleAcknowledgeAll = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, acknowledged: true })));
  };

  const handleScanCompleted = (scan: CropScanResult) => {
    setRecentScans((prev) => [scan, ...prev]);
  };

  // Derive decision & environmental risk from current telemetry
  const irrigation: IrrigationDecision = DecisionEngine.evaluateIrrigation(reading);
  const envRisk: EnvironmentalRiskAnalysis = DecisionEngine.evaluateEnvironmentalRisk(reading);
  const cropHealth: CropHealthOverview = DecisionEngine.evaluateCropHealth(reading, scenario, alerts);

  const unreadAlerts = alerts.filter((a) => !a.acknowledged).length;

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'scan', label: 'Scan', icon: Camera },
    { id: 'irrigation', label: 'Irrigation', icon: Droplet },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: unreadAlerts },
  ];

  return (
    <div className="min-h-screen bg-stone-200/70 py-2 sm:py-6 px-2 flex flex-col items-center justify-center font-sans antialiased selection:bg-emerald-200">
      {/* Top Floating Control Bar for Demo / Flutter Code Export / Viewport switch */}
      <header className="w-full max-w-lg mb-3 flex items-center justify-between px-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-stone-700 tracking-wide flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
            SIH PS 26180
          </span>
          <span className="text-stone-400">•</span>
          <span className="text-stone-500 font-medium">Smart Farming Assistant</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Flutter APK & Code Inspector Button */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-emerald-800 text-white hover:bg-emerald-700 font-bold shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-300" />
            <span>Flutter Code / APK</span>
          </button>

          {/* Toggle Device Frame / Fullscreen view */}
          <button
            onClick={() => setIsFrameMode(!isFrameMode)}
            className="p-1.5 rounded-xl bg-white border border-stone-300 text-stone-600 hover:bg-stone-50 shadow-sm transition-colors"
            title={isFrameMode ? 'Switch to Full View' : 'Switch to Android Pixel Frame'}
          >
            {isFrameMode ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* Main Android Device Container */}
      <main 
        className={`bg-stone-50 w-full transition-all duration-300 flex flex-col overflow-hidden shadow-2xl relative ${
          isFrameMode
            ? 'max-w-[430px] rounded-[42px] border-[10px] border-stone-900 ring-1 ring-stone-900/40 min-h-[850px] max-h-[92vh]'
            : 'max-w-2xl rounded-3xl border border-stone-300 min-h-[90vh]'
        }`}
      >
        {/* Android Hardware Speaker Slit & Camera Punch-hole (When in Frame mode) */}
        {isFrameMode && (
          <div className="bg-stone-900 w-full pt-1.5 pb-0.5 flex items-center justify-center relative select-none">
            <div className="w-16 h-1 bg-stone-700 rounded-full mb-1" />
            <div className="absolute right-28 top-2 w-3 h-3 bg-stone-800 rounded-full border border-stone-700" />
          </div>
        )}

        {/* Android Status Bar */}
        <div className="bg-emerald-900 text-white px-5 pt-2 pb-1.5 flex items-center justify-between text-[11px] font-semibold tracking-wider select-none">
          <span>{currentTime}</span>
          <div className="flex items-center gap-2">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center gap-1">
              <span>{reading.batteryPercent ?? 92}%</span>
              <Battery className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Material 3 Top App Bar */}
        <div className="bg-emerald-800 text-white px-4 py-3 shadow-md flex items-center justify-between select-none">
          <AgroLogo size={32} showText={true} className="text-white" />
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsEnvRiskModalOpen(true)}
              className="px-2 py-1 rounded-lg bg-emerald-700/80 hover:bg-emerald-700 text-[11px] font-bold border border-emerald-600 flex items-center gap-1"
            >
              <Layers className="w-3 h-3 text-emerald-200" />
              <span>Risk: {envRisk.overallScore}%</span>
            </button>
          </div>
        </div>

        {/* Screen Content Viewport (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 bg-stone-100/90 no-scrollbar">
          {currentTab === 0 && (
            <HomeScreen
              reading={reading}
              scenario={scenario}
              onScenarioChange={handleScenarioChange}
              irrigation={irrigation}
              cropHealth={cropHealth}
              envRisk={envRisk}
              alerts={alerts}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onNavigateTab={(idx) => setCurrentTab(idx)}
              onOpenEnvRisk={() => setIsEnvRiskModalOpen(true)}
            />
          )}

          {currentTab === 1 && (
            <CropScanScreen
              onScanCompleted={handleScanCompleted}
              recentScans={recentScans}
            />
          )}

          {currentTab === 2 && (
            <IrrigationScreen
              reading={reading}
              onOverrideReading={(overrides) => mockSensorAdapter.overrideReading(overrides)}
            />
          )}

          {currentTab === 3 && (
            <AnalyticsScreen currentReading={reading} />
          )}

          {currentTab === 4 && (
            <AlertsScreen
              alerts={alerts}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onAcknowledgeAll={handleAcknowledgeAll}
            />
          )}
        </div>

        {/* Material 3 Bottom Navigation Bar */}
        <div className="bg-white border-t border-stone-200/90 py-1.5 px-3 flex items-center justify-around shadow-lg select-none">
          {tabs.map((tab, idx) => {
            const active = currentTab === idx;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => setCurrentTab(idx)}
                className="flex flex-col items-center gap-0.5 group focus:outline-none transition-all"
              >
                {/* MD3 Active Indicator Pill */}
                <div
                  className={`px-4 py-1 rounded-full transition-all flex items-center justify-center relative ${
                    active
                      ? 'bg-emerald-100 text-emerald-900 font-bold scale-105'
                      : 'text-stone-500 group-hover:text-stone-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.badge && tab.badge > 0 ? (
                    <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                      {tab.badge}
                    </span>
                  ) : null}
                </div>
                <span
                  className={`text-[10px] font-semibold tracking-tight ${
                    active ? 'text-emerald-900 font-extrabold' : 'text-stone-500'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Android Gesture Navigation Pill */}
        {isFrameMode && (
          <div className="bg-white py-1 flex items-center justify-center select-none">
            <div className="w-32 h-1 bg-stone-900 rounded-full" />
          </div>
        )}
      </main>

      {/* Environmental Risk Detail Modal */}
      {isEnvRiskModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
          <div className="bg-stone-50 w-full max-w-lg max-h-[85vh] rounded-3xl shadow-2xl border border-stone-300 flex flex-col overflow-hidden">
            <div className="p-4 bg-emerald-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Environmental Stress & Vulnerability</h3>
              <button
                onClick={() => setIsEnvRiskModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <EnvironmentalRiskScreen
                envRisk={envRisk}
                reading={reading}
                onNavigateToIrrigation={() => {
                  setIsEnvRiskModalOpen(false);
                  setCurrentTab(2);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Flutter Code & APK Export Modal */}
      <FlutterExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
};
