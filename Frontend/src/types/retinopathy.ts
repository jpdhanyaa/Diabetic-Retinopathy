export type ICDRStage = 0 | 1 | 2 | 3 | 4;

export interface ICDRStageInfo {
  stage: ICDRStage;
  name: string;
  shortName: string;
  code: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  clinicalSigns: string[];
  recommendedFollowUp: string;
  urgency: 'routine' | 'moderate' | 'high' | 'urgent' | 'emergency';
}

export type DMEStatus = 'none' | 'non_center' | 'center_involved';

export interface DMEInfo {
  status: DMEStatus;
  name: string;
  shortName: string;
  description: string;
  treatmentIndicated: boolean;
  color: string;
}

export interface RetinalLesion {
  id: string;
  type: 'microaneurysm' | 'hemorrhage' | 'hard_exudate' | 'cotton_wool_spot' | 'irma' | 'neovascularization' | 'venous_beading';
  quadrant: 'ST' | 'IT' | 'SN' | 'IN' | 'macula'; // Superior-Temporal, Inferior-Temporal, Superior-Nasal, Inferior-Nasal, Macular
  x: number; // 0 - 100% relative to image
  y: number; // 0 - 100% relative to image
  size: 'small' | 'medium' | 'large';
  confidence: number;
  notes?: string;
}

export interface QuadrantAnalysis {
  name: string;
  code: 'ST' | 'IT' | 'SN' | 'IN';
  hemorrhageSeverity: 'none' | 'mild' | 'moderate' | 'severe' | 'very_severe';
  microaneurysmCount: number;
  hardExudateCount: number;
  cottonWoolSpotCount: number;
  hasVenousBeading: boolean;
  hasIRMA: boolean;
  hasNeovascularization: boolean;
}

export interface FourTwoOneRuleStatus {
  fourQuadrantsHemorrhages: boolean; // ≥20 intraretinal hemorrhages in each of 4 quadrants
  twoQuadrantsVenousBeading: boolean; // Venous beading in ≥2 quadrants
  oneQuadrantIRMA: boolean; // Prominent IRMA in ≥1 quadrant
  meetsCriteriaForSevereNPDR: boolean; // Meets 1+ of the 4-2-1 criteria
}

export interface RetinalScan {
  id: string;
  title: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  diabetesType: 'Type 1' | 'Type 2' | 'Gestational';
  diabetesDurationYears: number;
  hba1c: number; // e.g. 7.8%
  bloodPressure: string; // e.g. "135/85"
  eye: 'OD' | 'OS'; // OD = Right Eye, OS = Left Eye
  captureDate: string;
  imageQuality: 'Excellent' | 'Good' | 'Fair' | 'Ungradable';
  qualityScore: number; // 0 - 100%
  
  // AI Diagnostics
  predictedStage: ICDRStage;
  stageConfidence: number; // 0 - 100%
  classProbabilities: {
    stage0: number;
    stage1: number;
    stage2: number;
    stage3: number;
    stage4: number;
  };
  dmeStatus: DMEStatus;
  dmeConfidence: number;
  
  // Detailed findings
  lesions: RetinalLesion[];
  quadrants: QuadrantAnalysis[];
  fourTwoOneRule: FourTwoOneRuleStatus;
  
  // Visual assets
  imageUrl: string;
  thumbnailUrl: string;
  description: string;
  clinicalSummary: string;
  treatmentRecommendations: string[];
}

export interface PatientRecord {
  id: string;
  name: string;
  mrn: string; // Medical Record Number
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  phone: string;
  email: string;
  diabetesType: 'Type 1' | 'Type 2';
  durationYears: number;
  latestHbA1c: number;
  latestBP: string;
  kidneyFunction: 'Normal' | 'Microalbuminuria' | 'Macroalbuminuria' | 'CKD Stage 3+';
  smokingStatus: 'Never' | 'Former' | 'Current';
  scans: RetinalScan[];
  clinicalNotes: string;
}
