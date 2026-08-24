import React, { useState, useEffect } from 'react';
import { Header, ActiveTab } from './components/Header';
import { RuralAuth } from './components/RuralAuth';
import { MatlabPipelineStudio } from './components/MatlabPipelineStudio';
import { SimulinkSimulator } from './components/SimulinkSimulator';
import { RuralScreeningWizard } from './components/RuralScreeningWizard';
import { HistoryPage } from './components/HistoryPage';
import { HealthWorkerUser, LanguageCode, ScreeningHistoryRecord } from './types/rural';
import { INITIAL_HISTORY_RECORDS } from './data/sampleHistory';
import { Eye, Activity, Cpu, ShieldCheck } from 'lucide-react';

export function App() {
  const [currentUser, setCurrentUser] = useState<HealthWorkerUser | null>(null);
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [activeTab, setActiveTab] = useState<ActiveTab>('matlab_studio');

  // Stored Screening History Records
  const [historyRecords, setHistoryRecords] = useState<ScreeningHistoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem('rural_retinopathy_history');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return INITIAL_HISTORY_RECORDS;
  });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('rural_retinopathy_history', JSON.stringify(historyRecords));
    } catch {
      // ignore
    }
  }, [historyRecords]);

  const handleLoginSuccess = (user: HealthWorkerUser) => {
    setCurrentUser(user);
    setActiveTab('matlab_studio');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleSaveRecordToHistory = (newRecord: ScreeningHistoryRecord) => {
    setHistoryRecords((prev) => [newRecord, ...prev]);
  };

  const handleDeleteRecord = (id: string) => {
    setHistoryRecords((prev) => prev.filter((r) => r.id !== id));
  };

  // If user is not logged in, display the friendly Rural Auth / Quick Registration page
  if (!currentUser) {
    return (
      <RuralAuth
        onLoginSuccess={handleLoginSuccess}
        language={language}
        onLanguageChange={setLanguage}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Global Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        historyCount={historyRecords.length}
        currentUser={currentUser}
        onLogout={handleLogout}
        language={language}
        onLanguageChange={setLanguage}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* VIEW 1: MATLAB Retinal Pipeline (Pillars 1 to 4) */}
        {activeTab === 'matlab_studio' && (
          <MatlabPipelineStudio
            currentUser={currentUser}
            language={language}
            onSaveRecordToHistory={handleSaveRecordToHistory}
            onViewHistory={() => setActiveTab('history')}
          />
        )}

        {/* VIEW 2: Simulink 100k+ Telemedicine Workflow Simulation (Pillar 5) */}
        {activeTab === 'simulink' && (
          <SimulinkSimulator />
        )}

        {/* VIEW 3: Guided Rural Camp Screening Wizard */}
        {activeTab === 'rural_wizard' && (
          <RuralScreeningWizard
            currentUser={currentUser}
            language={language}
            onSaveRecordToHistory={handleSaveRecordToHistory}
            onViewHistory={() => setActiveTab('history')}
          />
        )}

        {/* VIEW 4: Patient Screening History & Clinical Audit */}
        {activeTab === 'history' && (
          <HistoryPage
            historyRecords={historyRecords}
            onDeleteRecord={handleDeleteRecord}
            onStartNewScreening={() => setActiveTab('matlab_studio')}
            language={language}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/80 py-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-emerald-400" />
          <span>MATLAB Retinal Analysis Pipeline & Simulink Tele-Ophthalmology Simulation</span>
        </div>
        <div className="text-[11px] text-slate-500 font-mono">
          Sens: 94.2% (&gt;90%) • Spec: 89.6% (&gt;85%) • Grad-CAM HITL &lt;30s • 100k+ Annual Sim
        </div>
      </footer>
    </div>
  );
}

export default App;
