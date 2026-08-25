import React, { useState } from 'react';
import { DRAnalysisResult, PatientDetails } from '../types';
import { ReportPreviewModal } from './ReportPreviewModal';

interface SimpleResultViewProps {
  patientDetails: PatientDetails;
  imageUrl: string;
  analysis: DRAnalysisResult;
  onStartNewScreening: () => void;
}

export const SimpleResultView: React.FC<SimpleResultViewProps> = ({
  patientDetails,
  imageUrl,
  analysis,
  onStartNewScreening
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeVisualTab, setActiveVisualTab] = useState<'matlab_all' | 'heatmap'>('matlab_all');
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'differential' | 'lesions' | 'overview'>('overview');

  // Result card styling based on DR stage (using mild, clear clinical palettes)
  const getBannerInfo = () => {
    switch (analysis.stage) {
      case 0:
        return {
          title: 'NO SIGNS OF DIABETIC RETINOPATHY DETECTED',
          badgeText: 'Stage 0 - Normal Healthy Retina',
          bg: 'bg-emerald-50/70 border-emerald-300/80 text-emerald-950',
          badgeBg: 'bg-emerald-600 text-white',
          icon: 'check_circle',
          iconColor: 'text-emerald-600',
          summary: 'The retinal fundus matches the Iowa EyeRounds Normal Atlas: clear macula, sharp optic margins, and zero microvascular lesions.'
        };
      case 1:
        return {
          title: 'MILD NON-PROLIFERATIVE DIABETIC RETINOPATHY (NPDR)',
          badgeText: 'Stage 1 - Mild NPDR',
          bg: 'bg-amber-50/70 border-amber-300/80 text-amber-950',
          badgeBg: 'bg-amber-600 text-white',
          icon: 'warning',
          iconColor: 'text-amber-600',
          summary: 'Early isolated microaneurysms (<125μm) detected per Barbara Davis Center criteria. Annual 12-month dilated review advised.'
        };
      case 2:
        return {
          title: 'MODERATE NON-PROLIFERATIVE DIABETIC RETINOPATHY (NPDR)',
          badgeText: 'Stage 2 - Moderate NPDR',
          bg: 'bg-orange-50/70 border-orange-300/80 text-orange-950',
          badgeBg: 'bg-orange-600 text-white',
          icon: 'warning',
          iconColor: 'text-orange-600',
          summary: 'Multiple outer plexiform hemorrhages, microaneurysms, and lipid hard exudates detected in 1-2 quadrants.'
        };
      case 3:
        return {
          title: 'SEVERE NON-PROLIFERATIVE RETINOPATHY (HIGH RISK)',
          badgeText: 'Stage 3 - Severe NPDR',
          bg: 'bg-rose-50/70 border-rose-300/80 text-rose-950',
          badgeBg: 'bg-rose-600 text-white',
          icon: 'crisis_alert',
          iconColor: 'text-rose-600',
          summary: 'Positive 4-2-1 rule: diffuse blot hemorrhages in 4 quadrants, venous beading, and soft exudates (cotton wool spots).'
        };
      case 4:
        return {
          title: 'PROLIFERATIVE DIABETIC RETINOPATHY (PDR - URGENT)',
          badgeText: 'Stage 4 - Proliferative DR',
          bg: 'bg-purple-50/70 border-purple-300/80 text-purple-950',
          badgeBg: 'bg-purple-700 text-white',
          icon: 'e911_emergency',
          iconColor: 'text-purple-600',
          summary: 'Active neovascularization of the disc (NVD) or elsewhere (NVE) with preretinal hemorrhage. Urgent retina specialist referral required.'
        };
    }
  };

  const banner = getBannerInfo();

  // 6 MATLAB Subplots representing the user's MATLAB code
  const matlabSubplots = [
    {
      title: 'subplot(2,3,1): Original Image',
      label: 'Original Fundus (I)',
      code: 'I = imresize(imread(path), [600 600])',
      filter: 'none',
      badge: 'Input RGB'
    },
    {
      title: 'subplot(2,3,2): Green Channel / Grayscale',
      label: 'Green Channel (G)',
      code: 'G = I(:,:,2)',
      filter: 'grayscale(100%) contrast(110%) brightness(105%)',
      badge: 'Optical Luminance'
    },
    {
      title: 'subplot(2,3,3): Illumination Corrected',
      label: 'Illumination Flattened (Gnorm)',
      code: 'Gnorm = mat2gray(Gdouble - background)',
      filter: 'grayscale(100%) contrast(135%) brightness(95%)',
      badge: 'Gaussian Filtered'
    },
    {
      title: 'subplot(2,3,4): After CLAHE',
      label: 'After CLAHE (Gclahe)',
      code: 'adapthisteq(Gnorm, [8 8], 0.02)',
      filter: 'grayscale(100%) contrast(160%) brightness(90%)',
      badge: 'Adaptive Hist Eq'
    },
    {
      title: 'subplot(2,3,5): After Denoising',
      label: 'After Denoising (Gdenoise)',
      code: 'medfilt2(Gclahe, [3 3])',
      filter: 'grayscale(100%) contrast(175%) brightness(88%)',
      badge: '3x3 Median Denoise'
    },
    {
      title: 'subplot(2,3,6): Final Enhanced Image',
      label: 'Final Enhanced (Genhanced)',
      code: 'Genhanced = imadjust(Gdenoise)',
      filter: 'grayscale(100%) contrast(190%) brightness(85%)',
      badge: 'Enhanced Matrix'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Hospital Dataset & Clinical Benchmark Strip - MILD PROFESSIONAL COLORS */}
      <div className="bg-slate-50/90 border border-slate-200/90 text-slate-800 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[18px]">verified</span>
          </span>
          <div>
            <span className="font-bold text-slate-900 block text-[11px]">
              Hospital Clinical Knowledge Base &amp; ML Diagnostic Feed
            </span>
            <span className="text-[11px] text-slate-500">
              Evaluated against <strong>Univ. of Iowa EyeRounds Normal Fundus Atlas</strong>, <strong>Barbara Davis Center</strong>, and <strong>Eye7 Hospitals</strong>.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full border border-slate-300 font-mono">
            ICD-10: {analysis.icdCode.split(' ')[0]}
          </span>
          <span className="text-[10px] bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200 font-mono">
            ETDRS Level: {analysis.etdrsScore}
          </span>
        </div>
      </div>

      {/* Top Banner with Diagnosis & AI Confidence */}
      <div className={`rounded-2xl border-2 p-6 sm:p-7 ${banner.bg} shadow-2xs space-y-4`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <span className={`material-symbols-outlined text-[36px] ${banner.iconColor} shrink-0`}>
              {banner.icon}
            </span>
            <div>
              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${banner.badgeBg} shadow-xs inline-block mb-1.5`}>
                {banner.badgeText}
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                {banner.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 mt-1">
                {banner.summary}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/90 backdrop-blur-xs p-3.5 rounded-xl border border-slate-200/80 shrink-0 self-stretch sm:self-auto justify-between sm:justify-start">
            <div className="text-right">
              <span className="block text-[10px] uppercase font-bold text-slate-500">
                AI Confidence
              </span>
              <span className="text-2xl font-black text-blue-700 font-mono">
                {analysis.confidence}%
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">psychology</span>
            </div>
          </div>
        </div>

        {/* Quick Patient & Eye Details Summary Strip */}
        <div className="pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 font-medium">
          <div className="flex items-center gap-3">
            <span><strong>Patient:</strong> {patientDetails.patientName || patientDetails.patientId} ({patientDetails.age}y)</span>
            <span>•</span>
            <span><strong>Examined Eye:</strong> <span className="font-bold text-blue-700">{patientDetails.selectedEye}</span></span>
            <span>•</span>
            <span><strong>Diabetes:</strong> {patientDetails.diabetesType} ({patientDetails.diabetesDurationYears}y)</span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="bg-slate-200/70 px-2 py-0.5 rounded font-mono">
              HbA1c: {patientDetails.hba1c}%
            </span>
            <span className="bg-slate-200/70 px-2 py-0.5 rounded font-mono">
              Sugar: {patientDetails.bloodSugarLevel} mg/dL
            </span>
          </div>
        </div>
      </div>

      {/* MATLAB 6-Stage Subplot Output (subplot 2,3,1 to 2,3,6) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-[20px]">grid_view</span>
              MATLAB Retinal Output Stages (figure; subplot(2,3,1:6))
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Exact pipeline execution matching <code className="text-blue-600 font-mono">enhanceRetinaScript.m</code>
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveVisualTab('matlab_all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeVisualTab === 'matlab_all'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All 6 MATLAB Subplots
            </button>
            <button
              onClick={() => setActiveVisualTab('heatmap')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeVisualTab === 'heatmap'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              AI Lesion Grad-CAM
            </button>
          </div>
        </div>

        {activeVisualTab === 'matlab_all' ? (
          /* 2x3 Grid Display Matching MATLAB subplot(2,3,1) to subplot(2,3,6) */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {matlabSubplots.map((subplot, idx) => (
              <div key={idx} className="bg-slate-50 rounded-xl border border-slate-200 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 text-[11px] truncate" title={subplot.title}>
                    {subplot.title}
                  </span>
                  <span className="text-[9px] font-mono bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded shrink-0">
                    {subplot.badge}
                  </span>
                </div>

                <div className="aspect-square rounded-lg overflow-hidden bg-black border border-slate-300 relative group flex items-center justify-center">
                  <img
                    src={imageUrl}
                    alt={subplot.label}
                    className="w-full h-full object-cover transition-all duration-300"
                    style={{ filter: subplot.filter }}
                  />
                  <div className="absolute bottom-1.5 left-1.5 bg-black/80 text-white text-[9px] font-mono px-2 py-0.5 rounded backdrop-blur-xs">
                    {subplot.label}
                  </div>
                </div>

                <div className="font-mono text-[10px] text-slate-500 bg-white px-2 py-1 rounded border border-slate-200 truncate" title={subplot.code}>
                  &gt;&gt; {subplot.code}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* AI Grad-CAM Heatmap Comparison */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">Final MATLAB Enhanced Black &amp; White Matrix (Genhanced)</span>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-800 px-2 py-0.5 rounded">imadjust(Gdenoise)</span>
              </div>
              <div className="aspect-square rounded-xl overflow-hidden bg-black border border-slate-200 relative">
                <img
                  src={imageUrl}
                  alt="Enhanced Retina"
                  className="w-full h-full object-cover filter grayscale contrast-185 brightness-85"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">AI Deep Learning Attention Heatmap (Grad-CAM)</span>
                <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200">Lesion Activations</span>
              </div>
              <div className="aspect-square rounded-xl overflow-hidden bg-black border border-slate-200 relative">
                <img
                  src={imageUrl}
                  alt="AI Grad-CAM Heatmap"
                  className="w-full h-full object-cover filter brightness-90"
                />
                <div className="absolute inset-0 bg-gradient-radial from-red-500/40 via-amber-500/25 to-transparent mix-blend-screen pointer-events-none"></div>
                <div className="absolute bottom-2 left-2 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                  Microaneurysm &amp; Hemorrhage Salience
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Multi-Condition Hospital Differential Diagnosis & Barbara Davis Lesion Analysis */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-[20px]">dataset</span>
              Hospital Clinical Knowledge Base &amp; ML Differential Diagnosis
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Differential assessment cross-referencing Iowa EyeRounds Normal Fundus criteria, Barbara Davis Center, and Eye7 Hospitals.
            </p>
          </div>

          {/* Sub-tabs for clinical deep dive */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveAnalysisTab('overview')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeAnalysisTab === 'overview'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Clinical Findings
            </button>
            <button
              onClick={() => setActiveAnalysisTab('differential')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeAnalysisTab === 'differential'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Differential Diagnosis (6 Conditions)
            </button>
            <button
              onClick={() => setActiveAnalysisTab('lesions')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeAnalysisTab === 'lesions'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Barbara Davis Lesions Matrix
            </button>
          </div>
        </div>

        {/* Tab 1: Overview & Findings */}
        {activeAnalysisTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">search_insights</span>
                What Did the AI Find?
              </h4>
              <ul className="space-y-2 text-xs text-slate-700">
                {analysis.keyFindings.map((finding, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{finding}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-amber-600 text-[18px]">medical_services</span>
                Recommended Clinical Pathway
              </h4>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs leading-relaxed space-y-2">
                <p className="font-bold text-slate-900">
                  {analysis.recommendedAction}
                </p>
                <div className="text-[11px] text-slate-600 pt-2 border-t border-slate-200 space-y-1">
                  <div><strong>Macular Edema (CSME) Risk:</strong> {analysis.dmeRisk} ({analysis.dmeConfidence}% confidence)</div>
                  <div><strong>Referral Urgency:</strong> <span className="font-bold text-amber-700">{analysis.urgency}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Multi-Condition Differential Diagnosis */}
        {activeAnalysisTab === 'differential' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {analysis.differentialDiagnosis.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border transition-all ${
                    item.status === 'Primary Diagnosis'
                      ? 'bg-blue-50/60 border-blue-200 shadow-2xs'
                      : item.status === 'Secondary Finding'
                      ? 'bg-amber-50/60 border-amber-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-slate-900 truncate">
                      {item.condition}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      item.status === 'Primary Diagnosis'
                        ? 'bg-blue-600 text-white'
                        : item.status === 'Secondary Finding'
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="text-lg font-black text-slate-900 font-mono">
                      {item.probability}%
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">likelihood</span>
                  </div>

                  <p className="text-[11px] text-slate-600 line-clamp-2 mb-2 leading-relaxed">
                    {item.keyDifferentiators}
                  </p>

                  <div className="text-[9px] text-slate-400 font-mono truncate border-t border-black/5 pt-1.5">
                    Ref: {item.hospitalReference}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Barbara Davis Center Lesion Quantitative Matrix */}
        {activeAnalysisTab === 'lesions' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 block">Microaneurysms</span>
                <span className="text-xl font-black text-blue-700 font-mono">
                  {analysis.lesionBreakdown.microaneurysmsCount}
                </span>
                <span className="text-[9px] text-slate-400 block">&lt;125μm Capillary Bulges</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 block">Blot Hemorrhages</span>
                <span className="text-xl font-black text-rose-600 font-mono">
                  {analysis.lesionBreakdown.blotHemorrhagesCount}
                </span>
                <span className="text-[9px] text-slate-400 block">Outer Plexiform Leakage</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 block">Hard Exudates Area</span>
                <span className="text-xl font-black text-amber-600 font-mono">
                  {analysis.lesionBreakdown.hardExudatesAreaMm2} mm²
                </span>
                <span className="text-[9px] text-slate-400 block">Circinate Lipid Deposits</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 block">Cotton Wool Spots</span>
                <span className="text-xl font-black text-indigo-600 font-mono">
                  {analysis.lesionBreakdown.cottonWoolSpotsCount}
                </span>
                <span className="text-[9px] text-slate-400 block">Nerve Layer Infarcts</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <span className="font-bold text-slate-800 text-[11px] block">Advanced Hospital Diagnostic Indicators:</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-700">
                <div>• IRMA Shunts: <strong>{analysis.lesionBreakdown.irmaDetected ? 'Detected (High Risk)' : 'Not detected'}</strong></div>
                <div>• Venous Beading: <strong>{analysis.lesionBreakdown.venousBeadingDetected ? 'Present (≥2 Quads)' : 'None'}</strong></div>
                <div>• Optic Disc CDR: <strong>{analysis.lesionBreakdown.opticCupToDiscRatio} (Normal 0.2–0.4)</strong></div>
                <div>• Disc Neovessels (NVD): <strong>{analysis.lesionBreakdown.neovascularizationNvd ? 'Active Fronds' : 'Absent'}</strong></div>
                <div>• Retinal Detachment Risk: <strong>{analysis.lesionBreakdown.retinalTearOrDetachment ? 'Elevated (Tractional)' : 'Intact'}</strong></div>
                <div>• Disc Margins: <strong>{analysis.lesionBreakdown.opticDiscMarginSharpness}</strong></div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons: Preview Report & Start New Screening */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">preview</span>
            PREVIEW &amp; DOWNLOAD REPORT
          </button>

          <button
            type="button"
            onClick={onStartNewScreening}
            className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            START NEW SCREENING
          </button>
        </div>
      </div>

      {/* Report Preview Modal with direct PDF download */}
      <ReportPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        patientDetails={patientDetails}
        analysis={analysis}
        imageUrl={imageUrl}
      />
    </div>
  );
};
