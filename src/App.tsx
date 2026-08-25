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

export function App() {
  // Authentication State (Default: start at login page)
  const [currentUser, setCurrentUser] = useState<ScreenerUser | null>(null);
  const [currentView, setCurrentView] = useState<ViewMode>('login');

  // Complete Essential Patient Details State
  const [patientDetails, setPatientDetails] = useState<PatientDetails>({
    patientName: 'Eleanor Vance',
    patientId: 'PAT-90214',
    age: 58,
    selectedEye: 'Right Eye (OD)',
    diabetesType: 'Type 2',
    diabetesDurationYears: 12,
    hba1c: 8.2,
    bloodSugarLevel: 154,
    diabetesMedications: ['Insulin Injections', 'Metformin'],
    systemicMedications: ['Blood Thinners (Aspirin/Clopidogrel)', 'ACE Inhibitor / ARB'],
    bloodPressure: '138/86 mmHg',
    kidneyFunctionStatus: 'Microalbuminuria',
    reproductiveStatus: 'Not Pregnant / N/A',
    ocularSymptoms: ['Blurred Vision', 'Floaters (Spots in vision)']
  });

  const [uploadedImage, setUploadedImage] = useState<string | null>(PRESET_FUNDUS_CASES[2].imageUrl);
  const [activeAnalysisResult, setActiveAnalysisResult] = useState<DRAnalysisResult>(PRESET_FUNDUS_CASES[2].analysis);

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

  const handleImageSelected = (imageDataUrl: string) => {
    setUploadedImage(imageDataUrl);
    // Deterministic simulation based on uploaded image
    const seed = imageDataUrl.length % 5;
    setActiveAnalysisResult(PRESET_FUNDUS_CASES[seed].analysis);
  };

  const handleStartAnalysis = () => {
    if (!uploadedImage) return;
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
  // NOTE: Step numbers (1. Home 2. Upload image 3. AI analysis 4. Result) have been removed from all pages as requested.
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-sky-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
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

          {/* User Profile & Navigation / Sign Out */}
          <div className="flex items-center gap-3">
            {currentUser && (
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-slate-500">
                  {currentUser.role}
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
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>RetinaScan AI • Early Eye Screening for Diabetic Retinopathy</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentView('home')}
              className="hover:text-blue-600 cursor-pointer"
            >
              Home
            </button>
            <span>•</span>
            <button
              onClick={() => setCurrentView('upload')}
              className="hover:text-blue-600 cursor-pointer"
            >
              Upload Image
            </button>
            <span>•</span>
            <button
              onClick={handleLogout}
              className="hover:text-blue-600 cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
