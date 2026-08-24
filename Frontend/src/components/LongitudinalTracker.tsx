import React, { useState } from 'react';
import { PatientRecord, RetinalScan, ICDRStage, DMEStatus } from '../types/retinopathy';
import { PRESET_SCANS, SAMPLE_PATIENTS } from '../data/sampleScans';
import { ICDR_STAGES } from '../data/icdrDefinitions';
import { 
  ArrowRight, 
  SplitSquareVertical, 
  Activity,
  User
} from 'lucide-react';

interface LongitudinalTrackerProps {
  onSelectScan: (scan: RetinalScan) => void;
}

interface HistoricalVisit {
  date: string;
  visitName: string;
  hba1c: number;
  bp: string;
  stage: ICDRStage;
  dme: DMEStatus;
  intervention: string;
  scan: RetinalScan;
}

export const LongitudinalTracker: React.FC<LongitudinalTrackerProps> = ({
  onSelectScan,
}) => {
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord>(SAMPLE_PATIENTS[0]);
  const [activeEye, setActiveEye] = useState<'OD' | 'OS'>('OD');
  const [splitPos, setSplitPos] = useState<number>(50);

  // Longitudinal simulated scans for the patient over 3 years
  const historicalVisits: HistoricalVisit[] = [
    {
      date: '2024-03-15',
      visitName: 'Baseline Screening',
      hba1c: 9.4,
      bp: '148/94',
      stage: 1,
      dme: 'none',
      intervention: 'Prescribed Metformin + Lifestyle counseling',
      scan: PRESET_SCANS[1],
    },
    {
      date: '2025-04-10',
      visitName: '12-Month Follow-Up',
      hba1c: 8.9,
      bp: '142/88',
      stage: 2,
      dme: 'non_center',
      intervention: 'Added SGLT2 inhibitor, referred for OCT macula',
      scan: PRESET_SCANS[2],
    },
    {
      date: '2026-08-14',
      visitName: 'Current Exam (2026)',
      hba1c: 8.4,
      bp: '138/86',
      stage: 2,
      dme: 'center_involved',
      intervention: 'First Anti-VEGF Intravitreal Injection (Aflibercept)',
      scan: PRESET_SCANS[2],
    },
  ];

  const baselineScan = historicalVisits[0].scan;
  const currentScan = historicalVisits[2].scan;

  return (
    <div className="space-y-6">
      {/* Patient Selector & Demographics Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <select
                value={selectedPatient.id}
                onChange={(e) => {
                  const p = SAMPLE_PATIENTS.find((item) => item.id === e.target.value);
                  if (p) setSelectedPatient(p);
                }}
                className="bg-slate-950 border border-slate-700 text-slate-100 font-bold text-sm rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-sky-500 focus:outline-none"
              >
                {SAMPLE_PATIENTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.mrn})
                  </option>
                ))}
              </select>
              <span className="text-xs text-slate-400">
                {selectedPatient.age}yo • {selectedPatient.gender} • {selectedPatient.diabetesType} ({selectedPatient.durationYears} yrs)
              </span>
            </div>
          </div>
        </div>

        {/* Eye Switcher */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveEye('OD')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeEye === 'OD'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            OD (Right Eye)
          </button>
          <button
            onClick={() => setActiveEye('OS')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeEye === 'OS'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            OS (Left Eye)
          </button>
        </div>
      </div>

      {/* Side-by-Side Before & After Split Comparator */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SplitSquareVertical className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Longitudinal Retinal Split Comparator
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Slide horizontal bar to compare <strong>Baseline (2024)</strong> vs <strong>Current (2026)</strong>
          </span>
        </div>

        {/* Split Container */}
        <div className="relative w-full aspect-[16/9] max-h-[460px] bg-black rounded-xl overflow-hidden border border-slate-800 select-none">
          {/* Baseline Left Side */}
          <div className="absolute inset-0 w-full h-full flex items-center justify-center">
            <img
              src={baselineScan.imageUrl}
              alt="Baseline 2024"
              className="w-full h-full object-contain"
            />
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-700 text-[11px] font-mono text-slate-300">
              📅 Baseline: March 2024 (Stage 1)
            </div>
          </div>

          {/* Current Right Side with Clip-Path */}
          <div
            style={{
              clipPath: `polygon(${splitPos}% 0, 100% 0, 100% 100%, ${splitPos}% 100%)`,
            }}
            className="absolute inset-0 w-full h-full flex items-center justify-center"
          >
            <img
              src={currentScan.imageUrl}
              alt="Current 2026"
              className="w-full h-full object-contain"
            />
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-rose-500/40 text-[11px] font-mono text-rose-300">
              📅 Follow-Up: August 2026 (Stage 2 + DME)
            </div>
          </div>

          {/* Divider Line & Handle */}
          <div
            style={{ left: `${splitPos}%` }}
            className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl z-20 -translate-x-1/2 flex items-center justify-center pointer-events-none"
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-white shadow-lg flex items-center justify-center text-[10px] text-white font-bold font-mono">
              ◄►
            </div>
          </div>

          {/* Interactive Slider Input */}
          <input
            type="range"
            min="5"
            max="95"
            value={splitPos}
            onChange={(e) => setSplitPos(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
          />
        </div>
      </div>

      {/* Longitudinal Timeline of Visits & Interventions */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Disease Trajectory & Intervention History
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">3-Year Longitudinal Track</span>
        </div>

        <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-6">
          {historicalVisits.map((visit, idx) => {
            const stage = ICDR_STAGES[visit.stage];
            return (
              <div key={idx} className="relative group">
                {/* Timeline node */}
                <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-slate-900 ${
                  visit.stage === 0 ? 'bg-emerald-400' :
                  visit.stage === 1 ? 'bg-blue-400' :
                  visit.stage === 2 ? 'bg-amber-400' : 'bg-rose-400'
                }`} />

                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-sky-400">
                        {visit.date}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="font-semibold text-xs text-slate-200">
                        {visit.visitName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${stage.bgColor}`}>
                        {stage.shortName}
                      </span>
                      {visit.dme !== 'none' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          DME +
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs py-1 border-y border-slate-800/60">
                    <div>
                      <span className="text-[10px] text-slate-400 block">HbA1c</span>
                      <span className="font-bold text-slate-200 font-mono">{visit.hba1c}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Blood Pressure</span>
                      <span className="font-bold text-slate-200 font-mono">{visit.bp}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-[10px] text-slate-400 block">Clinical Action</span>
                      <span className="text-slate-300 text-[11px]">{visit.intervention}</span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => onSelectScan(visit.scan)}
                      className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
                    >
                      <span>Load Full Diagnostic Analysis</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
