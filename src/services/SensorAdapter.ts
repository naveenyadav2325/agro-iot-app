import { SensorReading, DemoScenario, HistoricalDataPoint } from '../types';

export type HardwareConnectionType = 'DEMO_MOCK' | 'WIFI_HTTP' | 'BLUETOOTH_BLE' | 'MQTT_BROKER';

export interface HardwareConnectionConfig {
  type: HardwareConnectionType;
  endpointOrAddress?: string;
  topic?: string;
  baudRate?: number;
  connected: boolean;
}

export interface SensorAdapter {
  /**
   * Retrieves the current instantaneous sensor reading.
   */
  getLatestReading(): Promise<SensorReading>;

  /**
   * Subscribes to real-time telemetry updates. Returns an unsubscribe teardown function.
   */
  subscribe(callback: (reading: SensorReading) => void): () => void;

  /**
   * Sets active simulation scenario (used in Demo Mode).
   */
  setScenario(scenario: DemoScenario): void;

  /**
   * Retrieves historical time-series data for analytics charts.
   */
  getHistoricalData(timeRange: '24H' | '7D'): Promise<HistoricalDataPoint[]>;

  /**
   * Gets current hardware connection information (Mock vs Real Wi-Fi/BLE/MQTT).
   */
  getConnectionInfo(): HardwareConnectionConfig;

  /**
   * Allows manual override of telemetry values for testing sliders.
   */
  overrideReading(reading: Partial<SensorReading>): void;
}
