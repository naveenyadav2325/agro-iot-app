import { CropScanResult, EdgeAIStatusInfo, SensorReading } from '../types';

export interface EdgeAIModelMetadata {
  modelName: string;
  version: string;
  quantization: 'INT8' | 'FP16' | 'FP32';
  modelSizeBytes: number; // e.g., 12.4 MB = 13002342
  runtimeEngine: 'TFLite Edge Delegate (NPU/NNAPI)' | 'ONNX Runtime Mobile' | 'Mock Edge Engine';
  targetProblemStatement: string; // "SIH PS 26180"
  supportedConditions: {
    diseases: string[];
    pests: string[];
    nutrientDeficiencies: string[];
    healthy: string[];
  };
}

export interface EdgeAIAdapter {
  /**
   * Returns current Edge AI status (Engine ON/OFF, Inference state, Model status, latency, confidence).
   */
  getStatus(): EdgeAIStatusInfo;

  /**
   * Allows farmer/operator to toggle the Edge AI Engine ON or OFF.
   */
  setEngineOn(enabled: boolean): void;

  /**
   * Runs local on-device neural network inference on crop foliage.
   * Runs 100% offline without cloud/internet dependencies.
   * Cross-references live sensor telemetry snapshot for sensor-fused agronomic insights.
   */
  analyzeCropLocally(
    imageSource: string | File,
    presetHint?: string,
    sensorContext?: SensorReading
  ): Promise<CropScanResult>;

  /**
   * Whether this adapter is currently using the mock edge adapter or active on-device TFLite/ONNX.
   */
  isMock(): boolean;

  /**
   * Technical metadata regarding model architecture, quantization, and edge constraints.
   */
  getModelMetadata(): EdgeAIModelMetadata;

  /**
   * Observer subscription for real-time Edge AI state changes (e.g., status changes, inference progress).
   */
  subscribeStatus(listener: (status: EdgeAIStatusInfo) => void): () => void;

  /**
   * Clear integration instructions for replacing this mock with actual TensorFlow Lite or ONNX runtime.
   */
  getIntegrationDocs(): string;
}
