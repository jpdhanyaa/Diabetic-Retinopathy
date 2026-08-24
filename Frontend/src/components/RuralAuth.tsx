import React, { useState } from 'react';
import { HealthWorkerUser, LanguageCode } from '../types/rural';
import { TRANSLATIONS, LANGUAGE_OPTIONS } from '../data/translations';
import { 
  Eye, 
  User, 
  Lock, 
  MapPin, 
  Phone, 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  UserPlus, 
  LogIn, 
  HeartHandshake,
  Stethoscope,
  Globe
} from 'lucide-react';

interface RuralAuthProps {
  onLoginSuccess: (user: HealthWorkerUser) => void;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
}

export const RuralAuth: React.FC<RuralAuthProps> = ({
  onLoginSuccess,
  language,
  onLanguageChange,
}) => {
  const t = TRANSLATIONS[language];
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);

  // Form fields
  const [phone, setPhone] = useState<string>('9876543210');
  const [pin, setPin] = useState<string>('1234');
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<HealthWorkerUser['role']>('ASHA Worker');
  const [centerName, setCenterName] = useState<string>('');
  const [village, setVillage] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleQuickDemoLogin = () => {
    const demoWorker: HealthWorkerUser = {
      id: 'WORKER-ASHA-042',
      name: 'Pooja Verma',
      role: 'ASHA Worker',
      centerName: 'Rampur Primary Health Sub-Centre',
      village: 'Rampur Khurd',
      district: 'Varanasi',
      phone: '+91 98765 43210',
    };
    onLoginSuccess(demoWorker);
  };

  const handlePatientSelfCheck = () => {
    const patientUser: HealthWorkerUser = {
      id: 'PATIENT-SELF-01',
      name: 'Village Resident',
      role: 'Patient / Self',
      centerName: 'Mobile Village Screening Camp',
      village: 'Gram Panchayat',
      district: 'Rural District',
      phone: '+91 98000 11223',
    };
    onLoginSuccess(patientUser);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 6) {
      setErrorMsg('Please enter a valid mobile number');
      return;
    }
    if (!pin) {
      setErrorMsg('Please enter your 4-digit PIN');
      return;
    }

    if (isRegisterMode) {
      if (!name.trim()) {
        setErrorMsg('Please enter your full name');
        return;
      }
      const newUser: HealthWorkerUser = {
        id: `WORKER-${Date.now().toString().slice(-5)}`,
        name: name.trim(),
        role: role,
        centerName: centerName.trim() || 'Village Primary Health Centre',
        village: village.trim() || 'Local Village',
        district: district.trim() || 'Rural Block',
        phone: phone.trim(),
      };
      onLoginSuccess(newUser);
    } else {
      // Login simulation
      const loggedUser: HealthWorkerUser = {
        id: 'WORKER-001',
        name: name.trim() || 'Health Officer / Worker',
        role: role,
        centerName: centerName.trim() || 'Community Health Centre',
        village: village.trim() || 'Village Sub-Centre',
        district: district.trim() || 'District Health Mission',
        phone: phone.trim(),
      };
      onLoginSuccess(loggedUser);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Language Switcher Bar at Top */}
      <div className="w-full max-w-lg flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Globe className="w-4 h-4 text-emerald-400" />
          <span>Language / भाषा:</span>
        </div>
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
          className="bg-slate-900 border border-slate-700 text-slate-100 text-xs font-bold rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        >
          {LANGUAGE_OPTIONS.map((opt) => (
            <option key={opt.code} value={opt.code}>
              {opt.flag} {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-lg bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative z-10">
        
        {/* App Logo & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-lg shadow-emerald-500/30 mb-1">
            <Eye className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">
            {t.appTitle}
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            {t.appSubtitle}
          </p>
        </div>

        {/* Quick Demo Login Hero Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/30 text-left space-y-2.5 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                Instant 1-Click Access
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
              Demo Mode
            </span>
          </div>

          <p className="text-xs text-slate-300">
            For village camps & demonstrations, click below to start testing immediately without typing:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <Stethoscope className="w-4 h-4" />
              <span>ASHA Worker Login</span>
            </button>

            <button
              type="button"
              onClick={handlePatientSelfCheck}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all border border-slate-700"
            >
              <User className="w-4 h-4 text-sky-400" />
              <span>Patient Direct Check</span>
            </button>
          </div>
        </div>

        {/* Divider with Or */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-[11px] font-bold text-slate-500 uppercase">
            Or Login with Mobile / PIN
          </span>
          <div className="border-t border-slate-800 w-full" />
        </div>

        {/* Mode Switch Tabs (Login vs Register) */}
        <div className="flex p-1 bg-slate-950 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(false);
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              !isRegisterMode
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{t.loginTitle}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(true);
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              isRegisterMode
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{t.registerTitle}</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {isRegisterMode && (
            <>
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">
                  Health Worker Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Suman Devi"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Role */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">
                  Your Role / Designation
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as HealthWorkerUser['role'])}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="ASHA Worker">ASHA Worker (Accredited Social Health Activist)</option>
                  <option value="ANM / Clinic Nurse">ANM (Auxiliary Nurse Midwife) / Staff Nurse</option>
                  <option value="Community Health Officer (CHO)">Community Health Officer (CHO)</option>
                  <option value="Village Doctor">Primary Health Doctor / Medical Officer</option>
                  <option value="Patient / Self">Patient / Direct Self-User</option>
                </select>
              </div>

              {/* Village & Health Centre */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Health Centre / Sub-Centre
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={centerName}
                      onChange={(e) => setCenterName(e.target.value)}
                      placeholder="e.g. Rampur PHC"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Village Name
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      placeholder="e.g. Rampur"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Mobile Phone Number */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 block">
              {t.phoneNumber} *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* 4-Digit Security PIN */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 block">
              Security PIN (4 Digits) *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                maxLength={4}
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="e.g. 1234"
                className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono tracking-widest"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
          >
            <span>{isRegisterMode ? 'Complete Registration & Enter' : 'Log In to Clinic Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer info */}
        <div className="pt-2 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Village Tele-Ophthalmology Initiative • Fast Offline-Ready Screening</span>
        </div>
      </div>
    </div>
  );
};
