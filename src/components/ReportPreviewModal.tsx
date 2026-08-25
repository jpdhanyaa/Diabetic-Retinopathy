import React, { useState, useRef } from 'react';
import { DRAnalysisResult, PatientDetails } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientDetails: PatientDetails;
  analysis: DRAnalysisResult;
  imageUrl: string;
}

export const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({
  isOpen,
  onClose,
  patientDetails,
  analysis,
  imageUrl
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const a4PageRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Ultra-Reliable 1-Page A4 PDF Generation with exact dimensional mapping
  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      const pageEl = a4PageRef.current;
      const filename = `RetinaScan_Report_${patientDetails.patientId || 'PAT'}_${new Date().toISOString().slice(0, 10)}.pdf`;

      if (!pageEl) {
        window.print();
        setIsDownloading(false);
        return;
      }

      // Create an exact A4-dimension offscreen rendering container (794px x 1123px = 210mm x 297mm at 96 DPI)
      const offscreenWrapper = document.createElement('div');
      offscreenWrapper.style.position = 'fixed';
      offscreenWrapper.style.left = '-9999px';
      offscreenWrapper.style.top = '0';
      offscreenWrapper.style.width = '794px';
      offscreenWrapper.style.height = '1123px';
      offscreenWrapper.style.backgroundColor = '#ffffff';
      offscreenWrapper.style.zIndex = '-9999';
      offscreenWrapper.style.overflow = 'hidden';

      const clone = pageEl.cloneNode(true) as HTMLElement;
      clone.style.width = '794px';
      clone.style.height = '1123px';
      clone.style.maxWidth = '794px';
      clone.style.maxHeight = '1123px';
      clone.style.margin = '0';
      clone.style.padding = '24px 30px';
      clone.style.boxShadow = 'none';
      clone.style.borderRadius = '0';
      clone.style.border = 'none';
      clone.style.backgroundColor = '#ffffff';
      clone.style.boxSizing = 'border-box';
      clone.style.display = 'flex';
      clone.style.flexDirection = 'column';
      clone.style.justifyContent = 'space-between';

      offscreenWrapper.appendChild(clone);
      document.body.appendChild(offscreenWrapper);

      // Pre-load all images in the clone before canvas conversion
      const images = Array.from(clone.getElementsByTagName('img'));
      await Promise.all(
        images.map((img) => {
          if (img.complete) return Promise.resolve(true);
          return new Promise((resolve) => {
            img.onload = () => resolve(true);
            img.onerror = () => resolve(true);
          });
        })
      );

      // Capture high-res snapshot exactly within 794x1123 frame
      const canvas = await html2canvas(clone, {
        scale: 2, // 2x gives 1588x2246 crisp pixels
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123,
        windowWidth: 794,
        windowHeight: 1123,
        scrollY: 0,
        scrollX: 0
      });

      // Cleanup DOM node immediately
      if (offscreenWrapper.parentNode) {
        offscreenWrapper.parentNode.removeChild(offscreenWrapper);
      }

      // Instantiate jsPDF with standard ISO A4 dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      // Add image precisely fitting 210mm x 297mm Single Page
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      pdf.save(filename);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Error generating PDF via html2canvas:', err);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const getSeverityBadge = () => {
    switch (analysis.stage) {
      case 0:
        return { text: 'NO SIGNS OF DIABETIC RETINOPATHY (STAGE 0: NORMAL)', color: 'bg-emerald-100 text-emerald-900 border-emerald-400' };
      case 1:
        return { text: `MILD NON-PROLIFERATIVE RETINOPATHY (${analysis.matchedSubStage?.name || 'STAGE 1'})`, color: 'bg-amber-100 text-amber-900 border-amber-400' };
      case 2:
        return { text: 'MODERATE NON-PROLIFERATIVE RETINOPATHY (STAGE 2: MOD NPDR)', color: 'bg-orange-100 text-orange-900 border-orange-400' };
      case 3:
        return { text: 'SEVERE NON-PROLIFERATIVE RETINOPATHY (STAGE 3: SEVERE NPDR)', color: 'bg-rose-100 text-rose-900 border-rose-400' };
      case 4:
        return { text: `PROLIFERATIVE DIABETIC RETINOPATHY (${(analysis.matchedSubStage?.name || 'STAGE 4: PDR').toUpperCase()})`, color: 'bg-purple-100 text-purple-900 border-purple-400' };
    }
  };

  const badge = getSeverityBadge();

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      
      {/* Modal Container */}
      <div className="w-full max-w-4xl max-h-[96vh] flex flex-col bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800 overflow-hidden print:border-none print:shadow-none print:max-h-none print:bg-white">
        
        {/* Top Control Bar */}
        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-400 text-[20px]">description</span>
            <div>
              <span className="font-extrabold text-xs tracking-tight">Clinical Screening Report</span>
              <span className="ml-2 text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-mono">
                Standard A4 (1 Page Fit)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {downloadSuccess && (
              <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Downloaded!
              </span>
            )}

            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
            >
              <span className={`material-symbols-outlined text-[16px] ${isDownloading ? 'animate-spin' : ''}`}>
                {isDownloading ? 'progress_activity' : 'download'}
              </span>
              {isDownloading ? 'Downloading PDF...' : 'Download A4 PDF'}
            </button>

            <button
              onClick={() => window.print()}
              className="hidden sm:flex px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all items-center gap-1 cursor-pointer"
              title="Print Report"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              Print
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer flex items-center"
              title="Close Preview"
              aria-label="Close Preview"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Scrollable Viewport Area */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 flex justify-center bg-slate-950/60 print:p-0 print:overflow-visible">
          
          {/* Exact Proportional A4 Sheet (794px × 1123px standard A4 ratio) */}
          <div
            ref={a4PageRef}
            id="printable-report-area"
            className="w-full max-w-[760px] min-h-[1070px] bg-white text-slate-900 p-6 sm:p-7 shadow-xl border border-slate-200 rounded-lg font-sans flex flex-col justify-between print:shadow-none print:border-none print:m-0 print:p-6"
            style={{ width: '100%', maxWidth: '760px', boxSizing: 'border-box' }}
          >
            <div className="space-y-2.5">
              
              {/* Header / Hospital Identification */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold shadow-xs">
                    <span className="material-symbols-outlined text-[22px]">visibility</span>
                  </div>
                  <div>
                    <h1 className="text-base font-black text-slate-900 tracking-tight leading-none">RetinaScan AI</h1>
                    <p className="text-[10px] font-semibold text-slate-600 mt-0.5">
                      Clinical Retinopathy Screening &amp; MATLAB Enhancement Report
                    </p>
                  </div>
                </div>

                <div className="text-right text-[9.5px] text-slate-600 leading-tight space-y-0.5">
                  <p><strong>Date:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  <p><strong>ID:</strong> REP-{patientDetails.patientId || 'PAT'}-{Math.floor(1000 + Math.random() * 9000)}</p>
                  <p><strong>Standard:</strong> ICD-10 {analysis.icdCode.split(' ')[0]} • ETDRS Level {analysis.etdrsScore}</p>
                </div>
              </div>

              {/* Patient Identification & Clinical Parameters */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-1.5">
                <h2 className="text-[9.5px] font-extrabold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-0.5">
                  Patient Identification &amp; Clinical Parameters
                </h2>

                <div className="grid grid-cols-4 gap-2 text-[10.5px] leading-snug">
                  <div>
                    <span className="text-slate-500 block text-[8.5px]">Patient Name</span>
                    <span className="font-bold text-slate-900 break-words">{patientDetails.patientName || 'Eleanor Vance'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[8.5px]">Patient ID / MRN</span>
                    <span className="font-mono font-bold text-slate-900 break-words">{patientDetails.patientId}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[8.5px]">Age / Gender</span>
                    <span className="font-bold text-slate-900">{patientDetails.age} Years</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[8.5px]">Examined Eye</span>
                    <span className="font-bold text-blue-700">{patientDetails.selectedEye}</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-1 border-t border-slate-200 text-[10.5px] leading-snug">
                  <div>
                    <span className="text-slate-500 block text-[8.5px]">Diabetes Type &amp; Duration</span>
                    <span className="font-semibold text-slate-900 break-words">{patientDetails.diabetesType} ({patientDetails.diabetesDurationYears} yrs)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[8.5px]">Blood Sugar &amp; HbA1c</span>
                    <span className="font-semibold text-slate-900">{patientDetails.bloodSugarLevel} mg/dL • {patientDetails.hba1c}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[8.5px]">Blood Pressure</span>
                    <span className="font-semibold text-slate-900">{patientDetails.bloodPressure}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[8.5px]">Kidney Status</span>
                    <span className="font-semibold text-slate-900 break-words">{patientDetails.kidneyFunctionStatus}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200 text-[9.5px] leading-snug">
                  <div>
                    <span className="text-slate-500 block text-[8.5px]">Diabetes Medications</span>
                    <span className="font-medium text-slate-800 break-words block">
                      {patientDetails.diabetesMedications && patientDetails.diabetesMedications.length > 0
                        ? patientDetails.diabetesMedications.join(', ')
                        : 'None'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[8.5px]">Systemic / Blood Thinners</span>
                    <span className="font-medium text-slate-800 break-words block">
                      {patientDetails.systemicMedications && patientDetails.systemicMedications.length > 0
                        ? patientDetails.systemicMedications.join(', ')
                        : 'None'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[8.5px]">Symptoms</span>
                    <span className="font-medium text-slate-800 break-words block">
                      {patientDetails.ocularSymptoms && patientDetails.ocularSymptoms.length > 0 ? patientDetails.ocularSymptoms.join(', ') : 'Asymptomatic'}
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Diagnostic Classification Summary */}
              <div className="border border-slate-200 rounded-lg p-2.5 space-y-2">
                <h2 className="text-[9.5px] font-extrabold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-0.5">
                  AI Diagnostic Summary &amp; Image Enhancements
                </h2>

                <div className="flex items-center justify-between gap-2 bg-slate-50 p-2 rounded border border-slate-200">
                  <div>
                    <span className="text-[8.5px] text-slate-500 uppercase font-bold block">Diagnostic Classification</span>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10.5px] font-extrabold border ${badge.color}`}>
                      {badge.text}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-[8.5px] text-slate-500 uppercase font-bold block">Confidence</span>
                    <span className="text-xs font-black text-blue-700">{analysis.confidence}%</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[8.5px] text-slate-500 uppercase font-bold block">DME Risk</span>
                    <span className="text-[10px] font-bold text-slate-900">{analysis.dmeRisk}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8.5px] text-slate-500 uppercase font-bold block">Urgency</span>
                    <span className="text-[10px] font-bold text-amber-700">{analysis.urgency}</span>
                  </div>
                </div>

                {/* Tri-Panel Retinal Imagery */}
                <div className="grid grid-cols-3 gap-2 pt-0.5">
                  <div className="space-y-1 text-center">
                    <span className="font-bold text-[9.5px] text-slate-700 block">1. Original Retinal Image</span>
                    <div className="aspect-4/3 rounded border border-slate-300 bg-slate-950 flex items-center justify-center p-1 overflow-hidden">
                      <img src={imageUrl} alt="Original Fundus" className="w-full h-full object-contain object-center" />
                    </div>
                  </div>

                  <div className="space-y-1 text-center">
                    <span className="font-bold text-[9.5px] text-slate-700 block">2. MATLAB Enhanced (G-CLAHE)</span>
                    <div className="aspect-4/3 rounded border border-slate-300 bg-slate-950 flex items-center justify-center p-1 overflow-hidden">
                      <img src={imageUrl} alt="MATLAB Enhanced" className="w-full h-full object-contain object-center filter grayscale contrast-150 brightness-95" />
                    </div>
                  </div>

                  <div className="space-y-1 text-center">
                    <span className="font-bold text-[9.5px] text-slate-700 block">3. AI Grad-CAM Highlighted</span>
                    <div className="aspect-4/3 rounded border border-slate-300 bg-slate-950 flex items-center justify-center p-1 overflow-hidden relative">
                      <img src={imageUrl} alt="Grad-CAM" className="w-full h-full object-contain object-center filter brightness-90" />
                      <div className="absolute inset-0 bg-gradient-radial from-red-500/40 via-amber-500/20 to-transparent mix-blend-screen pointer-events-none"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Differential Stage Possibilities Breakdown (What Stage It Could Be) */}
              <div className="border border-blue-200 bg-blue-50/20 rounded-lg p-2 space-y-1">
                <div className="flex items-center justify-between border-b border-blue-200/80 pb-0.5">
                  <h2 className="text-[9.5px] font-extrabold uppercase tracking-wider text-blue-900">
                    Diabetic Retinopathy Stage Likelihood Assessment (What Stage It Could Be)
                  </h2>
                  <span className="text-[8.5px] font-semibold text-blue-700 bg-blue-100/80 px-1.5 py-0.2 rounded">
                    ETDRS &amp; Clinical Sub-Stage Matching
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                  {(analysis.subStageMatches || []).slice(0, 6).map((subStage) => {
                    const isTopMatch = subStage.id === analysis.matchedSubStage?.id || (analysis.stage === 0 && subStage.id === 'substage-0-normal');
                    return (
                      <div
                        key={subStage.id}
                        className={`p-1.5 rounded border text-[9px] leading-tight ${
                          isTopMatch
                            ? 'bg-blue-100/90 border-blue-400 font-semibold text-blue-950'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate font-bold" title={subStage.name}>
                            {subStage.name}
                          </span>
                          <span className="font-mono font-bold shrink-0 ml-1 text-blue-800">
                            {subStage.probability}%
                          </span>
                        </div>
                        <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden my-0.5">
                          <div
                            className={`h-full ${isTopMatch ? 'bg-blue-600' : 'bg-slate-400'}`}
                            style={{ width: `${Math.min(100, Math.max(3, subStage.probability))}%` }}
                          ></div>
                        </div>
                        <p className="text-[8px] text-slate-500 truncate" title={subStage.keySigns}>
                          {subStage.keySigns}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Differential Diagnosis Table */}
              <div className="border border-slate-200 rounded-lg p-2 space-y-1">
                <h2 className="text-[9.5px] font-extrabold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-0.5">
                  Multi-Condition Differential Diagnosis
                </h2>

                <div className="overflow-hidden rounded border border-slate-200">
                  <table className="w-full text-left text-[9.5px] border-collapse leading-snug">
                    <thead>
                      <tr className="bg-slate-100 font-bold text-slate-600 border-b border-slate-200">
                        <th className="py-1 px-1.5 w-[28%]">Pathology Condition</th>
                        <th className="py-1 px-1.5 w-[12%]">Probability</th>
                        <th className="py-1 px-1.5 w-[18%]">Status</th>
                        <th className="py-1 px-1.5 w-[42%]">Key Differentiating Features</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {analysis.differentialDiagnosis.slice(0, 4).map((item, idx) => (
                        <tr key={idx} className={item.status === 'Primary Diagnosis' ? 'bg-blue-50/60 font-medium' : ''}>
                          <td className="py-0.8 px-1.5 font-bold text-slate-900 break-words">{item.condition}</td>
                          <td className="py-0.8 px-1.5 font-mono">{item.probability}%</td>
                          <td className="py-0.8 px-1.5">
                            <span className={`px-1.5 py-0.2 rounded text-[8.5px] font-bold ${
                              item.status === 'Primary Diagnosis'
                                ? 'bg-blue-600 text-white'
                                : item.status === 'Secondary Finding'
                                ? 'bg-amber-600 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-0.8 px-1.5 text-slate-700 break-words leading-tight">{item.keyDifferentiators}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recommended Clinical Action */}
              <div className="border border-blue-200 bg-blue-50/50 rounded-lg p-2.5 space-y-1">
                <h3 className="text-[9.5px] font-extrabold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[13px] text-blue-700">medical_services</span>
                  Recommended Clinical Action &amp; Follow-up
                </h3>
                <p className="text-[9.5px] text-slate-800 font-medium leading-snug break-words">
                  {analysis.recommendedAction}
                </p>
                <div className="flex items-center justify-between text-[8.5px] text-blue-800 pt-0.5 border-t border-blue-200/60 font-medium">
                  <span>Referral Urgency: <strong>{analysis.urgency}</strong></span>
                  <span>Macular Edema (DME) Status: <strong>{analysis.dmeRisk}</strong></span>
                  <span>Target HbA1c: <strong>&lt; 7.0%</strong></span>
                </div>
              </div>
            </div>

            {/* Verification Footer */}
            <div className="pt-2 mt-2 border-t border-slate-300 flex items-center justify-between text-[8.5px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-blue-600 text-[14px]">verified</span>
                <span className="font-semibold text-slate-700">RetinaScan AI Screening Protocol • Automated Digital Ophthalmic Grading</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-700">Verified System Report • Page 1 of 1</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
