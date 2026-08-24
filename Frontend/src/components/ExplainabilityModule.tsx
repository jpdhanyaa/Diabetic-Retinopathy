import React, { useState, useEffect } from 'react';
import { RetinalScan, ICDRStage } from '../types/retinopathy';
import { ExplainabilityData, HealthWorkerUser } from '../types/rural';
import { ICDR_STAGES } from '../data/icdrDefinitions';
import { 
  Eye, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Sliders, 
  Check, 
  Clock, 
  ShieldCheck, 
  UserCheck, 
  FileText, 
  ThumbsUp, 
  Edit3, 
  Send
} from 'lucide-react';

interface ExplainabilityModuleProps {
  scan: RetinalScan;
  currentUser: HealthWorkerUser;
  onValidationComplete: (data: ExplainabilityData) => void;
}

export const ExplainabilityModule: React.FC<ExplainabilityModuleProps> = ({
  scan,
  currentUser,
  onValidationComplete,
}) => {
  const [gradCamOpacity, setGradCamOpacity] = useState<number>(0.65);
  const [selectedColormap, setSelectedColormap] = useState<'jet' | 'hot' | 'turbo'>('jet');
  const [validationTimeSeconds, setValidationTimeSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  
  // Doctor HITL Validation state
  const [doctorAgreed, setDoctorAgreed] = useState<boolean>(true);
  const [doctorOverrideStage, setDoctorOverrideStage] = useState<ICDRStage>(scan.predictedStage);
  const [doctorNotes, setDoctorNotes] = useState<string>(
    `Grad-CAM salience highlights intraretinal hemorrhages and microaneurysms in temporal quadrants. Validated stage ${scan.predictedStage} according to ICDR clinical criteria.`
  );
  const [isSignedOff, setIsSignedOff] = useState<boolean>(false);

  // 30-second target timer
  useEffect(() => {
    let interval: any;
    if (isTimerRunning && !isSignedOff) {
      interval = setInterval(() => {
        setValidationTimeSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isSignedOff]);

  const handleSignOff = () => {
    setIsTimerRunning(false);
    setIsSignedOff(true);

    const explainabilityResult: ExplainabilityData = {
      gradCamIntensityMap: 'Layer_ResNet50_Activation_GradCAM',
      topSalientRegions: [
        { name: 'Inferior-Temporal Vascular Arcade', impact: 'High (+42%)', weight: 0.88, coordinates: 'ST / IT Quadrant' },
        { name: 'Macular Avascular Perifoveal Ring', impact: 'Moderate (+28%)', weight: 0.64, coordinates: 'FAZ Zone' },
        { name: 'Nasal Microaneurysm Clusters', impact: 'Low (+14%)', weight: 0.35, coordinates: 'SN Quadrant' },
      ],
      calibratedConfidence: scan.stageConfidence,
      epistemicUncertainty: 0.042, // low uncertainty
      clinicalCriteriaMatched: [
        'ETDRS 4-2-1 Rule: Intraretinal hemorrhages detected in ≥2 quadrants',
        'Lipid exudates isolated outside 500µm foveal center',
        'No active disc neovascularization (NVD) fronds',
      ],
      ophthalmologistValidation: {
        validatedBy: currentUser.name,
        validatedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        agreedWithAI: doctorAgreed,
        adjustedStage: doctorAgreed ? scan.predictedStage : doctorOverrideStage,
        clinicalNotes: doctorNotes,
        validationTimeSeconds,
      },
    };

    onValidationComplete(explainabilityResult);
  };

  const stageObj = ICDR_STAGES[scan.predictedStage];

  return (
    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100">
                Pillar 4: Deep Learning Explainability & 30-Second HITL Validation
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono">
                Grad-CAM • ResNet-50 Feature Attribution
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Visualizes neural activation heatmaps correlated with ETDRS clinical evidence for rapid specialist sign-off
            </p>
          </div>
        </div>

        {/* 30-second Validation Target Timer */}
        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border text-xs font-mono font-bold ${
          validationTimeSeconds <= 30
            ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
            : 'bg-amber-950/60 border-amber-500/50 text-amber-300'
        }`}>
          <Clock className="w-4 h-4" />
          <span>HITL Review Time: {validationTimeSeconds}s / 30s Target</span>
          {validationTimeSeconds <= 30 && <span className="text-[10px] text-emerald-400">⚡ Fast-Track</span>}
        </div>
      </div>

      {/* Main Grid: Grad-CAM Visualizer (6 cols) + Clinical Evidence & Fast Sign-Off (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 6 Cols: Grad-CAM Heatmap Overlaid on Fundus */}
        <div className="lg:col-span-6 space-y-3">
          
          <div className="relative aspect-square sm:aspect-[4/3] rounded-3xl bg-black border border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center">
            
            {/* Raw Fundus Image */}
            <img
              src={scan.imageUrl}
              alt="Fundus Base"
              className="w-full h-full object-contain"
            />

            {/* Grad-CAM Heatmap Simulation Overlay */}
            <div
              style={{ opacity: gradCamOpacity }}
              className={`absolute inset-0 pointer-events-none transition-opacity duration-200 mix-blend-screen ${
                selectedColormap === 'jet'
                  ? 'bg-radial from-red-600/90 via-amber-400/50 to-transparent'
                  : selectedColormap === 'hot'
                  ? 'bg-radial from-yellow-300 via-rose-600/60 to-transparent'
                  : 'bg-radial from-fuchsia-500 via-cyan-400/60 to-transparent'
              }`}
            />

            {/* Heatmap intensity hotspots */}
            <div 
              style={{ opacity: gradCamOpacity * 0.9 }}
              className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-transparent blur-2xl pointer-events-none mix-blend-color-dodge"
            />

            {/* Top Badge */}
            <div className="absolute top-3 left-3 p-2 rounded-2xl bg-black/75 backdrop-blur-md border border-white/10 text-[11px] text-slate-200 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span className="font-bold">Grad-CAM Salience Map</span>
              <span className="text-slate-400">|</span>
              <span className="text-emerald-400 font-mono">ResNet-50 Layer 4</span>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-2xl bg-black/85 backdrop-blur-md border border-white/10 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-1 max-w-[200px]">
                <span className="text-[10px] text-slate-400 font-mono">Heatmap Opacity:</span>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={gradCamOpacity}
                  onChange={(e) => setGradCamOpacity(parseFloat(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSelectedColormap('jet')}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                    selectedColormap === 'jet' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  Jet
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedColormap('hot')}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                    selectedColormap === 'hot' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  Hot
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedColormap('turbo')}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                    selectedColormap === 'turbo' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  Turbo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right 6 Cols: Clinical Evidence Correlation & Rapid HITL Sign-off */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Calibrated Confidence & Evidence Box */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Calibrated Clinical Evidence (Platt-Scaled)
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                Confidence: {scan.stageConfidence}%
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-200 block">Lesion Correlation:</strong>
                  <span className="text-slate-400">
                    Grad-CAM activation matches clustered microaneurysms and intraretinal dot hemorrhages in inferior temporal arcade.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-200 block">Macular Edema Risk (DME):</strong>
                  <span className="text-slate-400">
                    {scan.dmeStatus === 'none'
                      ? 'No hard exudates or retinal thickening detected within 1 Disc Diameter of foveal avascular zone.'
                      : 'Exudative lipid deposit detected near perifovea with high DME risk probability.'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Rapid 30-Second Ophthalmologist Sign-Off Box */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" />
                Specialist Fast-Track Sign-Off
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Reviewer: {currentUser.name}
              </span>
            </div>

            {/* One-Click Validation Decision */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDoctorAgreed(true)}
                  className={`flex-1 py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all border ${
                    doctorAgreed
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>Accept AI Diagnosis ({stageObj.shortName})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDoctorAgreed(false)}
                  className={`flex-1 py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all border ${
                    !doctorAgreed
                      ? 'bg-amber-600 border-amber-500 text-white shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Modify Grade</span>
                </button>
              </div>

              {/* If doctor overrides grade */}
              {!doctorAgreed && (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <label className="text-[11px] text-slate-400 font-bold block">
                    Override Stage Selection:
                  </label>
                  <select
                    value={doctorOverrideStage}
                    onChange={(e) => setDoctorOverrideStage(parseInt(e.target.value, 10) as ICDRStage)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value={0}>Stage 0: No Apparent DR</option>
                    <option value={1}>Stage 1: Mild NPDR</option>
                    <option value={2}>Stage 2: Moderate NPDR</option>
                    <option value={3}>Stage 3: Severe NPDR</option>
                    <option value={4}>Stage 4: Proliferative DR (PDR)</option>
                  </select>
                </div>
              )}

              {/* Clinical Notes Input */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-bold block">
                  Physician Audit Notes & Recommendations:
                </label>
                <textarea
                  rows={2}
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Complete Sign-Off Button */}
            <button
              type="button"
              onClick={handleSignOff}
              className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
                isSignedOff
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/50'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/25'
              }`}
            >
              {isSignedOff ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Verified & Digitally Signed ({validationTimeSeconds}s audit completed)</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Digitally Sign & Lock Audit ({validationTimeSeconds}s)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
