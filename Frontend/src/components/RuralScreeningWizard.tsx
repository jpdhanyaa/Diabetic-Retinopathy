import React, { useState, useEffect, useRef } from 'react';
import { HealthWorkerUser, RuralPatientData, RuralStep, LanguageCode, ScreeningHistoryRecord } from '../types/rural';
import { RetinalScan, RetinalLesion, ICDRStage, DMEStatus } from '../types/retinopathy';
import { TRANSLATIONS } from '../data/translations';
import { PRESET_SCANS } from '../data/sampleScans';
import { ICDR_STAGES, DME_DEFINITIONS } from '../data/icdrDefinitions';
import { MatlabEnhancer } from './MatlabEnhancer';
import { analyzeUploadedRetinalImage } from '../utils/imageProcessing';
import { generatePatientReportPDF } from '../utils/pdfGenerator';
import { 
  User, 
  Upload, 
  Camera, 
  Cpu, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Volume2, 
  VolumeX, 
  Printer, 
  Download,
  ArrowRight, 
  ArrowLeft, 
  RefreshCw, 
  Eye, 
  MapPin, 
  Phone, 
  Send,
  HeartHandshake, 
  Check, 
  FileText,
  ShieldCheck,
  Stethoscope,
  ChevronRight,
  History
} from 'lucide-react';

interface RuralScreeningWizardProps {
  currentUser: HealthWorkerUser;
  language: LanguageCode;
  onSaveRecordToHistory: (record: ScreeningHistoryRecord) => void;
  onViewHistory: () => void;
}

export const RuralScreeningWizard: React.FC<RuralScreeningWizardProps> = ({
  currentUser,
  language,
  onSaveRecordToHistory,
  onViewHistory,
}) => {
  const t = TRANSLATIONS[language];
  const [currentStep, setCurrentStep] = useState<RuralStep>('patient_info');

  // Patient info state
  const [patientData, setPatientData] = useState<RuralPatientData>({
    name: 'Ramesh Patel',
    age: 54,
    gender: 'Male',
    village: currentUser.village || 'Rampur Khurd',
    phone: '9845012345',
    aadhaarOrId: 'XXXX-XXXX-4812',
    diabetesType: 'Type 2',
    durationYears: 8,
    lastFastingSugar: '168 mg/dL',
    selectedEye: 'OD',
  });

  // Image & Scan State
  const [selectedScan, setSelectedScan] = useState<RetinalScan>(PRESET_SCANS[2]);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [isAIAnalyzing, setIsAIAnalyzing] = useState<boolean>(false);
  const [aiProgressText, setAiProgressText] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [lastSavedRecord, setLastSavedRecord] = useState<ScreeningHistoryRecord | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio Speech synthesis
  const speakResultText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const langMap: Record<LanguageCode, string> = {
      en: 'en-US',
      hi: 'hi-IN',
      te: 'te-IN',
      ta: 'ta-IN',
      bn: 'bn-IN',
      es: 'es-ES',
    };
    utterance.lang = langMap[language] || 'en-US';
    utterance.rate = 0.9;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        if (loadEvt.target?.result) {
          const imgUrl = loadEvt.target.result as string;
          setUploadedImagePreview(imgUrl);
          
          // Generate active scan object
          const tempScan: RetinalScan = {
            ...PRESET_SCANS[2],
            id: `SCAN-RURAL-${Date.now().toString().slice(-4)}`,
            title: `Rural Screening (${patientData.selectedEye}) — ${patientData.name}`,
            patientName: patientData.name,
            patientAge: Number(patientData.age) || 50,
            patientGender: patientData.gender,
            diabetesType: patientData.diabetesType === 'Type 1' ? 'Type 1' : 'Type 2',
            diabetesDurationYears: Number(patientData.durationYears) || 5,
            eye: patientData.selectedEye,
            imageUrl: imgUrl,
            thumbnailUrl: imgUrl,
          };
          setSelectedScan(tempScan);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPresetSample = (presetScan: RetinalScan) => {
    setSelectedScan({
      ...presetScan,
      patientName: patientData.name || presetScan.patientName,
      eye: patientData.selectedEye,
    });
    setUploadedImagePreview(presetScan.imageUrl);
  };

  const handleRunAIModel = async () => {
    setIsAIAnalyzing(true);
    setCurrentStep('ai_predict');
    setAiProgressText('1/3: Loading MATLAB-enhanced features into Convolutional Neural Network...');

    setTimeout(() => {
      setAiProgressText('2/3: Scanning for Microaneurysms, Hemorrhages, and Macular Swelling...');
    }, 800);

    setTimeout(() => {
      setAiProgressText('3/3: Evaluating ICDR stage & ETDRS severity classification...');
    }, 1500);

    setTimeout(async () => {
      let finalStage = selectedScan.predictedStage;
      let finalConfidence = selectedScan.stageConfidence;
      let finalDme = selectedScan.dmeStatus;

      if (uploadedImagePreview) {
        const result = await analyzeUploadedRetinalImage(uploadedImagePreview, 'fundus.png');
        finalStage = result.stage;
        finalConfidence = result.confidence;
        finalDme = result.dmeStatus;

        setSelectedScan((prev) => ({
          ...prev,
          predictedStage: result.stage,
          stageConfidence: result.confidence,
          classProbabilities: result.classProbabilities,
          dmeStatus: result.dmeStatus,
          dmeConfidence: result.dmeConfidence,
          lesions: result.lesions,
          clinicalSummary: result.summary,
          treatmentRecommendations: result.recommendations,
        }));
      }

      const stageObj = ICDR_STAGES[finalStage];
      const todayStr = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      // Save to History Record
      const newHistoryRecord: ScreeningHistoryRecord = {
        id: `REC-${Date.now().toString().slice(-6)}`,
        date: todayStr,
        patientName: patientData.name || 'Patient',
        age: Number(patientData.age) || 50,
        gender: patientData.gender,
        village: patientData.village || currentUser.village || 'Gram Panchayat',
        phone: patientData.phone || '9876543210',
        eye: patientData.selectedEye,
        sugarLevel: patientData.lastFastingSugar || '150 mg/dL',
        diabetesDuration: `${patientData.durationYears || 5} Years`,
        predictedStage: finalStage,
        stageName: stageObj.name,
        stageConfidence: finalConfidence,
        dmeStatus: finalDme,
        urgency: stageObj.urgency,
        followUpText: stageObj.recommendedFollowUp,
        imageUrl: uploadedImagePreview || selectedScan.imageUrl,
        healthWorkerName: currentUser.name,
        centerName: currentUser.centerName,
        adviceGiven: [
          'Daily prescribed diabetes medicines on time',
          'Maintain fasting blood sugar below 130 mg/dL',
          '30 minutes morning walking and avoid sweets',
          stageObj.recommendedFollowUp,
        ],
      };

      setLastSavedRecord(newHistoryRecord);
      onSaveRecordToHistory(newHistoryRecord);

      setIsAIAnalyzing(false);
      setCurrentStep('result');
    }, 2200);
  };

  const handleResetForNewPatient = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setUploadedImagePreview(null);
    setSelectedScan(PRESET_SCANS[0]);
    setPatientData({
      name: '',
      age: '',
      gender: 'Male',
      village: currentUser.village || '',
      phone: '',
      aadhaarOrId: '',
      diabetesType: 'Type 2',
      durationYears: '',
      lastFastingSugar: '',
      selectedEye: 'OD',
    });
    setCurrentStep('patient_info');
  };

  const stageInfo = ICDR_STAGES[selectedScan.predictedStage];

  // Simple Plain-Language Result Text for Rural Patients
  const getSimpleResultAudioScript = () => {
    const stage = selectedScan.predictedStage;
    if (language === 'hi') {
      if (stage === 0) {
        return `नमस्ते ${patientData.name || 'मरीज'}. शुभ समाचार है. आपकी आंख के पर्दे में शुगर की वजह से कोई नुकसान नहीं पाया गया है. आंखें बिल्कुल स्वस्थ हैं. एक साल बाद दोबारा जांच करवाएं.`;
      }
      if (stage === 1) {
        return `नमस्ते ${patientData.name || 'मरीज'}. आपकी आंख में शुरुआती हल्के धब्बे दिखे हैं. अपनी शुगर और ब्लड प्रेशर को कंट्रोल में रखें. छह महीने में दोबारा जांच कराएं.`;
      }
      if (stage === 2) {
        return `ध्यान दें ${patientData.name || 'मरीज'}. आपकी आंख में मध्यम स्तर का नुकसान और खून के धब्बे पाए गए हैं. अगले एक महीने के अंदर आंख के बड़े डॉक्टर से जांच कराएं.`;
      }
      return `अति आवश्यक सूचना ${patientData.name || 'मरीज'}. आपकी आंख के पर्दे में गंभीर खतरा है. तुरंत आंख के अस्पताल जाएं और लेजर या सुई का इलाज कराएं ताकि रोशनी बची रहे.`;
    }
    
    // English default
    if (stage === 0) {
      return `Hello ${patientData.name || 'Patient'}. Good news! No diabetic eye damage was found in your retina. Your eyes are healthy. Please come back for a routine checkup in 12 months.`;
    }
    if (stage === 1) {
      return `Hello ${patientData.name || 'Patient'}. Mild early diabetic spots were found in your eye. Please take your diabetes medicine regularly and repeat the eye check in 6 months.`;
    }
    if (stage === 2) {
      return `Attention ${patientData.name || 'Patient'}. Moderate diabetic eye damage with swelling was detected. Please visit an eye specialist within 1 month.`;
    }
    return `Urgent Medical Alert for ${patientData.name || 'Patient'}. Severe vision-threatening diabetic eye damage was detected. Please visit the eye hospital immediately within 1 to 2 weeks for laser or injection treatment.`;
  };

  const handleDownloadPDF = () => {
    if (lastSavedRecord) {
      generatePatientReportPDF(lastSavedRecord);
    } else {
      const todayStr = new Date().toLocaleDateString('en-GB');
      const tempRec: ScreeningHistoryRecord = {
        id: `REC-${Date.now().toString().slice(-6)}`,
        date: todayStr,
        patientName: patientData.name || 'Patient',
        age: Number(patientData.age) || 50,
        gender: patientData.gender,
        village: patientData.village || currentUser.village || 'Gram Panchayat',
        phone: patientData.phone || '9876543210',
        eye: patientData.selectedEye,
        sugarLevel: patientData.lastFastingSugar || '150 mg/dL',
        diabetesDuration: `${patientData.durationYears || 5} Years`,
        predictedStage: selectedScan.predictedStage,
        stageName: stageInfo.name,
        stageConfidence: selectedScan.stageConfidence,
        dmeStatus: selectedScan.dmeStatus,
        urgency: stageInfo.urgency,
        followUpText: stageInfo.recommendedFollowUp,
        imageUrl: uploadedImagePreview || selectedScan.imageUrl,
        healthWorkerName: currentUser.name,
        centerName: currentUser.centerName,
        adviceGiven: [
          'Daily prescribed diabetes medicines on time',
          'Maintain fasting blood sugar below 130 mg/dL',
          '30 minutes morning walking and avoid sweets',
          stageInfo.recommendedFollowUp,
        ],
      };
      generatePatientReportPDF(tempRec);
    }
  };

  const handleShareWhatsApp = () => {
    const stageTxt = selectedScan.predictedStage === 0 
      ? 'NORMAL (Healthy Eyes)' 
      : selectedScan.predictedStage === 1 
      ? 'MILD Early Stage' 
      : selectedScan.predictedStage === 2 
      ? 'MODERATE Damage (Needs Doctor Visit)' 
      : 'URGENT Severe Damage (Hospital Laser/Injection required)';

    const text = `*Rural Eye Screening Report*
*Patient:* ${patientData.name} (${patientData.age}y, ${patientData.gender})
*Village:* ${patientData.village}
*Tested Eye:* ${patientData.selectedEye === 'OD' ? 'Right Eye (OD)' : 'Left Eye (OS)'}
*Diagnosis:* ${stageTxt}
*Follow-Up Action:* ${stageInfo.recommendedFollowUp}
*Sugar Level:* ${patientData.lastFastingSugar}
*Screened By:* ${currentUser.name} (${currentUser.centerName})`;

    const phoneClean = (patientData.phone || '').replace(/[^0-9]/g, '');
    const url = `https://api.whatsapp.com/send?phone=${phoneClean.length === 10 ? '91' + phoneClean : phoneClean}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Top Breadcrumb Steps Navigation */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between overflow-x-auto gap-2 pb-1 sm:pb-0">
          
          {/* Step 1 */}
          <button
            onClick={() => setCurrentStep('patient_info')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              currentStep === 'patient_info'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-950/70 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-black/30 flex items-center justify-center text-[11px]">1</div>
            <span>{t.step1}</span>
          </button>

          <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />

          {/* Step 2 */}
          <button
            onClick={() => setCurrentStep('image_input')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              currentStep === 'image_input'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-950/70 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-black/30 flex items-center justify-center text-[11px]">2</div>
            <span>{t.step2}</span>
          </button>

          <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />

          {/* Step 3 */}
          <button
            onClick={() => setCurrentStep('matlab_enhance')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              currentStep === 'matlab_enhance'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-950/70 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-black/30 flex items-center justify-center text-[11px]">3</div>
            <span>{t.step3}</span>
          </button>

          <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />

          {/* Step 4 & 5 */}
          <button
            onClick={() => {
              if (selectedScan) setCurrentStep('result');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              currentStep === 'result' || currentStep === 'ai_predict'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-950/70 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-black/30 flex items-center justify-center text-[11px]">4 & 5</div>
            <span>{t.step5}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          STEP 1: PATIENT REGISTRATION & BASIC DETAILS
         ========================================================================= */}
      {currentStep === 'patient_info' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
          
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">
                  {t.patientDetails}
                </h2>
                <p className="text-xs text-slate-400">
                  Health Centre: <strong>{currentUser.centerName}</strong> • Worker: {currentUser.name}
                </p>
              </div>
            </div>

            {/* Quick Demo Patients Fill */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Quick Fill:</span>
              <button
                type="button"
                onClick={() => setPatientData({
                  name: 'Ramesh Patel',
                  age: 54,
                  gender: 'Male',
                  village: 'Rampur Khurd',
                  phone: '9845012345',
                  aadhaarOrId: 'XXXX-XXXX-4812',
                  diabetesType: 'Type 2',
                  durationYears: 8,
                  lastFastingSugar: '165 mg/dL',
                  selectedEye: 'OD',
                })}
                className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
              >
                Ramesh (54M)
              </button>
              <button
                type="button"
                onClick={() => setPatientData({
                  name: 'Shanti Devi',
                  age: 62,
                  gender: 'Female',
                  village: 'Bishanpur',
                  phone: '9871122334',
                  aadhaarOrId: 'XXXX-XXXX-9102',
                  diabetesType: 'Type 2',
                  durationYears: 14,
                  lastFastingSugar: '210 mg/dL',
                  selectedEye: 'OS',
                })}
                className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
              >
                Shanti (62F)
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            
            {/* Full Name */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-semibold text-slate-200 block">
                {t.fullName} *
              </label>
              <input
                type="text"
                required
                value={patientData.name}
                onChange={(e) => setPatientData({ ...patientData, name: e.target.value })}
                placeholder="e.g. Ramesh Patel"
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm font-semibold"
              />
            </div>

            {/* Age */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-200 block">
                {t.age} *
              </label>
              <input
                type="number"
                value={patientData.age}
                onChange={(e) => setPatientData({ ...patientData, age: e.target.value ? Number(e.target.value) : '' })}
                placeholder="e.g. 52"
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm font-mono"
              />
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-200 block">
                {t.gender}
              </label>
              <select
                value={patientData.gender}
                onChange={(e) => setPatientData({ ...patientData, gender: e.target.value as RuralPatientData['gender'] })}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
              >
                <option value="Male">Male / पुरुष</option>
                <option value="Female">Female / महिला</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Village */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-200 block">
                {t.villageName}
              </label>
              <input
                type="text"
                value={patientData.village}
                onChange={(e) => setPatientData({ ...patientData, village: e.target.value })}
                placeholder="e.g. Rampur Khurd"
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-200 block">
                {t.phoneNumber}
              </label>
              <input
                type="tel"
                value={patientData.phone}
                onChange={(e) => setPatientData({ ...patientData, phone: e.target.value })}
                placeholder="10-digit mobile number"
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm font-mono"
              />
            </div>

            {/* Diabetes Years */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-200 block">
                Years Living with Diabetes
              </label>
              <input
                type="number"
                value={patientData.durationYears}
                onChange={(e) => setPatientData({ ...patientData, durationYears: e.target.value ? Number(e.target.value) : '' })}
                placeholder="e.g. 8 years"
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm font-mono"
              />
            </div>

            {/* Fasting Sugar */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-200 block">
                Recent Blood Sugar / Fasting
              </label>
              <input
                type="text"
                value={patientData.lastFastingSugar}
                onChange={(e) => setPatientData({ ...patientData, lastFastingSugar: e.target.value })}
                placeholder="e.g. 160 mg/dL"
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm font-mono"
              />
            </div>

            {/* Eye Selector */}
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <label className="font-semibold text-slate-200 block">
                {t.selectEye}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPatientData({ ...patientData, selectedEye: 'OD' })}
                  className={`py-3 rounded-2xl text-xs font-bold transition-all border ${
                    patientData.selectedEye === 'OD'
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  👁️ {t.rightEye}
                </button>

                <button
                  type="button"
                  onClick={() => setPatientData({ ...patientData, selectedEye: 'OS' })}
                  className={`py-3 rounded-2xl text-xs font-bold transition-all border ${
                    patientData.selectedEye === 'OS'
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  👁️ {t.leftEye}
                </button>
              </div>
            </div>
          </div>

          {/* Action to proceed to step 2 */}
          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setCurrentStep('image_input')}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
            >
              <span>{t.nextStep}: {t.addFundusImage}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 2: ADD RETINA FUNDUS IMAGE
         ========================================================================= */}
      {currentStep === 'image_input' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
          
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-sky-500/20 text-sky-400">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">
                  {t.addFundusImage}
                </h2>
                <p className="text-xs text-slate-400">
                  Patient: <strong>{patientData.name || 'Patient'}</strong> • Eye: <strong>{patientData.selectedEye === 'OD' ? 'Right Eye (OD)' : 'Left Eye (OS)'}</strong>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCurrentStep('patient_info')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.back}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left: Upload or Camera Dropzone (6 cols) */}
            <div className="lg:col-span-6 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Option A: Upload / Camera Photo
              </span>

              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px] ${
                  uploadedImagePreview
                    ? 'border-emerald-500/60 bg-slate-950/80'
                    : 'border-slate-800 hover:border-emerald-500/50 bg-slate-950/40 hover:bg-slate-950/70'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {uploadedImagePreview ? (
                  <div className="space-y-3 flex flex-col items-center">
                    <div className="w-36 h-36 rounded-2xl overflow-hidden border-2 border-emerald-500 bg-black shadow-lg">
                      <img
                        src={uploadedImagePreview}
                        alt="Retina Preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                      <Check className="w-4 h-4" />
                      <span>Retina Image Ready for MATLAB Processing</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                      <Upload className="w-7 h-7" />
                    </div>
                    <div className="text-xs text-slate-200 font-bold">
                      <span className="text-emerald-400">Click to Upload</span> or Take Photo with Fundus Lens
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Supports JPG, PNG from handheld fundus camera or smartphone attachment
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Quick Preloaded Rural Camp Presets (6 cols) */}
            <div className="lg:col-span-6 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Option B: Or Select Rural Camp Sample Case
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                {PRESET_SCANS.slice(0, 4).map((preset) => {
                  const stage = ICDR_STAGES[preset.predictedStage];
                  const isSelected = selectedScan.id === preset.id && !uploadedImagePreview;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPresetSample(preset)}
                      className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-2 ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-400 shadow-lg'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="w-full aspect-video rounded-xl overflow-hidden bg-black border border-slate-800">
                        <img
                          src={preset.imageUrl}
                          alt={preset.title}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${stage.bgColor}`}>
                          {stage.shortName}
                        </span>
                        <p className="text-xs font-bold text-slate-200 mt-1 truncate">
                          {preset.title.split('—')[0]}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action to proceed to MATLAB Enhancement */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setCurrentStep('patient_info')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.back}</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep('matlab_enhance')}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-orange-500/25 transition-all"
            >
              <span>{t.nextStep}: {t.matlabEnhanceTitle}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 3: MATLAB IMAGE ENHANCEMENT PIPELINE
         ========================================================================= */}
      {currentStep === 'matlab_enhance' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep('image_input')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.back}</span>
            </button>

            <span className="text-xs text-slate-400">
              Patient: <strong>{patientData.name}</strong> • Eye: <strong>{patientData.selectedEye}</strong>
            </span>
          </div>

          <MatlabEnhancer
            scan={selectedScan}
            language={language}
            onEnhancementComplete={handleRunAIModel}
            autoRun={true}
          />
        </div>
      )}

      {/* =========================================================================
          STEP 4: AI / ML MODEL RUNNING ANIMATION
         ========================================================================= */}
      {currentStep === 'ai_predict' && isAIAnalyzing && (
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-emerald-500/30 animate-pulse">
            <Cpu className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-100">
              {t.analyzingWithAI}
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Deep Learning ResNet-50 Classifier + Random Forest Microaneurysm Detector
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 max-w-md mx-auto">
            <div className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-bold">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>{aiProgressText}</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 5: SIMPLE, ACCESSIBLE RESULTS + PDF EXPORT + PRINT SLIP
         ========================================================================= */}
      {currentStep === 'result' && !isAIAnalyzing && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Main Traffic Light Result Hero Banner */}
          <div className={`p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-4 ${
            selectedScan.predictedStage === 0
              ? 'bg-gradient-to-br from-emerald-950/90 via-slate-900 to-slate-900 border-emerald-500/40 text-emerald-100'
              : selectedScan.predictedStage === 1
              ? 'bg-gradient-to-br from-amber-950/90 via-slate-900 to-slate-900 border-amber-500/40 text-amber-100'
              : selectedScan.predictedStage === 2
              ? 'bg-gradient-to-br from-orange-950/90 via-slate-900 to-slate-900 border-orange-500/40 text-orange-100'
              : 'bg-gradient-to-br from-rose-950/90 via-slate-900 to-slate-900 border-rose-500/50 text-rose-100'
          }`}>
            
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Big Status Icon */}
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl shadow-xl ${
                  selectedScan.predictedStage === 0
                    ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                    : selectedScan.predictedStage === 1
                    ? 'bg-amber-500 text-slate-950 shadow-amber-500/30'
                    : selectedScan.predictedStage === 2
                    ? 'bg-orange-500 text-white shadow-orange-500/30'
                    : 'bg-rose-600 text-white shadow-rose-600/30 animate-bounce'
                }`}>
                  {selectedScan.predictedStage === 0 ? '🟢' : selectedScan.predictedStage === 1 ? '🟡' : selectedScan.predictedStage === 2 ? '🟠' : '🔴'}
                </div>

                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider block opacity-80">
                    {t.resultsTitle} • {patientData.selectedEye === 'OD' ? 'Right Eye (OD)' : 'Left Eye (OS)'}
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                    {selectedScan.predictedStage === 0
                      ? t.safeNormal
                      : selectedScan.predictedStage === 1
                      ? t.mildCaution
                      : selectedScan.predictedStage === 2
                      ? t.moderateRisk
                      : t.highRiskUrgent}
                  </h1>
                </div>
              </div>

              {/* Voice Readout Button */}
              <button
                type="button"
                onClick={() => speakResultText(getSimpleResultAudioScript())}
                className={`px-4 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95 ${
                  isSpeaking
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600'
                }`}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                <span>{isSpeaking ? t.stopVoice : t.voiceReadout}</span>
              </button>
            </div>

            {/* Sub-details & Follow-Up Urgency */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-sky-400" />
                <span>
                  <strong>Clinical Staging:</strong> {stageInfo.name} ({stageInfo.code}) • Confidence: <strong>{selectedScan.stageConfidence}%</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold">Next Action:</span>
                <span className="px-2.5 py-1 rounded-xl bg-white/10 font-bold">
                  {stageInfo.recommendedFollowUp}
                </span>
              </div>
            </div>
          </div>

          {/* Side-by-Side: Retina Visual Map + Plain Advice */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Left: Visual Eye Map showing detected spots (5 Cols) */}
            <div className="md:col-span-5 p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>Where Are the Spots? (Eye Map)</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-400">
                  {selectedScan.lesions.length} spots marked
                </span>
              </div>

              <div className="relative w-full aspect-square bg-black rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
                <img
                  src={selectedScan.imageUrl}
                  alt="Fundus Findings"
                  className="w-full h-full object-contain"
                />

                {/* Overlaid Lesion Markers */}
                {selectedScan.lesions.map((lesion) => (
                  <div
                    key={lesion.id}
                    style={{ left: `${lesion.x}%`, top: `${lesion.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group z-20 pointer-events-auto"
                  >
                    <span className="relative flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 border-2 border-white shadow-md" />
                    </span>
                  </div>
                ))}
              </div>

              <div className="text-[11px] text-slate-400 space-y-1 pt-1">
                {selectedScan.predictedStage === 0 ? (
                  <p className="text-emerald-400 font-semibold">✓ Retina surface is clean and smooth.</p>
                ) : (
                  <p>🔴 Red glowing dots indicate tiny leaking microaneurysms or bleeding spots on the retina.</p>
                )}
              </div>
            </div>

            {/* Right: Action Buttons + Plain Patient Advice (7 Cols) */}
            <div className="md:col-span-7 space-y-4">
              
              {/* Patient Advice */}
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <HeartHandshake className="w-4 h-4 text-rose-400" />
                  <span>{t.adviceForPatient}</span>
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold">
                      1
                    </div>
                    <div>
                      <strong className="text-slate-100 block">Blood Sugar Control:</strong>
                      <span className="text-slate-300">
                        Take diabetes medicine on time daily. Avoid sweets, white rice, and sugary tea. Keep fasting sugar below 130 mg/dL.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                    <div className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 font-bold">
                      2
                    </div>
                    <div>
                      <strong className="text-slate-100 block">Daily 30 Minutes Walking:</strong>
                      <span className="text-slate-300">
                        Regular walking improves blood circulation in the eye vessels and prevents bleeding.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-bold">
                      3
                    </div>
                    <div>
                      <strong className="text-slate-100 block">Eye Specialist Doctor Visit:</strong>
                      <span className="text-slate-300">
                        {stageInfo.recommendedFollowUp} at the District Hospital or Vision Centre.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PRIMARY ACTION BUTTONS: Download PDF + Print Slip + WhatsApp + Next Patient */}
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Export, Print & Share Results
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  
                  {/* Download PDF Button */}
                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    className="py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Medical PDF</span>
                  </button>

                  {/* Print Slip Button */}
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors shadow-md active:scale-95"
                  >
                    <Printer className="w-4 h-4 text-sky-400" />
                    <span>{t.printSlip}</span>
                  </button>

                  {/* WhatsApp Share Button */}
                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 border border-emerald-500/30 transition-colors shadow-md active:scale-95"
                  >
                    <Send className="w-4 h-4 text-emerald-400" />
                    <span>Send via WhatsApp</span>
                  </button>

                  {/* View in History Button */}
                  <button
                    type="button"
                    onClick={onViewHistory}
                    className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors shadow-md active:scale-95"
                  >
                    <History className="w-4 h-4 text-amber-400" />
                    <span>View Patient History</span>
                  </button>
                </div>

                {/* Reset for New Patient */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleResetForNewPatient}
                    className="w-full py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-800 transition-all"
                  >
                    <RefreshCw className="w-4 h-4 text-emerald-400" />
                    <span>{t.startNewCheck}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Printable Village Health Slip Preview (visible during print) */}
          <div className="hidden print:block p-8 bg-white text-black rounded-xl border border-black space-y-4">
            <div className="text-center border-b pb-3">
              <h2 className="text-xl font-bold">Village Primary Health Care Center</h2>
              <p className="text-xs">Diabetic Retinopathy Screening Card • Tele-Ophthalmology Mission</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <p><strong>Patient Name:</strong> {patientData.name}</p>
              <p><strong>Age / Gender:</strong> {patientData.age} yrs / {patientData.gender}</p>
              <p><strong>Village:</strong> {patientData.village}</p>
              <p><strong>Phone:</strong> {patientData.phone}</p>
              <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
              <p><strong>Tested Eye:</strong> {patientData.selectedEye === 'OD' ? 'Right Eye (OD)' : 'Left Eye (OS)'}</p>
              <p><strong>Blood Sugar:</strong> {patientData.lastFastingSugar}</p>
            </div>

            <div className="border p-3 rounded bg-slate-100 text-xs">
              <p><strong>Screening Diagnosis:</strong> {stageInfo.name}</p>
              <p><strong>Urgency:</strong> {stageInfo.urgency.toUpperCase()}</p>
              <p><strong>Recommended Follow-up:</strong> {stageInfo.recommendedFollowUp}</p>
            </div>

            <div className="pt-8 border-t flex justify-between text-xs">
              <p>Health Worker Signature: {currentUser.name}</p>
              <p>Center: {currentUser.centerName}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
