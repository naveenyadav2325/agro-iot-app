import React, { useState } from 'react';
import { AlertItem, AlertType } from '../types';
import { 
  Bell, 
  ShieldAlert, 
  Bug, 
  Droplet, 
  Flame, 
  Waves, 
  CheckCircle2, 
  AlertCircle, 
  Filter,
  CheckCheck
} from 'lucide-react';

interface AlertsScreenProps {
  alerts: AlertItem[];
  onAcknowledgeAlert: (id: string) => void;
  onAcknowledgeAll: () => void;
}

export const AlertsScreen: React.FC<AlertsScreenProps> = ({
  alerts,
  onAcknowledgeAlert,
  onAcknowledgeAll,
}) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | AlertType>('ALL');

  const filterTabs: { id: 'ALL' | AlertType; label: string; icon: any }[] = [
    { id: 'ALL', label: 'All Alerts', icon: Bell },
    { id: 'disease', label: 'Disease', icon: ShieldAlert },
    { id: 'pest', label: 'Pest', icon: Bug },
    { id: 'irrigation', label: 'Irrigation', icon: Droplet },
    { id: 'heat', label: 'Heat', icon: Flame },
    { id: 'flood', label: 'Flood', icon: Waves },
  ];

  const filteredAlerts = alerts.filter((a) => {
    if (activeFilter === 'ALL') return true;
    return a.type === activeFilter;
  });

  const unreadCount = alerts.filter((a) => !a.acknowledged).length;

  const getTypeIcon = (type: AlertType) => {
    switch (type) {
      case 'disease':
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      case 'pest':
        return <Bug className="w-4 h-4 text-amber-600" />;
      case 'irrigation':
        return <Droplet className="w-4 h-4 text-blue-600" />;
      case 'heat':
        return <Flame className="w-4 h-4 text-orange-600" />;
      case 'flood':
        return <Waves className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Header bar */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              Field Advisory Alerts
            </h2>
            {unreadCount > 0 && (
              <span className="text-[10px] font-extrabold bg-rose-500 text-white px-2 py-0.5 rounded-full">
                {unreadCount} Actionable
              </span>
            )}
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">
            Real-time threshold notifications triggered by IoT telemetry
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={onAcknowledgeAll}
            className="px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 flex items-center gap-1 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark Read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
        {filterTabs.map((tab) => {
          const isSelected = activeFilter === tab.id;
          const Icon = tab.icon;
          const count = tab.id === 'ALL' 
            ? alerts.length 
            : alerts.filter((a) => a.type === tab.id).length;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1 rounded-full ${isSelected ? 'bg-stone-700 text-white' : 'bg-stone-100 text-stone-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-stone-200/80 text-center shadow-sm">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-stone-800">No Alerts in this Category</h4>
          <p className="text-xs text-stone-500 mt-1">
            Sensor metrics are within normal vegetative safety thresholds.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredAlerts.map((alert) => {
            const isCritical = alert.severity === 'critical';
            const isWarning = alert.severity === 'warning';

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border transition-all ${
                  alert.acknowledged
                    ? 'bg-stone-50/70 border-stone-200 opacity-75'
                    : isCritical
                    ? 'bg-rose-50/70 border-rose-200 shadow-sm'
                    : isWarning
                    ? 'bg-amber-50/70 border-amber-200 shadow-sm'
                    : 'bg-white border-stone-200 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded-xl bg-white shadow-xs mt-0.5">
                      {getTypeIcon(alert.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-stone-900">{alert.title}</h4>
                        <span
                          className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded ${
                            isCritical
                              ? 'bg-rose-200 text-rose-900'
                              : isWarning
                              ? 'bg-amber-200 text-amber-900'
                              : 'bg-stone-200 text-stone-800'
                          }`}
                        >
                          {alert.severity}
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-400 font-medium">
                        Triggered: {alert.timestamp} • {alert.metricTrigger}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-stone-700 mt-2.5 leading-relaxed font-medium">
                  {alert.message}
                </p>

                {/* Recommended Mitigation Action */}
                <div className="mt-3 p-2.5 bg-white/80 rounded-xl border border-stone-200/60 text-xs">
                  <span className="font-bold text-stone-800 block text-[11px] mb-0.5">
                    Recommended Action:
                  </span>
                  <p className="text-stone-600 leading-snug">{alert.recommendedAction}</p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-stone-200/50 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-stone-400 font-mono">ID: {alert.id}</span>
                  {!alert.acknowledged ? (
                    <button
                      onClick={() => onAcknowledgeAlert(alert.id)}
                      className="px-3 py-1 bg-stone-900 text-white font-bold rounded-lg text-xs hover:bg-stone-800 flex items-center gap-1 shadow-sm"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Acknowledge</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Acknowledged
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
