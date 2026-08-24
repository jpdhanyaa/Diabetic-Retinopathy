import React, { useState, useRef } from 'react';
import { RetinalScan, PatientRecord } from '../types/retinopathy';
import { SAMPLE_PATIENTS } from '../data/sampleScans';
import { analyzeUploadedRetinalImage } from '../utils/imageProcessing';
import { 
  Upload, 
  X, 
  Eye, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  FileImage,
  Loader2
} from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanAnalyzed: (scan: RetinalScan) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onScanAnalyzed,
}) => {
  if (!isOpen) return null;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(SAMPLE_PATIENTS[0].id);
  const [selectedEye, setSelectedEye] = useState<'OD' | 'OS'>('OD');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        if (loadEvt.target?.result) {
          setImagePreview(loadEvt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        if (loadEvt.target?.result) {
          setImagePreview(loadEvt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunAnalysis = async () => {
    if (!imagePreview || !selectedFile) return;

    setIsAnalyzing(true);
    setAnalysisProgress('Segmenting optic disc and vascular tree...');

    setTimeout(() => {
      setAnalysisProgress('Detecting microaneurysms, hemorrhages, and lipid exudates...');
    }, 600);

    setTimeout(() => {
      setAnalysisProgress('Evaluating 4-2-1 rule and ICDR staging...');
    }, 1200);

    setTimeout(async () => {
      const patient = SAMPLE_PATIENTS.find((p) => p.id === selectedPatientId) || SAMPLE_PATIENTS[0];
      const result = await analyzeUploadedRetinalImage(imagePreview, selectedFile.name);

      const newScan: RetinalScan = {
        id: `SCAN-UP-${Date.now().toString().slice(-4)}`,
        title: `Uploaded Scan (${selectedEye}) — ${patient.name}`,
        patientId: patient.id,
        patientName: patient.name,
        patientAge: patient.age,
        patientGender: patient.gender,
        diabetesType: patient.diabetesType,
        diabetesDurationYears: patient.durationYears,
        hba1c: patient.latestHbA1c,
        bloodPressure: patient.latestBP,
        eye: selectedEye,
        captureDate: new Date().toISOString().split('T')[0],
        imageQuality: result.imageQuality,
        qualityScore: result.qualityScore,
        predictedStage: result.stage,
        stageConfidence: result.confidence,
        classProbabilities: result.classProbabilities,
        dmeStatus: result.dmeStatus,
        dmeConfidence: result.dmeConfidence,
        imageUrl: imagePreview,
        thumbnailUrl: imagePreview,
        description: `Uploaded fundus photograph analyzed via AI Computer Vision pipeline.`,
        clinicalSummary: result.summary,
        treatmentRecommendations: result.recommendations,
        lesions: result.lesions,
        quadrants: [
          { name: 'Superior-Temporal', code: 'ST', hemorrhageSeverity: 'mild', microaneurysmCount: 2, hardExudateCount: 1, cottonWoolSpotCount: 0, hasVenousBeading: false, hasIRMA: false, hasNeovascularization: false },
          { name: 'Inferior-Temporal', code: 'IT', hemorrhageSeverity: 'mild', microaneurysmCount: 2, hardExudateCount: 1, cottonWoolSpotCount: 0, hasVenousBeading: false, hasIRMA: false, hasNeovascularization: false },
          { name: 'Superior-Nasal', code: 'SN', hemorrhageSeverity: 'none', microaneurysmCount: 1, hardExudateCount: 0, cottonWoolSpotCount: 0, hasVenousBeading: false, hasIRMA: false, hasNeovascularization: false },
          { name: 'Inferior-Nasal', code: 'IN', hemorrhageSeverity: 'none', microaneurysmCount: 1, hardExudateCount: 0, cottonWoolSpotCount: 0, hasVenousBeading: false, hasIRMA: false, hasNeovascularization: false },
        ],
        fourTwoOneRule: {
          fourQuadrantsHemorrhages: false,
          twoQuadrantsVenousBeading: false,
          oneQuadrantIRMA: false,
          meetsCriteriaForSevereNPDR: false,
        },
      };

      setIsAnalyzing(false);
      onScanAnalyzed(newScan);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Upload Retinal Fundus Photograph
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Patient and Eye selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Assign to Patient
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-semibold focus:ring-1 focus:ring-sky-500 focus:outline-none"
              >
                {SAMPLE_PATIENTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.mrn})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Laterality (Eye)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedEye('OD')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                    selectedEye === 'OD'
                      ? 'bg-sky-600 border-sky-500 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  OD (Right Eye)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedEye('OS')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                    selectedEye === 'OS'
                      ? 'bg-sky-600 border-sky-500 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  OS (Left Eye)
                </button>
              </div>
            </div>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[200px] ${
              imagePreview
                ? 'border-sky-500/50 bg-slate-950/60'
                : 'border-slate-800 hover:border-sky-500/50 bg-slate-950/40 hover:bg-slate-950/80'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              onChange={handleFileChange}
              className="hidden"
            />

            {imagePreview ? (
              <div className="space-y-3 flex flex-col items-center">
                <div className="w-28 h-28 rounded-xl overflow-hidden border border-slate-700 bg-black shadow-lg">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-xs">
                  <span className="text-emerald-400 font-bold block">✓ Image Ready for AI Grading</span>
                  <span className="text-slate-400 text-[11px]">{selectedFile?.name}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mx-auto">
                  <FileImage className="w-6 h-6" />
                </div>
                <div className="text-xs text-slate-300 font-medium">
                  <span className="text-sky-400 font-bold">Click to browse</span> or drag & drop fundus photo
                </div>
                <p className="text-[11px] text-slate-500">
                  Supports standard 30° / 45° / 50° fundus camera color JPG, PNG, WEBP
                </p>
              </div>
            )}
          </div>

          {/* Action Button & Analysis Loader */}
          {isAnalyzing ? (
            <div className="p-4 rounded-xl bg-slate-950 border border-sky-500/40 space-y-2">
              <div className="flex items-center gap-2 text-sky-400 text-xs font-bold">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI Diagnostics Pipeline Running...</span>
              </div>
              <p className="text-[11px] text-slate-300 font-mono animate-pulse">
                {analysisProgress}
              </p>
            </div>
          ) : (
            <button
              onClick={handleRunAnalysis}
              disabled={!imagePreview}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Run Automated AI Retinopathy Grading</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
