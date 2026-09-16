import { SensorReading, DemoScenario, HistoricalDataPoint } from '../types';
import { SensorAdapter, HardwareConnectionConfig } from './SensorAdapter';

export class MockSensorAdapter implements SensorAdapter {
  private currentScenario: DemoScenario = 'NORMAL';
  private subscribers: Set<(reading: SensorReading) => void> = new Set();
  private currentReading: SensorReading;
  private intervalTimer: ReturnType<typeof setInterval> | null = null;
  private connectionConfig: HardwareConnectionConfig = {
    type: 'DEMO_MOCK',
    endpointOrAddress: 'mock://local-esp32-node-01',
    topic: 'agro-iot/v1/telemetry',
    connected: true,
  };

  private static readonly SCENARIO_PRESETS: Record<DemoScenario, Omit<SensorReading, 'timestamp'>> = {
    NORMAL: {
      soilMoisture: 58,
      temperature: 26.5,
      humidity: 62,
      rainProbability: 15,
      lightLux: 45000,
      batteryPercent: 92,
      rssi: -65,
    },
    LOW_MOISTURE: {
      soilMoisture: 23,
      temperature: 31.8,
      humidity: 38,
      rainProbability: 8,
      lightLux: 52000,
      batteryPercent: 88,
      rssi: -68,
    },
    HEAT_STRESS: {
      soilMoisture: 36,
      temperature: 41.2,
      humidity: 29,
      rainProbability: 4,
      lightLux: 68000,
      batteryPercent: 84,
      rssi: -71,
    },
    DISEASE: {
      soilMoisture: 69,
      temperature: 28.4,
      humidity: 89,
      rainProbability: 38,
      lightLux: 32000,
      batteryPercent: 90,
      rssi: -64,
    },
    PEST: {
      soilMoisture: 46,
      temperature: 33.2,
      humidity: 52,
      rainProbability: 14,
      lightLux: 48000,
      batteryPercent: 86,
      rssi: -66,
    },
    FLOOD: {
      soilMoisture: 92,
      temperature: 23.5,
      humidity: 94,
      rainProbability: 88,
      lightLux: 18000,
      batteryPercent: 79,
      rssi: -74,
    },
  };

  constructor(initialScenario: DemoScenario = 'NORMAL') {
    this.currentScenario = initialScenario;
    this.currentReading = this.generateReadingForScenario(initialScenario);
    this.startPeriodicTelemetryEmulation();
  }

  private generateReadingForScenario(scenario: DemoScenario): SensorReading {
    const preset = MockSensorAdapter.SCENARIO_PRESETS[scenario];
    return {
      ...preset,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
  }

  private startPeriodicTelemetryEmulation(): void {
    if (this.intervalTimer) clearInterval(this.intervalTimer);

    // Gently fluctuate sensor values every 4 seconds to mimic real IoT sensor packet broadcasts
    this.intervalTimer = setInterval(() => {
      const preset = MockSensorAdapter.SCENARIO_PRESETS[this.currentScenario];
      // small jitter within ±0.3°C, ±0.4% moisture
      const jitterTemp = (Math.random() - 0.5) * 0.4;
      const jitterMoist = (Math.random() - 0.5) * 0.6;
      const jitterHum = (Math.random() - 0.5) * 0.8;

      this.currentReading = {
        soilMoisture: Math.max(0, Math.min(100, Number((this.currentReading.soilMoisture + jitterMoist).toFixed(1)))),
        temperature: Math.max(-5, Math.min(60, Number((preset.temperature + jitterTemp).toFixed(1)))),
        humidity: Math.max(10, Math.min(100, Number((preset.humidity + jitterHum).toFixed(1)))),
        rainProbability: preset.rainProbability,
        lightLux: preset.lightLux ? Math.round(preset.lightLux + (Math.random() - 0.5) * 500) : 45000,
        batteryPercent: preset.batteryPercent,
        rssi: preset.rssi,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };

      this.notifySubscribers();
    }, 4000);
  }

  private notifySubscribers(): void {
    for (const sub of this.subscribers) {
      sub({ ...this.currentReading });
    }
  }

  public async getLatestReading(): Promise<SensorReading> {
    return { ...this.currentReading };
  }

  public subscribe(callback: (reading: SensorReading) => void): () => void {
    this.subscribers.add(callback);
    // Send immediate initial value
    callback({ ...this.currentReading });

    return () => {
      this.subscribers.delete(callback);
    };
  }

  public setScenario(scenario: DemoScenario): void {
    this.currentScenario = scenario;
    this.currentReading = this.generateReadingForScenario(scenario);
    this.notifySubscribers();
  }

  public getScenario(): DemoScenario {
    return this.currentScenario;
  }

  public overrideReading(reading: Partial<SensorReading>): void {
    this.currentReading = {
      ...this.currentReading,
      ...reading,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    this.notifySubscribers();
  }

  public getConnectionInfo(): HardwareConnectionConfig {
    return { ...this.connectionConfig };
  }

  public setConnectionMode(type: HardwareConnectionConfig['type'], endpoint?: string): void {
    this.connectionConfig = {
      type,
      endpointOrAddress: endpoint || (type === 'DEMO_MOCK' ? 'mock://local-esp32-node-01' : 'http://192.168.4.1/api/telemetry'),
      connected: true,
      topic: type === 'MQTT_BROKER' ? 'agro-iot/v1/field/node1' : undefined,
    };
  }

  public async getHistoricalData(timeRange: '24H' | '7D'): Promise<HistoricalDataPoint[]> {
    const points: HistoricalDataPoint[] = [];
    const base = this.currentReading;

    if (timeRange === '24H') {
      // 24 hourly points
      const now = new Date();
      for (let i = 23; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 60 * 60 * 1000);
        const hour = d.getHours();
        const timeLabel = `${hour.toString().padStart(2, '0')}:00`;

        // Diurnal curve: cooler at 4 AM, hottest at 14:00 (2 PM)
        const diurnalShift = Math.sin(((hour - 8) / 24) * 2 * Math.PI) * 4;
        const temp = Number((base.temperature + diurnalShift + (Math.random() - 0.5)).toFixed(1));
        const humShift = -diurnalShift * 1.5;
        const hum = Math.max(20, Math.min(98, Number((base.humidity + humShift + (Math.random() - 0.5) * 2).toFixed(1))));
        
        // Soil moisture decreases slowly during day, jumps if irrigated
        const soilLoss = (23 - i) * 0.15;
        const moisture = Math.max(10, Math.min(100, Number((base.soilMoisture + Math.sin(i * 0.4) * 3 - soilLoss * 0.2).toFixed(1))));

        points.push({
          time: timeLabel,
          soilMoisture: moisture,
          temperature: temp,
          humidity: hum,
          rainProbability: base.rainProbability,
        });
      }
    } else {
      // 7 daily points
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const todayIdx = new Date().getDay();
      for (let i = 6; i >= 0; i--) {
        const dayName = days[(todayIdx - i + 7) % 7];
        points.push({
          time: dayName,
          soilMoisture: Math.max(15, Math.min(95, Number((base.soilMoisture + (Math.random() - 0.5) * 8).toFixed(1)))),
          temperature: Math.max(18, Math.min(45, Number((base.temperature + (Math.random() - 0.5) * 4).toFixed(1)))),
          humidity: Math.max(30, Math.min(95, Number((base.humidity + (Math.random() - 0.5) * 10).toFixed(1)))),
          rainProbability: Math.max(0, Math.min(100, Math.round(base.rainProbability + (Math.random() - 0.5) * 20))),
        });
      }
    }

    return points;
  }
}

// Export singleton instance for global state sharing across screens
export const mockSensorAdapter = new MockSensorAdapter('NORMAL');
