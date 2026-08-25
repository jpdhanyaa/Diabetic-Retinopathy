import React, { useState, useRef } from 'react';
import { PatientDetails } from '../types';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImagePreview(dataUrl);
      onImageSelected(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setImagePreview(null);
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
        {/* Left Column (5 Cols): Comprehensive Patient Details */}
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
                      OD (Right)
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
                      OS (Left)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Diabetes History & Glycemic Control */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <span className="text-[11px] uppercase font-extrabold text-slate-400 tracking-wider block">
                2. Diabetes History &amp; Glycemic Control
              </span>

              <div className="grid grid-cols-2 gap-3">
                {/* Diabetes Type */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Diabetes Diagnosis
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
                    <option value="None">No Diabetes (General Eye Exam)</option>
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Duration (Years)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={80}
                    value={patientDetails.diabetesDurationYears}
                    onChange={(e) => updateField('diabetesDurationYears', Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="e.g. 12"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Blood Sugar Level */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Blood Sugar (mg/dL)
                  </label>
                  <input
                    type="number"
                    min={40}
                    max={600}
                    value={patientDetails.bloodSugarLevel}
                    onChange={(e) => updateField('bloodSugarLevel', parseInt(e.target.value) || 0)}
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
                    min={3.5}
                    max={20.0}
                    value={patientDetails.hba1c}
                    onChange={(e) => updateField('hba1c', parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 8.2"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Medication List */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] uppercase font-extrabold text-slate-400 tracking-wider block">
                3. Medication List
              </span>

              <div>
                <span className="block font-bold text-slate-700 mb-1.5 text-[11px]">
                  Diabetes Treatments:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['Insulin Injections', 'Metformin', 'Sulfonylureas', 'SGLT2 Inhibitor', 'GLP-1 Agonist', 'DPP-4 Inhibitor'].map((med) => {
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

              <div className="pt-1">
                <span className="block font-bold text-slate-700 mb-1.5 text-[11px]">
                  Systemic Medications (Blood Thinners / Cardiovascular):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['Blood Thinners (Aspirin/Clopidogrel)', 'ACE Inhibitor / ARB', 'Beta Blocker', 'Statin / Lipid Lowering'].map((med) => {
                    const active = patientDetails.systemicMedications.includes(med);
                    return (
                      <button
                        key={med}
                        type="button"
                        onClick={() => toggleArrayItem('systemicMedications', med)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors cursor-pointer ${
                          active
                            ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
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
                4. Systemic Health &amp; Reproductive Status
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
                    Kidney Function
                  </label>
                  <select
                    value={patientDetails.kidneyFunctionStatus}
                    onChange={(e) => updateField('kidneyFunctionStatus', e.target.value as PatientDetails['kidneyFunctionStatus'])}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Normal / Preserved">Normal / Preserved Function</option>
                    <option value="Microalbuminuria">Microalbuminuria (Early Nephropathy)</option>
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

        {/* Right Column (6 Cols): ONLY Upload Image Option */}
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
            /* Image Preview Card */
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
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
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-2.5 py-1 rounded-md">
                  45° Fundus Field Loaded
                </div>
              </div>

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
                  className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span className="material-symbols-outlined text-[20px]">biotech</span>
                  START ANALYSIS
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Summary of MATLAB Processing Architecture */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2.5 text-xs text-slate-600">
            <span className="font-bold text-slate-800 flex items-center gap-1.5 text-[12px]">
              <span className="material-symbols-outlined text-blue-600 text-[18px]">settings_suggest</span>
              MATLAB Automated Image Pipeline
            </span>
            <p className="text-[11px] leading-relaxed text-slate-500">
              When analysis begins, the image is passed through MATLAB image processing algorithms:
            </p>
            <div className="font-mono text-[10px] bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto">
              <code>G = I(:,:,2); background = imgaussfilt(G, 45);</code><br/>
              <code>Gnorm = imdivide(G, background, 'scaled');</code><br/>
              <code>Gclahe = adapthisteq(Gnorm, 'NumTiles', [8 8], 'ClipLimit', 0.02);</code><br/>
              <code>Gdenoise = medfilt2(Gclahe, [3 3]); % Black &amp; White Enhancement</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
