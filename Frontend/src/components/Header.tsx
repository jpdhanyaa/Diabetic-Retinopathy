import React from 'react';
import { 
  Eye, 
  Sparkles, 
  History, 
  Globe, 
  LogOut, 
  User,
  PlusCircle,
  FileCheck,
  Activity,
  Layers,
  Cpu
} from 'lucide-react';
import { HealthWorkerUser, LanguageCode } from '../types/rural';
import { LANGUAGE_OPTIONS } from '../data/translations';

export type ActiveTab = 'matlab_studio' | 'simulink' | 'rural_wizard' | 'history';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  historyCount: number;
  currentUser: HealthWorkerUser | null;
  onLogout: () => void;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  historyCount,
  currentUser,
  onLogout,
  language,
  onLanguageChange,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo and Brand */}
          <div 
            className="flex items-center gap-3 cursor-pointer shrink-0" 
            onClick={() => setActiveTab('matlab_studio')}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-sky-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-white/20">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  MATLAB Retinal AI
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Toolbox & Simulink
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal hidden md:block">
                Automated DR Screening Pipeline & Telemedicine Optimization
              </p>
            </div>
          </div>

          {/* Center Navigation: 4 Core Modules */}
          <div className="flex items-center p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-bold overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('matlab_studio')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'matlab_studio'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>MATLAB Pipeline (1–4)</span>
            </button>

            <button
              onClick={() => setActiveTab('simulink')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'simulink'
                  ? 'bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Simulink 100k+ (Pillar 5)</span>
            </button>

            <button
              onClick={() => setActiveTab('rural_wizard')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'rural_wizard'
                  ? 'bg-slate-800 text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Camp Flow</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'history'
                  ? 'bg-slate-800 text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-4 h-4" />
              <span>History</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-900 text-emerald-400 border border-slate-700">
                {historyCount}
              </span>
            </button>
          </div>

          {/* Right Actions: Language Selector + User Info & Logout */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Language Selector */}
            <div className="hidden sm:flex items-center bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400 mr-1.5" />
              <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
                className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer"
              >
                {LANGUAGE_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code} className="bg-slate-900 text-slate-100">
                    {opt.flag} {opt.label.split(' ')[0]}
                  </option>
                ))}
              </select>
            </div>

            {/* Current Health Worker / User Badge */}
            {currentUser && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="text-right hidden md:block">
                  <div className="text-xs font-bold text-slate-200 truncate max-w-[120px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-emerald-400 truncate max-w-[120px]">
                    {currentUser.role}
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  title="Log out / Switch User"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 border border-slate-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
