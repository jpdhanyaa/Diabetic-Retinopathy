import React, { useState, useRef, useEffect } from 'react';
import { PatientDetails } from '../types';
import { validateRetinalImageQuality, QualityAnalysisResult } from '../utils/qualityChecker';

interface SimpleUploadViewProps {
  initialImage: string | null;
  patientDetails: PatientDetails;
  onPatientDetailsChange: (details: PatientDetails) => void;
  onImageSelected: (imageDataUrl: string) => void;
  onStartAnalysis: () => void;
  onBackToHome: () => void;
}

export const SimpleUploadView: React.FC<SimpleUploadViewProps> = ({
  initialImage,
  patientDetails,
  onPatientDetailsChange,
  onImageSelected,
  onStartAnalysis,
  onBackToHome
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(initialImage);
  const [isCheckingQuality, setIsCheckingQuality] = useState<boolean>(false);
  const [qualityResult, setQualityResult] = useState<QualityAnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialImage) {
      runQualityCheck(initialImage);
    }
  }, [initialImage]);

  const runQualityCheck = async (dataUrl: string) => {
    setIsCheckingQuality(true);
    try {
      const result = await validateRetinalImageQuality(dataUrl);
      setQualityResult(result);
    } catch {
      setQualityResult(null);
    } finally {
      setIsCheckingQuality(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImagePreview(dataUrl);
      onImageSelected(dataUrl);
      runQualityCheck(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setImagePreview(null);
    setQualityResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateField = <K extends keyof PatientDetails>(key: K, value: PatientDetails[K]) => {
    onPatientDetailsChange({
      ...patientDetails,
      [key]: value
    });
  };

  const toggleArrayItem = (key: 'diabetesMedications' | 'systemicMedications' | 'ocularSymptoms', item: string) => {
    const currentList = patientDetails[key];
    const exists = currentList.includes(item);
    const updated = exists ? currentList.filter((x) => x !== item) : [...currentList, item];
    updateField(key, updated);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Navigation Breadcrumb / Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <button
          onClick={onBackToHome}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Home
        </button>
        <span className="text-xs font-bold text-slate-500">
          Retinal Image &amp; Patient Clinical Profile
        </span>
      </div>

      <div className="text-center space-y-1.5">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Diabetic Retinopathy Screening Upload
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          Please upload the retinal fundus photograph and provide essential clinical details for accurate risk assessment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (6 Cols): Comprehensive Patient Details */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-[20px]">assignment_ind</span>
              Essential Patient Details
            </h3>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              Clinical Assessment
            </span>
          </div>

          <div className="space-y-5 text-xs">
            {/* Section 1: Basic Identifiers */}
            <div className="space-y-3">
              <span className="text-[11px] uppercase font-extrabold text-slate-400 tracking-wider block">
                1. Identification &amp; Eye Examined
              </span>

              <div className="grid grid-cols-2 gap-3">
                {/* Patient Name */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Patient Full Name
                  </label>
                  <input
                    type="text"
                    value={patientDetails.patientName}
                    onChange={(e) => updateField('patientName', e.target.value)}
                    placeholder="e.g. Eleanor Vance"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Patient ID / MRN */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Patient ID / MRN
                  </label>
                  <input
                    type="text"
                    value={patientDetails.patientId}
                    onChange={(e) => updateField('patientId', e.target.value)}
                    placeholder="e.g. PAT-90214"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Age */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={patientDetails.age}
                    onChange={(e) => updateField('age', Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Eye Selection */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Examined Eye
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => updateField('selectedEye', 'Right Eye (OD)')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        patientDetails.selectedEye === 'Right Eye (OD)'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">visibility</span>
                      Right (OD)
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField('selectedEye', 'Left Eye (OS)')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        patientDetails.selectedEye === 'Left Eye (OS)'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">visibility</span>
                      Left (OS)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Diabetes History & Blood Sugar */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <span className="text-[11px] uppercase font-extrabold text-slate-400 tracking-wider block">
                2. Diabetes &amp; Glycemic Parameters
              </span>

              <div className="grid grid-cols-2 gap-3">
                {/* Diabetes Type */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Diabetes Classification
                  </label>
                  <select
                    value={patientDetails.diabetesType}
                    onChange={(e) => updateField('diabetesType', e.target.value as PatientDetails['diabetesType'])}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Type 2">Type 2 Diabetes</option>
                    <option value="Type 1">Type 1 Diabetes</option>
                    <option value="Gestational">Gestational Diabetes</option>
                    <option value="Pre-diabetes">Pre-diabetes</option>
                    <option value="None / Not Diagnosed">None / Not Diagnosed</option>
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Duration (Years Diagnosed)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={80}
                    value={patientDetails.diabetesDurationYears}
                    onChange={(e) => updateField('diabetesDurationYears', Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Blood Sugar */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Current Blood Sugar (mg/dL)
                  </label>
                  <input
                    type="number"
                    min={40}
                    max={600}
                    value={patientDetails.bloodSugarLevel}
                    onChange={(e) => updateField('bloodSugarLevel', Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="e.g. 154"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* HbA1c */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Recent HbA1c (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min={3.0}
                    max={20.0}
                    value={patientDetails.hba1c}
                    onChange={(e) => updateField('hba1c', Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="e.g. 8.2"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Medication Regimens */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <span className="text-[11px] uppercase font-extrabold text-slate-400 tracking-wider block">
                3. Medications &amp; Systemic Treatments
              </span>

              {/* Diabetes Medications Chips */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Diabetes Medications
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Insulin Injections',
                    'Metformin',
                    'Sulfonylureas (Glipizide/Glimepiride)',
                    'SGLT2 Inhibitors (Jardiance/Farxiga)',
                    'GLP-1 RA (Ozempic/Trulicity)',
                    'DPP-4 Inhibitors (Januvia)'
                  ].map((med) => {
                    const active = patientDetails.diabetesMedications.includes(med);
                    return (
                      <button
                        key={med}
                        type="button"
                        onClick={() => toggleArrayItem('diabetesMedications', med)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors cursor-pointer ${
                          active
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {active ? '✓ ' : '+ '}{med}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Systemic Medications / Blood Thinners */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Systemic Medications &amp; Blood Thinners
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Blood Thinners (Aspirin/Clopidogrel)',
                    'Anticoagulants (Warfarin/Eliquis)',
                    'ACE Inhibitor / ARB',
                    'Beta Blocker / Calcium Blocker',
                    'Statin (Cholesterol lowering)'
                  ].map((med) => {
                    const active = patientDetails.systemicMedications.includes(med);
                    return (
                      <button
                        key={med}
                        type="button"
                        onClick={() => toggleArrayItem('systemicMedications', med)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors cursor-pointer ${
                          active
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {active ? '✓ ' : '+ '}{med}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Section 4: Systemic Health & Reproductive Status */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <span className="text-[11px] uppercase font-extrabold text-slate-400 tracking-wider block">
                4. Cardiovascular, Renal &amp; Gestational Status
              </span>

              <div className="grid grid-cols-2 gap-3">
                {/* Blood Pressure */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Blood Pressure (BP)
                  </label>
                  <input
                    type="text"
                    value={patientDetails.bloodPressure}
                    onChange={(e) => updateField('bloodPressure', e.target.value)}
                    placeholder="e.g. 138/86 mmHg"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Kidney Function Status */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kidney Status / Nephropathy
                  </label>
                  <select
                    value={patientDetails.kidneyFunctionStatus}
                    onChange={(e) => updateField('kidneyFunctionStatus', e.target.value as PatientDetails['kidneyFunctionStatus'])}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Normal / Preserved">Normal / Preserved</option>
                    <option value="Microalbuminuria">Microalbuminuria</option>
                    <option value="Macroalbuminuria / Proteinuria">Macroalbuminuria / Proteinuria</option>
                    <option value="Chronic Kidney Disease (CKD)">Chronic Kidney Disease (CKD)</option>
                    <option value="Unknown / Not Tested">Unknown / Not Tested</option>
                  </select>
                </div>
              </div>

              {/* Reproductive Status */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Reproductive Status <span className="text-slate-400 font-normal">(Retinopathy can accelerate during gestation)</span>
                </label>
                <select
                  value={patientDetails.reproductiveStatus}
                  onChange={(e) => updateField('reproductiveStatus', e.target.value as PatientDetails['reproductiveStatus'])}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Not Pregnant / N/A">Not Pregnant / N/A</option>
                  <option value="Currently Pregnant (1st Trimester)">Currently Pregnant (1st Trimester)</option>
                  <option value="Currently Pregnant (2nd Trimester)">Currently Pregnant (2nd Trimester)</option>
                  <option value="Currently Pregnant (3rd Trimester)">Currently Pregnant (3rd Trimester)</option>
                  <option value="Planning Pregnancy">Planning Pregnancy</option>
                </select>
              </div>
            </div>

            {/* Section 5: Ocular Symptoms */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] uppercase font-extrabold text-slate-400 tracking-wider block">
                5. Ocular Symptoms
              </span>

              <div className="flex flex-wrap gap-1.5">
                {[
                  'Blurred Vision',
                  'Floaters (Spots in vision)',
                  'Dark / Blind Spots (Scotoma)',
                  'Visual Distortion',
                  'Difficulty with Night Vision',
                  'None / Asymptomatic'
                ].map((symptom) => {
                  const active = patientDetails.ocularSymptoms.includes(symptom);
                  return (
                    <button
                      key={symptom}
                      type="button"
                      onClick={() => toggleArrayItem('ocularSymptoms', symptom)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors cursor-pointer ${
                        active
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {active ? '✓ ' : '+ '}{symptom}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (6 Cols): ONLY Upload Image Option + Automated Quality Alert */}
        <div className="lg:col-span-6 space-y-6">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          {!imagePreview ? (
            /* Upload Action Box - ONLY ONE OPTION SHOWING */
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-8 sm:p-14 text-center space-y-6 hover:border-blue-500 transition-colors shadow-sm">
              <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
                <span className="material-symbols-outlined text-[44px]">upload_file</span>
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Upload Retinal Image</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Select a fundus camera photograph from your computer or medical storage (JPG, PNG, TIFF).
                </p>
              </div>

              {/* Only Upload Image Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2.5 mx-auto cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">add_photo_alternate</span>
                  Upload Retinal Image
                </button>
              </div>

              <div className="text-[11px] text-slate-400">
                Recommended standard 45° field of view centered on macula or optic disc
              </div>
            </div>
          ) : (
            /* Image Preview Card with Quality Analysis Alert */
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    isCheckingQuality
                      ? 'bg-blue-500 animate-ping'
                      : qualityResult?.status === 'rejected'
                      ? 'bg-rose-600'
                      : qualityResult?.status === 'warning'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}></span>
                  <h3 className="font-bold text-slate-900 text-sm">Uploaded Retinal Photograph</h3>
                </div>
                <span className="text-[11px] font-semibold text-slate-500">
                  {patientDetails.selectedEye} • {patientDetails.patientName || patientDetails.patientId}
                </span>
              </div>

              {/* Retinal Image Frame */}
              <div className="relative aspect-square max-h-80 w-full rounded-xl overflow-hidden bg-black border border-slate-200 flex items-center justify-center shadow-inner">
                <img
                  src={imagePreview}
                  alt="Fundus Preview"
                  className="w-full h-full object-contain"
                />

                {/* Quality Scan Overlay */}
                {isCheckingQuality && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-2">
                    <span className="material-symbols-outlined text-blue-400 text-[32px] animate-spin">progress_activity</span>
                    <span className="text-xs font-bold">Scanning Optical Sharpness &amp; Quality...</span>
                  </div>
                )}

                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-2.5 py-1 rounded-md">
                  45° Fundus Field Loaded
                </div>

                {qualityResult && !isCheckingQuality && (
                  <div className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-md ${
                    qualityResult.status === 'excellent'
                      ? 'bg-emerald-600 text-white'
                      : qualityResult.status === 'acceptable'
                      ? 'bg-blue-600 text-white'
                      : qualityResult.status === 'warning'
                      ? 'bg-amber-500 text-white'
                      : 'bg-rose-600 text-white animate-bounce'
                  }`}>
                    <span className="material-symbols-outlined text-[14px]">
                      {qualityResult.status === 'rejected' ? 'error' : qualityResult.status === 'warning' ? 'warning' : 'verified'}
                    </span>
                    Quality Score: {qualityResult.score}/100
                  </div>
                )}
              </div>

              {/* Automated Real-Time Quality Alert Box */}
              {qualityResult && !isCheckingQuality && (
                <div className={`p-4 rounded-xl border transition-all ${
                  qualityResult.status === 'rejected'
                    ? 'bg-rose-50 border-rose-300 text-rose-950'
                    : qualityResult.status === 'warning'
                    ? 'bg-amber-50 border-amber-300 text-amber-950'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-950'
                }`}>
                  <div className="flex items-start gap-3">
                    <span className={`material-symbols-outlined text-[24px] shrink-0 mt-0.5 ${
                      qualityResult.status === 'rejected'
                        ? 'text-rose-600'
                        : qualityResult.status === 'warning'
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}>
                      {qualityResult.status === 'rejected'
                        ? 'cancel'
                        : qualityResult.status === 'warning'
                        ? 'warning'
                        : 'check_circle'}
                    </span>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-xs">
                          {qualityResult.status === 'rejected' && '⚠️ IMAGE REJECTED: BLURRY OR INVALID PHOTOGRAPH'}
                          {qualityResult.status === 'warning' && '⚠️ IMAGE WARNING: SUB-OPTIMAL OPTICAL QUALITY'}
                          {(qualityResult.status === 'acceptable' || qualityResult.status === 'excellent') && '✓ IMAGE QUALITY VERIFIED'}
                        </h4>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/70">
                          Blur Metric: {qualityResult.metrics.laplacianVariance}
                        </span>
                      </div>

                      {qualityResult.issues.length > 0 ? (
                        <div className="space-y-1">
                          <ul className="text-[11px] list-disc list-inside space-y-0.5">
                            {qualityResult.issues.map((issue, idx) => (
                              <li key={idx} className="font-semibold">{issue}</li>
                            ))}
                          </ul>
                          <div className="text-[11px] opacity-90 pt-1 border-t border-black/10">
                            <strong>Recommendation:</strong> {qualityResult.recommendations.join(' ')}
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px]">
                          Vascular structure and optical sharpness are clear for MATLAB contrast enhancement and deep learning feature extraction.
                        </p>
                      )}

                      {/* If rejected, strictly guide user to re-upload clear fundus photo */}
                      {qualityResult.status === 'rejected' && (
                        <div className="pt-2 text-[11px] text-rose-700 font-bold flex items-center gap-1.5 border-t border-rose-200 mt-2">
                          <span className="material-symbols-outlined text-[16px]">info</span>
                          Analysis is locked. Please click "Change Image" to upload a clear, focused retinal photograph.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons: [ CHANGE IMAGE ] [ START ANALYSIS ] */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">replay</span>
                  CHANGE IMAGE
                </button>

                <button
                  type="button"
                  onClick={onStartAnalysis}
                  disabled={qualityResult?.status === 'rejected'}
                  className={`w-full sm:w-auto px-8 py-3.5 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    qualityResult?.status === 'rejected'
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none border border-slate-300'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30 active:scale-98'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">biotech</span>
                  {qualityResult?.status === 'rejected'
                    ? 'CANNOT ANALYZE (RE-UPLOAD)'
                    : 'START ANALYSIS'}
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
