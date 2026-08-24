import React, { useState } from 'react';
import { ImageQualityMetrics } from '../types/rural';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Sparkles, 
  Sliders, 
  RefreshCw, 
  Code, 
  Layers, 
  Eye, 
  Sun, 
  Focus, 
  Maximize,
  ShieldCheck,
  Check
} from 'lucide-react';

interface IQAAssessmentProps {
  imageUrl: string;
  onApplyEnhancement: (enhancedUrl: string, metrics: ImageQualityMetrics) => void;
}

export const IQAAssessment: React.FC<IQAAssessmentProps> = ({
  imageUrl,
  onApplyEnhancement,
}) => {
  // Preset or calculated IQA states
  const [selectedQualityPreset, setSelectedQualityPreset] = useState<'adequate' | 'borderline' | 'ungradeable'>('borderline');
  const [claheClipLimit, setClaheClipLimit] = useState<number>(0.02);
  const [denoiseLevel, setDenoiseLevel] = useState<number>(3);
  const [illuminationWeight, setIlluminationWeight] = useState<number>(0.85);
  const [activeFilterTab, setActiveFilterTab] = useState<'preview' | 'matlab_code'>('preview');

  // IQA Metrics dynamic object based on selection
  const getMetrics = (): ImageQualityMetrics => {
    if (selectedQualityPreset === 'adequate') {
      return {
        overallScore: 94,
        status: 'Adequate',
        focusScore: 96,
        illuminationScore: 92,
        fieldOfViewScore: 95,
        artifactLevel: 'None',
        recaptureRequired: false,
        enhancementApplied: {
          clahe: false,
          illuminationCorrection: false,
          medianDenoising: false,
          gammaCorrection: 1.0,
        },
      };
    }
    if (selectedQualityPreset === 'borderline') {
      return {
        overallScore: 68,
        status: 'Borderline (Enhanced)',
        focusScore: 71,
        illuminationScore: 62,
        fieldOfViewScore: 84,
        artifactLevel: 'Mild Glare',
        recaptureRequired: false,
        recaptureReason: 'Uneven peripheral illumination & mild choroidal reflection',
        recaptureAdvice: 'MATLAB CLAHE & Homomorphic Illumination Normalization successfully applied. Image is now gradeable.',
        enhancementApplied: {
          clahe: true,
          illuminationCorrection: true,
          medianDenoising: true,
          gammaCorrection: 1.15,
        },
      };
    }
    return {
      overallScore: 32,
      status: 'Ungradeable (Reject)',
      focusScore: 28,
      illuminationScore: 35,
      fieldOfViewScore: 40,
      artifactLevel: 'Motion Blur',
      recaptureRequired: true,
      recaptureReason: 'Significant motion blur & severe optic disc cutoff (<30° FOV)',
      recaptureAdvice: 'RECAPTURE MANDATORY: Ask patient to fixate on internal green target. Increase flash illumination by +1 stop and ensure optical axis alignment.',
      enhancementApplied: {
        clahe: false,
        illuminationCorrection: false,
        medianDenoising: false,
        gammaCorrection: 1.0,
      },
    };
  };

  const metrics = getMetrics();

  const matlabCode = `% =========================================================================
% MATLAB Image Processing & Medical Imaging Toolbox: Automated Fundus IQA
% Evaluates focus (Laplacian gradient), illumination uniformity, & FOV adequacy
% =========================================================================
function [qualityMetrics, enhancedImg] = evaluateAndEnhanceFundus(rgbImg)
    % 1. Channel Extraction & Green Intensity Analysis
    I_green = rgbImg(:,:,2);
    
    % 2. Focus Assessment using Modified Laplacian Focus Measure (MLFM)
    lapFilter = [0 1 0; 1 -4 1; 0 1 0];
    laplacianMap = abs(imfilter(double(I_green), lapFilter, 'replicate'));
    focusScore = mean(laplacianMap(laplacianMap > 0.05)) * 100;
    
    % 3. Illumination Uniformity Assessment (Gaussian Background Estimation)
    h_gauss = fspecial('gaussian', [128 128], 30);
    bg_illum = imfilter(double(I_green), h_gauss, 'replicate');
    illumScore = (1 - std2(bg_illum) / mean2(bg_illum)) * 100;
    
    % 4. Field of View (FOV) & Retinal Mask Coverage
    retinaMask = imbinarize(I_green, 'adaptive');
    fovCoverage = (sum(retinaMask(:)) / numel(retinaMask)) * 100;
    
    overallQuality = 0.40 * focusScore + 0.35 * illumScore + 0.25 * fovCoverage;
    
    % 5. Adaptive Enhancement Decision
    if overallQuality < 45
        qualityMetrics.status = 'UNGRADEABLE_REJECT';
        qualityMetrics.recaptureFeedback = 'Insufficient focus/FOV. Re-align camera & steady patient fixation.';
        enhancedImg = rgbImg;
    elseif overallQuality < 80
        qualityMetrics.status = 'BORDERLINE_ENHANCED';
        % Homomorphic illumination correction
        I_homomorphic = double(I_green) ./ (bg_illum + eps);
        % Contrast-Limited Adaptive Histogram Equalization (CLAHE)
        I_clahe = adapthisteq(mat2gray(I_homomorphic), 'ClipLimit', ${claheClipLimit}, 'NumTiles', [8 8]);
        % Median Noise Filtering
        I_denoised = medfilt2(I_clahe, [${denoiseLevel} ${denoiseLevel}]);
        enhancedImg = cat(3, rgbImg(:,:,1), uint8(I_denoised * 255), rgbImg(:,:,3));
    else
        qualityMetrics.status = 'ADEQUATE';
        enhancedImg = rgbImg;
    end
end`;

  return (
    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
            <Focus className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100">
                Pillar 1: Automated Image Quality Assessment (IQA) & Adaptive Enhancement
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                MATLAB Image Processing Toolbox
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Evaluates focus sharpness (Laplacian gradient), illumination uniformity, and FOV adequacy with instant recapture feedback
            </p>
          </div>
        </div>

        {/* Quality Test Preset Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setSelectedQualityPreset('adequate')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              selectedQualityPreset === 'adequate'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🟢 Adequate (94%)
          </button>
          <button
            type="button"
            onClick={() => setSelectedQualityPreset('borderline')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              selectedQualityPreset === 'borderline'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🟡 Borderline (CLAHE Applied)
          </button>
          <button
            type="button"
            onClick={() => setSelectedQualityPreset('ungradeable')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              selectedQualityPreset === 'ungradeable'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🔴 Ungradeable (Reject)
          </button>
        </div>
      </div>

      {/* Main Grid: IQA Scores + Visual Enhancement Slider / Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 5 Cols: IQA Diagnostic Gauge & Metrics */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Status Banner */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
            metrics.status === 'Adequate'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100'
              : metrics.status === 'Borderline (Enhanced)'
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-100'
              : 'bg-rose-950/40 border-rose-500/50 text-rose-100'
          }`}>
            <div className="p-2 rounded-xl bg-black/30 shrink-0">
              {metrics.status === 'Adequate' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              ) : metrics.status === 'Borderline (Enhanced)' ? (
                <Sparkles className="w-6 h-6 text-amber-400" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-400" />
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black">{metrics.status}</h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-black/40 font-bold">
                  Score: {metrics.overallScore}/100
                </span>
              </div>
              <p className="text-xs opacity-90 leading-relaxed">
                {metrics.status === 'Adequate'
                  ? 'Optical focus, macula/optic disc alignment, and illumination are optimal for deep neural network grading.'
                  : metrics.status === 'Borderline (Enhanced)'
                  ? metrics.recaptureAdvice
                  : metrics.recaptureAdvice}
              </p>
            </div>
          </div>

          {/* Individual Factor Breakdown Gauges */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Multi-Metric Adequacy Matrix
            </span>

            {/* Focus (Modified Laplacian Sharpness) */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Focus className="w-3.5 h-3.5 text-sky-400" />
                  Focus / Edge Sharpness (Laplacian)
                </span>
                <span className="font-mono font-bold text-slate-200">{metrics.focusScore}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    metrics.focusScore > 80 ? 'bg-emerald-500' : metrics.focusScore > 60 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${metrics.focusScore}%` }}
                />
              </div>
            </div>

            {/* Illumination Uniformity */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  Illumination Uniformity (Homomorphic)
                </span>
                <span className="font-mono font-bold text-slate-200">{metrics.illuminationScore}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    metrics.illuminationScore > 80 ? 'bg-emerald-500' : metrics.illuminationScore > 60 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${metrics.illuminationScore}%` }}
                />
              </div>
            </div>

            {/* Field of View (FOV coverage) */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Maximize className="w-3.5 h-3.5 text-teal-400" />
                  Field of View Adequacy (≥45° Retinal Mask)
                </span>
                <span className="font-mono font-bold text-slate-200">{metrics.fieldOfViewScore}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    metrics.fieldOfViewScore > 80 ? 'bg-emerald-500' : metrics.fieldOfViewScore > 60 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${metrics.fieldOfViewScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* MATLAB Parameter Tuners (CLAHE & Denoising) */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              Interactive MATLAB Pipeline Hyperparameters
            </span>

            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>CLAHE adapthisteq ClipLimit:</span>
                  <span className="font-mono text-emerald-400 font-bold">{claheClipLimit.toFixed(3)}</span>
                </div>
                <input
                  type="range"
                  min="0.005"
                  max="0.05"
                  step="0.005"
                  value={claheClipLimit}
                  onChange={(e) => setClaheClipLimit(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>medfilt2 Kernel Size [k k]:</span>
                  <span className="font-mono text-emerald-400 font-bold">{denoiseLevel} × {denoiseLevel}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="7"
                  step="2"
                  value={denoiseLevel}
                  onChange={(e) => setDenoiseLevel(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 7 Cols: Image Preview vs MATLAB Code Tab */}
        <div className="lg:col-span-7 space-y-3">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveFilterTab('preview')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeFilterTab === 'preview'
                    ? 'bg-slate-800 text-slate-100 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Visual Enhancement View
              </button>
              <button
                type="button"
                onClick={() => setActiveFilterTab('matlab_code')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeFilterTab === 'matlab_code'
                    ? 'bg-slate-800 text-slate-100 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code className="w-3.5 h-3.5 text-amber-400" />
                <span>MATLAB .m Function</span>
              </button>
            </div>

            <span className="text-[11px] font-mono text-emerald-400">
              {metrics.recaptureRequired ? '⚠️ Recapture Triggered' : '✓ Preprocessing Validated'}
            </span>
          </div>

          {activeFilterTab === 'preview' ? (
            <div className="relative aspect-video rounded-3xl bg-black border border-slate-800 overflow-hidden shadow-xl flex items-center justify-center">
              
              {/* Fundus Image Display */}
              <img
                src={imageUrl}
                alt="Retina IQA"
                className={`w-full h-full object-contain transition-all duration-300 ${
                  selectedQualityPreset === 'borderline'
                    ? 'contrast-125 saturate-110 brightness-105'
                    : selectedQualityPreset === 'ungradeable'
                    ? 'blur-[2px] opacity-70'
                    : ''
                }`}
              />

              {/* Status Overlay Badge */}
              <div className="absolute top-4 left-4 p-2.5 rounded-2xl bg-black/70 backdrop-blur-md border border-white/20 text-xs space-y-0.5">
                <div className="font-mono font-bold text-slate-200">
                  {selectedQualityPreset === 'borderline' ? 'Adaptive CLAHE + Homomorphic' : selectedQualityPreset === 'ungradeable' ? 'Motion Blur Reject' : 'Raw RGB Direct'}
                </div>
                <div className="text-[10px] text-slate-400">
                  {selectedQualityPreset === 'borderline' ? 'Edge sharpness boosted +24%' : selectedQualityPreset === 'ungradeable' ? 'SNR below clinical threshold (12dB)' : 'Ideal 45° macula-centered capture'}
                </div>
              </div>

              {/* Recapture Alert Overlay if Ungradeable */}
              {metrics.recaptureRequired && (
                <div className="absolute inset-0 bg-rose-950/80 backdrop-blur-sm p-6 flex flex-col items-center justify-center text-center space-y-3 z-30">
                  <div className="w-14 h-14 rounded-2xl bg-rose-600/30 border border-rose-500 flex items-center justify-center text-rose-300">
                    <AlertTriangle className="w-7 h-7" />
                  </div>
                  <div className="space-y-1 max-w-md">
                    <h4 className="text-base font-black text-rose-100">AUTOMATIC IMAGE REJECTION</h4>
                    <p className="text-xs text-rose-200">
                      {metrics.recaptureAdvice}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedQualityPreset('borderline')}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition-all"
                  >
                    Simulate Recapture with Correct Optical Alignment
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-3xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-emerald-300 overflow-x-auto max-h-[380px] shadow-inner">
              <pre>{matlabCode}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
