import { DRAnalysisResult } from '../types';

export interface SampleFundusCase {
  id: string;
  title: string;
  stageName: string;
  stage: 0 | 1 | 2 | 3 | 4;
  description: string;
  imageUrl: string;
  analysis: DRAnalysisResult;
}

// Built-in high resolution SVGs and curated fundus mock imagery with realistic medical annotations
export const PRESET_FUNDUS_CASES: SampleFundusCase[] = [
  {
    id: 'case-stage-0',
    title: 'Stage 0: Normal Healthy Retina',
    stageName: 'No Diabetic Retinopathy',
    stage: 0,
    description: 'Crisp optic disc margins, normal cup-to-disc ratio (0.3), uniform macular reflex, no vascular anomalies or exudates.',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    analysis: {
      stage: 0,
      stageName: 'No Diabetic Retinopathy (Stage 0)',
      stageShortName: 'No DR',
      icdCode: 'E11.319 (Type 2 DM without retinopathy)',
      confidence: 99.1,
      classProbabilities: {
        stage0: 99.1,
        stage1: 0.7,
        stage2: 0.1,
        stage3: 0.1,
        stage4: 0.0
      },
      dmeRisk: 'Negative',
      dmeConfidence: 99.5,
      urgency: 'Routine (12 mo)',
      urgencyColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      keyFindings: [
        'Well-defined optic nerve head with sharp neuroretinal rim',
        'Normal foveal avascular zone (FAZ) contour',
        'Caliber and branching of retinal arterioles and venules are within physiological limits',
        'Zero microaneurysms, hemorrhages, or exudative deposits detected'
      ],
      recommendedAction: 'Annual dilated eye examination. Maintain glycemic target (HbA1c < 7.0%) and regular blood pressure monitoring.',
      lesions: [
        {
          id: 'l-0-od',
          type: 'optic_disc',
          label: 'Optic Disc (Normal)',
          x: 28,
          y: 46,
          width: 14,
          height: 14,
          severity: 'low',
          notes: 'Sharp margins, physiological cup-to-disc ratio 0.3'
        },
        {
          id: 'l-0-mac',
          type: 'macula',
          label: 'Fovea / Macula (Intact)',
          x: 62,
          y: 52,
          width: 12,
          height: 12,
          severity: 'low',
          notes: 'Uniform xanthophyll pigment, intact foveal reflex'
        }
      ],
      qualityScore: 98,
      imageField: 'Macula-Centered',
      eye: 'OD (Right Eye)',
      etdrsScore: 10
    }
  },
  {
    id: 'case-stage-1',
    title: 'Stage 1: Mild NPDR',
    stageName: 'Mild Non-Proliferative DR',
    stage: 1,
    description: 'Presence of isolated microaneurysms (<5) in the temporal parafoveal region. No hard exudates or venous abnormalities.',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    analysis: {
      stage: 1,
      stageName: 'Mild Non-Proliferative Retinopathy (Stage 1)',
      stageShortName: 'Mild NPDR',
      icdCode: 'E11.329 (Mild nonproliferative DR without macular edema)',
      confidence: 94.8,
      classProbabilities: {
        stage0: 3.2,
        stage1: 94.8,
        stage2: 1.8,
        stage3: 0.1,
        stage4: 0.1
      },
      dmeRisk: 'Negative',
      dmeConfidence: 96.2,
      urgency: 'Routine (12 mo)',
      urgencyColor: 'text-blue-700 bg-blue-50 border-blue-200',
      keyFindings: [
        '3 isolated microaneurysms detected in temporal macula',
        'No visible blot hemorrhages or lipid exudation',
        'Macular thickness profile normal',
        'Optic disc margin distinct and unremarkable'
      ],
      recommendedAction: 'Repeat retinal screening in 12 months. Review diabetes self-management education and lipid profile.',
      lesions: [
        {
          id: 'l-1-ma1',
          type: 'microaneurysm',
          label: 'Microaneurysm #1',
          x: 68,
          y: 42,
          width: 5,
          height: 5,
          severity: 'low',
          notes: 'Focal capillary out-pouching (approx. 25μm)'
        },
        {
          id: 'l-1-ma2',
          type: 'microaneurysm',
          label: 'Microaneurysm #2',
          x: 74,
          y: 58,
          width: 5,
          height: 5,
          severity: 'low',
          notes: 'Isolated microvascular lesion'
        },
        {
          id: 'l-1-od',
          type: 'optic_disc',
          label: 'Optic Disc',
          x: 26,
          y: 48,
          width: 14,
          height: 14,
          severity: 'low',
          notes: 'Normal vasculature convergence'
        }
      ],
      qualityScore: 95,
      imageField: 'Macula-Centered',
      eye: 'OD (Right Eye)',
      etdrsScore: 20
    }
  },
  {
    id: 'case-stage-2',
    title: 'Stage 2: Moderate NPDR',
    stageName: 'Moderate Non-Proliferative DR',
    stage: 2,
    description: 'Multiple microaneurysms, dot & blot hemorrhages in 2 quadrants, small clusters of hard exudates approaching the vascular arcade.',
    imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
    analysis: {
      stage: 2,
      stageName: 'Moderate Non-Proliferative Retinopathy (Stage 2)',
      stageShortName: 'Mod NPDR',
      icdCode: 'E11.331 (Moderate nonproliferative DR with macular edema)',
      confidence: 92.4,
      classProbabilities: {
        stage0: 0.2,
        stage1: 4.8,
        stage2: 92.4,
        stage3: 2.3,
        stage4: 0.3
      },
      dmeRisk: 'Suspected',
      dmeConfidence: 78.4,
      urgency: 'Semi-Annual (6 mo)',
      urgencyColor: 'text-amber-700 bg-amber-50 border-amber-200',
      keyFindings: [
        'Moderate microaneurysms and dot-blot hemorrhages in inferior and superior temporal quadrants',
        'Circinate ring of hard exudates (lipid precipitation) 800μm from foveal center',
        'Mild venous dilation noted in inferior temporal arcade',
        'Absence of definitive neovascularization'
      ],
      recommendedAction: 'Order Optical Coherence Tomography (OCT) macula scan to rule out center-involving DME. Follow-up eye exam in 3 to 6 months.',
      lesions: [
        {
          id: 'l-2-he1',
          type: 'hard_exudate',
          label: 'Hard Exudate Cluster',
          x: 54,
          y: 38,
          width: 9,
          height: 8,
          severity: 'medium',
          notes: 'Lipoprotein deposits near superior macular arcade'
        },
        {
          id: 'l-2-hem1',
          type: 'hemorrhage',
          label: 'Dot-Blot Hemorrhage',
          x: 72,
          y: 44,
          width: 6,
          height: 6,
          severity: 'medium',
          notes: 'Intraretinal hemorrhage in outer plexiform layer'
        },
        {
          id: 'l-2-hem2',
          type: 'hemorrhage',
          label: 'Blot Hemorrhage (Inferior)',
          x: 60,
          y: 68,
          width: 7,
          height: 7,
          severity: 'medium',
          notes: 'Deep retinal capillary leakage'
        },
        {
          id: 'l-2-ma1',
          type: 'microaneurysm',
          label: 'Multiple Microaneurysms',
          x: 44,
          y: 56,
          width: 8,
          height: 8,
          severity: 'medium',
          notes: 'Capillary telangiectasias'
        }
      ],
      qualityScore: 92,
      imageField: 'Macula-Centered',
      eye: 'OS (Left Eye)',
      etdrsScore: 43
    }
  },
  {
    id: 'case-stage-3',
    title: 'Stage 3: Severe NPDR',
    stageName: 'Severe Non-Proliferative DR',
    stage: 3,
    description: 'Meets 4-2-1 international clinical rule: severe intraretinal hemorrhages in all 4 quadrants, definite venous beading, and cotton wool spots.',
    imageUrl: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=800&q=80',
    analysis: {
      stage: 3,
      stageName: 'Severe Non-Proliferative Retinopathy (Stage 3)',
      stageShortName: 'Severe NPDR',
      icdCode: 'E11.341 (Severe nonproliferative DR with macular edema)',
      confidence: 96.7,
      classProbabilities: {
        stage0: 0.0,
        stage1: 0.2,
        stage2: 1.6,
        stage3: 96.7,
        stage4: 1.5
      },
      dmeRisk: 'Clinically Significant Macular Edema (CSME)',
      dmeConfidence: 91.2,
      urgency: 'Urgent (1-3 mo)',
      urgencyColor: 'text-orange-700 bg-orange-50 border-orange-200',
      keyFindings: [
        'Positive 4-2-1 Rule: >20 intraretinal hemorrhages in all 4 quadrants',
        'Marked venous beading in ≥2 quadrants (superior and inferior branches)',
        'Prominent cotton wool spots (focal nerve fiber layer infarcts)',
        'High 1-year progression risk (approx. 50%) to Proliferative DR without intervention'
      ],
      recommendedAction: 'Urgent referral to Retina Specialist. Initiate macular OCT and consider pre-emptive Panretinal Photocoagulation (PRP) or anti-VEGF injection trial.',
      lesions: [
        {
          id: 'l-3-cws1',
          type: 'cotton_wool_spot',
          label: 'Cotton Wool Spot (Infarct)',
          x: 48,
          y: 32,
          width: 10,
          height: 9,
          severity: 'high',
          notes: 'Nerve fiber layer ischemia and axoplasmic debris'
        },
        {
          id: 'l-3-hem1',
          type: 'hemorrhage',
          label: 'Dense Flame & Blot Hemorrhage',
          x: 75,
          y: 36,
          width: 12,
          height: 10,
          severity: 'high',
          notes: 'Widespread capillary bed occlusion'
        },
        {
          id: 'l-3-hem2',
          type: 'hemorrhage',
          label: 'Inferior Arcade Hemorrhage',
          x: 58,
          y: 72,
          width: 11,
          height: 9,
          severity: 'high',
          notes: 'Confluent hemorrhage in outer plexiform layers'
        },
        {
          id: 'l-3-he',
          type: 'hard_exudate',
          label: 'Perifoveal Hard Exudates',
          x: 64,
          y: 50,
          width: 8,
          height: 8,
          severity: 'high',
          notes: 'Threatening central fixation / foveal center'
        }
      ],
      qualityScore: 94,
      imageField: 'Peripheral 45°',
      eye: 'OD (Right Eye)',
      etdrsScore: 53
    }
  },
  {
    id: 'case-stage-4',
    title: 'Stage 4: Proliferative DR (PDR)',
    stageName: 'Proliferative Diabetic Retinopathy',
    stage: 4,
    description: 'High-risk characteristics: active Neovascularization of Disc (NVD), preretinal fibrovascular proliferation, and vitreous hemorrhage threat.',
    imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=800&q=80',
    analysis: {
      stage: 4,
      stageName: 'Proliferative Diabetic Retinopathy (Stage 4)',
      stageShortName: 'Proliferative DR (PDR)',
      icdCode: 'E11.351 (Proliferative DR with macular edema)',
      confidence: 98.4,
      classProbabilities: {
        stage0: 0.0,
        stage1: 0.0,
        stage2: 0.2,
        stage3: 1.4,
        stage4: 98.4
      },
      dmeRisk: 'Clinically Significant Macular Edema (CSME)',
      dmeConfidence: 95.8,
      urgency: 'Emergency Referral',
      urgencyColor: 'text-red-700 bg-red-50 border-red-200',
      keyFindings: [
        'Definitive Neovascularization of the Optic Disc (NVD > 1/3 disc area)',
        'Active Neovascularization Elsewhere (NVE) along temporal vascular arcades',
        'Preretinal boat-shaped hemorrhage in upper nasal quadrant',
        'Elevated risk of tractional retinal detachment and neovascular glaucoma'
      ],
      recommendedAction: 'STAT Retina Specialist consultation. Immediate Panretinal Photocoagulation (PRP) laser surgery combined with intravitreal Anti-VEGF (Aflibercept/Ranibizumab) therapy.',
      lesions: [
        {
          id: 'l-4-nvd',
          type: 'neovascularization',
          label: 'Neovascularization of Disc (NVD)',
          x: 24,
          y: 44,
          width: 16,
          height: 16,
          severity: 'high',
          notes: 'Fronds of fragile abnormal vessels on optic head'
        },
        {
          id: 'l-4-nve',
          type: 'neovascularization',
          label: 'Neovascularization Elsewhere (NVE)',
          x: 62,
          y: 28,
          width: 14,
          height: 12,
          severity: 'high',
          notes: 'Vascular budding through internal limiting membrane'
        },
        {
          id: 'l-4-preret',
          type: 'hemorrhage',
          label: 'Preretinal Hemorrhage',
          x: 68,
          y: 62,
          width: 15,
          height: 12,
          severity: 'high',
          notes: 'Subhyaloid boat-shaped blood collection'
        },
        {
          id: 'l-4-cws',
          type: 'cotton_wool_spot',
          label: 'Ischemic Infarctions',
          x: 42,
          y: 60,
          width: 9,
          height: 8,
          severity: 'high',
          notes: 'Severe diffuse capillary non-perfusion'
        }
      ],
      qualityScore: 91,
      imageField: 'Optic Disc-Centered',
      eye: 'OS (Left Eye)',
      etdrsScore: 71
    }
  }
];

export function runSimulatedAIInference(imageFile: { name: string; size: number } | string): DRAnalysisResult {
  const seed = typeof imageFile === 'string' ? imageFile.length : imageFile.name.length + imageFile.size;
  const stage = (seed % 5) as 0 | 1 | 2 | 3 | 4;
  return PRESET_FUNDUS_CASES[stage].analysis;
}
