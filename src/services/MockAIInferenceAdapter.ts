import { CropScanResult } from '../types';
import { AIInferenceAdapter, AIModelMetadata } from './AIInferenceAdapter';

export interface SampleCropLeaf {
  id: string;
  name: string;
  crop: string;
  condition: string;
  imageUri: string;
  expectedDisease: string;
  expectedPest: string;
  healthStatus: CropScanResult['healthStatus'];
  confidence: number;
  recommendation: string;
  organicRemedy: string;
  chemicalRemedy: string;
}

export const SAMPLE_CROP_LEAVES: SampleCropLeaf[] = [
  {
    id: 'sample-healthy',
    name: 'Healthy Wheat / Maize Foliage',
    crop: 'Wheat (Triticum aestivum)',
    condition: 'Optimal Vigorous Leaf',
    imageUri: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80',
    expectedDisease: 'None (Clean photosynthetic tissue)',
    expectedPest: 'None detected',
    healthStatus: 'Healthy',
    confidence: 96.8,
    recommendation: 'Crop foliage displays healthy chlorophyll density and intact stomatal margins. Continue regular fertigation schedule.',
    organicRemedy: 'Preventative neem oil foliar spray (2ml/L) once every 14 days as biosecurity prophylactic.',
    chemicalRemedy: 'No chemical intervention warranted.',
  },
  {
    id: 'sample-blight',
    name: 'Tomato Early Blight (Alternaria solani)',
    crop: 'Tomato (Solanum lycopersicum)',
    condition: 'Concentric Target Rings on Leaf',
    imageUri: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb22511?auto=format&fit=crop&w=600&q=80',
    expectedDisease: 'Early Blight (Alternaria solani)',
    expectedPest: 'None detected',
    healthStatus: 'Infected',
    confidence: 93.4,
    recommendation: 'Immediate fungicide treatment required. Prune lower diseased leaves to stop spore rain onto adjacent plants.',
    organicRemedy: 'Copper oxychloride or Trichoderma viride @ 5g/L water sprayed during low humidity morning hours.',
    chemicalRemedy: 'Mancozeb 75% WP @ 2.5g/L or Azoxystrobin 23% SC @ 1ml/L applied thoroughly under leaves.',
  },
  {
    id: 'sample-aphid',
    name: 'Cotton / Maize Aphid Cluster',
    crop: 'Cotton / Maize',
    condition: 'Sucking Pest Colonization',
    imageUri: 'https://images.unsplash.com/photo-1598030304671-5aa1d6f21128?auto=format&fit=crop&w=600&q=80',
    expectedDisease: 'Secondary Sooty Mold Risk',
    expectedPest: 'Aphids (Aphis gossypii) - Nymph colonies',
    healthStatus: 'Damaged',
    confidence: 91.2,
    recommendation: 'High sap-sucking pest infestation causing leaf cupping and honeydew secretion. Intervene before vectoring viral mosaic.',
    organicRemedy: 'Spray 5% Neem Seed Kernel Extract (NSKE) or Beauveria bassiana bio-insecticide @ 5g/L.',
    chemicalRemedy: 'Imidacloprid 17.8% SL @ 0.5ml/L or Acetamiprid 20% SP @ 0.2g/L with surfactant.',
  },
  {
    id: 'sample-mildew',
    name: 'Cucurbit Powdery Mildew',
    crop: 'Cucumber / Squash',
    condition: 'White Talcum-like Mycelial Patches',
    imageUri: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=600&q=80',
    expectedDisease: 'Powdery Mildew (Podosphaera xanthii)',
    expectedPest: 'None detected',
    healthStatus: 'Infected',
    confidence: 94.7,
    recommendation: 'Fungal mycelium covering photosynthetic surface. Improve plant spacing and reduce overhead sprinkler irrigation.',
    organicRemedy: 'Potassium bicarbonate (3g/L) or diluted milk whey solution (1:9 ratio) sprayed in direct sunlight.',
    chemicalRemedy: 'Sulfur 80% WDG @ 3g/L or Difenoconazole 25% EC @ 0.5ml/L.',
  },
];

export class MockAIInferenceAdapter implements AIInferenceAdapter {
  private metadata: AIModelMetadata = {
    modelName: 'AgroVision-MobileNetV3-Lite',
    version: 'v0.9.4-mock',
    inferenceType: 'MOCK_ENGINE',
    targetProblemStatement: 'SIH PS 26180 - Smart Farming Assistant',
    supportedClasses: [
      'Healthy Crop Foliage',
      'Early Blight (Alternaria solani)',
      'Late Blight (Phytophthora infestans)',
      'Powdery Mildew (Podosphaera xanthii)',
      'Leaf Rust (Puccinia triticina)',
      'Cotton Aphids (Aphis gossypii)',
      'Fall Armyworm (Spodoptera frugiperda)',
      'Nitrogen Chlorosis Deficiency',
    ],
  };

  public isMock(): boolean {
    return true;
  }

  public getMetadata(): AIModelMetadata {
    return { ...this.metadata };
  }

  public async analyzeCrop(imageSource: string | File, presetHint?: string): Promise<CropScanResult> {
    // Simulate real edge inference latency (800ms - 1400ms)
    await new Promise((resolve) => setTimeout(resolve, 1100));

    // If preset hint matches a sample leaf, return its tailored result
    if (presetHint) {
      const sample = SAMPLE_CROP_LEAVES.find((s) => s.id === presetHint);
      if (sample) {
        return {
          id: `scan-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          imageUri: sample.imageUri,
          cropName: sample.crop,
          healthStatus: sample.healthStatus,
          diseaseDetected: sample.expectedDisease,
          pestDetected: sample.expectedPest,
          confidencePercent: sample.confidence,
          recommendation: sample.recommendation,
          organicRemedy: sample.organicRemedy,
          chemicalRemedy: sample.chemicalRemedy,
          affectedAreaPercent: sample.healthStatus === 'Healthy' ? 0 : sample.healthStatus === 'Infected' ? 28 : 18,
          isMock: true,
        };
      }
    }

    // Default heuristic for custom uploaded or captured photo
    const isFile = typeof imageSource !== 'string';
    const uri = isFile ? URL.createObjectURL(imageSource as File) : imageSource;

    return {
      id: `scan-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageUri: uri,
      cropName: 'Foliage Specimen (Solanaceae / Poaceae)',
      healthStatus: 'Early Warning',
      diseaseDetected: 'Suspected Cercospora / Early Leaf Spot',
      pestDetected: 'No active nymph colonies observed',
      confidencePercent: 88.6,
      recommendation: 'Early localized spot chlorosis detected along leaf margin. Isolate sample area and monitor for 48 hours.',
      organicRemedy: 'Foliar application of fermented cow urine + neem leaf extract (10% solution) at 5-day intervals.',
      chemicalRemedy: 'Chlorothalonil 75% WP @ 2g/L if spotting spreads past 15% canopy area.',
      affectedAreaPercent: 12,
      isMock: true,
    };
  }
}

export const mockAIInferenceAdapter = new MockAIInferenceAdapter();
