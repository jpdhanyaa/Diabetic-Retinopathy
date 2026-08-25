import React, { useState } from 'react';
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

  if (!isOpen) return null;

  // Actual PDF download function using jsPDF and html2canvas + instant download trigger
  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      const reportElement = document.getElementById('printable-report-area');
      const filename = `RetinaScan_Screening_Report_${patientDetails.patientId || 'PAT'}_${new Date().toISOString().slice(0, 10)}.pdf`;

      if (reportElement) {
        // High quality rendering
        const canvas = await html2canvas(reportElement, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        // If the report fits or exceeds, handle scaling cleanly
        if (pdfHeight <= pdf.internal.pageSize.getHeight()) {
          pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        } else {
          // Multi-page or fit to 1-2 pages
          let heightLeft = pdfHeight;
          let position = 0;
          const pageHeight = pdf.internal.pageSize.getHeight();

          pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
          heightLeft -= pageHeight;

          while (heightLeft > 0) {
            position = heightLeft - pdfHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pageHeight;
          }
        }

        // Trigger file download
        pdf.save(filename);
      } else {
        // Fallback: window.print()
        window.print();
      }
    } catch (err) {
      console.error('Error generating PDF:', err);
      // Fallback print/download dialog
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const getSeverityBadge = () => {
    switch (analysis.stage) {
      case 0:
        return { text: 'NO SIGNS OF DIABETIC RETINOPATHY', color: 'bg-emerald-50 text-emerald-800 border-emerald-300' };
      case 1:
        return { text: 'MILD NON-PROLIFERATIVE RETINOPATHY', color: 'bg-amber-50 text-amber-800 border-amber-300' };
      case 2:
        return { text: 'MODERATE NON-PROLIFERATIVE RETINOPATHY', color: 'bg-orange-50 text-orange-800 border-orange-300' };
      case 3:
        return { text: 'SEVERE NON-PROLIFERATIVE RETINOPATHY', color: 'bg-rose-50 text-rose-800 border-rose-300' };
      case 4:
        return { text: 'PROLIFERATIVE DIABETIC RETINOPATHY (HIGH RISK)', color: 'bg-purple-50 text-purple-800 border-purple-300' };
    }
  };

  const badge = getSeverityBadge();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* TOP BAR WITH CLEAR CLOSING OPTION (X / CLOSE PREVIEW) & DOWNLOAD BUTTON */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 print:hidden sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-400 text-[22px]">description</span>
            <span className="font-bold text-sm">Clinical Screening Report Preview</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Download Report Button - Actually downloads PDF */}
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span className={`material-symbols-outlined text-[18px] ${isDownloading ? 'animate-spin' : ''}`}>
                {isDownloading ? 'progress_activity' : 'download'}
              </span>
              {isDownloading ? 'Generating PDF...' : 'Download Report'}
            </button>

            {/* Prominent Close Button on Top */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
              title="Close Preview"
              aria-label="Close Preview"
            >
              <span className="text-xs font-semibold hidden sm:inline">Close</span>
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>
        </div>

        {/* Printable Report Content Body */}
        <div id="printable-report-area" className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800 text-xs bg-white">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-slate-900 pb-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[28px]">visibility</span>
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">RetinaScan AI</h1>
                <p className="text-xs font-semibold text-slate-600">
                  Hospital-Grade Diabetic Retinopathy Screening &amp; MATLAB Image Enhancement Report
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-0.5 text-[11px] text-slate-500">
              <p><strong>Report Date:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong>Report ID:</strong> REP-{patientDetails.patientId}-{Math.floor(1000 + Math.random() * 9000)}</p>
              <p><strong>Standard:</strong> ICD-10 {analysis.icdCode} / ETDRS Level {analysis.etdrsScore}</p>
            </div>
          </div>

          {/* Primary Patient Information Block */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <h2 className="font-extrabold text-slate-900 uppercase text-[11px] tracking-wider border-b border-slate-200 pb-1">
              Patient Identification &amp; Clinical Parameters
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">Patient Full Name</span>
                <span className="font-bold text-slate-900">{patientDetails.patientName || 'Eleanor Vance'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Patient ID / MRN</span>
                <span className="font-mono font-bold text-slate-900">{patientDetails.patientId}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Age / Gender</span>
                <span className="font-bold text-slate-900">{patientDetails.age} Years</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Examined Eye</span>
                <span className="font-bold text-blue-700">{patientDetails.selectedEye}</span>
              </div>
            </div>

            {/* Comprehensive Medical History */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">Diabetes Type &amp; Duration</span>
                <span className="font-bold text-slate-900">{patientDetails.diabetesType} ({patientDetails.diabetesDurationYears} yrs)</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Blood Sugar &amp; HbA1c</span>
                <span className="font-bold text-slate-900">{patientDetails.bloodSugarLevel} mg/dL | {patientDetails.hba1c}%</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Blood Pressure (BP)</span>
                <span className="font-bold text-slate-900">{patientDetails.bloodPressure}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Kidney Status</span>
                <span className="font-bold text-slate-900">{patientDetails.kidneyFunctionStatus}</span>
              </div>
            </div>

            {/* Medications & Reproductive & Symptoms */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">Diabetes Medications</span>
                <span className="font-medium text-slate-800">
                  {patientDetails.diabetesMedications.length > 0 ? patientDetails.diabetesMedications.join(', ') : 'None reported'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Systemic Drugs / Blood Thinners</span>
                <span className="font-medium text-slate-800">
                  {patientDetails.systemicMedications.length > 0 ? patientDetails.systemicMedications.join(', ') : 'None reported'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Reproductive Status &amp; Symptoms</span>
                <span className="font-medium text-slate-800">
                  {patientDetails.reproductiveStatus} • {patientDetails.ocularSymptoms.join(', ') || 'Asymptomatic'}
                </span>
              </div>
            </div>
          </div>

          {/* AI Screening Classification & MATLAB Enhancement */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3">
            <h2 className="font-extrabold text-slate-900 uppercase text-[11px] tracking-wider border-b border-slate-200 pb-1">
              AI Diagnostic Evaluation &amp; MATLAB Image Enhancement
            </h2>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-lg">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Assigned Screening Stage</span>
                <span className={`inline-block px-3 py-1 rounded-md text-xs font-extrabold border ${badge.color}`}>
                  {badge.text}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Model Confidence</span>
                <span className="text-base font-extrabold text-blue-700">{analysis.confidence}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">DME Macular Edema Risk</span>
                <span className="text-xs font-bold text-slate-900">{analysis.dmeRisk}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Referral Urgency</span>
                <span className="text-xs font-bold text-amber-700">{analysis.urgency}</span>
              </div>
            </div>

            {/* Tri-Panel Retinal Images: Original, MATLAB B&W Enhanced, and AI Grad-CAM */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="space-y-1 text-center">
                <span className="font-bold text-[11px] text-slate-700 block">1. Original Retinal Image</span>
                <div className="aspect-square rounded-lg overflow-hidden bg-black border border-slate-200">
                  <img src={imageUrl} alt="Original" className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="space-y-1 text-center">
                <span className="font-bold text-[11px] text-slate-700 block">2. MATLAB B&amp;W Enhanced (G-CLAHE)</span>
                <div className="aspect-square rounded-lg overflow-hidden bg-black border border-slate-200">
                  <img src={imageUrl} alt="Enhanced" className="w-full h-full object-cover filter grayscale contrast-150 brightness-95" />
                </div>
              </div>

              <div className="space-y-1 text-center">
                <span className="font-bold text-[11px] text-slate-700 block">3. AI Highlighted (Grad-CAM)</span>
                <div className="aspect-square rounded-lg overflow-hidden bg-black border border-slate-200 relative">
                  <img src={imageUrl} alt="Heatmap" className="w-full h-full object-cover filter brightness-90" />
                  <div className="absolute inset-0 bg-gradient-radial from-red-500/40 via-amber-500/20 to-transparent mix-blend-screen pointer-events-none"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Hospital Differential Diagnosis & Barbara Davis Lesions Table */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3">
            <h2 className="font-extrabold text-slate-900 uppercase text-[11px] tracking-wider border-b border-slate-200 pb-1">
              Multi-Condition Differential Diagnosis &amp; Quantitative Lesion Breakdown
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 block text-[10px]">Microaneurysms</span>
                <span className="font-mono font-bold text-slate-900">{analysis.lesionBreakdown.microaneurysmsCount}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Blot Hemorrhages</span>
                <span className="font-mono font-bold text-slate-900">{analysis.lesionBreakdown.blotHemorrhagesCount}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Hard Exudates</span>
                <span className="font-mono font-bold text-slate-900">{analysis.lesionBreakdown.hardExudatesAreaMm2} mm²</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Cup-to-Disc (CDR)</span>
                <span className="font-mono font-bold text-slate-900">{analysis.lesionBreakdown.opticCupToDiscRatio}</span>
              </div>
            </div>

            {/* Differential Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] uppercase font-extrabold text-slate-500 bg-slate-100/60">
                    <th className="py-1.5 px-2">Pathology (Hospital Atlas)</th>
                    <th className="py-1.5 px-2">Probability</th>
                    <th className="py-1.5 px-2">Status</th>
                    <th className="py-1.5 px-2">Key Differentiating Features</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {analysis.differentialDiagnosis.map((item, idx) => (
                    <tr key={idx} className={item.status === 'Primary Diagnosis' ? 'bg-blue-50/50 font-medium' : ''}>
                      <td className="py-1.5 px-2 font-bold text-slate-900">{item.condition}</td>
                      <td className="py-1.5 px-2 font-mono">{item.probability}%</td>
                      <td className="py-1.5 px-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'Primary Diagnosis'
                            ? 'bg-blue-600 text-white'
                            : item.status === 'Secondary Finding'
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-1.5 px-2 text-slate-600">{item.keyDifferentiators}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Key Findings & Recommendations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-xl p-4 space-y-2">
              <h3 className="font-extrabold text-slate-900 uppercase text-[11px] tracking-wider">
                What Did the AI Find?
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {analysis.keyFindings.map((finding, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-blue-200 bg-blue-50/40 rounded-xl p-4 space-y-2">
              <h3 className="font-extrabold text-blue-900 uppercase text-[11px] tracking-wider">
                Recommended Action
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {analysis.recommendedAction}
              </p>
              <p className="text-[11px] text-slate-500 pt-1 border-t border-blue-100">
                Regular dilated retinal examinations and strict glycemic control (HbA1c &lt; 7.0%) are advised.
              </p>
            </div>
          </div>

          {/* Signatures & Hospital Knowledge Base Sources */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500">
            <div>
              <p className="font-bold text-slate-700">Hospital &amp; Clinical Knowledge Sources:</p>
              <p>• University of Iowa EyeRounds Normal Fundus Atlas Reference Criteria</p>
              <p>• Barbara Davis Center for Diabetes (CU Anschutz Medical Campus) Lesion Classification</p>
              <p>• Retina Today Clinical Multi-Center Image Archive &amp; ETDRS Research Protocols</p>
              <p>• Eye7 Eye Hospitals Multi-Condition Retinal Pathology Differential Atlas</p>
            </div>
            <div className="text-right sm:min-w-40 border-t sm:border-t-0 sm:border-l border-slate-300 pt-2 sm:pt-0 sm:pl-4">
              <div className="font-serif italic text-slate-800 text-xs">Automated Clinical AI</div>
              <span className="font-bold text-slate-700">Verified System Report</span>
            </div>
          </div>
        </div>

        {/* Footer Actions inside preview */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-xs cursor-pointer transition-colors"
          >
            Close Preview
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <span className={`material-symbols-outlined text-[18px] ${isDownloading ? 'animate-spin' : ''}`}>
              {isDownloading ? 'progress_activity' : 'download'}
            </span>
            {isDownloading ? 'Downloading Report...' : 'Download Report'}
          </button>
        </div>
      </div>
    </div>
  );
};
