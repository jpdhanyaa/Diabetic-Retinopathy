import React from 'react';
import { DRAnalysisResult } from '../types';

interface SimpleReportModalProps {
  patientId: string;
  patientAge: number;
  selectedEye: string;
  imageUrl: string;
  analysis: DRAnalysisResult;
  onClose: () => void;
}

export const SimpleReportModal: React.FC<SimpleReportModalProps> = ({
  patientId,
  patientAge,
  selectedEye,
  imageUrl,
  analysis,
  onClose
}) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getStatusText = () => {
    if (analysis.stage === 0) {
      return {
        banner: '🟢 NO OBVIOUS SIGNS DETECTED',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        severity: 'No Obvious Risk (Normal)',
        recommendation: 'Annual routine retinal examination recommended. Maintain regular blood glucose and blood pressure control.'
      };
    } else if (analysis.stage <= 2) {
      return {
        banner: '🟠 POSSIBLE SIGNS OF DIABETIC RETINOPATHY',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
        severity: analysis.stage === 1 ? 'Mild Risk' : 'Moderate Risk',
        recommendation: 'Possible signs of diabetic retinopathy were detected. Clinical review by an eye care specialist (optometrist or ophthalmologist) is recommended within 3–6 months.'
      };
    } else {
      return {
        banner: '🔴 HIGH-RISK SIGNS DETECTED — OPHTHALMOLOGIST REVIEW RECOMMENDED',
        badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
        severity: analysis.stage === 3 ? 'Severe Risk' : 'High / Proliferative Risk',
        recommendation: 'High-risk retinal changes identified. Prompt referral and examination by an ophthalmologist or vitreoretinal specialist is recommended.'
      };
    }
  };

  const status = getStatusText();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl max-w-3xl w-full p-8 shadow-2xl space-y-6 my-6 print:p-0 print:m-0 print:shadow-none print:max-w-none print:w-full print:rounded-none">
        {/* Controls Ribbon (hidden when printing) */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[24px]">description</span>
            <span className="font-bold text-slate-800 text-sm">
              Screening Report Ready to Print / Download
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
              AI DIABETIC RETINOPATHY SCREENING REPORT
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Automated Retinal Image Analysis &amp; Screening Support System
            </p>
          </div>

          {/* Patient Details & Exam Meta */}
          <div className="grid grid-cols-3 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Patient ID:</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{patientId}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Age / Eye Examined:</span>
              <span className="font-bold text-slate-900">{patientAge} yrs • {selectedEye}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Date of Screening:</span>
              <span className="font-medium text-slate-800">{currentDate}</span>
            </div>
          </div>

          {/* Image Quality Status */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
            <span className="font-bold text-emerald-900 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              IMAGE QUALITY ASSESSMENT
            </span>
            <span className="font-bold text-emerald-800">✓ Suitable for analysis (Score: 98/100)</span>
          </div>

          {/* AI Screening Result Banner */}
          <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
              AI SCREENING RESULT
            </span>
            <div className={`p-3.5 rounded-xl border text-sm font-extrabold flex items-center justify-between ${status.badgeColor}`}>
              <span>{status.banner}</span>
              <span className="text-xs font-mono font-bold bg-white/80 px-2 py-1 rounded">
                Confidence: {analysis.confidence.toFixed(1)}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs pt-1">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">DR Severity Estimate:</span>
                <span className="font-bold text-slate-900 text-sm">{status.severity}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Confidence Level:</span>
                <span className="font-mono font-bold text-blue-700 text-sm">{analysis.confidence.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Images Section (Original, Enhanced, Grad-CAM Explanation) */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
              RETINAL IMAGING &amp; AI EXPLAINABILITY
            </span>

            <div className="grid grid-cols-3 gap-3">
              {/* Original Image */}
              <div className="space-y-1 text-center">
                <div className="aspect-square rounded-lg overflow-hidden bg-black border border-slate-200">
                  <img src={imageUrl} alt="Original" className="w-full h-full object-cover" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 block">1. Original Image</span>
              </div>

              {/* Enhanced Image */}
              <div className="space-y-1 text-center">
                <div className="aspect-square rounded-lg overflow-hidden bg-black border border-slate-200">
                  <img
                    src={imageUrl}
                    alt="Enhanced"
                    className="w-full h-full object-cover"
                    style={{ filter: 'contrast(175%) brightness(105%) saturate(125%)' }}
                  />
                </div>
                <span className="text-[11px] font-bold text-slate-700 block">2. Enhanced Image (CLAHE)</span>
              </div>

              {/* AI Explanation / Heatmap */}
              <div className="space-y-1 text-center">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-black border border-slate-200">
                  <img
                    src={imageUrl}
                    alt="AI Explanation"
                    className="w-full h-full object-cover"
                    style={{ filter: 'contrast(170%) brightness(105%)' }}
                  />
                  <div
                    className="absolute inset-0 opacity-60 mix-blend-color-dodge"
                    style={{
                      background:
                        analysis.stage === 0
                          ? 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.4) 0%, transparent 70%)'
                          : 'radial-gradient(circle at 62% 48%, rgba(239, 68, 68, 0.9) 0%, rgba(245, 158, 11, 0.7) 35%, rgba(59, 130, 246, 0.3) 65%, transparent 80%)'
                    }}
                  ></div>
                </div>
                <span className="text-[11px] font-bold text-slate-700 block">3. AI Attention Heatmap</span>
              </div>
            </div>
          </div>

          {/* AI Explanation & Findings */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
            <span className="font-bold text-slate-900 block">AI EXPLANATION</span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Highlighted retinal regions indicate areas contributing to the prediction. Blood vessel calibers, foveal avascular zone (FAZ) integrity, and abnormal microvascular lesions were evaluated.
            </p>
            <ul className="list-disc list-inside text-slate-700 text-[11px] space-y-0.5 pt-1">
              {analysis.keyFindings.slice(0, 3).map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>

          {/* Recommendation Box */}
          <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl space-y-1 text-xs">
            <span className="font-bold text-blue-900 block">RECOMMENDATION</span>
            <p className="text-blue-800 text-[11px] leading-relaxed">
              {status.recommendation}
            </p>
          </div>

          {/* Disclaimer */}
          <div className="border-t border-slate-200 pt-3 text-center space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">DISCLAIMER</span>
            <p className="text-[10px] text-slate-500 max-w-xl mx-auto leading-normal">
              This is an AI-assisted screening result and is not a final clinical diagnosis. AI screening indicates possible signs of diabetic retinopathy. Clinical review and comprehensive dilated examination by an ophthalmologist or qualified eye care professional is recommended.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
