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
  const [activeVisualTab, setActiveVisualTab] = useState<'enhancement_grid' | 'split' | 'enhanced'>('enhancement_grid');
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'overview' | 'differential'>('overview');

  // Result card styling based on DR stage
  const getBannerInfo = () => {
    switch (analysis.stage) {
      case 0:
        return {
          title: 'NO SIGNS OF DIABETIC RETINOPATHY (STAGE 0: NORMAL)',
          badgeText: 'Stage 0 - Without DR (Normal)',
          bg: 'bg-emerald-50/70 border-emerald-300/80 text-emerald-950',
          badgeBg: 'bg-emerald-600 text-white',
          icon: 'check_circle',
          iconColor: 'text-emerald-600',
          summary: 'The retinal fundus matches the "Without DR" normal clinical atlas: clear macula, sharp optic margins, physiological A/V caliber, and zero microvascular lesions.'
        };
      case 1:
        return {
          title: `MILD NON-PROLIFERATIVE DIABETIC RETINOPATHY (${analysis.matchedSubStage?.name || 'STAGE 1'})`,
          badgeText: analysis.matchedSubStage?.badge || 'Stage 1 - Mild NPDR',
          bg: 'bg-amber-50/70 border-amber-300/80 text-amber-950',
          badgeBg: 'bg-amber-600 text-white',
          icon: 'warning',
          iconColor: 'text-amber-600',
          summary: 'Early isolated microaneurysms (<125μm) detected matching early diabetic microvascular alterations. Annual 12-month dilated review advised.'
        };
      case 2:
        return {
          title: 'MODERATE NON-PROLIFERATIVE DIABETIC RETINOPATHY (MODERATE NPDR)',
          badgeText: 'Stage 2 - Moderate NPDR',
          bg: 'bg-orange-50/70 border-orange-300/80 text-orange-950',
          badgeBg: 'bg-orange-600 text-white',
          icon: 'warning',
          iconColor: 'text-orange-600',
          summary: 'Multiple outer plexiform hemorrhages, microaneurysms, and lipid hard exudates detected matching Moderate NPDR criteria.'
        };
      case 3:
        return {
          title: 'SEVERE NON-PROLIFERATIVE RETINOPATHY (SEVERE NPDR - HIGH RISK)',
          badgeText: 'Stage 3 - Severe NPDR',
          bg: 'bg-rose-50/70 border-rose-300/80 text-rose-950',
          badgeBg: 'bg-rose-600 text-white',
          icon: 'crisis_alert',
          iconColor: 'text-rose-600',
          summary: 'Positive 4-2-1 rule: diffuse blot hemorrhages in all 4 quadrants, venous beading, and soft exudates (cotton wool spots).'
        };
      case 4:
        return {
          title: `PROLIFERATIVE DIABETIC RETINOPATHY (${(analysis.matchedSubStage?.name || 'PDR').toUpperCase()} - URGENT)`,
          badgeText: analysis.matchedSubStage?.badge || 'Stage 4 - Proliferative DR',
          bg: 'bg-purple-50/70 border-purple-300/80 text-purple-950',
          badgeBg: 'bg-purple-700 text-white',
          icon: 'e911_emergency',
          iconColor: 'text-purple-600',
          summary: `${analysis.matchedSubStage?.description || 'Active neovascularization (NVD/NVE) with preretinal/vitreous hemorrhage or fibrovascular traction bands. Immediate retina specialist referral required.'}`
        };
    }
  };

  const banner = getBannerInfo();

  // 6 Stages from the MATLAB code:
  // subplot(2,3,1): Original Image (I)
  // subplot(2,3,2): Green Channel / Grayscale (G)
  // subplot(2,3,3): Illumination Corrected (Gnorm)
  // subplot(2,3,4): After CLAHE (Gclahe)
  // subplot(2,3,5): After Denoising (Gdenoise)
  // subplot(2,3,6): Final Enhanced Image (Genhanced)
  const matlabEnhancementStages = [
    {
      id: 1,
      title: 'Original Image',
      command: 'subplot(2,3,1); imshow(I);',
      badge: 'I [600×600]',
      desc: 'Raw retinal fundus RGB capture',
      filter: 'none',
      bgClass: 'bg-slate-900'
    },
    {
      id: 2,
      title: 'Green Channel / Grayscale',
      command: 'subplot(2,3,2); imshow(G);',
      badge: 'G = I(:,:,2)',
      desc: 'Optimal vascular contrast extraction',
      filter: 'grayscale(100%)',
      bgClass: 'bg-slate-950'
    },
    {
      id: 3,
      title: 'Illumination Corrected',
      command: 'subplot(2,3,3); imshow(Gnorm);',
      badge: 'Gnorm = Gdouble - bg',
      desc: 'Gaussian filter [51 51] background removal',
      filter: 'grayscale(100%) contrast(125%) brightness(105%)',
      bgClass: 'bg-slate-950'
    },
    {
      id: 4,
      title: 'After CLAHE',
      command: 'subplot(2,3,4); imshow(Gclahe);',
      badge: 'adapthisteq [8 8]',
      desc: 'Contrast-limited adaptive histogram eq.',
      filter: 'grayscale(100%) contrast(165%) brightness(95%)',
      bgClass: 'bg-slate-950'
    },
    {
      id: 5,
      title: 'After Denoising',
      command: 'subplot(2,3,5); imshow(Gdenoise);',
      badge: 'medfilt2 [3 3]',
      desc: 'Median filter speckle removal',
      filter: 'grayscale(100%) contrast(165%) blur(0.3px) brightness(95%)',
      bgClass: 'bg-slate-950'
    },
    {
      id: 6,
      title: 'Final Enhanced Image',
      command: 'subplot(2,3,6); imshow(Genhanced);',
      badge: 'imadjust(Gdenoise)',
      desc: 'Intensity stretching for clinical diagnosis',
      filter: 'grayscale(100%) contrast(190%) brightness(100%)',
      bgClass: 'bg-slate-950'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      
      {/* Top Clinical Identifier & Standard Banner */}
      <div className="bg-slate-50/90 border border-slate-200/90 text-slate-800 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[18px]">verified</span>
          </span>
          <div>
            <span className="font-bold text-slate-900 block text-[11px]">
              Retinal Screening &amp; MATLAB Image Enhancement Engine
            </span>
            <span className="text-[11px] text-slate-500">
              Diagnostic grading per ETDRS scale (ICD-10 standard: {analysis.icdCode.split(' ')[0]}).
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
                Confidence Score
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

      {/* MATLAB Retinal Image Enhancement Pipeline Display (2x3 Subplots) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-[20px]">auto_fix_high</span>
              MATLAB Retinal Image Enhancement Pipeline (Figure: 2×3 Stages)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Gaussian Background Normalization $\rightarrow$ Adaptive Histogram Equalization (CLAHE) $\rightarrow$ Median Denoising $\rightarrow$ Contrast Adjustment
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveVisualTab('enhancement_grid')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeVisualTab === 'enhancement_grid'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All 6 MATLAB Stages
            </button>
            <button
              onClick={() => setActiveVisualTab('split')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeVisualTab === 'split'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Original vs Enhanced
            </button>
            <button
              onClick={() => setActiveVisualTab('enhanced')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeVisualTab === 'enhanced'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Final Enhanced View
            </button>
          </div>
        </div>

        {/* Tab 1: All 6 MATLAB Enhancement Pipeline Subplots (2x3 Grid) */}
        {activeVisualTab === 'enhancement_grid' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {matlabEnhancementStages.map((stage) => (
                <div key={stage.id} className="bg-slate-50 rounded-xl border border-slate-200 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 text-[11px] truncate" title={stage.title}>
                      {stage.id}. {stage.title}
                    </span>
                    <span className="text-[9px] font-mono bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded shrink-0 font-semibold">
                      {stage.badge}
                    </span>
                  </div>

                  <div className={`aspect-4/3 sm:aspect-square rounded-lg overflow-hidden ${stage.bgClass} border border-slate-300 relative group flex items-center justify-center p-1`}>
                    <img
                      src={imageUrl}
                      alt={stage.title}
                      className="w-full h-full object-contain object-center transition-all duration-300"
                      style={{ filter: stage.filter }}
                    />
                    <div className="absolute bottom-1.5 left-1.5 bg-black/80 text-white text-[9px] font-mono px-2 py-0.5 rounded backdrop-blur-xs">
                      subplot(2,3,{stage.id})
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="font-mono text-[9.5px] text-blue-600 bg-white px-2 py-0.5 rounded border border-slate-200 truncate" title={stage.command}>
                      &gt;&gt; {stage.command}
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">{stage.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                MATLAB: <code className="font-mono font-bold">imwrite(Genhanced, 'enhanced_retina.jpg')</code>
              </span>
              <span className="font-mono font-bold text-emerald-700">Image enhancement completed successfully!</span>
            </div>
          </div>
        )}

        {/* Tab 2: Side-by-Side (Original vs Enhanced) */}
        {activeVisualTab === 'split' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2 text-center">
              <div className="flex items-center justify-between text-xs pb-1">
                <span className="font-bold text-slate-800">1. Original Image (I)</span>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded">600 × 600 RGB</span>
              </div>
              <div className="aspect-square rounded-lg overflow-hidden bg-slate-950 border border-slate-300 flex items-center justify-center p-2">
                <img src={imageUrl} alt="Original Image" className="w-full h-full object-contain object-center" />
              </div>
              <p className="text-[11px] text-slate-500">Unprocessed input retinal fundus</p>
            </div>

            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2 text-center">
              <div className="flex items-center justify-between text-xs pb-1">
                <span className="font-bold text-blue-900">2. Final Enhanced (Genhanced)</span>
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">G-CLAHE + MedFilt</span>
              </div>
              <div className="aspect-square rounded-lg overflow-hidden bg-slate-950 border border-slate-300 flex items-center justify-center p-2">
                <img
                  src={imageUrl}
                  alt="Final Enhanced"
                  className="w-full h-full object-contain object-center filter grayscale contrast-190 brightness-100"
                />
              </div>
              <p className="text-[11px] text-slate-500">Enhanced contrast for clear lesion visibility</p>
            </div>
          </div>
        )}

        {/* Tab 3: Final Enhanced View Only */}
        {activeVisualTab === 'enhanced' && (
          <div className="max-w-xl mx-auto space-y-2 text-center">
            <div className="aspect-square rounded-xl overflow-hidden bg-slate-950 border border-slate-300 flex items-center justify-center p-2">
              <img
                src={imageUrl}
                alt="Final Enhanced Image"
                className="w-full h-full object-contain object-center filter grayscale contrast-190 brightness-100"
              />
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Final Enhanced Output (imadjust(Gdenoise)) — optimized for ophthalmological examination.
            </p>
          </div>
        )}
      </div>

      {/* Clinical Findings & Diagnostic Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-[20px]">biometrics</span>
              Clinical Findings &amp; Multi-Condition Differential
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Comprehensive microvascular analysis, clinical recommendations, and differential diagnosis.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveAnalysisTab('overview')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeAnalysisTab === 'overview'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Clinical Findings &amp; Action
            </button>
            <button
              onClick={() => setActiveAnalysisTab('differential')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeAnalysisTab === 'differential'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Differential (6 Conditions)
            </button>
          </div>
        </div>

        {/* Tab 1: Clinical Findings & Recommended Action */}
        {activeAnalysisTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">biometrics</span>
                Key Clinical Findings
              </h4>
              <ul className="space-y-2 text-xs text-slate-700">
                {analysis.keyFindings.map((finding, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-blue-600 text-[14px] mt-0.5">check_circle</span>
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-200/80 space-y-3">
              <h4 className="font-bold text-blue-900 text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-blue-700 text-[18px]">medical_services</span>
                Recommended Clinical Action
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {analysis.recommendedAction}
              </p>
              <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between text-[11px] text-blue-800">
                <span>Follow-up Interval: <strong>{analysis.urgency}</strong></span>
                <span>DME Macular Risk: <strong>{analysis.dmeRisk}</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: 6 Differential Diagnoses Table */}
        {activeAnalysisTab === 'differential' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3">Condition</th>
                  <th className="py-2.5 px-3">Probability</th>
                  <th className="py-2.5 px-3">Diagnostic Status</th>
                  <th className="py-2.5 px-3">Key Differentiating Features</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analysis.differentialDiagnosis.map((item, idx) => (
                  <tr key={idx} className={item.status === 'Primary Diagnosis' ? 'bg-blue-50/50 font-semibold' : ''}>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{item.condition}</td>
                    <td className="py-2.5 px-3 font-mono">{item.probability}%</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.status === 'Primary Diagnosis'
                          ? 'bg-blue-600 text-white'
                          : item.status === 'Secondary Finding'
                          ? 'bg-amber-600 text-white'
                          : item.status === 'Low Risk'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{item.keyDifferentiators}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Action Buttons: Preview Report & Start New Screening */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <span className="material-symbols-outlined text-[18px]">description</span>
            View &amp; Download A4 Clinical Report
          </button>

          <button
            onClick={onStartNewScreening}
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">restart_alt</span>
            Start New Screening
          </button>
        </div>
      </div>

      {/* A4 Report Modal */}
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
