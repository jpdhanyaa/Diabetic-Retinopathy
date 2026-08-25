import React, { useState } from 'react';
import { ViewMode, ScreenerUser, DRAnalysisResult, PatientDetails } from './types';
import { SimpleHomeView } from './components/SimpleHomeView';
import { SimpleUploadView } from './components/SimpleUploadView';
import { SimpleAnalysisView } from './components/SimpleAnalysisView';
import { SimpleResultView } from './components/SimpleResultView';
import { LoginView } from './components/LoginView';
import { ForgotPasswordView } from './components/ForgotPasswordView';
import { RegisterView } from './components/RegisterView';
import { PRESET_FUNDUS_CASES } from './data/sampleScans';
import { analyzeRetinalImageML } from './utils/retinalMlEngine';

export function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<ScreenerUser | null>(null);
  const [currentView, setCurrentView] = useState<ViewMode>('login');

  // Complete Essential Patient Details State
  const [patientDetails, setPatientDetails] = useState<PatientDetails>({
    patientName: '',
    patientId: 'PAT-90214',
    age: 58,
    selectedEye: 'Right Eye (OD)',
    diabetesType: 'Type 2',
    diabetesDurationYears: 10,
    hba1c: 8.0,
    bloodSugarLevel: 150,
    diabetesMedications: ['Metformin'],
    systemicMedications: ['Blood Thinners (Aspirin/Clopidogrel)'],
    bloodPressure: '130/85 mmHg',
    kidneyFunctionStatus: 'Microalbuminuria',
    reproductiveStatus: 'Not Pregnant / N/A',
    ocularSymptoms: ['Blurred Vision']
  });

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [activeAnalysisResult, setActiveAnalysisResult] = useState<DRAnalysisResult>(PRESET_FUNDUS_CASES[0].analysis);

  // Authentication Handlers
  const handleLogin = (user: ScreenerUser) => {
    setCurrentUser(user);
    setCurrentView('home');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('login');
  };

  const handleRegistered = (user: ScreenerUser) => {
    setCurrentUser(user);
    setCurrentView('home');
  };

  // Screening Workflow Navigation Handlers
  const handleStartScreeningFromHome = () => {
    setCurrentView('upload');
  };

  const handleImageSelected = async (imageDataUrl: string) => {
    setUploadedImage(imageDataUrl);
    // Execute intelligent feature extraction evaluating Iowa EyeRounds Normal Fundus Atlas & hospital lesion benchmarks
    try {
      const mlResult = await analyzeRetinalImageML(imageDataUrl, patientDetails);
      setActiveAnalysisResult(mlResult);
    } catch (err) {
      console.error('Error analyzing retinal image:', err);
      setActiveAnalysisResult(PRESET_FUNDUS_CASES[0].analysis);
    }
  };

  const handleStartAnalysis = async () => {
    if (!uploadedImage) return;
    // Re-evaluate with current patient parameters before switching to analysis view
    try {
      const mlResult = await analyzeRetinalImageML(uploadedImage, patientDetails);
      setActiveAnalysisResult(mlResult);
    } catch (err) {
      console.error('Error during final analysis prep:', err);
    }
    setCurrentView('analysis');
  };

  const handleAnalysisComplete = () => {
    setCurrentView('result');
  };

  const handleStartNewScreening = () => {
    setPatientDetails({
      patientName: '',
      patientId: `PAT-${Math.floor(10000 + Math.random() * 90000)}`,
      age: 50,
      selectedEye: 'Right Eye (OD)',
      diabetesType: 'Type 2',
      diabetesDurationYears: 5,
      hba1c: 7.0,
      bloodSugarLevel: 130,
      diabetesMedications: ['Metformin'],
      systemicMedications: [],
      bloodPressure: '120/80 mmHg',
      kidneyFunctionStatus: 'Normal / Preserved',
      reproductiveStatus: 'Not Pregnant / N/A',
      ocularSymptoms: ['None / Asymptomatic']
    });
    setUploadedImage(null);
    setCurrentView('upload');
  };

  // If on Auth pages, render full screen auth views
  if (currentView === 'login') {
    return <LoginView onNavigate={(view) => setCurrentView(view)} onLogin={handleLogin} />;
  }

  if (currentView === 'register') {
    return <RegisterView onNavigate={(view) => setCurrentView(view)} onRegistered={handleRegistered} />;
  }

  if (currentView === 'forgot-password') {
    return <ForgotPasswordView onNavigate={(view) => setCurrentView(view)} />;
  }

  // Authenticated Layout: Home, Upload, Analysis, Result
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Application Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo & Project Title */}
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-3 text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[24px]">visibility</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 text-base tracking-tight">RetinaScan AI</span>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  Screening
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Early Eye Screening for Diabetic Retinopathy
              </p>
            </div>
          </button>

          {/* User Profile - Displays user name alone simply */}
          <div className="flex items-center gap-3">
            {currentUser && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="text-xs font-bold text-slate-800">
                  {currentUser.name}
                </span>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer border border-slate-200"
              title="Sign Out"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Screening Pages */}
      <main className="flex-1">
        {currentView === 'home' && (
          <SimpleHomeView
            onStartScreening={handleStartScreeningFromHome}
          />
        )}

        {currentView === 'upload' && (
          <SimpleUploadView
            initialImage={uploadedImage}
            patientDetails={patientDetails}
            onPatientDetailsChange={setPatientDetails}
            onImageSelected={handleImageSelected}
            onStartAnalysis={handleStartAnalysis}
            onBackToHome={() => setCurrentView('home')}
          />
        )}

        {currentView === 'analysis' && uploadedImage && (
          <SimpleAnalysisView
            imageUrl={uploadedImage}
            patientDetails={patientDetails}
            analysisResult={activeAnalysisResult}
            onAnalysisComplete={handleAnalysisComplete}
          />
        )}

        {currentView === 'result' && uploadedImage && (
          <SimpleResultView
            patientDetails={patientDetails}
            imageUrl={uploadedImage}
            analysis={activeAnalysisResult}
            onStartNewScreening={handleStartNewScreening}
          />
        )}
      </main>

      {/* Simple Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>RetinaScan AI • Hospital-Trained Retinal Health Screening &amp; MATLAB Image Enhancement</span>
          <span className="text-[11px] text-slate-400">ICD-10 / ETDRS Clinical Protocols</span>
        </div>
      </footer>
    </div>
  );
}
export default App;
