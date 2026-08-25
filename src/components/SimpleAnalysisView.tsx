import React, { useState, useEffect } from 'react';
import { DRAnalysisResult, PatientDetails } from '../types';

interface SimpleAnalysisViewProps {
  imageUrl: string;
  patientDetails: PatientDetails;
  analysisResult: DRAnalysisResult;
  onAnalysisComplete: () => void;
}

export const SimpleAnalysisView: React.FC<SimpleAnalysisViewProps> = ({
  imageUrl,
  patientDetails,
  analysisResult,
  onAnalysisComplete
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(10);
  const [matlabTerminalLines, setMatlabTerminalLines] = useState<string[]>([
    '>> matlab -batch "processRetina(inputPath, outputPath)"',
    '>> I = imread(inputPath);',
    '>> I = imresize(I, [600 600]);'
  ]);

  const steps = [
    {
      id: 'upload',
      title: 'Image Uploaded & Initialized',
      desc: 'Fundus image converted to standardized 600x600 matrix resolution.',
      matlabCmd: 'I = imresize(imread(inputPath), [600 600]);'
    },
    {
      id: 'green_channel',
      title: 'MATLAB Black & White Conversion (Green Channel G = I(:,:,2))',
      desc: 'Isolates optical green wavelength where retinal vessels exhibit highest contrast.',
      matlabCmd: 'G = I(:,:,2); % Black & White vessel luminance'
    },
    {
      id: 'illumination',
      title: 'Gaussian Illumination Flattening',
      desc: 'Corrects non-uniform flash lighting with 45-pixel Gaussian low-pass filter.',
      matlabCmd: 'background = imgaussfilt(G, 45); Gnorm = imdivide(G, background, \'scaled\');'
    },
    {
      id: 'clahe',
      title: 'CLAHE Contrast Enhancement & Denoising',
      desc: 'Adaptive histogram equalization (adapthisteq) & 3x3 median filter denoising.',
      matlabCmd: 'Gclahe = adapthisteq(Gnorm, \'ClipLimit\', 0.02); Gdenoise = medfilt2(Gclahe, [3 3]);'
    },
    {
      id: 'ai_inference',
      title: 'AI Classification on Black & White Retinal Matrix',
      desc: 'Deep convolutional neural network scans microaneurysms, hemorrhages & exudates.',
      matlabCmd: 'drNet.classify(Gdenoise); % Generating ETDRS stage & confidence'
    }
  ];

  useEffect(() => {
    // Step progression timer
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          const next = prev + 1;
          setMatlabTerminalLines((lines) => [...lines, `>> ${steps[next].matlabCmd}`]);
          return next;
        } else {
          clearInterval(stepInterval);
          return prev;
        }
      });
    }, 1200);

    const progressInterval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            onAnalysisComplete();
          }, 800);
          return 100;
        }
        return Math.min(100, prev + 3);
      });
    }, 150);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Title Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
          Automated Retinal Processing Active
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          MATLAB Enhancement &amp; AI Analysis in Progress
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
          Converting fundus image to black and white green channel, equalizing microvascular contrast, and executing diabetic retinopathy AI inference.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (6 Cols): Black & White Retinal Image Display */}
        <div className="lg:col-span-6 bg-slate-900 text-white rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <h3 className="font-bold text-sm text-slate-100">
                MATLAB Black &amp; White Retinal Matrix
              </h3>
            </div>
            <span className="text-[10px] font-mono bg-slate-800 text-blue-300 px-2 py-0.5 rounded">
              G = I(:,:,2) + CLAHE
            </span>
          </div>

          {/* Black & White Filtered Image */}
          <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center">
            {/* Black & White enhanced style specifically */}
            <img
              src={imageUrl}
              alt="Black and White Enhanced Retina"
              className="w-full h-full object-contain filter grayscale contrast-150 brightness-95"
            />

            {/* Simulated MATLAB Scanning Beam */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-pulse absolute top-1/2 -translate-y-1/2"></div>
            </div>

            {/* Overlay Status Badge */}
            <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-xs text-white text-[10px] font-mono px-2.5 py-1 rounded border border-slate-700">
              ● B&amp;W Vascular Contrast Mode
            </div>

            <div className="absolute bottom-3 right-3 bg-blue-900/90 text-blue-200 text-[10px] font-mono px-2 py-1 rounded border border-blue-600/50">
              Patient: {patientDetails.patientName || patientDetails.patientId} ({patientDetails.selectedEye})
            </div>
          </div>

          {/* MATLAB Live Script Execution Terminal */}
          <div className="bg-black/80 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-emerald-400 space-y-1 overflow-x-auto max-h-32">
            <div className="text-slate-500 text-[10px] pb-1 border-b border-slate-800 flex items-center justify-between">
              <span>MATLAB ENGINE (processRetina.m)</span>
              <span className="text-cyan-400">EXECUTING</span>
            </div>
            {matlabTerminalLines.map((line, idx) => (
              <div key={idx} className="leading-tight truncate">
                {line}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (6 Cols): Progress Checklist */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700">Analysis Completion</span>
              <span className="text-blue-600 font-mono">{progressPercent}%</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Step-by-Step Flow List */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
              Diagnostic Pipeline Steps
            </h3>

            <div className="space-y-3">
              {steps.map((step, idx) => {
                const isDone = idx < currentStep || progressPercent === 100;
                const isCurrent = idx === currentStep && progressPercent < 100;

                return (
                  <div
                    key={step.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                      isCurrent
                        ? 'bg-blue-50/70 border-blue-300 shadow-xs'
                        : isDone
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-white border-slate-100 opacity-50'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isDone ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                          <span className="material-symbols-outlined text-[16px]">check</span>
                        </div>
                      ) : isCurrent ? (
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center animate-spin">
                          <span className="material-symbols-outlined text-[16px]">progress_activity</span>
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {step.title}
                        </h4>
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded">
                            PROCESSING
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Automatic Redirect Notice */}
          <div className="pt-2 text-center text-xs text-slate-400">
            Results and full report preview will load automatically upon completion...
          </div>
        </div>
      </div>
    </div>
  );
};
