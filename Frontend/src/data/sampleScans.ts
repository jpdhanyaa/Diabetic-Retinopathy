import { RetinalScan, PatientRecord } from '../types/retinopathy';

// Helper to generate ultra-realistic high-resolution SVG Data URIs representing fundus photos
export function generateSyntheticFundusSVG(options: {
  eye: 'OD' | 'OS';
  stage: 0 | 1 | 2 | 3 | 4;
  hasDME: boolean;
  blur?: number;
}): string {
  const { eye, stage, hasDME } = options;
  const isOD = eye === 'OD'; // Right eye: Optic disc is on Nasal side (left in image), Macula is Temporal (right in image)
  
  // Coordinates
  const discX = isOD ? 320 : 680;
  const discY = 500;
  const foveaX = isOD ? 580 : 420;
  const foveaY = 505;

  // Build SVG string
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000" style="background:#000;">
    <defs>
      <!-- Radial gradient for retinal background fundus orange-red glow -->
      <radialGradient id="retinaBg" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" stop-color="#b43416" />
        <stop offset="35%" stop-color="#8c220d" />
        <stop offset="70%" stop-color="#5a1306" />
        <stop offset="92%" stop-color="#2d0802" />
        <stop offset="100%" stop-color="#050100" />
      </radialGradient>

      <!-- Choroidal tessellation texture -->
      <radialGradient id="choroidGlow" cx="${foveaX / 10}%" cy="${foveaY / 10}%" r="60%">
        <stop offset="0%" stop-color="#3d0c04" stop-opacity="0.9" />
        <stop offset="40%" stop-color="#731908" stop-opacity="0.3" />
        <stop offset="100%" stop-color="#140301" stop-opacity="0.8" />
      </radialGradient>

      <!-- Optic Disc Gradient -->
      <radialGradient id="opticDiscGrad" cx="45%" cy="45%" r="50%">
        <stop offset="0%" stop-color="#fff1b8" />
        <stop offset="40%" stop-color="#fbd38d" />
        <stop offset="80%" stop-color="#ed8936" />
        <stop offset="100%" stop-color="#c05621" />
      </radialGradient>

      <!-- Optic Cup Gradient -->
      <radialGradient id="opticCupGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fffbeb" />
        <stop offset="70%" stop-color="#fef3c7" />
        <stop offset="100%" stop-color="#fde68a" />
      </radialGradient>

      <!-- Fovea centralis / FAZ (Foveal Avascular Zone) -->
      <radialGradient id="foveaGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#2b0502" />
        <stop offset="40%" stop-color="#450a04" />
        <stop offset="80%" stop-color="#781708" />
        <stop offset="100%" stop-color="transparent" />
      </radialGradient>

      <!-- Hard Exudates Lipid Texture -->
      <radialGradient id="hardExudateGrad" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="50%" stop-color="#fef08a" />
        <stop offset="90%" stop-color="#eab308" />
        <stop offset="100%" stop-color="#a16207" />
      </radialGradient>

      <!-- Cotton Wool Spot (Soft Exudate) -->
      <radialGradient id="cwsGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.85" />
        <stop offset="50%" stop-color="#e2e8f0" stop-opacity="0.6" />
        <stop offset="85%" stop-color="#94a3b8" stop-opacity="0.25" />
        <stop offset="100%" stop-color="transparent" />
      </radialGradient>
      
      <!-- Subtle noise for fundus camera sensor grain -->
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="noise"/>
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.04 0"/>
        <feBlend mode="overlay" in="SourceGraphic" in2="noise"/>
      </filter>
    </defs>

    <!-- Fundus Disc aperture -->
    <clipPath id="fundusAperture">
      <circle cx="500" cy="500" r="465" />
    </clipPath>

    <g clip-path="url(#fundusAperture)" filter="url(#grain)">
      <!-- Main retinal sphere -->
      <circle cx="500" cy="500" r="470" fill="url(#retinaBg)" />
      <rect x="0" y="0" width="1000" height="1000" fill="url(#choroidGlow)" />

      <!-- Retinal nerve fiber layer subtle sheen -->
      <ellipse cx="${discX}" cy="${discY}" rx="380" ry="340" fill="none" stroke="#f97316" stroke-opacity="0.04" stroke-width="120" />

      <!-- Fovea and Macula -->
      <circle cx="${foveaX}" cy="${foveaY}" r="75" fill="url(#foveaGrad)" opacity="0.9" />
      <circle cx="${foveaX}" cy="${foveaY}" r="14" fill="#1c0301" opacity="0.95" />
      <!-- Foveal light reflex -->
      <circle cx="${foveaX + 2}" cy="${foveaY - 2}" r="2" fill="#fff" opacity="0.7" />

      <!-- Major Retinal Blood Vessels (Arcades) -->
      <!-- Superior Temporal Arcade -->
      <path d="M ${discX} ${discY - 15} Q ${isOD ? discX + 110 : discX - 110} ${discY - 220}, ${foveaX + (isOD ? 120 : -120)} 230 T ${isOD ? 850 : 150} 180" 
            fill="none" stroke="#600707" stroke-width="14" stroke-linecap="round" opacity="0.9" />
      <path d="M ${discX} ${discY - 15} Q ${isOD ? discX + 110 : discX - 110} ${discY - 220}, ${foveaX + (isOD ? 120 : -120)} 230 T ${isOD ? 850 : 150} 180" 
            fill="none" stroke="#991b1b" stroke-width="9" stroke-linecap="round" opacity="0.95" />
      <!-- Arteriole central reflex -->
      <path d="M ${discX + (isOD ? 15 : -15)} ${discY - 45} Q ${isOD ? discX + 110 : discX - 110} ${discY - 220}, ${foveaX + (isOD ? 120 : -120)} 230 T ${isOD ? 850 : 150} 180" 
            fill="none" stroke="#fca5a5" stroke-width="1.5" stroke-linecap="round" opacity="0.5" />

      <!-- Superior Nasal Arcade -->
      <path d="M ${discX} ${discY - 15} Q ${isOD ? discX - 90 : discX + 90} ${discY - 180}, ${isOD ? discX - 180 : discX + 180} 220 T ${isOD ? 160 : 840} 170" 
            fill="none" stroke="#600707" stroke-width="11" stroke-linecap="round" opacity="0.9" />
      <path d="M ${discX} ${discY - 15} Q ${isOD ? discX - 90 : discX + 90} ${discY - 180}, ${isOD ? discX - 180 : discX + 180} 220 T ${isOD ? 160 : 840} 170" 
            fill="none" stroke="#991b1b" stroke-width="7" stroke-linecap="round" opacity="0.95" />

      <!-- Inferior Temporal Arcade -->
      <path d="M ${discX} ${discY + 15} Q ${isOD ? discX + 120 : discX - 120} ${discY + 230}, ${foveaX + (isOD ? 130 : -130)} 780 T ${isOD ? 860 : 140} 820" 
            fill="none" stroke="#520505" stroke-width="15" stroke-linecap="round" opacity="0.9" />
      <path d="M ${discX} ${discY + 15} Q ${isOD ? discX + 120 : discX - 120} ${discY + 230}, ${foveaX + (isOD ? 130 : -130)} 780 T ${isOD ? 860 : 140} 820" 
            fill="none" stroke="#881337" stroke-width="10" stroke-linecap="round" opacity="0.95" />
      <path d="M ${discX + (isOD ? 15 : -15)} ${discY + 45} Q ${isOD ? discX + 120 : discX - 120} ${discY + 230}, ${foveaX + (isOD ? 130 : -130)} 780 T ${isOD ? 860 : 140} 820" 
            fill="none" stroke="#fda4af" stroke-width="1.5" stroke-linecap="round" opacity="0.5" />

      <!-- Inferior Nasal Arcade -->
      <path d="M ${discX} ${discY + 15} Q ${isOD ? discX - 80 : discX + 80} ${discY + 170}, ${isOD ? discX - 170 : discX + 170} 770 T ${isOD ? 170 : 830} 830" 
            fill="none" stroke="#600707" stroke-width="11" stroke-linecap="round" opacity="0.9" />
      <path d="M ${discX} ${discY + 15} Q ${isOD ? discX - 80 : discX + 80} ${discY + 170}, ${isOD ? discX - 170 : discX + 170} 770 T ${isOD ? 170 : 830} 830" 
            fill="none" stroke="#991b1b" stroke-width="7" stroke-linecap="round" opacity="0.95" />

      <!-- Small Macular Capillary branches -->
      <path d="M ${discX + (isOD ? 80 : -80)} ${discY - 100} Q ${foveaX} ${discY - 60}, ${foveaX + (isOD ? -40 : 40)} ${foveaY - 50}" 
            fill="none" stroke="#7f1d1d" stroke-width="3.5" opacity="0.75" />
      <path d="M ${discX + (isOD ? 85 : -85)} ${discY + 90} Q ${foveaX} ${discY + 60}, ${foveaX + (isOD ? -40 : 40)} ${foveaY + 50}" 
            fill="none" stroke="#7f1d1d" stroke-width="3.5" opacity="0.75" />
      <path d="M ${foveaX + (isOD ? 90 : -90)} ${foveaY - 140} L ${foveaX + (isOD ? 45 : -45)} ${foveaY - 55}" 
            fill="none" stroke="#991b1b" stroke-width="2.5" opacity="0.7" />
      <path d="M ${foveaX + (isOD ? 80 : -80)} ${foveaY + 135} L ${foveaX + (isOD ? 45 : -45)} ${foveaY + 55}" 
            fill="none" stroke="#991b1b" stroke-width="2.5" opacity="0.7" />

      <!-- Optic Disc (Nerve Head) -->
      <ellipse cx="${discX}" cy="${discY}" rx="46" ry="54" fill="url(#opticDiscGrad)" />
      <!-- Physiological Cup -->
      <ellipse cx="${discX + (isOD ? -5 : 5)}" cy="${discY}" rx="20" ry="24" fill="url(#opticCupGrad)" opacity="0.9" />

      ${stage >= 1 ? `
        <!-- Stage 1+ Microaneurysms (Red Dots) -->
        <circle cx="${discX + (isOD ? 160 : -160)}" cy="${discY - 80}" r="3.2" fill="#7f1d1d" />
        <circle cx="${discX + (isOD ? 160 : -160)}" cy="${discY - 80}" r="1.8" fill="#dc2626" />
        <circle cx="${foveaX + (isOD ? 60 : -60)}" cy="${foveaY + 70}" r="3.5" fill="#7f1d1d" />
        <circle cx="${foveaX + (isOD ? 60 : -60)}" cy="${foveaY + 70}" r="2" fill="#ef4444" />
        <circle cx="${foveaX + (isOD ? -50 : 50)}" cy="${foveaY - 90}" r="3.0" fill="#7f1d1d" />
        <circle cx="${foveaX + (isOD ? -50 : 50)}" cy="${foveaY - 90}" r="1.7" fill="#dc2626" />
        <circle cx="${discX + (isOD ? 90 : -90)}" cy="${discY + 140}" r="3.8" fill="#7f1d1d" />
        <circle cx="${discX + (isOD ? 90 : -90)}" cy="${discY + 140}" r="2.2" fill="#ef4444" />
      ` : ''}

      ${stage >= 2 ? `
        <!-- Stage 2+ Moderate: Dot & Blot Hemorrhages & Hard Exudates -->
        <!-- Blot hemorrhages -->
        <ellipse cx="${discX + (isOD ? 210 : -210)}" cy="${discY + 130}" rx="14" ry="10" fill="#450a0a" transform="rotate(-15 ${discX + (isOD ? 210 : -210)} ${discY + 130})" />
        <ellipse cx="${discX + (isOD ? 210 : -210)}" cy="${discY + 130}" rx="10" ry="7" fill="#7f1d1d" transform="rotate(-15 ${discX + (isOD ? 210 : -210)} ${discY + 130})" />
        <ellipse cx="${foveaX + (isOD ? 110 : -110)}" cy="${foveaY - 80}" rx="12" ry="15" fill="#7f1d1d" opacity="0.9" />
        <circle cx="${foveaX + (isOD ? -80 : 80)}" cy="${foveaY + 110}" r="9" fill="#991b1b" />
        
        <!-- Hard Exudates (Lipid circinate ring) -->
        <g opacity="0.95">
          <circle cx="${foveaX + (isOD ? 130 : -130)}" cy="${foveaY + 40}" r="6" fill="url(#hardExudateGrad)" />
          <circle cx="${foveaX + (isOD ? 142 : -142)}" cy="${foveaY + 52}" r="5" fill="url(#hardExudateGrad)" />
          <circle cx="${foveaX + (isOD ? 120 : -120)}" cy="${foveaY + 65}" r="7" fill="url(#hardExudateGrad)" />
          <circle cx="${foveaX + (isOD ? 148 : -148)}" cy="${foveaY + 30}" r="4.5" fill="url(#hardExudateGrad)" />
          <circle cx="${foveaX + (isOD ? 105 : -105)}" cy="${foveaY + 58}" r="5" fill="url(#hardExudateGrad)" />
          <circle cx="${discX + (isOD ? 180 : -180)}" cy="${discY - 140}" r="6.5" fill="url(#hardExudateGrad)" />
          <circle cx="${discX + (isOD ? 195 : -195)}" cy="${discY - 135}" r="4.5" fill="url(#hardExudateGrad)" />
        </g>

        <!-- Cotton Wool Spot -->
        <ellipse cx="${discX + (isOD ? 150 : -150)}" cy="${discY - 190}" rx="24" ry="18" fill="url(#cwsGrad)" transform="rotate(25 ${discX + (isOD ? 150 : -150)} ${discY - 190})" />
        <ellipse cx="${foveaX + (isOD ? 90 : -90)}" cy="${foveaY + 160}" rx="22" ry="15" fill="url(#cwsGrad)" transform="rotate(-30 ${foveaX + (isOD ? 90 : -90)} ${foveaY + 160})" />
      ` : ''}

      ${stage >= 3 ? `
        <!-- Stage 3+ Severe NPDR: Venous Beading, extensive 4-quadrant hemorrhages & IRMA -->
        <!-- Extensive intraretinal hemorrhages -->
        <ellipse cx="280" cy="300" rx="18" ry="12" fill="#7f1d1d" opacity="0.92" />
        <ellipse cx="320" cy="730" rx="22" ry="15" fill="#7f1d1d" opacity="0.9" />
        <ellipse cx="730" cy="310" rx="25" ry="16" fill="#7f1d1d" opacity="0.95" />
        <ellipse cx="710" cy="720" rx="20" ry="14" fill="#7f1d1d" opacity="0.92" />
        <circle cx="450" cy="220" r="11" fill="#991b1b" />
        <circle cx="580" cy="800" r="13" fill="#991b1b" />
        <circle cx="210" cy="510" r="14" fill="#7f1d1d" />
        <circle cx="810" cy="530" r="15" fill="#7f1d1d" />

        <!-- Venous Beading (caliber changes / sausage-like constriction on major venule) -->
        <ellipse cx="${discX + (isOD ? 85 : -85)}" cy="${discY - 165}" rx="14" ry="9" fill="#520505" transform="rotate(35 ${discX + (isOD ? 85 : -85)} ${discY - 165})" />
        <ellipse cx="${discX + (isOD ? 105 : -105)}" cy="${discY - 195}" rx="16" ry="10" fill="#520505" transform="rotate(35 ${discX + (isOD ? 105 : -105)} ${discY - 195})" />
        
        <!-- IRMA (Intraretinal microvascular shunt vessels with tortuous loops) -->
        <path d="M ${foveaX + (isOD ? 130 : -130)} ${foveaY - 130} Q ${foveaX + (isOD ? 145 : -145)} ${foveaY - 110}, ${foveaX + (isOD ? 135 : -135)} ${foveaY - 95} T ${foveaX + (isOD ? 160 : -160)} ${foveaY - 80}" 
              fill="none" stroke="#dc2626" stroke-width="3" stroke-linecap="round" opacity="0.9" />
        <path d="M ${discX + (isOD ? -60 : 60)} ${discY + 110} Q ${discX + (isOD ? -80 : 80)} ${discY + 125}, ${discX + (isOD ? -65 : 65)} ${discY + 145} T ${discX + (isOD ? -90 : 90)} ${discY + 165}" 
              fill="none" stroke="#ef4444" stroke-width="3" stroke-linecap="round" opacity="0.9" />
      ` : ''}

      ${stage >= 4 ? `
        <!-- Stage 4 PDR: Neovascularization on Disc (NVD), NVE, Pre-retinal / Vitreous Hemorrhage -->
        <!-- NVD: Fine sea-fan arborization of fragile vessels directly on and spilling over the optic disc margin -->
        <g stroke="#ef4444" stroke-width="2" fill="none" opacity="0.95">
          <path d="M ${discX} ${discY - 10} Q ${discX + 15} ${discY - 40}, ${discX + 35} ${discY - 55}" />
          <path d="M ${discX} ${discY - 10} Q ${discX - 20} ${discY - 35}, ${discX - 35} ${discY - 60}" />
          <path d="M ${discX + 15} ${discY - 40} Q ${discX + 25} ${discY - 50}, ${discX + 45} ${discY - 45}" />
          <path d="M ${discX - 10} ${discY + 10} Q ${discX - 30} ${discY + 35}, ${discX - 45} ${discY + 50}" />
          <path d="M ${discX + 10} ${discY + 10} Q ${discX + 25} ${discY + 40}, ${discX + 40} ${discY + 60}" />
        </g>
        
        <!-- Vitreous / Preretinal Sub-hyaloid D-shaped boat Hemorrhage -->
        <path d="M ${foveaX + (isOD ? 80 : -80)} ${foveaY + 90} Q ${foveaX + (isOD ? 170 : -170)} ${foveaY + 190}, ${foveaX + (isOD ? 240 : -240)} ${foveaY + 110} Z" 
              fill="#3a0404" opacity="0.88" />
        <path d="M ${foveaX + (isOD ? 85 : -85)} ${foveaY + 95} Q ${foveaX + (isOD ? 165 : -165)} ${foveaY + 180}, ${foveaX + (isOD ? 230 : -230)} ${foveaY + 112} Z" 
              fill="#6b0d0d" opacity="0.9" />

        <!-- Fibrous proliferation band -->
        <path d="M ${discX + (isOD ? 20 : -20)} ${discY - 20} Q ${foveaX} ${discY - 140}, ${foveaX + (isOD ? 100 : -100)} ${foveaY - 70}" 
              fill="none" stroke="#f1f5f9" stroke-width="4.5" stroke-dasharray="6,3" opacity="0.45" />
      ` : ''}

      ${hasDME ? `
        <!-- DME: Macular Edema Ring of Lipid Hard Exudates surrounding Fovea & Retinal Thickening Glare -->
        <ellipse cx="${foveaX}" cy="${foveaY}" rx="65" ry="60" fill="#fef08a" opacity="0.18" filter="url(#cwsGrad)" />
        <g fill="url(#hardExudateGrad)" opacity="0.95">
          <circle cx="${foveaX - 35}" cy="${foveaY - 30}" r="4.5" />
          <circle cx="${foveaX - 45}" cy="${foveaY - 15}" r="5.5" />
          <circle cx="${foveaX - 40}" cy="${foveaY + 20}" r="5" />
          <circle cx="${foveaX - 25}" cy="${foveaY + 38}" r="4.8" />
          <circle cx="${foveaX + 30}" cy="${foveaY - 32}" r="5.2" />
          <circle cx="${foveaX + 44}" cy="${foveaY - 10}" r="6.0" />
          <circle cx="${foveaX + 38}" cy="${foveaY + 24}" r="5.5" />
          <circle cx="${foveaX + 18}" cy="${foveaY + 42}" r="4.5" />
          <circle cx="${foveaX - 10}" cy="${foveaY + 45}" r="5.0" />
          <circle cx="${foveaX + 5}" cy="${foveaY - 42}" r="4.2" />
        </g>
      ` : ''}

    </g>

    <!-- Fundus Camera Outer Mask (Dark Vignette & Field of View Ring) -->
    <path d="M 0 0 L 1000 0 L 1000 1000 L 0 1000 Z M 500 35 C 243.2 35 35 243.2 35 500 C 35 756.8 243.2 965 500 965 C 756.8 965 965 756.8 965 500 C 965 243.2 756.8 35 500 35 Z" fill="#030712" />
    <circle cx="500" cy="500" r="465" fill="none" stroke="#1e293b" stroke-width="4" opacity="0.6" />
    
    <!-- Camera Orientation Mark -->
    <text x="50" y="85" fill="#64748b" font-family="'JetBrains Mono', monospace" font-size="24" font-weight="600">${eye}</text>
    <text x="50" y="115" fill="#475569" font-family="'JetBrains Mono', monospace" font-size="14">45° FOV</text>
  </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

export const SAMPLE_PATIENTS: PatientRecord[] = [
  {
    id: 'PAT-84920',
    mrn: 'MRN-90281-DR',
    name: 'Eleanor Vance',
    age: 58,
    gender: 'Female',
    dob: '1968-04-12',
    phone: '+1 (555) 349-8821',
    email: 'e.vance@example.org',
    diabetesType: 'Type 2',
    durationYears: 14,
    latestHbA1c: 8.4,
    latestBP: '138/86 mmHg',
    kidneyFunction: 'Microalbuminuria',
    smokingStatus: 'Never',
    clinicalNotes: 'Patient notes mild bilateral blurring when reading. Poor glycemic control in past 18 months. Currently on Metformin + SGLT2i.',
    scans: []
  },
  {
    id: 'PAT-31094',
    mrn: 'MRN-44120-DR',
    name: 'Marcus Chen',
    age: 44,
    gender: 'Male',
    dob: '1982-11-03',
    phone: '+1 (555) 782-9014',
    email: 'm.chen@example.org',
    diabetesType: 'Type 1',
    durationYears: 22,
    latestHbA1c: 9.6,
    latestBP: '144/92 mmHg',
    kidneyFunction: 'Macroalbuminuria',
    smokingStatus: 'Former',
    clinicalNotes: 'Reports floaters and dark spots in right visual field for 2 weeks. Urgent evaluation requested by primary endocrinologist.',
    scans: []
  },
  {
    id: 'PAT-59201',
    mrn: 'MRN-77341-DR',
    name: 'Sophia Rodriguez',
    age: 63,
    gender: 'Female',
    dob: '1963-08-27',
    phone: '+1 (555) 492-1200',
    email: 's.rodriguez@example.org',
    diabetesType: 'Type 2',
    durationYears: 8,
    latestHbA1c: 6.9,
    latestBP: '124/78 mmHg',
    kidneyFunction: 'Normal',
    smokingStatus: 'Never',
    clinicalNotes: 'Routine annual diabetic eye screening. Excellent glycemic control achieved with GLP-1 RA + lifestyle changes.',
    scans: []
  }
];

export const PRESET_SCANS: RetinalScan[] = [
  {
    id: 'SCAN-NORMAL-OD',
    title: 'Normal Retina — Right Eye (OD)',
    patientId: 'PAT-59201',
    patientName: 'Sophia Rodriguez',
    patientAge: 63,
    patientGender: 'Female',
    diabetesType: 'Type 2',
    diabetesDurationYears: 8,
    hba1c: 6.9,
    bloodPressure: '124/78',
    eye: 'OD',
    captureDate: '2026-08-10',
    imageQuality: 'Excellent',
    qualityScore: 98.4,
    predictedStage: 0,
    stageConfidence: 99.2,
    classProbabilities: {
      stage0: 0.992,
      stage1: 0.006,
      stage2: 0.001,
      stage3: 0.0005,
      stage4: 0.0005
    },
    dmeStatus: 'none',
    dmeConfidence: 99.7,
    imageUrl: generateSyntheticFundusSVG({ eye: 'OD', stage: 0, hasDME: false }),
    thumbnailUrl: generateSyntheticFundusSVG({ eye: 'OD', stage: 0, hasDME: false }),
    description: 'Crisp optic nerve head, healthy pink neuroretinal rim, well-defined foveal avascular zone, normal caliber vascular tree without microvascular lesions.',
    clinicalSummary: 'Stage 0 (No Diabetic Retinopathy). Fovea is dry with normal light reflex. No microaneurysms, hemorrhages, or exudates identified.',
    treatmentRecommendations: [
      'Maintain annual dilated funduscopic screening (12 months)',
      'Reinforce strict glycemic target (HbA1c < 7.0%) and normotension (< 130/80 mmHg)',
      'Educate patient on visual symptoms (floaters, distortion, sudden vision drop)'
    ],
    lesions: [],
    quadrants: [
      { name: 'Superior-Temporal', code: 'ST', hemorrhageSeverity: 'none', microaneurysmCount: 0, hardExudateCount: 0, cottonWoolSpotCount: 0, hasVenousBeading: false, hasIRMA: false, hasNeovascularization: false },
      { name: 'Inferior-Temporal', code: 'IT', hemorrhageSeverity: 'none', microaneurysmCount: 0, hardExudateCount: 0, cottonWoolSpotCount: 0, hasVenousBeading: false, hasIRMA: false, hasNeovascularization: false },
      { name: 'Superior-Nasal', code: 'SN', hemorrhageSeverity: 'none', microaneurysmCount: 0, hardExudateCount: 0, cottonWoolSpotCount: 0, hasVenousBeading: false, hasIRMA: false, hasNeovascularization: false },
      { name: 'Inferior-Nasal', code: 'IN', hemorrhageSeverity: 'none', microaneurysmCount: 0, hardExudateCount: 0, cottonWoolSpotCount: 0, hasVenousBeading: false, hasIRMA: false, hasNeovascularization: false },
    ],
    fourTwoOneRule: {
      fourQuadrantsHemorrhages: false,
      twoQuadrantsVenousBeading: false,
      oneQuadrantIRMA: false,
      meetsCriteriaForSevereNPDR: false
    }
  },
  {
    id: 'SCAN-MILD-OS',
    title: 'Mild NPDR — Left Eye (OS)',
    patientId: 'PAT-84920',
    patientName: 'Eleanor Vance',
    patientAge: 58,
    patientGender: 'Female',
    diabetesType: 'Type 2',
    diabetesDurationYears: 14,
    hba1c: 7.6,
    bloodPressure: '132/84',
    eye: 'OS',
    captureDate: '2026-07-22',
    imageQuality: 'Good',
    qualityScore: 94.1,
    predictedStage: 1,
    stageConfidence: 93.6,
    classProbabilities: {
      stage0: 0.045,
      stage1: 0.936,
      stage2: 0.016,
      stage3: 0.002,
      stage4: 0.001
    },
    dmeStatus: 'none',
    dmeConfidence: 97.4,
    imageUrl: generateSyntheticFundusSVG({ eye: 'OS', stage: 1, hasDME: false }),
    thumbnailUrl: generateSyntheticFundusSVG({ eye: 'OS', stage: 1, hasDME: false }),
    description: 'Multiple isolated punctate microaneurysms detected in the temporal and inferior parafoveal zones. No macular edema or cotton wool spots.',
    clinicalSummary: 'Stage 1 (Mild NPDR). Earliest sign of diabetic microangiopathy with capillary pericyte loss. Low short-term risk of vision loss.',
    treatmentRecommendations: [
      'Repeat clinical fundus examination in 6 to 12 months',
      'Optimize HbA1c control (target < 7.0%) to arrest lesion progression',
      'Screen for renal microalbuminuria and dyslipidemia'
    ],
    lesions: [
      { id: 'l-1', type: 'microaneurysm', quadrant: 'ST', x: 52, y: 42, size: 'small', confidence: 0.95, notes: 'Pinpoint capillary outpouching ST' },
      { id: 'l-2', type: 'microaneurysm', quadrant: 'IT', x: 48, y: 57, size: 'small', confidence: 0.92, notes: 'Parafoveal microaneurysm IT' },
      { id: 'l-3', type: 'microaneurysm', quadrant: 'SN', x: 67, y: 41, size: 'small', confidence: 0.89, notes: 'Superior nasal microaneurysm' },
      { id: 'l-4', type: 'microaneurysm', quadrant: 'IN', x: 59, y: 64, size: 'small', confidence: 0.91, notes: 'Inferior nasal microaneurysm' },
    ],
    quadrants: [
      { name: 'Superior-Temporal', code: 'ST', hemorrhageSeverity: 'none', microaneurysmCount: 2, hardExudateCount: 0, cottonWoolSpotCount: 0, hasVenousBeading: false, hasIRMA: false, hasNeovascularization: false },
      { name: 'Inferior-Temporal', code: 'IT', hemorrhageSeverity: 'none', microaneurysmCount: 1, hardExudateCount: 0, cottonWoolSpotCount: 0, hasVenousBeading: false, hasIRMA: false, hasNeovascularization: false },
      { name: 'Superior-Nasal', code: 'SN', hemorrhageSeverity: 'none', microaneurysmCount: 1, hardExudateCount: 0, cottonWoolSpotCount: 0, hasVenousBeading: false, hasIRMA: false, hasNeovascularization: false },
      { name: 'Inferior-Nasal', code: 'IN', hemorrhageSeverity: 'none', microaneurysmCount: 1, hardExudateCount: 0, cottonWoolSpotCount: 0, hasVenousBeading: false, hasIRMA: false, hasNeovascularization: false },
    ],
    fourTwoOneRule: {
      fourQuadrantsHemorrhages: false,
      twoQuadrantsVenousBeading: false,
      oneQuadrantIRMA: false,
      meetsCriteriaForSevereNPDR: false
    }
  },
  {
    id: 'SCAN-MOD-DME-OD',
    title: 'Moderate NPDR with Center-Involved DME — Right Eye (OD)',
    patientId: 'PAT-84920',
    patientName: 'Eleanor Vance',
    patientAge: 58,
    patientGender: 'Female',
    diabetesType: 'Type 2',
    diabetesDurationYears: 14,
    hba1c: 8.4,
    bloodPressure: '138/86',
    eye: 'OD',
    captureDate: '2026-08-14',
    imageQuality: 'Good',
    qualityScore: 92.5,
    predictedStage: 2,
    stageConfidence: 89.4,
    classProbabilities: {
      stage0: 0.005,
      stage1: 0.065,
      stage2: 0.894,
      stage3: 0.032,
      stage4: 0.004
    },
    dmeStatus: 'center_involved',
    dmeConfidence: 94.8,
    imageUrl: generateSyntheticFundusSVG({ eye: 'OD', stage: 2, hasDME: true }),
    thumbnailUrl: generateSyntheticFundusSVG({ eye: 'OD', stage: 2, hasDME: true }),
    description: 'Scattered blot hemorrhages, circinate rings of yellowish hard exudates abutting the foveal avascular zone with localized macular thickening, and cotton wool spots.',
    clinicalSummary: 'Stage 2 (Moderate NPDR) with Center-Involved Diabetic Macular Edema (CSME). High risk of progressive central visual acuity decline without timely therapeutic intervention.',
    treatmentRecommendations: [
      'Prompt Ophthalmology / Retina Specialist referral (within 2 weeks)',
      'OCT (Optical Coherence Tomography) macula for baseline central subfield thickness measurement',
      'First-line Anti-VEGF intravitreal injection therapy (e.g. Aflibercept 2mg / Faricimab / Ranibizumab)',
      'Intensify medical management: HbA1c target < 7.0%, blood pressure < 130/80 mmHg, lipid-lowering with statin'
    ],
    lesions: [
      { id: 'l-m1', type: 'hemorrhage', quadrant: 'IT', x: 53, y: 63, size: 'medium', confidence: 0.94, notes: 'Blot hemorrhage inferior-temporal' },
      { id: 'l-m2', type: 'hemorrhage', quadrant: 'ST', x: 69, y: 42, size: 'medium', confidence: 0.91, notes: 'Dot hemorrhage near upper arcade' },
      { id: 'l-m3', type: 'hard_exudate', quadrant: 'macula', x: 55, y: 47, size: 'medium', confidence: 0.96, notes: 'Circinate hard exudate ring involving parafovea' },
      { id: 'l-m4', type: 'hard_exudate', quadrant: 'macula', x: 62, y: 53, size: 'large', confidence: 0.97, notes: 'Lipid deposition within 500µm of foveal center' },
      { id: 'l-m5', type: 'cotton_wool_spot', quadrant: 'ST', x: 47, y: 31, size: 'large', confidence: 0.93, notes: 'Axoplasmic flow stasis / nerve fiber layer infarct' },
      { id: 'l-m6', type: 'cotton_wool_spot', quadrant: 'IT', x: 67, y: 66, size: 'medium', confidence: 0.90, notes: 'Soft exudate along inferior temporal arcade' }
    ],
    quadrants: [
      { name: 'Superior-Temporal', code: 'ST', hemorrhageSeverity: 'mild', microaneurysmCount: 4, hardExudateCount: 2, cottonWoolSpotCount: 1, hasVenousBeading: false, hasIRMA: false, hasNeovascularization: false },
      { name: 'Inferior-Temporal', code: 'IT', hemorrhageSeverity: 'moderate', microaneurysmCount: 5, hardExudateCount: 3, cottonWoolSpotCount: 1, hasVenousBeading: false, hasIRMA: false, hasNeovascularization: false },
      { name: 'Superior-Nasal', code: 'SN', hemorrhageSeverity: 'mild', microaneurysmCount: 2, hardExudateCount: 0, cottonWoolSpotCount: 0, hasVenousBeading: false, hasIRMA: false, hasNeovascularization: false },
      { name: 'Inferior-Nasal', code: 'IN', hemorrhageSeverity: 'mild', microaneurysmCount: 2, hardExudateCount: 0, cottonWoolSpotCount: 0, hasVenousBeading: false, hasIRMA: false, hasNeovascularization: false },
    ],
    fourTwoOneRule: {
      fourQuadrantsHemorrhages: false,
      twoQuadrantsVenousBeading: false,
      oneQuadrantIRMA: false,
      meetsCriteriaForSevereNPDR: false
    }
  },
  {
    id: 'SCAN-SEVERE-OD',
    title: 'Severe NPDR (4-2-1 Rule) — Right Eye (OD)',
    patientId: 'PAT-31094',
    patientName: 'Marcus Chen',
    patientAge: 44,
    patientGender: 'Male',
    diabetesType: 'Type 1',
    diabetesDurationYears: 22,
    hba1c: 9.6,
    bloodPressure: '144/92',
    eye: 'OD',
    captureDate: '2026-08-02',
    imageQuality: 'Good',
    qualityScore: 91.0,
    predictedStage: 3,
    stageConfidence: 92.1,
    classProbabilities: {
      stage0: 0.001,
      stage1: 0.009,
      stage2: 0.065,
      stage3: 0.921,
      stage4: 0.004
    },
    dmeStatus: 'non_center',
    dmeConfidence: 88.3,
    imageUrl: generateSyntheticFundusSVG({ eye: 'OD', stage: 3, hasDME: false }),
    thumbnailUrl: generateSyntheticFundusSVG({ eye: 'OD', stage: 3, hasDME: false }),
    description: 'Extensive multi-quadrant intraretinal hemorrhages, conspicuous venous beading in superior temporal & nasal branches, prominent intraretinal microvascular abnormalities (IRMA).',
    clinicalSummary: 'Stage 3 (Severe NPDR). Meets 4-2-1 rule criteria (extensive hemorrhages in all 4 quadrants + venous beading in 2 quadrants + IRMA). 50% chance of progression to Proliferative DR in 12 months.',
    treatmentRecommendations: [
      'Urgent Retina Specialist evaluation within 2 to 4 weeks',
      'Fluorescein Angiography (FA) / Widefield OCTA to delineate retinal capillary non-perfusion zones',
      'Consider prophylactic Panretinal Photocoagulation (PRP) or Anti-VEGF if patient follow-up compliance is uncertain',
      'Strict nephrology & endocrinology co-management'
    ],
    lesions: [
      { id: 'l-s1', type: 'hemorrhage', quadrant: 'ST', x: 28, y: 30, size: 'large', confidence: 0.98, notes: 'Dense intraretinal hemorrhage ST' },
      { id: 'l-s2', type: 'hemorrhage', quadrant: 'IT', x: 32, y: 73, size: 'large', confidence: 0.97, notes: 'Blot hemorrhage IT' },
      { id: 'l-s3', type: 'hemorrhage', quadrant: 'SN', x: 73, y: 31, size: 'large', confidence: 0.96, notes: 'Hemorrhage SN' },
      { id: 'l-s4', type: 'hemorrhage', quadrant: 'IN', x: 71, y: 72, size: 'large', confidence: 0.95, notes: 'Hemorrhage IN' },
      { id: 'l-s5', type: 'venous_beading', quadrant: 'ST', x: 41, y: 33, size: 'medium', confidence: 0.94, notes: 'Sausage-link caliber dilation on superior temporal venule' },
      { id: 'l-s6', type: 'venous_beading', quadrant: 'SN', x: 25, y: 38, size: 'medium', confidence: 0.92, notes: 'Venous caliber beading superior nasal branch' },
      { id: 'l-s7', type: 'irma', quadrant: 'ST', x: 71, y: 37, size: 'medium', confidence: 0.93, notes: 'Tortuous intraretinal shunt vessel loops (IRMA)' }
    ],
    quadrants: [
      { name: 'Superior-Temporal', code: 'ST', hemorrhageSeverity: 'severe', microaneurysmCount: 14, hardExudateCount: 2, cottonWoolSpotCount: 2, hasVenousBeading: true, hasIRMA: true, hasNeovascularization: false },
      { name: 'Inferior-Temporal', code: 'IT', hemorrhageSeverity: 'severe', microaneurysmCount: 16, hardExudateCount: 3, cottonWoolSpotCount: 1, hasVenousBeading: false, hasIRMA: false, hasNeovascularization: false },
      { name: 'Superior-Nasal', code: 'SN', hemorrhageSeverity: 'severe', microaneurysmCount: 11, hardExudateCount: 1, cottonWoolSpotCount: 1, hasVenousBeading: true, hasIRMA: false, hasNeovascularization: false },
      { name: 'Inferior-Nasal', code: 'IN', hemorrhageSeverity: 'severe', microaneurysmCount: 12, hardExudateCount: 0, cottonWoolSpotCount: 0, hasVenousBeading: false, hasIRMA: false, hasNeovascularization: false },
    ],
    fourTwoOneRule: {
      fourQuadrantsHemorrhages: true,
      twoQuadrantsVenousBeading: true,
      oneQuadrantIRMA: true,
      meetsCriteriaForSevereNPDR: true
    }
  },
  {
    id: 'SCAN-PDR-OD',
    title: 'High-Risk Proliferative Diabetic Retinopathy (PDR) — Right Eye (OD)',
    patientId: 'PAT-31094',
    patientName: 'Marcus Chen',
    patientAge: 44,
    patientGender: 'Male',
    diabetesType: 'Type 1',
    diabetesDurationYears: 22,
    hba1c: 9.6,
    bloodPressure: '144/92',
    eye: 'OD',
    captureDate: '2026-08-18',
    imageQuality: 'Good',
    qualityScore: 89.2,
    predictedStage: 4,
    stageConfidence: 97.8,
    classProbabilities: {
      stage0: 0.0001,
      stage1: 0.0005,
      stage2: 0.008,
      stage3: 0.0134,
      stage4: 0.978
    },
    dmeStatus: 'center_involved',
    dmeConfidence: 91.2,
    imageUrl: generateSyntheticFundusSVG({ eye: 'OD', stage: 4, hasDME: true }),
    thumbnailUrl: generateSyntheticFundusSVG({ eye: 'OD', stage: 4, hasDME: true }),
    description: 'Prominent Neovascularization of the Optic Disc (NVD > 1/3 disc area), preretinal boat-shaped sub-hyaloid hemorrhage, fibrous traction scaffold.',
    clinicalSummary: 'Stage 4 (Proliferative DR - High Risk PDR). Frank neovascular growth with acute vitreous hemorrhage risk and tractional retinal detachment danger. Requires immediate emergency ophthalmologic intervention.',
    treatmentRecommendations: [
      'EMERGENCY Retina Specialist Consultation (< 1 week)',
      'Immediate Panretinal Photocoagulation (PRP Laser) to ablate ischemic peripheral retina',
      'Intravitreal Anti-VEGF (e.g., Aflibercept / Ranibizumab) for rapid neovascular regression',
      'Monitor for tractional retinal detachment; prepare for 25G/27G Pars Plana Vitrectomy if vitreous hemorrhage fails to clear'
    ],
    lesions: [
      { id: 'l-p1', type: 'neovascularization', quadrant: 'macula', x: 32, y: 50, size: 'large', confidence: 0.99, notes: 'High-risk Neovascularization of the Disc (NVD)' },
      { id: 'l-p2', type: 'hemorrhage', quadrant: 'IT', x: 66, y: 64, size: 'large', confidence: 0.98, notes: 'Preretinal boat-shaped sub-hyaloid hemorrhage' },
      { id: 'l-p3', type: 'neovascularization', quadrant: 'ST', x: 58, y: 32, size: 'medium', confidence: 0.95, notes: 'Neovascularization Elsewhere (NVE)' },
      { id: 'l-p4', type: 'hard_exudate', quadrant: 'macula', x: 58, y: 51, size: 'medium', confidence: 0.94, notes: 'Macular lipid deposition with CSME' }
    ],
    quadrants: [
      { name: 'Superior-Temporal', code: 'ST', hemorrhageSeverity: 'very_severe', microaneurysmCount: 22, hardExudateCount: 4, cottonWoolSpotCount: 3, hasVenousBeading: true, hasIRMA: true, hasNeovascularization: true },
      { name: 'Inferior-Temporal', code: 'IT', hemorrhageSeverity: 'very_severe', microaneurysmCount: 25, hardExudateCount: 5, cottonWoolSpotCount: 2, hasVenousBeading: true, hasIRMA: true, hasNeovascularization: true },
      { name: 'Superior-Nasal', code: 'SN', hemorrhageSeverity: 'severe', microaneurysmCount: 15, hardExudateCount: 2, cottonWoolSpotCount: 1, hasVenousBeading: true, hasIRMA: true, hasNeovascularization: true },
      { name: 'Inferior-Nasal', code: 'IN', hemorrhageSeverity: 'severe', microaneurysmCount: 18, hardExudateCount: 1, cottonWoolSpotCount: 1, hasVenousBeading: true, hasIRMA: false, hasNeovascularization: false },
    ],
    fourTwoOneRule: {
      fourQuadrantsHemorrhages: true,
      twoQuadrantsVenousBeading: true,
      oneQuadrantIRMA: true,
      meetsCriteriaForSevereNPDR: true
    }
  }
];

// Link presets to patient records
SAMPLE_PATIENTS[0].scans = [PRESET_SCANS[1], PRESET_SCANS[2]];
SAMPLE_PATIENTS[1].scans = [PRESET_SCANS[3], PRESET_SCANS[4]];
SAMPLE_PATIENTS[2].scans = [PRESET_SCANS[0]];
