import { ICDRStage, ICDRStageInfo, DMEInfo, DMEStatus } from '../types/retinopathy';

export const ICDR_STAGES: Record<ICDRStage, ICDRStageInfo> = {
  0: {
    stage: 0,
    name: 'No Diabetic Retinopathy',
    shortName: 'Normal (Stage 0)',
    code: 'ICDR-0',
    color: 'emerald',
    bgColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    borderColor: 'border-emerald-500',
    description: 'No microaneurysms, hemorrhages, or other vascular lesions. Normal fundus appearance.',
    clinicalSigns: [
      'Clear optic disc margins with normal neuroretinal rim',
      'Normal foveal avascular zone (FAZ) and macula',
      'Vascular caliber and branching pattern intact',
      'Zero microaneurysms, hard exudates, or hemorrhages'
    ],
    recommendedFollowUp: 'Annual routine screening (12 months)',
    urgency: 'routine'
  },
  1: {
    stage: 1,
    name: 'Mild Non-Proliferative DR',
    shortName: 'Mild NPDR (Stage 1)',
    code: 'ICDR-1',
    color: 'blue',
    bgColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    borderColor: 'border-blue-500',
    description: 'Microaneurysms only. Early localized capillary outpouching without extensive intraretinal leakage.',
    clinicalSigns: [
      'Isolated microaneurysms (pinpoint red round dots)',
      'Absence of dot/blot hemorrhages',
      'No hard exudates or cotton wool spots',
      'No venous beading or IRMA'
    ],
    recommendedFollowUp: 'Follow-up exam in 6 to 12 months; optimize systemic glucose control',
    urgency: 'moderate'
  },
  2: {
    stage: 2,
    name: 'Moderate Non-Proliferative DR',
    shortName: 'Moderate NPDR (Stage 2)',
    code: 'ICDR-2',
    color: 'amber',
    bgColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    borderColor: 'border-amber-500',
    description: 'More than microaneurysms alone, but less than Severe NPDR. Scattered hemorrhages, hard exudates, and cotton wool spots.',
    clinicalSigns: [
      'Multiple microaneurysms & dot/blot hemorrhages in 1-3 quadrants',
      'Hard exudates (yellow distinct lipid deposits, often in rings/circinate)',
      'Cotton wool spots (soft white fluffy nerve-fiber layer infarcts)',
      'Mild venous dilation without full 4-2-1 rule criteria'
    ],
    recommendedFollowUp: 'Ophthalmology evaluation in 3 to 6 months; monitor macula closely',
    urgency: 'high'
  },
  3: {
    stage: 3,
    name: 'Severe Non-Proliferative DR',
    shortName: 'Severe NPDR (Stage 3)',
    code: 'ICDR-3',
    color: 'orange',
    bgColor: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    borderColor: 'border-orange-500',
    description: 'High risk of imminent progression to proliferative disease (50% risk in 1 year). Diagnosed via the 4-2-1 Rule.',
    clinicalSigns: [
      'Severe intraretinal hemorrhages (≥20 per quadrant in all 4 quadrants)',
      'Venous beading / caliber irregularities in ≥2 quadrants',
      'Intraretinal microvascular abnormalities (IRMA) in ≥1 quadrant',
      'No frank neovascularization on disc or elsewhere yet'
    ],
    recommendedFollowUp: 'Urgent Retinal Specialist referral within 2 to 4 weeks; consider early anti-VEGF or PRP',
    urgency: 'urgent'
  },
  4: {
    stage: 4,
    name: 'Proliferative Diabetic Retinopathy',
    shortName: 'PDR (Stage 4)',
    code: 'ICDR-4',
    color: 'rose',
    bgColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    borderColor: 'border-rose-500',
    description: 'Sight-threatening ischemia-driven neovascularization on the optic disc (NVD) or elsewhere (NVE), with risk of vitreous hemorrhage and tractional retinal detachment.',
    clinicalSigns: [
      'Neovascularization of the Optic Disc (NVD) or Retina (NVE)',
      'Preretinal or vitreous hemorrhage (boat-shaped or diffuse haze)',
      'Fibrovascular proliferation & traction on retinal surface',
      'High risk of tractional retinal detachment and neovascular glaucoma'
    ],
    recommendedFollowUp: 'Immediate referral (< 1 week). Panretinal photocoagulation (PRP) laser + Anti-VEGF ± Vitrectomy',
    urgency: 'emergency'
  }
};

export const DME_DEFINITIONS: Record<DMEStatus, DMEInfo> = {
  none: {
    status: 'none',
    name: 'DME Absent',
    shortName: 'No DME',
    description: 'No retinal thickening or hard exudates in the macular region.',
    treatmentIndicated: false,
    color: 'emerald'
  },
  non_center: {
    status: 'non_center',
    name: 'Non-Center-Involved DME',
    shortName: 'Non-Center DME',
    description: 'Retinal thickening or lipid exudates within 1 disc diameter of foveal center, but foveal avascular zone spared.',
    treatmentIndicated: false,
    color: 'amber'
  },
  center_involved: {
    status: 'center_involved',
    name: 'Center-Involved DME (CSME)',
    shortName: 'Center-Involved DME',
    description: 'Clinically Significant Macular Edema involving the central subfield. Leading cause of moderate vision loss in diabetics.',
    treatmentIndicated: true,
    color: 'rose'
  }
};
