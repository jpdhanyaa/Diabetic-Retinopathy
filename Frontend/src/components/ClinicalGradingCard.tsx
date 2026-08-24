import React from 'react';
import { RetinalScan, RetinalLesion } from '../types/retinopathy';
import { ICDR_STAGES, DME_DEFINITIONS } from '../data/icdrDefinitions';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Layers, 
  Activity, 
  ChevronRight, 
  PieChart, 
  Info,
  Clock
} from 'lucide-react';

interface ClinicalGradingCardProps {
  scan: RetinalScan;
  onSelectLesion?: (lesion: RetinalLesion | null) => void;
  selectedLesion?: RetinalLesion | null;
}

export const ClinicalGradingCard: React.FC<ClinicalGradingCardProps> = ({
  scan,
  onSelectLesion,
  selectedLesion,
}) => {
  const stageInfo = ICDR_STAGES[scan.predictedStage];
  const dmeInfo = DME_DEFINITIONS[scan.dmeStatus];

  // Stage probabilities
  const probs = [
    { stage: 0, label: 'Stage 0 (No DR)', prob: scan.classProbabilities.stage0, color: 'bg-emerald-500' },
    { stage: 1, label: 'Stage 1 (Mild)', prob: scan.classProbabilities.stage1, color: 'bg-blue-500' },
    { stage: 2, label: 'Stage 2 (Moderate)', prob: scan.classProbabilities.stage2, color: 'bg-amber-500' },
    { stage: 3, label: 'Stage 3 (Severe)', prob: scan.classProbabilities.stage3, color: 'bg-orange-500' },
    { stage: 4, label: 'Stage 4 (PDR)', prob: scan.classProbabilities.stage4, color: 'bg-rose-500' },
  ];

  return (
    <div className="space-y-4">
      {/* Primary Staging Card */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Glow accent */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${
          scan.predictedStage === 0 ? 'bg-emerald-500' :
          scan.predictedStage === 1 ? 'bg-blue-500' :
          scan.predictedStage === 2 ? 'bg-amber-500' :
          scan.predictedStage === 3 ? 'bg-orange-500' : 'bg-rose-500'
        }`} />

        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                ICDR Retinopathy Classification
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-[11px] font-mono text-slate-400">
                AI Confidence: <strong className="text-emerald-400">{scan.stageConfidence}%</strong>
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
              <span>{stageInfo.name}</span>
            </h2>
          </div>

          <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold font-mono ${stageInfo.bgColor}`}>
            {stageInfo.code}
          </div>
        </div>

        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          {stageInfo.description}
        </p>

        {/* DME Assessment Callout */}
        <div className={`p-3 rounded-xl border flex items-start justify-between gap-3 ${
          scan.dmeStatus === 'none'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : scan.dmeStatus === 'non_center'
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-start gap-2.5">
            {scan.dmeStatus === 'none' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs">
                  Macular Status: {dmeInfo.name}
                </span>
                <span className="text-[10px] font-mono opacity-80 font-semibold">
                  ({scan.dmeConfidence}% confidence)
                </span>
              </div>
              <p className="text-[11px] opacity-90 mt-0.5 leading-snug">
                {dmeInfo.description}
              </p>
            </div>
          </div>
          {dmeInfo.treatmentIndicated && (
            <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500 text-white shadow-sm">
              Anti-VEGF Indicated
            </span>
          )}
        </div>
      </div>

      {/* Model Probability Distribution */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <PieChart className="w-3.5 h-3.5 text-sky-400" />
            <span>AI Class Probability Distribution</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-500">Softmax Output</span>
        </div>

        <div className="space-y-2">
          {probs.map((p) => {
            const pct = Math.round(p.prob * 1000) / 10;
            const isTop = p.stage === scan.predictedStage;
            return (
              <div key={p.stage} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-medium ${isTop ? 'text-slate-100 font-bold' : 'text-slate-400'}`}>
                    {p.label}
                  </span>
                  <span className={`font-mono text-xs ${isTop ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                    {pct}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    style={{ width: `${Math.max(pct, 1)}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${p.color}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4-2-1 Rule Clinical Evaluation (Criteria for Severe NPDR) */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>ETDRS 4-2-1 Rule Criteria</span>
          </h3>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            scan.fourTwoOneRule.meetsCriteriaForSevereNPDR
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              : 'bg-slate-800 text-slate-400'
          }`}>
            {scan.fourTwoOneRule.meetsCriteriaForSevereNPDR ? 'Criteria Met' : 'Not Met'}
          </span>
        </div>

        <div className="space-y-2 text-xs">
          {/* 4: Hemorrhages in all 4 quadrants */}
          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              scan.fourTwoOneRule.fourQuadrantsHemorrhages
                ? 'bg-rose-500 text-white'
                : 'bg-slate-800 text-slate-500'
            }`}>
              <span className="text-[10px] font-bold">4</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">≥20 Hemorrhages in All 4 Quadrants</span>
                <span className={`text-[10px] font-mono ${scan.fourTwoOneRule.fourQuadrantsHemorrhages ? 'text-rose-400 font-bold' : 'text-slate-500'}`}>
                  {scan.fourTwoOneRule.fourQuadrantsHemorrhages ? 'POSITIVE' : 'NEGATIVE'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Diffuse intraretinal dot/blot hemorrhages across ST, IT, SN, IN.
              </p>
            </div>
          </div>

          {/* 2: Venous Beading in 2+ quadrants */}
          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              scan.fourTwoOneRule.twoQuadrantsVenousBeading
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-800 text-slate-500'
            }`}>
              <span className="text-[10px] font-bold">2</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">Venous Beading in ≥2 Quadrants</span>
                <span className={`text-[10px] font-mono ${scan.fourTwoOneRule.twoQuadrantsVenousBeading ? 'text-amber-400 font-bold' : 'text-slate-500'}`}>
                  {scan.fourTwoOneRule.twoQuadrantsVenousBeading ? 'POSITIVE' : 'NEGATIVE'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Caliber variations & sausage-like venule dilation indicating severe ischemia.
              </p>
            </div>
          </div>

          {/* 1: Prominent IRMA in 1+ quadrant */}
          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              scan.fourTwoOneRule.oneQuadrantIRMA
                ? 'bg-orange-500 text-white'
                : 'bg-slate-800 text-slate-500'
            }`}>
              <span className="text-[10px] font-bold">1</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">Prominent IRMA in ≥1 Quadrant</span>
                <span className={`text-[10px] font-mono ${scan.fourTwoOneRule.oneQuadrantIRMA ? 'text-orange-400 font-bold' : 'text-slate-500'}`}>
                  {scan.fourTwoOneRule.oneQuadrantIRMA ? 'POSITIVE' : 'NEGATIVE'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Intraretinal microvascular collateral shunt vessels adjacent to capillary non-perfusion.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detected Microvascular Lesions Breakdown */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            <span>Pathology Marker Summary</span>
          </h3>
          <span className="text-xs font-mono font-bold text-slate-300">
            {scan.lesions.length} Total Lesions
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Microaneurysms</span>
            <span className="text-base font-bold font-mono text-red-400">
              {scan.lesions.filter((l) => l.type === 'microaneurysm').length}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Hemorrhages</span>
            <span className="text-base font-bold font-mono text-rose-400">
              {scan.lesions.filter((l) => l.type === 'hemorrhage').length}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Hard Exudates</span>
            <span className="text-base font-bold font-mono text-amber-400">
              {scan.lesions.filter((l) => l.type === 'hard_exudate').length}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Cotton Wool Spots</span>
            <span className="text-base font-bold font-mono text-slate-200">
              {scan.lesions.filter((l) => l.type === 'cotton_wool_spot').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
