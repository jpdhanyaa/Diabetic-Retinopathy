import React from 'react';
import { RetinalScan, PatientRecord } from '../types/retinopathy';
import { ICDR_STAGES, DME_DEFINITIONS } from '../data/icdrDefinitions';
import { X, Printer, Download, Eye, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';

interface ReportModalProps {
  scan: RetinalScan;
  patient?: PatientRecord;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  scan,
  patient,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const stageInfo = ICDR_STAGES[scan.predictedStage];
  const dmeInfo = DME_DEFINITIONS[scan.dmeStatus];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Header Actions Bar (not printed) */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Clinical Screening & Ophthalmic Report
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div className="p-8 bg-white text-slate-900 overflow-y-auto space-y-6 font-sans">
          
          {/* Clinic Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-700 flex items-center justify-center text-white font-bold">
                  <Eye className="w-5 h-5" />
                </div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  RetinaVision AI Diagnostic Center
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Department of Ophthalmology & Diabetic Retinal Tele-Screening
              </p>
            </div>

            <div className="text-right text-xs text-slate-600 space-y-0.5">
              <p><strong>Report Date:</strong> {new Date().toISOString().split('T')[0]}</p>
              <p><strong>Exam ID:</strong> {scan.id}</p>
              <p><strong>Standard:</strong> ICDR / ETDRS Guideline</p>
            </div>
          </div>

          {/* Patient Details & Clinical Background */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 font-bold block uppercase text-[10px]">Patient Name</span>
              <span className="font-bold text-slate-800 text-sm">{scan.patientName}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block uppercase text-[10px]">Age / Gender</span>
              <span className="font-bold text-slate-800 text-sm">{scan.patientAge} yrs • {scan.patientGender}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block uppercase text-[10px]">Diabetes Status</span>
              <span className="font-bold text-slate-800 text-sm">{scan.diabetesType} ({scan.diabetesDurationYears} yrs)</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block uppercase text-[10px]">Current HbA1c & BP</span>
              <span className="font-bold text-slate-800 text-sm">{scan.hba1c}% • {scan.bloodPressure}</span>
            </div>
          </div>

          {/* Image Snapshot & Primary Diagnosis */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Fundus Image Snapshot */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="w-full aspect-square max-w-[280px] bg-black rounded-xl overflow-hidden border border-slate-300 shadow-md">
                <img
                  src={scan.imageUrl}
                  alt="Retinal Fundus"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 font-mono">
                {scan.eye === 'OD' ? 'OD (Right Eye)' : 'OS (Left Eye)'} • 45° Macular Field
              </span>
            </div>

            {/* Diagnostic Staging & Findings */}
            <div className="md:col-span-7 space-y-3">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Primary Retinopathy Diagnosis (ICDR)
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  {stageInfo.name} ({stageInfo.code})
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {stageInfo.description}
                </p>
                <div className="mt-2 text-xs text-slate-500 font-mono">
                  AI Model Confidence: <strong>{scan.stageConfidence}%</strong> • Image Quality: <strong>{scan.imageQuality} ({scan.qualityScore}%)</strong>
                </div>
              </div>

              {/* Macular Status */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Diabetic Macular Edema (DME)
                </span>
                <span className="font-bold text-slate-800 block text-sm">
                  {dmeInfo.name} ({scan.dmeConfidence}% confidence)
                </span>
                <span className="text-slate-600 block text-[11px] mt-0.5">
                  {dmeInfo.description}
                </span>
              </div>
            </div>
          </div>

          {/* Microvascular Lesion Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Detected Microvascular Pathology Summary
            </h4>
            <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Lesion Type</th>
                  <th className="p-2.5">Count</th>
                  <th className="p-2.5">Primary Distribution</th>
                  <th className="p-2.5">Clinical Significance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2.5 font-semibold">Microaneurysms</td>
                  <td className="p-2.5 font-mono">{scan.lesions.filter((l) => l.type === 'microaneurysm').length}</td>
                  <td className="p-2.5">Parafoveal / Temporal Arcades</td>
                  <td className="p-2.5 text-slate-600">Earliest hallmark of capillary pericyte loss</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold">Intraretinal Hemorrhages</td>
                  <td className="p-2.5 font-mono">{scan.lesions.filter((l) => l.type === 'hemorrhage').length}</td>
                  <td className="p-2.5">{scan.fourTwoOneRule.fourQuadrantsHemorrhages ? 'All 4 Quadrants (Severe)' : 'Scattered'}</td>
                  <td className="p-2.5 text-slate-600">Capillary rupture and ischemia</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold">Hard Exudates (Lipid)</td>
                  <td className="p-2.5 font-mono">{scan.lesions.filter((l) => l.type === 'hard_exudate').length}</td>
                  <td className="p-2.5">{scan.dmeStatus !== 'none' ? 'Macula / Parafoveal Ring' : 'None/Scattered'}</td>
                  <td className="p-2.5 text-slate-600">Lipoprotein extravasation (Macular Edema)</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold">Cotton Wool Spots (CWS)</td>
                  <td className="p-2.5 font-mono">{scan.lesions.filter((l) => l.type === 'cotton_wool_spot').length}</td>
                  <td className="p-2.5">Along Nerve Fiber Layer</td>
                  <td className="p-2.5 text-slate-600">Terminal retinal arteriolar micro-infarction</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Treatment & Action Plan */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Ophthalmic Clinical Recommendations & Follow-Up
            </h4>
            <div className="text-xs text-slate-700 space-y-1">
              <p>• <strong>Recommended Follow-up:</strong> {stageInfo.recommendedFollowUp}</p>
              {scan.treatmentRecommendations.map((rec, i) => (
                <p key={i}>• {rec}</p>
              ))}
            </div>
          </div>

          {/* Doctor Signature Block */}
          <div className="pt-8 border-t border-slate-200 flex items-end justify-between text-xs">
            <div>
              <p className="text-slate-500">Examining Ophthalmologist / Retinologist:</p>
              <div className="mt-4 font-serif text-slate-800 italic text-base">
                Dr. J. Henderson, MD, FACS
              </div>
              <p className="text-[10px] text-slate-400">Board Certified Vitreoretinal Specialist</p>
            </div>

            <div className="text-right">
              <p className="text-slate-400 font-mono text-[10px]">Verified Digital Electronic Signature</p>
              <p className="text-slate-500 font-mono text-[10px]">{new Date().toUTCString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
