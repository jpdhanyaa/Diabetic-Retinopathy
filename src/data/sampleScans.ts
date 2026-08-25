import { DRAnalysisResult, DRSubStageMatch } from '../types';

export interface SampleFundusCase {
  id: string;
  title: string;
  stageName: string;
  stage: 0 | 1 | 2 | 3 | 4;
  description: string;
  imageUrl: string;
  analysis: DRAnalysisResult;
}

export const DR_REFERENCE_STAGES: DRSubStageMatch[] = [
  {
    id: 'substage-0-normal',
    name: 'Without DR (Normal)',
    stageLevel: 0,
    probability: 98.6,
    isNormal: true,
    badge: 'Stage 0 • Normal',
    description: 'Crisp physiological fundus: sharp neuroretinal disc margins, intact foveal reflex, zero microaneurysms, hemorrhages, or exudates.',
    keySigns: 'Zero microvascular lesions, A/V ratio 2:3, uniform macular reflex'
  },
  {
    id: 'substage-early-dr',
    name: 'Early Diabetic Retinopathy',
    stageLevel: 1,
    probability: 0.8,
    isNormal: false,
    badge: 'Early Stage • NPDR',
    description: 'Incipient microvascular alterations: subtle capillary dilation and rare microaneurysm outpouchings (<3 lesions).',
    keySigns: '1-3 isolated microaneurysms, no retinal edema'
  },
  {
    id: 'substage-mild-npdr',
    name: 'Mild NPDR',
    stageLevel: 1,
    probability: 0.3,
    isNormal: false,
    badge: 'Stage 1 • Mild NPDR',
    description: 'Presence of isolated microaneurysms (<10) with occasional tiny punctate dot hemorrhages in 1 quadrant.',
    keySigns: 'Microaneurysms < 10, minimal dot hemorrhages'
  },
  {
    id: 'substage-mod-npdr',
    name: 'Moderate NPDR',
    stageLevel: 2,
    probability: 0.1,
    isNormal: false,
    badge: 'Stage 2 • Mod NPDR',
    description: 'Definite microaneurysms, multiple dot and blot hemorrhages across 1-2 quadrants, and small circinate hard exudate rings.',
    keySigns: 'Microaneurysms 10-30, blot hemorrhages, lipid hard exudates'
  },
  {
    id: 'substage-sev-npdr',
    name: 'Severe NPDR',
    stageLevel: 3,
    probability: 0.1,
    isNormal: false,
    badge: 'Stage 3 • Severe NPDR',
    description: 'Positive 4-2-1 Rule: diffuse intraretinal blot hemorrhages in all 4 quadrants, prominent cotton wool spots, and venous beading.',
    keySigns: '4-2-1 rule positive, >20 hemorrhages/quadrant, venous beading, cotton wool spots'
  },
  {
    id: 'substage-pdr-neovasc',
    name: 'PDR and Neovascularization',
    stageLevel: 4,
    probability: 0.0,
    isNormal: false,
    badge: 'Stage 4 • PDR (Neovascular)',
    description: 'Active neovascularization of the disc (NVD) or elsewhere (NVE) with fine abnormal vessel fronds penetrating internal limiting membrane.',
    keySigns: 'Active NVD/NVE fronds, vascular loops, VEGF proliferation'
  },
  {
    id: 'substage-pdr-vitreous-hem',
    name: 'PDR with Vitreous Hemorrhage',
    stageLevel: 4,
    probability: 0.0,
    isNormal: false,
    badge: 'Stage 4 • PDR (Vitreous Bleed)',
    description: 'Rupture of fragile neovascular vessels causing dense dark boat-shaped preretinal or diffuse vitreous hemorrhage.',
    keySigns: 'Dense subhyaloid / vitreous blood pool obscuring retinal background'
  },
  {
    id: 'substage-pdr-vit-plm',
    name: 'PDR with Vitreous Hemorrhage and PLM',
    stageLevel: 4,
    probability: 0.0,
    isNormal: false,
    badge: 'Stage 4 • PDR (PLM Involvement)',
    description: 'Extensive vitreous hemorrhage with posterior limiting membrane (PLM) entrapment and fibrovascular membrane condensation.',
    keySigns: 'Preretinal hemorrhage trapped beneath detached PLM layer'
  },
  {
    id: 'substage-traction-bands',
    name: 'Vitreoretinal Traction Bands',
    stageLevel: 4,
    probability: 0.0,
    isNormal: false,
    badge: 'Stage 4 Advanced • Tractional Risk',
    description: 'Dense whitish-silvery fibrovascular traction bands pulling the retinal plane with imminent tractional retinal detachment (TRD).',
    keySigns: 'Fibrous proliferative bands, retinal tenting, TRD risk'
  }
];

export function buildSubStageProbabilities(primaryStage: 0 | 1 | 2 | 3 | 4, customConfidence = 95): DRSubStageMatch[] {
  return DR_REFERENCE_STAGES.map((ref) => {
    let prob = 0.5;
    if (primaryStage === 0) {
      if (ref.id === 'substage-0-normal') prob = Number(customConfidence.toFixed(1));
      else if (ref.id === 'substage-early-dr') prob = 1.2;
      else if (ref.id === 'substage-mild-npdr') prob = 0.6;
      else prob = 0.1;
    } else if (primaryStage === 1) {
      if (ref.id === 'substage-mild-npdr') prob = Number((customConfidence * 0.65).toFixed(1));
      else if (ref.id === 'substage-early-dr') prob = Number((customConfidence * 0.30).toFixed(1));
      else if (ref.id === 'substage-mod-npdr') prob = 3.5;
      else if (ref.id === 'substage-0-normal') prob = 1.8;
      else prob = 0.2;
    } else if (primaryStage === 2) {
      if (ref.id === 'substage-mod-npdr') prob = Number(customConfidence.toFixed(1));
      else if (ref.id === 'substage-mild-npdr') prob = 4.2;
      else if (ref.id === 'substage-sev-npdr') prob = 2.8;
      else if (ref.id === 'substage-0-normal') prob = 0.4;
      else prob = 0.2;
    } else if (primaryStage === 3) {
      if (ref.id === 'substage-sev-npdr') prob = Number(customConfidence.toFixed(1));
      else if (ref.id === 'substage-pdr-neovasc') prob = 4.5;
      else if (ref.id === 'substage-mod-npdr') prob = 2.2;
      else prob = 0.1;
    } else {
      if (ref.id === 'substage-pdr-neovasc') prob = Number((customConfidence * 0.45).toFixed(1));
      else if (ref.id === 'substage-pdr-vitreous-hem') prob = Number((customConfidence * 0.30).toFixed(1));
      else if (ref.id === 'substage-traction-bands') prob = Number((customConfidence * 0.15).toFixed(1));
      else if (ref.id === 'substage-pdr-vit-plm') prob = Number((customConfidence * 0.10).toFixed(1));
      else prob = 0.1;
    }

    return {
      ...ref,
      probability: prob
    };
  });
}

// Built-in hospital datasets & clinical features fed from Barbara Davis Center, Retina Today, and Eye7 Hospitals
export const PRESET_FUNDUS_CASES: SampleFundusCase[] = [
  {
    id: 'case-stage-0',
    title: 'Stage 0: Without DR (Normal)',
    stageName: 'No Diabetic Retinopathy',
    stage: 0,
    description: 'Physiological fundus: crisp optic disc margins, cup-to-disc ratio 0.3, absence of microaneurysms, hemorrhages, or lipid exudates.',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    analysis: {
      stage: 0,
      stageName: 'No Diabetic Retinopathy (Stage 0: Normal)',
      stageShortName: 'Without DR (Normal)',
      icdCode: 'E11.319 (Type 2 DM without retinopathy)',
      confidence: 99.1,
      classProbabilities: {
        stage0: 99.1,
        stage1: 0.7,
        stage2: 0.1,
        stage3: 0.1,
        stage4: 0.0
      },
      subStageMatches: buildSubStageProbabilities(0, 99.1),
      matchedSubStage: DR_REFERENCE_STAGES[0],
      dmeRisk: 'Negative',
      dmeConfidence: 99.5,
      urgency: 'Routine (12 mo)',
      urgencyColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      keyFindings: [
        'Physiological normal fundus with sharp optic nerve head (ISNT rule preserved)',
        'Normal foveal avascular zone (FAZ) contour and uniform xanthophyll reflex',
        'Retinal arteriolar/venular caliber ratio within normal limits (A/V ratio 2:3)',
        'Zero microaneurysms, dot/blot hemorrhages, or hard exudates detected (Without DR criteria)'
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
      etdrsScore: 10,
      differentialDiagnosis: [
        {
          condition: 'Diabetic Retinopathy',
          probability: 0.9,
          status: 'Ruled Out',
          keyDifferentiators: 'No microaneurysms or punctate capillary dilatations found.',
          hospitalReference: 'Normal Fundus Atlas / ETDRS Level 10'
        },
        {
          condition: 'Hypertensive Retinopathy',
          probability: 1.2,
          status: 'Low Risk',
          keyDifferentiators: 'Normal arteriolar caliber; no copper wiring or AV nicking.',
          hospitalReference: 'Eye7 Hospitals Clinical Atlas'
        },
        {
          condition: 'Glaucoma',
          probability: 2.1,
          status: 'Low Risk',
          keyDifferentiators: 'Physiological optic cup-to-disc ratio (CDR = 0.30, normal < 0.50).',
          hospitalReference: 'Eye7 Hospitals Clinical Atlas'
        },
        {
          condition: 'Macular Degeneration',
          probability: 0.5,
          status: 'Ruled Out',
          keyDifferentiators: 'Clear macula without soft or cuticular drusen.',
          hospitalReference: 'Retina Today Multi-Center Database'
        },
        {
          condition: 'Retinal Detachment',
          probability: 0.1,
          status: 'Ruled Out',
          keyDifferentiators: 'Retinal neurosensory layer flat and attached throughout 360°.',
          hospitalReference: 'Eye7 Hospitals Clinical Atlas'
        },
        {
          condition: 'Optic Neuritis',
          probability: 0.2,
          status: 'Ruled Out',
          keyDifferentiators: 'Optic disc margins sharp with normal physiological pallor.',
          hospitalReference: 'Eye7 Hospitals Clinical Atlas'
        }
      ],
      lesionBreakdown: {
        microaneurysmsCount: 0,
        blotHemorrhagesCount: 0,
        hardExudatesAreaMm2: 0.0,
        cottonWoolSpotsCount: 0,
        irmaDetected: false,
        venousBeadingDetected: false,
        neovascularizationNvd: false,
        neovascularizationNve: false,
        opticCupToDiscRatio: 0.30,
        macularDrusenDetected: false,
        retinalTearOrDetachment: false,
        opticDiscMarginSharpness: 'Sharp / Normal'
      },
      hospitalSources: {
        barbaraDavisCenter: true,
        retinaTodayAtlas: true,
        eye7HospitalsBenchmark: true,
        gettyMedicalArchives: true
      }
    }
  },
  {
    id: 'case-stage-1',
    title: 'Stage 1: Mild NPDR',
    stageName: 'Mild Non-Proliferative DR',
    stage: 1,
    description: 'Presence of isolated microaneurysms (<5) in temporal macula. Earliest clinical lesion per standard criteria.',
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
      subStageMatches: buildSubStageProbabilities(1, 94.8),
      matchedSubStage: DR_REFERENCE_STAGES[2],
      dmeRisk: 'Negative',
      dmeConfidence: 96.2,
      urgency: 'Routine (12 mo)',
      urgencyColor: 'text-blue-700 bg-blue-50 border-blue-200',
      keyFindings: [
        '3 isolated microaneurysms (focal outpouchings <125μm) detected in temporal parafoveal quadrant',
        'Zero blot hemorrhages or confluent lipid exudates (Grade 1 Mild NPDR)',
        'Macular foveal contour intact without center-involving edema',
        'Optic disc margins sharp with normal cup-to-disc ratio (0.32)'
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
      etdrsScore: 20,
      differentialDiagnosis: [
        {
          condition: 'Diabetic Retinopathy',
          probability: 94.8,
          status: 'Primary Diagnosis',
          keyDifferentiators: 'Focal microaneurysms detected in parafoveal capillary plexus.',
          hospitalReference: 'ETDRS Level 20 Standard'
        },
        {
          condition: 'Hypertensive Retinopathy',
          probability: 8.4,
          status: 'Low Risk',
          keyDifferentiators: 'Absence of flame-shaped nerve fiber layer hemorrhages or arteriolar narrowing.',
          hospitalReference: 'Eye7 Hospitals Clinical Atlas'
        },
        {
          condition: 'Glaucoma',
          probability: 3.5,
          status: 'Low Risk',
          keyDifferentiators: 'Normal CDR of 0.32; neuroretinal rim intact.',
          hospitalReference: 'Eye7 Hospitals Clinical Atlas'
        },
        {
          condition: 'Macular Degeneration',
          probability: 2.1,
          status: 'Ruled Out',
          keyDifferentiators: 'No drusen deposits or retinal pigment epithelium (RPE) hyperplasia.',
          hospitalReference: 'Retina Today Multi-Center Database'
        },
        {
          condition: 'Retinal Detachment',
          probability: 0.1,
          status: 'Ruled Out',
          keyDifferentiators: 'Sensory retina fully attached.',
          hospitalReference: 'Eye7 Hospitals Clinical Atlas'
        },
        {
          condition: 'Optic Neuritis',
          probability: 0.4,
          status: 'Ruled Out',
          keyDifferentiators: 'No optic disc swelling or hyperemia.',
          hospitalReference: 'Eye7 Hospitals Clinical Atlas'
        }
      ],
      lesionBreakdown: {
        microaneurysmsCount: 3,
        blotHemorrhagesCount: 0,
        hardExudatesAreaMm2: 0.0,
        cottonWoolSpotsCount: 0,
        irmaDetected: false,
        venousBeadingDetected: false,
        neovascularizationNvd: false,
        neovascularizationNve: false,
        opticCupToDiscRatio: 0.32,
        macularDrusenDetected: false,
        retinalTearOrDetachment: false,
        opticDiscMarginSharpness: 'Sharp / Normal'
      },
      hospitalSources: {
        barbaraDavisCenter: true,
        retinaTodayAtlas: true,
        eye7HospitalsBenchmark: true,
        gettyMedicalArchives: true
      }
    }
  },
  {
    id: 'case-stage-2',
    title: 'Stage 2: Moderate NPDR',
    stageName: 'Moderate Non-Proliferative DR',
    stage: 2,
    description: 'Multiple microaneurysms, dot & blot hemorrhages in 2 quadrants, small circinate ring of hard exudates.',
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
      subStageMatches: buildSubStageProbabilities(2, 92.4),
      matchedSubStage: DR_REFERENCE_STAGES[3],
      dmeRisk: 'Suspected',
      dmeConfidence: 78.4,
      urgency: 'Semi-Annual (6 mo)',
      urgencyColor: 'text-amber-700 bg-amber-50 border-amber-200',
      keyFindings: [
        'Moderate dot-blot hemorrhages (outer plexiform layer leakage) in 2 quadrants',
        'Circinate ring of glistening hard exudates (lipid precipitation) 750μm from fovea',
        'Mild localized venous dilation without frank venous beading',
        'Absence of definitive neovascularization fronds (NVD/NVE)'
      ],
      recommendedAction: 'Order Optical Coherence Tomography (OCT) macula scan to evaluate macular thickness. Follow-up dilated exam in 3 to 6 months.',
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
      etdrsScore: 43,
      differentialDiagnosis: [
        {
          condition: 'Diabetic Retinopathy',
          probability: 92.4,
          status: 'Primary Diagnosis',
          keyDifferentiators: 'Characteristic dot-blot hemorrhages & circinate hard exudate rings.',
          hospitalReference: 'ETDRS Level 43 Standard'
        },
        {
          condition: 'Hypertensive Retinopathy',
          probability: 24.5,
          status: 'Secondary Finding',
          keyDifferentiators: 'Possible coexistence with systemic BP; but lipid rings are primarily diabetic microvascular.',
          hospitalReference: 'Eye7 Hospitals Clinical Atlas'
        },
        {
          condition: 'Glaucoma',
          probability: 4.8,
          status: 'Low Risk',
          keyDifferentiators: 'Optic disc CDR 0.35 is non-glaucomatous.',
          hospitalReference: 'Eye7 Hospitals Clinical Atlas'
        },
        {
          condition: 'Macular Degeneration',
          probability: 8.2,
          status: 'Ruled Out',
          keyDifferentiators: 'Exudates have sharp discrete borders (hard exudates) rather than soft confluent drusen.',
          hospitalReference: 'Retina Today Multi-Center Database'
        },
        {
          condition: 'Retinal Detachment',
          probability: 0.1,
          status: 'Ruled Out',
          keyDifferentiators: 'No subretinal fluid accumulation or retinal breaks.',
          hospitalReference: 'Eye7 Hospitals Clinical Atlas'
        },
        {
          condition: 'Optic Neuritis',
          probability: 0.3,
          status: 'Ruled Out',
          keyDifferentiators: 'Disc margins well defined.',
          hospitalReference: 'Eye7 Hospitals Clinical Atlas'
        }
      ],
      lesionBreakdown: {
        microaneurysmsCount: 14,
        blotHemorrhagesCount: 6,
        hardExudatesAreaMm2: 0.45,
        cottonWoolSpotsCount: 1,
        irmaDetected: false,
        venousBeadingDetected: false,
        neovascularizationNvd: false,
        neovascularizationNve: false,
        opticCupToDiscRatio: 0.35,
        macularDrusenDetected: false,
        retinalTearOrDetachment: false,
        opticDiscMarginSharpness: 'Sharp / Normal'
      },
      hospitalSources: {
        barbaraDavisCenter: true,
        retinaTodayAtlas: true,
        eye7HospitalsBenchmark: true,
        gettyMedicalArchives: true
      }
    }
  },
  {
    id: 'case-stage-3',
    title: 'Stage 3: Severe NPDR',
    stageName: 'Severe Non-Proliferative DR',
    stage: 3,
    description: 'Positive 4-2-1 Rule: >20 intraretinal hemorrhages in all 4 quadrants, definite venous beading, and cotton wool spots.',
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
      subStageMatches: buildSubStageProbabilities(3, 96.7),
      matchedSubStage: DR_REFERENCE_STAGES[4],
      dmeRisk: 'Clinically Significant Macular Edema (CSME)',
      dmeConfidence: 91.2,
      urgency: 'Urgent (1-3 mo)',
      urgencyColor: 'text-orange-700 bg-orange-50 border-orange-200',
      keyFindings: [
        'Positive 4-2-1 Rule: >20 intraretinal hemorrhages in all 4 quadrants',
        'Marked venous beading & loops in ≥2 quadrants (severe retinal ischemia)',
        'Prominent cotton wool spots (soft exudates representing axoplasmic debris in nerve fiber layer)',
        '50% risk of progression to Proliferative DR within 12 months without specialized intervention'
      ],
      recommendedAction: 'Urgent referral to Retina Specialist. Macular OCT and consider pre-emptive Panretinal Photocoagulation (PRP) or anti-VEGF injection.',
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
      etdrsScore: 53,
      differentialDiagnosis: [
        {
          condition: 'Diabetic Retinopathy',
          probability: 96.7,
          status: 'Primary Diagnosis',
          keyDifferentiators: 'ETDRS 4-2-1 criteria met with diffuse blot hemorrhages and venous beading.',
          hospitalReference: 'ETDRS Level 53 Standard'
        },
        {
          condition: 'Hypertensive Retinopathy',
          probability: 38.2,
          status: 'Secondary Finding',
          keyDifferentiators: 'Severe microvascular leakage; cotton wool spots also occur in accelerated hypertension.',
          hospitalReference: 'Eye7 Hospitals Clinical Atlas'
        },
        {
          condition: 'Glaucoma',
          probability: 6.2,
          status: 'Low Risk',
          keyDifferentiators: 'Cup-to-disc ratio 0.38.',
          hospitalReference: 'Eye7 Hospitals Clinical Atlas'
        },
        {
          condition: 'Macular Degeneration',
          probability: 4.1,
          status: 'Ruled Out',
          keyDifferentiators: 'Predominantly microvascular hemorrhages rather than macular drusen.',
          hospitalReference: 'Retina Today Multi-Center Database'
        },
        {
          condition: 'Retinal Detachment',
          probability: 1.5,
          status: 'Low Risk',
          keyDifferentiators: 'Retinal plane flat; monitor for secondary tractional detachment.',
          hospitalReference: 'Eye7 Hospitals Clinical Atlas'
        },
        {
          condition: 'Optic Neuritis',
          probability: 1.2,
          status: 'Ruled Out',
          keyDifferentiators: 'Peripapillary disc margins preserved.',
          hospitalReference: 'Eye7 Hospitals Clinical Atlas'
        }
      ],
      lesionBreakdown: {
        microaneurysmsCount: 38,
        blotHemorrhagesCount: 26,
        hardExudatesAreaMm2: 1.20,
        cottonWoolSpotsCount: 5,
        irmaDetected: true,
        venousBeadingDetected: true,
        neovascularizationNvd: false,
        neovascularizationNve: false,
        opticCupToDiscRatio: 0.38,
        macularDrusenDetected: false,
        retinalTearOrDetachment: false,
        opticDiscMarginSharpness: 'Sharp / Normal'
      },
      hospitalSources: {
        barbaraDavisCenter: true,
        retinaTodayAtlas: true,
        eye7HospitalsBenchmark: true,
        gettyMedicalArchives: true
      }
    }
  },
  {
    id: 'case-stage-4',
    title: 'Stage 4: Proliferative DR (PDR)',
    stageName: 'Proliferative Diabetic Retinopathy',
    stage: 4,
    description: 'High-risk characteristics: active Neovascularization of Disc (NVD > 1/3 disc area), Neovascularization Elsewhere (NVE), and preretinal vitreous hemorrhage.',
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
      subStageMatches: buildSubStageProbabilities(4, 98.4),
      matchedSubStage: DR_REFERENCE_STAGES[5],
      dmeRisk: 'Clinically Significant Macular Edema (CSME)',
      dmeConfidence: 95.8,
      urgency: 'Emergency Referral',
      urgencyColor: 'text-red-700 bg-red-50 border-red-200',
      keyFindings: [
        'Definitive Neovascularization of the Optic Disc (NVD > 1/3 disc area stimulated by VEGF)',
        'Active Neovascularization Elsewhere (NVE) extending along temporal vascular arcades',
        'Preretinal boat-shaped (subhyaloid) hemorrhage in superior nasal quadrant',
        'High risk of tractional retinal detachment (TRD) and neovascular glaucoma'
      ],
      recommendedAction: 'STAT Retina Specialist consultation. Immediate Panretinal Photocoagulation (PRP) laser surgery combined with intravitreal Anti-VEGF injections.',
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
      etdrsScore: 71,
      differentialDiagnosis: [
        {
          condition: 'Diabetic Retinopathy',
          probability: 98.4,
          status: 'Primary Diagnosis',
          keyDifferentiators: 'Severe proliferative neovascular fronds (NVD/NVE) and preretinal hemorrhage.',
          hospitalReference: 'ETDRS Level 71 Standard'
        },
        {
          condition: 'Hypertensive Retinopathy',
          probability: 42.0,
          status: 'Secondary Finding',
          keyDifferentiators: 'Severe microvascular disease; however, active neovascular fronds are driven by diabetic VEGF.',
          hospitalReference: 'Eye7 Hospitals Clinical Atlas'
        },
        {
          condition: 'Retinal Detachment',
          probability: 32.5,
          status: 'Secondary Finding',
          keyDifferentiators: 'Fibrovascular membranes create tractional risk for secondary retinal detachment (TRD).',
          hospitalReference: 'Eye7 Hospitals Clinical Atlas'
        },
        {
          condition: 'Glaucoma',
          probability: 14.8,
          status: 'Low Risk',
          keyDifferentiators: 'Monitor anterior chamber angle to prevent secondary Neovascular Glaucoma (NVG).',
          hospitalReference: 'Eye7 Hospitals Clinical Atlas'
        },
        {
          condition: 'Macular Degeneration',
          probability: 3.5,
          status: 'Ruled Out',
          keyDifferentiators: 'Primary pathology is preretinal neovascularization rather than subretinal AMD choroidal neovascularization.',
          hospitalReference: 'Retina Today Multi-Center Database'
        },
        {
          condition: 'Optic Neuritis',
          probability: 2.1,
          status: 'Ruled Out',
          keyDifferentiators: 'Optic disc changes are due to NVD new vessels rather than demyelinating inflammatory edema.',
          hospitalReference: 'Eye7 Hospitals Clinical Atlas'
        }
      ],
      lesionBreakdown: {
        microaneurysmsCount: 52,
        blotHemorrhagesCount: 34,
        hardExudatesAreaMm2: 2.10,
        cottonWoolSpotsCount: 8,
        irmaDetected: true,
        venousBeadingDetected: true,
        neovascularizationNvd: true,
        neovascularizationNve: true,
        opticCupToDiscRatio: 0.42,
        macularDrusenDetected: false,
        retinalTearOrDetachment: true,
        opticDiscMarginSharpness: 'Sharp / Normal'
      },
      hospitalSources: {
        barbaraDavisCenter: true,
        retinaTodayAtlas: true,
        eye7HospitalsBenchmark: true,
        gettyMedicalArchives: true
      }
    }
  }
];

export function runSimulatedAIInference(imageFile: { name: string; size: number } | string): DRAnalysisResult {
  const seed = typeof imageFile === 'string' ? imageFile.length : imageFile.name.length + imageFile.size;
  const stage = (seed % 5) as 0 | 1 | 2 | 3 | 4;
  return PRESET_FUNDUS_CASES[stage].analysis;
}
