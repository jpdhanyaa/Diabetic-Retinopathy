export type ViewMode =
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'home'
  | 'upload'
  | 'analysis'
  | 'result';

export type DRSeverity = 0 | 1 | 2 | 3 | 4;

export interface DRSubStageMatch {
  id: string;
  name: string;
  stageLevel: DRSeverity;
  probability: number; // 0 - 100%
  isNormal: boolean;
  badge: string;
  description: string;
  keySigns: string;
}

export interface Lesion {
  id: string;
  type: 'microaneurysm' | 'hemorrhage' | 'hard_exudate' | 'cotton_wool_spot' | 'neovascularization' | 'optic_disc' | 'macula' | 'irma' | 'venous_bead' | 'drusen' | 'traction_band' | 'vitreous_hem';
  label: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage
  height: number; // percentage
  severity: 'low' | 'medium' | 'high';
  notes: string;
}

export interface DifferentialDiagnosisItem {
  condition: 'Diabetic Retinopathy' | 'Hypertensive Retinopathy' | 'Glaucoma' | 'Macular Degeneration' | 'Retinal Detachment' | 'Optic Neuritis';
  probability: number; // 0-100
  status: 'Primary Diagnosis' | 'Secondary Finding' | 'Ruled Out' | 'Low Risk';
  keyDifferentiators: string;
  hospitalReference: string;
}

export interface LesionQuantitativeBreakdown {
  microaneurysmsCount: number;
  blotHemorrhagesCount: number;
  hardExudatesAreaMm2: number;
  cottonWoolSpotsCount: number;
  irmaDetected: boolean;
  venousBeadingDetected: boolean;
  neovascularizationNvd: boolean;
  neovascularizationNve: boolean;
  opticCupToDiscRatio: number;
  macularDrusenDetected: boolean;
  retinalTearOrDetachment: boolean;
  opticDiscMarginSharpness: 'Sharp / Normal' | 'Blurred / Edematous';
}

export interface MatlabAnalysisData {
  focusValue: number;
  brightnessValue: number;
  contrastValue: number;
  qualityStatus: 'ACCEPTABLE' | 'REJECTED';
  numberOfMA: number;
  exudateArea: number;
  hemorrhageArea: number;
  vesselDensity: number;
  neovascularization: boolean;
  drLevel: number;
  drResult: string;
  referableDR: string;
  qualityScore: number;
  lesionScore: number;
  confidenceScore: number;
  opticDiscBoundingBox: { x: number; y: number; width: number; height: number } | null;
  opticDiscCentroid: { x: number; y: number } | null;
  renderedImages?: {
    enhanced: string;
    vessels: string;
    microaneurysms: string;
    explainable: string;
  };
}

export interface DRAnalysisResult {
  stage: DRSeverity;
  stageName: string;
  stageShortName: string;
  icdCode: string;
  confidence: number; // 0 - 100
  classProbabilities: {
    stage0: number; // No DR
    stage1: number; // Mild NPDR
    stage2: number; // Moderate NPDR
    stage3: number; // Severe NPDR
    stage4: number; // Proliferative DR
  };
  // 9 Stage Reference Atlas Matching
  subStageMatches: DRSubStageMatch[];
  matchedSubStage: DRSubStageMatch;
  dmeRisk: 'Negative' | 'Suspected' | 'Clinically Significant Macular Edema (CSME)';
  dmeConfidence: number;
  urgency: 'Routine (12 mo)' | 'Semi-Annual (6 mo)' | 'Urgent (1-3 mo)' | 'Immediate (<2 wks)' | 'Emergency Referral';
  urgencyColor: string;
  keyFindings: string[];
  recommendedAction: string;
  lesions: Lesion[];
  qualityScore: number; // 0 - 100
  imageField: 'Macula-Centered' | 'Optic Disc-Centered' | 'Peripheral 45°';
  eye: 'OD (Right Eye)' | 'OS (Left Eye)';
  etdrsScore: number; // 10 - 85 scale
  matlabLogs?: string[];
  matlabData?: MatlabAnalysisData;
  // Hospital-fed ML Knowledge & Multi-Condition Differential Diagnosis
  differentialDiagnosis: DifferentialDiagnosisItem[];
  lesionBreakdown: LesionQuantitativeBreakdown;
  hospitalSources: {
    barbaraDavisCenter: boolean;
    retinaTodayAtlas: boolean;
    eye7HospitalsBenchmark: boolean;
    gettyMedicalArchives: boolean;
  };
}

export interface PatientDetails {
  patientName: string;
  patientId: string;
  age: number;
  selectedEye: 'Left Eye (OS)' | 'Right Eye (OD)';
  // Diabetes History
  diabetesType: 'Type 2' | 'Type 1' | 'Gestational' | 'Pre-diabetes' | 'None';
  diabetesDurationYears: number;
  // Glycemic Control
  hba1c: number; // percentage e.g. 7.4%
  bloodSugarLevel: number; // mg/dL e.g. 145 mg/dL
  // Medication List
  diabetesMedications: string[]; // e.g. ['Insulin', 'Metformin', 'SGLT2 Inhibitor']
  systemicMedications: string[]; // e.g. ['Blood Thinner (Aspirin)', 'ACE Inhibitor / ARB', 'Statin']
  // Systemic Health
  bloodPressure: string; // e.g. '130/84 mmHg'
  kidneyFunctionStatus: 'Normal / Preserved' | 'Microalbuminuria' | 'Macroalbuminuria / Proteinuria' | 'Chronic Kidney Disease (CKD)' | 'Unknown / Not Tested';
  // Reproductive Status
  reproductiveStatus: 'Not Pregnant / N/A' | 'Currently Pregnant (1st Trimester)' | 'Currently Pregnant (2nd Trimester)' | 'Currently Pregnant (3rd Trimester)' | 'Planning Pregnancy';
  // Ocular Symptoms
  ocularSymptoms: string[]; // e.g. ['Blurred Vision', 'Floaters', 'Dark Spots', 'Visual Distortion']
  notes?: string;
}

export interface ScreenerUser {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
}
