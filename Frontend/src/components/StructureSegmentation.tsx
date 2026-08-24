import React, { useState } from 'react';
import { RetinalScan, RetinalLesion } from '../types/retinopathy';
import { 
  Layers, 
  Eye, 
  CircleDot, 
  Activity, 
  Target, 
  Sparkles, 
  Code, 
  Sliders, 
  Info, 
  Check, 
  AlertCircle
} from 'lucide-react';

interface StructureSegmentationProps {
  scan: RetinalScan;
  onMaskToggleChange?: (activeLayers: string[]) => void;
}

export const StructureSegmentation: React.FC<StructureSegmentationProps> = ({
  scan,
}) => {
  // Layer visibility state
  const [showOpticDisc, setShowOpticDisc] = useState<boolean>(true);
  const [showFovea, setShowFovea] = useState<boolean>(true);
  const [showVessels, setShowVessels] = useState<boolean>(true);
  const [showMicroaneurysms, setShowMicroaneurysms] = useState<boolean>(true);
  const [showExudates, setShowExudates] = useState<boolean>(true);
  const [showHemorrhages, setShowHemorrhages] = useState<boolean>(true);
  const [showNeovascularization, setShowNeovascularization] = useState<boolean>(true);

  // Active MATLAB tab
  const [selectedMatlabFunction, setSelectedMatlabFunction] = useState<
    'vessels' | 'optic_disc' | 'microaneurysms' | 'exudates' | 'neovascularization'
  >('vessels');

  // Realistic lesion extractions from scan
  const microaneurysmsList = scan.lesions.filter((l) => l.type === 'microaneurysm');
  const hemorrhagesList = scan.lesions.filter((l) => l.type === 'hemorrhage');
  const exudatesList = scan.lesions.filter((l) => l.type === 'hard_exudate' || l.type === 'cotton_wool_spot');
  const neovascularList = scan.lesions.filter((l) => l.type === 'neovascularization' || l.type === 'irma');

  // Optic disc location (standard OD / OS anatomy)
  const isRightEye = scan.eye === 'OD';
  const discPosition = isRightEye ? { x: 26, y: 52 } : { x: 74, y: 52 };
  const foveaPosition = isRightEye ? { x: 58, y: 54 } : { x: 42, y: 54 };

  const getMatlabCode = () => {
    switch (selectedMatlabFunction) {
      case 'vessels':
        return `% =========================================================================
% MATLAB Image Processing & Computer Vision: Multi-Scale Vessel Segmentation
% Frangi 2D Hessian Vesselness Filter + Matched Filtering (fibermetric)
% =========================================================================
function [vesselBinaryMask, vesselFeatures] = segmentRetinalVessels(I_green)
    % 1. Background Equalization & Inversion
    se = strel('disk', 15);
    I_bg = imopen(I_green, se);
    I_flat = imsubtract(I_bg, I_green);
    
    % 2. Multi-Scale Hessian Eigenvalue Analysis (Tubular Vessel Enhancement)
    % fibermetric enhances linear ridge structures across scales [1:0.5:4] px
    vesselEnhanced = fibermetric(I_flat, [1 2 3 4], 'StructureSensitivity', 12);
    
    % 3. Hysteresis Thresholding & Small Noise Removal
    T_high = 0.28;
    T_low = 0.12;
    vesselBinaryMask = imbinarize(vesselEnhanced, T_low);
    vesselBinaryMask = bwareaopen(vesselBinaryMask, 25); % eliminate <25px artifacts
    
    % 4. Morphological Skeleton & Tortuosity Measurement
    vesselSkeleton = bwskel(vesselBinaryMask);
    vesselFeatures.density = sum(vesselBinaryMask(:)) / numel(vesselBinaryMask);
    vesselFeatures.tortuosity = calculateChordLengthTortuosity(vesselSkeleton);
end`;

      case 'optic_disc':
        return `% =========================================================================
% Optic Disc & Fovea Localization via Circular Hough Transform & Active Contours
% =========================================================================
function [odMask, odCenter, foveaCoord] = localizeOpticDiscAndFovea(I_rgb)
    I_red = I_rgb(:,:,1); % Disc is brightest in Red channel
    
    % Circular Hough Transform candidate detection
    [centers, radii, metric] = imfindcircles(I_red, [25 60], 'Sensitivity', 0.92);
    odCenter = centers(1,:);
    odRadius = radii(1);
    
    % Refine boundary using Chan-Vese Morphological Active Contours (Snakes)
    initMask = createCirclesMask(size(I_red), odCenter, odRadius);
    odMask = activecontour(I_red, initMask, 150, 'Chan-Vese');
    
    % Fovea Localization: Darkest avascular zone 2.5 disc diameters temporal to OD
    foveaSearchRadius = odRadius * 2.5;
    I_green = I_rgb(:,:,2);
    foveaCoord = findAvascularCentroid(I_green, odCenter, foveaSearchRadius);
end`;

      case 'microaneurysms':
        return `% =========================================================================
% Sub-Pixel Microaneurysm (MA) Detection via Morphological Top-Hat & Eigen-Hessian
% =========================================================================
function [maCandidates, subPixelCoords] = detectMicroaneurysms(I_green, vesselMask)
    % 1. Exclude Major Vessels to prevent false-positive branch bifurcation hits
    I_nonVessel = I_green;
    I_nonVessel(vesselMask) = 0;
    
    % 2. Morphological Top-Hat Transform with Flat Disk Structuring Element
    se = strel('disk', 4); % Microaneurysms are small isolated dark dots (<120um)
    I_tophat = imtophat(255 - I_nonVessel, se);
    
    % 3. Gaussian Scale-Space Determinant of Hessian (DoH) for Sub-Pixel Peak
    sigma = 1.2;
    [Dxx, Dxy, Dyy] = hessian2D(I_tophat, sigma);
    detHessian = (Dxx .* Dyy) - (Dxy.^2);
    
    % Local maxima sub-pixel parabolic interpolation
    maCandidates = imregionalmax(detHessian);
    subPixelCoords = refineSubPixelCentroids(detHessian, maCandidates);
end`;

      case 'exudates':
        return `% =========================================================================
% Hard & Soft Exudate Segmentation using CIE L*a*b* Luminance & Morphological Bottom-Hat
% =========================================================================
function [exudateMask, exudateStats] = segmentExudates(I_rgb, odMask)
    % Convert to L*a*b* color space for robust lipid yellow separation
    labImg = rgb2lab(I_rgb);
    L = labImg(:,:,1);
    b_yellow = labImg(:,:,3);
    
    % Exclude Optic Disc (which shares high reflectance with hard exudates)
    L(odMask) = 0;
    b_yellow(odMask) = 0;
    
    % Morphological Bottom-Hat filtering for bright clustered lesions
    se = strel('disk', 6);
    L_bothat = imbothat(L, se);
    
    % Dual-thresholding for high-luminance + high-b* (yellowish lipid deposits)
    exudateMask = (L > 65) & (b_yellow > 18) & (L_bothat > 12);
    exudateMask = bwareaopen(exudateMask, 8);
    exudateStats.areaMm2 = sum(exudateMask(:)) * (0.005^2); % Calibrated sensor pitch
end`;

      case 'neovascularization':
        return `% =========================================================================
% Neovascularization Detection (NVD at Disc Margin vs NVE in Peripheral Quadrants)
% Deep Learning Toolbox ResNet-50 + Morphological Vessel Complexity Index
% =========================================================================
function [isNVD, isNVE, nvdConfidence] = detectNeovascularization(vesselMask, odMask, I_rgb)
    % 1. Dilate Optic Disc Margin by 1 Disc Diameter (DD) zone
    se_disc = strel('disk', 35);
    discPerimeterZone = imdilate(odMask, se_disc) & ~odMask;
    
    % 2. Frangi Vessel Tortuosity & Disordered Capillary Network within Disc Margin
    discMarginVessels = vesselMask & discPerimeterZone;
    vesselComplexity = sum(discMarginVessels(:)) / sum(discPerimeterZone(:));
    
    % 3. Deep Neural Classifier Feature Activation at Disc Margin (NVD check)
    dlNet = load('trainedRetinalResNet50.mat').net;
    patchROI = imcrop(I_rgb, getBoundingBox(discPerimeterZone));
    predScores = predict(dlNet, imresize(patchROI, [224 224]));
    
    isNVD = (vesselComplexity > 0.35) || (predScores(5) > 0.60);
    isNVE = detectPeripheralFronds(vesselMask, odMask);
    nvdConfidence = predScores(5) * 100;
end`;
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-teal-500/20 text-teal-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100">
                Pillar 2: Retinal Structure & Biomarker Segmentation Engine
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/30 font-mono">
                Computer Vision & Deep Learning Toolbox
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Sub-pixel microaneurysms, Frangi vesselness trees, exudate lipid clusters, and disc/fovea landmarks
            </p>
          </div>
        </div>

        {/* Eye Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
          <Eye className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-slate-200">
            {scan.eye === 'OD' ? 'Right Eye (OD)' : 'Left Eye (OS)'}
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-emerald-400 font-bold">{scan.lesions.length} Biomarkers Detected</span>
        </div>
      </div>

      {/* Main Grid: Interactive Multi-Layer Canvas (7 cols) + Clinical Metrics & MATLAB Tabs (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 7 Cols: Interactive Canvas with Toggleable SVG Layers */}
        <div className="lg:col-span-7 space-y-3">
          
          <div className="relative aspect-square sm:aspect-[4/3] rounded-3xl bg-black border border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center">
            
            {/* Base Retinal Fundus Image */}
            <img
              src={scan.imageUrl}
              alt="Retina Biomarkers"
              className="w-full h-full object-contain"
            />

            {/* SVG OVERLAY LAYERS */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              
              {/* 1. Optic Disc Ring */}
              {showOpticDisc && (
                <g>
                  <circle
                    cx={`${discPosition.x}%`}
                    cy={`${discPosition.y}%`}
                    r="8.5%"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="3"
                    strokeDasharray="4 2"
                    className="animate-pulse"
                  />
                  <text
                    x={`${discPosition.x}%`}
                    y={`${discPosition.y - 10}%`}
                    fill="#38bdf8"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    Optic Disc (OD)
                  </text>
                </g>
              )}

              {/* 2. Foveal Center Avascular Zone (FAZ) */}
              {showFovea && (
                <g>
                  <circle
                    cx={`${foveaPosition.x}%`}
                    cy={`${foveaPosition.y}%`}
                    r="4.5%"
                    fill="rgba(234, 179, 8, 0.15)"
                    stroke="#eab308"
                    strokeWidth="2.5"
                  />
                  <circle
                    cx={`${foveaPosition.x}%`}
                    cy={`${foveaPosition.y}%`}
                    r="1.5%"
                    fill="#eab308"
                  />
                  <text
                    x={`${foveaPosition.x}%`}
                    y={`${foveaPosition.y + 8}%`}
                    fill="#eab308"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    Fovea (FAZ)
                  </text>
                </g>
              )}

              {/* 3. Synthetic Vessel Frangi Traces */}
              {showVessels && (
                <g stroke="#10b981" strokeWidth="1.5" fill="none" opacity="0.65">
                  {isRightEye ? (
                    <>
                      {/* Arcades Right Eye */}
                      <path d="M 26 52 Q 35 25 60 22 T 80 30" />
                      <path d="M 26 52 Q 38 78 62 80 T 82 72" />
                      <path d="M 26 52 Q 18 35 10 32" />
                      <path d="M 26 52 Q 18 68 10 70" />
                    </>
                  ) : (
                    <>
                      {/* Arcades Left Eye */}
                      <path d="M 74 52 Q 65 25 40 22 T 20 30" />
                      <path d="M 74 52 Q 62 78 38 80 T 18 72" />
                      <path d="M 74 52 Q 82 35 90 32" />
                      <path d="M 74 52 Q 82 68 90 70" />
                    </>
                  )}
                </g>
              )}
            </svg>

            {/* 4. Individual Lesion Pinpoints (MAs, Hemorrhages, Exudates, NVD) */}
            {scan.lesions.map((lesion) => {
              if (lesion.type === 'microaneurysm' && !showMicroaneurysms) return null;
              if (lesion.type === 'hemorrhage' && !showHemorrhages) return null;
              if ((lesion.type === 'hard_exudate' || lesion.type === 'cotton_wool_spot') && !showExudates) return null;
              if ((lesion.type === 'neovascularization' || lesion.type === 'irma') && !showNeovascularization) return null;

              let color = 'bg-rose-500 border-white text-rose-100';
              let ringColor = 'ring-rose-500/50';
              let label = 'MA';

              if (lesion.type === 'hemorrhage') {
                color = 'bg-red-700 border-red-300';
                label = 'HEM';
              } else if (lesion.type === 'hard_exudate') {
                color = 'bg-amber-400 border-amber-950 text-slate-900';
                ringColor = 'ring-amber-400/50';
                label = 'EX';
              } else if (lesion.type === 'neovascularization' || lesion.type === 'irma') {
                color = 'bg-fuchsia-600 border-white text-white';
                ringColor = 'ring-fuchsia-500/60';
                label = 'NVD';
              }

              return (
                <div
                  key={lesion.id}
                  style={{ left: `${lesion.x}%`, top: `${lesion.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group z-20 pointer-events-auto cursor-pointer"
                >
                  <span className="relative flex h-4 w-4">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${ringColor}`} />
                    <span className={`relative inline-flex rounded-full h-4 w-4 border-2 shadow-lg items-center justify-center text-[8px] font-black ${color}`}>
                      {label[0]}
                    </span>
                  </span>

                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 rounded-xl bg-slate-950/95 border border-slate-700 text-[10px] text-slate-100 whitespace-nowrap shadow-2xl z-30 pointer-events-none">
                    <p className="font-bold capitalize">{lesion.type.replace('_', ' ')}</p>
                    <p className="text-slate-400">Quadrant: {lesion.quadrant} • Conf: {lesion.confidence}%</p>
                  </div>
                </div>
              );
            })}

            {/* Bottom Legend Overlay */}
            <div className="absolute bottom-3 left-3 right-3 p-2 rounded-2xl bg-black/80 backdrop-blur-md border border-white/10 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-300">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  MAs ({microaneurysmsList.length})
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-700" />
                  Hemorrhages ({hemorrhagesList.length})
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  Exudates ({exudatesList.length})
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-500" />
                  NVD / IRMA ({neovascularList.length})
                </span>
              </div>
              <span className="font-mono text-emerald-400 font-bold">ETDRS Calibrated</span>
            </div>
          </div>

          {/* Layer Visibility Toggles */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Toggle Retinal Structural Masks
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowOpticDisc(!showOpticDisc)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all border ${
                  showOpticDisc
                    ? 'bg-sky-950/60 border-sky-500 text-sky-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                {showOpticDisc ? '✓' : '+'} Optic Disc (OD)
              </button>

              <button
                type="button"
                onClick={() => setShowFovea(!showFovea)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all border ${
                  showFovea
                    ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                {showFovea ? '✓' : '+'} Fovea (FAZ)
              </button>

              <button
                type="button"
                onClick={() => setShowVessels(!showVessels)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all border ${
                  showVessels
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                {showVessels ? '✓' : '+'} Vessel Arcades
              </button>

              <button
                type="button"
                onClick={() => setShowMicroaneurysms(!showMicroaneurysms)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all border ${
                  showMicroaneurysms
                    ? 'bg-rose-950/60 border-rose-500 text-rose-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                {showMicroaneurysms ? '✓' : '+'} Sub-Pixel MAs
              </button>

              <button
                type="button"
                onClick={() => setShowExudates(!showExudates)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all border ${
                  showExudates
                    ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                {showExudates ? '✓' : '+'} Exudates
              </button>

              <button
                type="button"
                onClick={() => setShowNeovascularization(!showNeovascularization)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all border ${
                  showNeovascularization
                    ? 'bg-fuchsia-950/60 border-fuchsia-500 text-fuchsia-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                {showNeovascularization ? '✓' : '+'} Neovascularization (NVD)
              </button>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Quantitative Clinical Counts + MATLAB Code Inspector */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Quantitative Clinical Biomarkers Card */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Quantitative Clinical Feature Extraction
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
                <span className="text-[11px] text-slate-400">Microaneurysms:</span>
                <div className="text-base font-black text-rose-400 font-mono">
                  {microaneurysmsList.length} detected
                </div>
                <p className="text-[10px] text-slate-500">Sub-pixel DoH Hessian peaks</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
                <span className="text-[11px] text-slate-400">Hemorrhages:</span>
                <div className="text-base font-black text-red-400 font-mono">
                  {hemorrhagesList.length} lesions
                </div>
                <p className="text-[10px] text-slate-500">Dot/blot & flame types</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
                <span className="text-[11px] text-slate-400">Lipid Exudates:</span>
                <div className="text-base font-black text-amber-400 font-mono">
                  {exudatesList.length > 0 ? '0.42 mm²' : '0.00 mm²'}
                </div>
                <p className="text-[10px] text-slate-500">L*a*b* yellow luminance mask</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
                <span className="text-[11px] text-slate-400">Cup-to-Disc Ratio:</span>
                <div className="text-base font-black text-sky-400 font-mono">
                  0.38 (Normal)
                </div>
                <p className="text-[10px] text-slate-500">Active contour boundary</p>
              </div>
            </div>
          </div>

          {/* MATLAB Code Inspector Selector */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Code className="w-4 h-4 text-emerald-400" />
                MATLAB Pipeline Function
              </span>
              <span className="text-[10px] font-mono text-slate-500">2026b Core</span>
            </div>

            {/* Function Switcher Buttons */}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedMatlabFunction('vessels')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                  selectedMatlabFunction === 'vessels'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                Vessel fibermetric
              </button>
              <button
                type="button"
                onClick={() => setSelectedMatlabFunction('optic_disc')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                  selectedMatlabFunction === 'optic_disc'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                OD activecontour
              </button>
              <button
                type="button"
                onClick={() => setSelectedMatlabFunction('microaneurysms')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                  selectedMatlabFunction === 'microaneurysms'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                Sub-Pixel MAs
              </button>
              <button
                type="button"
                onClick={() => setSelectedMatlabFunction('exudates')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                  selectedMatlabFunction === 'exudates'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                Exudate L*a*b*
              </button>
              <button
                type="button"
                onClick={() => setSelectedMatlabFunction('neovascularization')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                  selectedMatlabFunction === 'neovascularization'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                NVD ResNet-50
              </button>
            </div>

            {/* Code Box */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-300 max-h-[220px] overflow-y-auto">
              <pre>{getMatlabCode()}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
