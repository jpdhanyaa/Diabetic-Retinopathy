import React, { useState } from 'react';
import { RetinalScan } from '../types/retinopathy';
import { ICDR_STAGES, DME_DEFINITIONS } from '../data/icdrDefinitions';
import { 
  Calendar, 
  Stethoscope, 
  Syringe, 
  Zap, 
  HeartPulse, 
  Edit3, 
  Save, 
  Check, 
  AlertCircle, 
  UserCheck 
} from 'lucide-react';

interface ClinicalActionPlanProps {
  scan: RetinalScan;
  onUpdateNotes?: (notes: string) => void;
}

export const ClinicalActionPlan: React.FC<ClinicalActionPlanProps> = ({
  scan,
  onUpdateNotes,
}) => {
  const stageInfo = ICDR_STAGES[scan.predictedStage];
  const dmeInfo = DME_DEFINITIONS[scan.dmeStatus];

  const [notes, setNotes] = useState<string>(scan.clinicalSummary);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handleSaveNotes = () => {
    onUpdateNotes?.(notes);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Clinical Management & Action Plan
          </h3>
        </div>

        <span className="text-[11px] font-semibold text-slate-400">
          American Academy of Ophthalmology (AAO) PPP Guideline
        </span>
      </div>

      {/* Follow-up Timeline & Urgency Badge */}
      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            stageInfo.urgency === 'routine' ? 'bg-emerald-500/20 text-emerald-300' :
            stageInfo.urgency === 'moderate' ? 'bg-blue-500/20 text-blue-300' :
            stageInfo.urgency === 'high' ? 'bg-amber-500/20 text-amber-300' :
            stageInfo.urgency === 'urgent' ? 'bg-orange-500/20 text-orange-300' : 'bg-rose-500/20 text-rose-300'
          }`}>
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] uppercase font-bold text-slate-400 block">
              Recommended Follow-Up Interval
            </span>
            <span className="text-sm font-bold text-slate-100">
              {stageInfo.recommendedFollowUp}
            </span>
          </div>
        </div>

        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase font-mono ${stageInfo.bgColor}`}>
          {stageInfo.urgency} Urgency
        </span>
      </div>

      {/* Treatment & Intervention Checklist */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
          <Syringe className="w-3.5 h-3.5 text-sky-400" />
          <span>Recommended Interventions</span>
        </h4>
        <div className="space-y-1.5">
          {scan.treatmentRecommendations.map((rec, index) => (
            <div
              key={index}
              className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
            >
              <div className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                {index + 1}
              </div>
              <span className="text-slate-200 leading-snug">{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Systemic Co-Management Targets */}
      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
          <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
          <span>Systemic Glycemic & Cardiovascular Targets</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">HbA1c Target</span>
            <span className="font-bold text-slate-100 font-mono">&lt; 7.0%</span>
            <span className="text-[10px] text-slate-500 block">Current: {scan.hba1c}%</span>
          </div>

          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Blood Pressure Target</span>
            <span className="font-bold text-slate-100 font-mono">&lt; 130/80 mmHg</span>
            <span className="text-[10px] text-slate-500 block">Current: {scan.bloodPressure}</span>
          </div>

          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Lipid Management</span>
            <span className="font-bold text-slate-100 font-mono">LDL &lt; 70 mg/dL</span>
            <span className="text-[10px] text-slate-500 block">Statin indicated</span>
          </div>
        </div>
      </div>

      {/* Doctor's Clinical Impression & Notes */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Edit3 className="w-3.5 h-3.5 text-sky-400" />
            <span>Ophthalmologist Clinical Impression & Notes</span>
          </h4>
          <button
            onClick={handleSaveNotes}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-all shadow-sm"
          >
            {isSaved ? <Check className="w-3 h-3 text-white" /> : <Save className="w-3 h-3" />}
            <span>{isSaved ? 'Saved!' : 'Save Notes'}</span>
          </button>
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 leading-relaxed font-sans"
          placeholder="Enter clinical commentary, planned injections, laser session dates..."
        />
      </div>
    </div>
  );
};
