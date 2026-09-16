import { CropScanResult } from '../types';

export interface AIModelMetadata {
  modelName: string;
  version: string;
  inferenceType: 'MOCK_ENGINE' | 'TFLITE_EDGE' | 'CLOUD_VISION_API';
  targetProblemStatement: string; // "SIH PS 26180"
  supportedClasses: string[];
}

export interface AIInferenceAdapter {
  /**
   * Evaluates a leaf/foliage image and returns structured diagnosis.
   */
  analyzeCrop(imageSource: string | File, presetHint?: string): Promise<CropScanResult>;

  /**
   * Indicates whether this adapter is using local mock inference or a live model.
   */
  isMock(): boolean;

  /**
   * Returns diagnostic metadata about the AI engine.
   */
  getMetadata(): AIModelMetadata;
}
