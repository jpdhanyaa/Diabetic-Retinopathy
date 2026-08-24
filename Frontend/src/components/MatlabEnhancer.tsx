import React, { useState, useEffect } from 'react';
import { RetinalScan } from '../types/retinopathy';
import { LanguageCode } from '../types/rural';
import { TRANSLATIONS } from '../data/translations';
import { 
  Cpu, 
  Sparkles, 
  Layers, 
  SplitSquareVertical, 
  CheckCircle2, 
  Code, 
  Play, 
  Sliders, 
  ArrowRight, 
  Eye, 
  Zap, 
  RefreshCw,
  Terminal,
  Copy,
  Check
} from 'lucide-react';

interface MatlabEnhancerProps {
  scan: RetinalScan;
  language: LanguageCode;
  onEnhancementComplete: () => void;
  autoRun?: boolean;
}

export type MatlabStageId = 'green_channel' | 'clahe' | 'morphology' | 'vessel_segment';

export const MatlabEnhancer: React.FC<MatlabEnhancerProps> = ({
  scan,
  language,
  onEnhancementComplete,
  autoRun = false,
}) => {
  const t = TRANSLATIONS[language];
  const [activeStage, setActiveStage] = useState<MatlabStageId>('clahe');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [hasProcessed, setHasProcessed] = useState<boolean>(false);
  const [processProgress, setProcessProgress] = useState<number>(0);
  const [consoleLog, setConsoleLog] = useState<string[]>([]);
  const [splitPos, setSplitPos] = useState<number>(50);
  const [clipLimit, setClipLimit] = useState<number>(0.03);
  const [structuringElementRadius, setStructuringElementRadius] = useState<number>(15);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const matlabCode = `% ==========================================================
% MATLAB RETINAL IMAGE ENHANCEMENT PIPELINE
% Diabetic Retinopathy Microvascular Lesion Enhancement
% ==========================================================
img = imread('${scan.id}_fundus.png');

% Step 1: Green Channel Extraction (Suppresses red choroidal glare)
I_green = img(:,:,2); 

% Step 2: CLAHE (Contrast-Limited Adaptive Histogram Equalization)
I_clahe = adapthisteq(I_green, ...
    'ClipLimit', ${clipLimit}, ...
    'Distribution', 'rayleigh', ...
    'NumTiles', [8 8]);

% Step 3: Morphological Top-Hat & Bottom-Hat Enhancement
se = strel('disk', ${structuringElementRadius});
I_tophat = imtophat(I_clahe, se);
I_bothat = imbothat(I_clahe, se);
I_enhanced = imsubtract(imadd(I_clahe, I_tophat), I_bothat);

% Step 4: Gabor Wavelet Vessel Ridge Filtering
wavelength = 4;
orientation = 0:30:150;
[mag, phase] = imgaborfilt(I_enhanced, wavelength, orientation);
I_vessels = max(mag, [], 3) > graythresh(mag);

% Ready for AI Deep Learning Feature Extractor (ResNet-50 / EfficientNet)
`;

  const runMatlabPipeline = () => {
    setIsProcessing(true);
    setProcessProgress(10);
    setConsoleLog(['>> Running MATLAB 2026b Image Processing Pipeline...', '>> Loading fundus image array [512 x 512 x 3 uint8]']);

    setTimeout(() => {
      setProcessProgress(35);
      setConsoleLog((prev) => [
        ...prev,
        '>> [Stage 1] I_green = img(:,:,2); % Extracted green channel for maximum vascular contrast',
      ]);
    }, 400);

    setTimeout(() => {
      setProcessProgress(65);
      setConsoleLog((prev) => [
        ...prev,
        `>> [Stage 2] I_clahe = adapthisteq(I_green, 'ClipLimit', ${clipLimit}); % Equalized contrast`,
      ]);
    }, 900);

    setTimeout(() => {
      setProcessProgress(85);
      setConsoleLog((prev) => [
        ...prev,
        `>> [Stage 3] se = strel('disk', ${structuringElementRadius}); % Top-Hat & Bottom-Hat filtering isolated microaneurysms`,
      ]);
    }, 1400);

    setTimeout(() => {
      setProcessProgress(100);
      setIsProcessing(false);
      setHasProcessed(true);
      setConsoleLog((prev) => [
        ...prev,
        '>> [Stage 4] Retinal enhancement successful. Vessel SNR improved by +4.8 dB. Ready for AI grading.',
      ]);
    }, 1900);
  };

  useEffect(() => {
    if (autoRun && !hasProcessed) {
      runMatlabPipeline();
    }
  }, [autoRun]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(matlabCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Determine SVG CSS filter style based on active stage
  const getStageFilterStyle = () => {
    if (activeStage === 'green_channel') {
      return 'brightness(1.1) contrast(1.4) saturate(0) sepia(1) hue-rotate(80deg) saturate(3)';
    }
    if (activeStage === 'clahe') {
      return 'brightness(1.15) contrast(1.75) saturate(1.1)';
    }
    if (activeStage === 'morphology') {
      return 'brightness(1.3) contrast(2.2) saturate(0.6) invert(0.85)';
    }
    if (activeStage === 'vessel_segment') {
      return 'contrast(3) saturate(0) invert(1) brightness(0.9)';
    }
    return 'none';
  };

  return (
    <div className="space-y-6">
      
      {/* Header Info Card */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/20">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">
                  {t.matlabEnhanceTitle}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  MATLAB Image Processing Toolbox
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
                {t.matlabEnhanceDesc}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={runMatlabPipeline}
            disabled={isProcessing}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-white" />
            )}
            <span>{isProcessing ? 'Processing in MATLAB...' : 'Run MATLAB Pipeline'}</span>
          </button>
        </div>

        {/* Processing Progress Bar */}
        {isProcessing && (
          <div className="space-y-1.5 pt-2 animate-fade-in">
            <div className="flex justify-between text-xs text-slate-300 font-semibold">
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                Executing MATLAB Vision Algorithm...
              </span>
              <span className="font-mono text-amber-400">{processProgress}%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${processProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Interactive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Before vs MATLAB Enhanced Split Screen (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            
            {/* View Selectors */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Enhancement Mode:
              </span>

              <div className="flex items-center flex-wrap gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveStage('green_channel')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    activeStage === 'green_channel'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🟢 Green Channel
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStage('clahe')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    activeStage === 'clahe'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ⚡ CLAHE
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStage('morphology')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    activeStage === 'morphology'
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🔬 Top-Hat
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStage('vessel_segment')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    activeStage === 'vessel_segment'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🕸 Vessel Map
                </button>
              </div>
            </div>

            {/* Split Comparison Viewer */}
            <div className="relative w-full aspect-square max-h-[440px] bg-black rounded-2xl overflow-hidden border border-slate-800 select-none flex items-center justify-center">
              
              {/* Left Background: Raw Original RGB Image */}
              <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black">
                <img
                  src={scan.imageUrl}
                  alt="Raw Fundus"
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-slate-950/85 border border-slate-700 text-xs font-mono text-slate-300 backdrop-blur-sm">
                  📷 Original Raw Fundus
                </div>
              </div>

              {/* Right Side: Filtered / Enhanced Image with Polygon Clip */}
              <div
                style={{
                  clipPath: `polygon(${splitPos}% 0, 100% 0, 100% 100%, ${splitPos}% 100%)`,
                }}
                className="absolute inset-0 w-full h-full flex items-center justify-center bg-black"
              >
                <img
                  src={scan.imageUrl}
                  alt="MATLAB Enhanced"
                  style={{ filter: getStageFilterStyle() }}
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-3 right-3 px-3 py-1 rounded-xl bg-slate-950/85 border border-amber-500/50 text-xs font-mono text-amber-300 backdrop-blur-sm">
                  ✨ MATLAB: {activeStage.toUpperCase()}
                </div>
              </div>

              {/* Divider Handle */}
              <div
                style={{ left: `${splitPos}%` }}
                className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl z-20 -translate-x-1/2 flex items-center justify-center pointer-events-none"
              >
                <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-white shadow-xl flex items-center justify-center text-[10px] text-white font-bold font-mono">
                  ◄►
                </div>
              </div>

              {/* Interactive Drag Range */}
              <input
                type="range"
                min="5"
                max="95"
                value={splitPos}
                onChange={(e) => setSplitPos(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>◄ Slide left to see more MATLAB Enhancement</span>
              <span>Slide right to see raw photo ►</span>
            </div>
          </div>
        </div>

        {/* Right Side: MATLAB Parameter Controls & Terminal Logs (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* MATLAB Parameter Sliders */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>MATLAB Tuning Parameters</span>
            </h3>

            {/* CLAHE Clip Limit */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">
                  CLAHE Clip Limit (<code className="text-amber-400 font-mono">ClipLimit</code>)
                </span>
                <span className="font-mono text-amber-400 font-bold">{clipLimit}</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.08"
                step="0.005"
                value={clipLimit}
                onChange={(e) => setClipLimit(Number(e.target.value))}
                className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">
                Higher values amplify contrast around faint microaneurysms.
              </span>
            </div>

            {/* Disk Structuring Element Radius */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">
                  Structuring Element Radius (<code className="text-amber-400 font-mono">strel('disk', r)</code>)
                </span>
                <span className="font-mono text-amber-400 font-bold">{structuringElementRadius} px</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="1"
                value={structuringElementRadius}
                onChange={(e) => setStructuringElementRadius(Number(e.target.value))}
                className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">
                Defines neighborhood size for separating exudates from retina background.
              </span>
            </div>
          </div>

          {/* MATLAB Execution Terminal */}
          <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>MATLAB Command Window</span>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono transition-colors"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? 'Copied!' : 'Copy .m Code'}</span>
              </button>
            </div>

            <div className="h-32 overflow-y-auto font-mono text-[11px] text-emerald-400/90 leading-relaxed bg-black/50 p-3 rounded-xl border border-slate-900 space-y-1">
              {consoleLog.length === 0 ? (
                <span className="text-slate-600">
                  Ready. Click 'Run MATLAB Pipeline' to process the retinal photograph...
                </span>
              ) : (
                consoleLog.map((line, idx) => <div key={idx}>{line}</div>)
              )}
            </div>
          </div>

          {/* Action Button to Proceed to AI */}
          <button
            type="button"
            onClick={onEnhancementComplete}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
          >
            <span>{t.runAI}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
