import { ICDRStage, DMEStatus } from './retinopathy';

export type LanguageCode = 'en' | 'hi' | 'te' | 'ta' | 'bn' | 'es';

export type RuralStep = 'patient_info' | 'image_input' | 'matlab_enhance' | 'ai_predict' | 'result';

export interface HealthWorkerUser {
  id: string;
  name: string;
  role: 'Ophthalmologist' | 'Retina Specialist' | 'ASHA Worker' | 'ANM / Clinic Nurse' | 'Community Health Officer (CHO)' | 'Village Doctor' | 'Patient / Self';
  centerName: string;
  village: string;
  district: string;
  phone: string;
}

export interface RuralPatientData {
  name: string;
  age: number | string;
  gender: 'Male' | 'Female' | 'Other';
  village: string;
  phone: string;
  aadhaarOrId?: string;
  diabetesType: 'Type 1' | 'Type 2' | 'Gestational' | 'Pre-diabetes';
  durationYears: number | string;
  lastFastingSugar: number | string;
  selectedEye: 'OD' | 'OS';
  eye?: 'OD' | 'OS';
  sugarLevel?: string;
  diabetesDuration?: string;
}

export interface ImageQualityMetrics {
  overallScore: number; // 0 - 100
  status: 'Adequate' | 'Borderline (Enhanced)' | 'Ungradeable (Reject)';
  focusScore: number; // 0 - 100
  illuminationScore: number; // 0 - 100
  fieldOfViewScore: number; // 0 - 100
  artifactLevel: 'None' | 'Mild Glare' | 'Severe Media Opacity' | 'Motion Blur';
  recaptureRequired: boolean;
  recaptureReason?: string;
  recaptureAdvice?: string;
  enhancementApplied: {
    clahe: boolean;
    illuminationCorrection: boolean;
    medianDenoising: boolean;
    gammaCorrection: number;
  };
}

export interface SegmentationMasks {
  opticDisc: { detected: boolean; x: number; y: number; radius: number; cupToDiscRatio: number };
  fovea: { detected: boolean; x: number; y: number; distanceToDiscMM: number };
  vessels: { density: number; tortuosityIndex: number; caliberRatio: number; maskUrl?: string };
  microaneurysms: { count: number; subPixelDetected: number; candidateLocations: Array<{ x: number; y: number; confidence: number; radiusPx: number }> };
  exudates: { hardExudatesAreaMm2: number; softExudatesCount: number; within1DDOfFovea: boolean };
  hemorrhages: { dotBlotCount: number; flameCount: number; quadrantsInvolved: number; meetsFourQuadrants: boolean };
  neovascularization: { nvdPresent: boolean; nvePresent: boolean; areaPercentage: number };
}

export interface ExplainabilityData {
  gradCamIntensityMap: string; // base64 or SVG heatmap pattern
  topSalientRegions: Array<{ name: string; impact: string; weight: number; coordinates: string }>;
  calibratedConfidence: number; // 0 - 100 (Platt scaled)
  epistemicUncertainty: number; // Monte Carlo dropout variance (0 - 1)
  clinicalCriteriaMatched: string[];
  ophthalmologistValidation: {
    validatedBy?: string;
    validatedAt?: string;
    agreedWithAI: boolean;
    adjustedStage?: ICDRStage;
    clinicalNotes?: string;
    validationTimeSeconds?: number;
  };
}

export interface SimulinkConfig {
  annualTargetPopulation: number; // e.g. 100,000
  mobileUnits: number; // e.g. 12
  dailyAcquisitionsPerUnit: number; // e.g. 35
  bandwidthType: '2G' | '3G' | '4G' | 'Starlink' | 'Fiber';
  bandwidthMbps: number;
  imageCompressionRatio: number; // e.g. 8x DICOM / JPEG-XL
  aiDeployment: 'Edge (On-Device GPU)' | 'Cloud Cluster (MATLAB Production Server)' | 'Hybrid Edge-Cloud';
  aiInferenceTimeMs: number;
  ophthalmologistStaffCount: number;
  autoTriageNormalThreshold: number; // e.g. 85%
  doctorReviewTimeSeconds: number; // e.g. 28s per referable case
}

export interface SimulinkSimulationResults {
  annualScreenedCapacity: number;
  averageQueueWaitDays: number;
  transmissionLatencySec: number;
  aiProcessingThroughputPerHr: number;
  doctorWorkloadHoursPerDay: number;
  bottleneckStage: 'Acquisition' | 'Bandwidth Transmission' | 'AI Inference' | 'Ophthalmologist Validation' | 'None (Optimal)';
  costPerPatientUSD: number;
  earlySightSavedEstimate: number;
  dailyTimeline: Array<{ hour: number; captured: number; processedAI: number; reviewedDoc: number; backlog: number }>;
}

export interface ScreeningHistoryRecord {
  id: string;
  date: string;
  patientName: string;
  age: number;
  gender: string;
  village: string;
  phone: string;
  eye: 'OD' | 'OS';
  sugarLevel: string | number;
  diabetesDuration: string;
  predictedStage: ICDRStage;
  stageName: string;
  stageConfidence: number;
  dmeStatus: DMEStatus;
  urgency: 'routine' | 'moderate' | 'high' | 'urgent' | 'emergency';
  followUpText: string;
  imageUrl: string;
  healthWorkerName: string;
  centerName: string;
  adviceGiven: string[];
  iqaMetrics?: ImageQualityMetrics;
  segmentationSummary?: {
    microaneurysmCount: number;
    hemorrhageCount: number;
    hardExudatesAreaMm2: number;
    nvdPresent: boolean;
  };
  validationStatus?: 'AI Pending Review' | 'Ophthalmologist Verified' | 'Overridden by MD';
}
