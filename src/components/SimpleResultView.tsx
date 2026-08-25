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

  // Result card styling based on DR stage
  const getBannerInfo = () => {
    switch (analysis.stage) {
      case 0:
        return {
          title: 'NO OBVIOUS SIGNS OF DIABETIC RETINOPATHY DETECTED',
          badgeText: 'Stage 0 - No Retinopathy',
          bg: 'bg-emerald-50 border-emerald-300 text-emerald-950',
          badgeBg: 'bg-emerald-600 text-white',
          icon: 'check_circle',
          iconColor: 'text-emerald-600',
          summary: 'The retinal photograph appears clear of microaneurysms, hemorrhages, or hard exudates.'
        };
      case 1:
        return {
          title: 'MILD NON-PROLIFERATIVE DIABETIC RETINOPATHY (NPDR)',
          badgeText: 'Stage 1 - Mild NPDR',
          bg: 'bg-amber-50 border-amber-300 text-amber-950',
          badgeBg: 'bg-amber-600 text-white',
          icon: 'warning',
          iconColor: 'text-amber-600',
          summary: 'Early microaneurysms or tiny punctate dot hemorrhages detected. Regular 6-12 month eye checks recommended.'
        };
      case 2:
        return {
          title: 'MODERATE NON-PROLIFERATIVE DIABETIC RETINOPATHY (NPDR)',
          badgeText: 'Stage 2 - Moderate NPDR',
          bg: 'bg-orange-50 border-orange-300 text-orange-950',
          badgeBg: 'bg-orange-600 text-white',
          icon: 'warning',
          iconColor: 'text-orange-600',
          summary: 'Multiple retinal hemorrhages, microaneurysms, or hard exudates detected in 1-3 retinal quadrants.'
        };
      case 3:
        return {
          title: 'SEVERE NON-PROLIFERATIVE RETINOPATHY (HIGH RISK)',
          badgeText: 'Stage 3 - Severe NPDR',
          bg: 'bg-rose-50 border-rose-300 text-rose-950',
          badgeBg: 'bg-rose-600 text-white',
          icon: 'crisis_alert',
          iconColor: 'text-rose-600',
          summary: 'Severe microvascular leakage, cotton wool spots, or venous beading. Prompt ophthalmologist referral indicated.'
        };
      case 4:
        return {
          title: 'PROLIFERATIVE DIABETIC RETINOPATHY (PDR - URGENT)',
          badgeText: 'Stage 4 - Proliferative DR',
          bg: 'bg-purple-50 border-purple-300 text-purple-950',
          badgeBg: 'bg-purple-700 text-white',
          icon: 'e911_emergency',
          iconColor: 'text-purple-600',
          summary: 'Active neovascularization (new abnormal blood vessels) or vitreous hemorrhage detected. Immediate intervention required.'
        };
    }
  };

  const banner = getBannerInfo();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Top Banner with Diagnosis & AI Confidence */}
      <div className={`rounded-2xl border-2 p-6 sm:p-7 ${banner.bg} shadow-sm space-y-4`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <span className={`material-symbols-outlined text-[36px] ${banner.iconColor} shrink-0`}>
              {banner.icon}
            </span>
            <div>
              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${banner.badgeBg} shadow-xs inline-block mb-1.5`}>
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

          <div className="flex items-center gap-4 bg-white/80 backdrop-blur-xs p-3.5 rounded-xl border border-slate-200/80 shrink-0 self-stretch sm:self-auto justify-between sm:justify-start">
            <div className="text-right">
              <span className="block text-[10px] uppercase font-bold text-slate-500">
                AI Confidence
              </span>
              <span className="text-2xl font-black text-blue-700 font-mono">
                {analysis.confidence}%
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
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

      {/* 3-Image Retinal Comparison: Original, MATLAB B&W Enhanced, AI Highlighted */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[20px]">burst_mode</span>
            Retinal Processing &amp; AI Heatmap Explainability
          </h3>
          <span className="text-xs text-slate-500">
            MATLAB G-CLAHE Matrix Analysis
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Original Image */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">1. Original Fundus</span>
              <span className="text-[10px] text-slate-500">Raw Input</span>
            </div>
            <div className="aspect-square rounded-xl overflow-hidden bg-black border border-slate-200 relative group">
              <img
                src={imageUrl}
                alt="Original"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded">
                45° Color Photo
              </div>
            </div>
          </div>

          {/* 2. MATLAB Black & White Enhanced (G-CLAHE) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">2. MATLAB B&amp;W Enhanced</span>
              <span className="text-[10px] font-mono text-cyan-700 bg-cyan-50 px-1.5 py-0.2 rounded border border-cyan-200">
                G = I(:,:,2) + CLAHE
              </span>
            </div>
            <div className="aspect-square rounded-xl overflow-hidden bg-black border border-slate-200 relative group">
              <img
                src={imageUrl}
                alt="MATLAB Black and White Enhanced"
                className="w-full h-full object-cover filter grayscale contrast-150 brightness-95"
              />
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                Denoised Vessel Matrix
              </div>
            </div>
          </div>

          {/* 3. AI Highlighted Attention Map (Grad-CAM) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">3. AI Highlighted (Grad-CAM)</span>
              <span className="text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200 font-bold">
                Focus Heatmap
              </span>
            </div>
            <div className="aspect-square rounded-xl overflow-hidden bg-black border border-slate-200 relative group">
              <img
                src={imageUrl}
                alt="AI Grad-CAM Heatmap"
                className="w-full h-full object-cover filter brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-radial from-red-500/40 via-amber-500/25 to-transparent mix-blend-screen pointer-events-none"></div>
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                Microaneurysm Focus
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Grid: AI Findings & Comprehensive Patient Context */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: What Did the AI Find? */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[20px]">search_insights</span>
            What Did the AI Find?
          </h3>

          <ul className="space-y-2.5 text-xs text-slate-700">
            {analysis.keyFindings.map((finding, idx) => (
              <li key={idx} className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{finding}</span>
              </li>
            ))}
          </ul>

          <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
            <span className="font-bold text-slate-800 block">Macular Edema (CSME) Risk:</span>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-md font-bold text-[11px] ${
                analysis.dmeRisk === 'Negative'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {analysis.dmeRisk}
              </span>
              <span className="text-slate-500 text-[11px]">
                Confidence: {analysis.dmeConfidence}%
              </span>
            </div>
          </div>
        </div>

        {/* Right: Recommended Clinical Action */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600 text-[20px]">medical_services</span>
              Recommended Action &amp; Follow-up
            </h3>

            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-slate-800 text-xs leading-relaxed space-y-2">
              <p className="font-semibold text-blue-950">
                {analysis.recommendedAction}
              </p>
              <p className="text-[11px] text-slate-600">
                Patient's blood pressure ({patientDetails.bloodPressure}) and glycemic control ({patientDetails.hba1c}%) should be monitored closely with the primary physician.
              </p>
            </div>
          </div>

          {/* Action Buttons: Preview Report & Start New Screening */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">preview</span>
              PREVIEW REPORT
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
      </div>

      {/* Report Preview Modal (with prominent close button on top and download PDF option) */}
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
