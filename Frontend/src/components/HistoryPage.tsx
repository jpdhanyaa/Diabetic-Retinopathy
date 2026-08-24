import React, { useState } from 'react';
import { ScreeningHistoryRecord, LanguageCode } from '../types/rural';
import { TRANSLATIONS } from '../data/translations';
import { generatePatientReportPDF } from '../utils/pdfGenerator';
import { 
  FileText, 
  Search, 
  Printer, 
  Download, 
  Share2, 
  Eye, 
  MapPin, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  User, 
  Filter, 
  Plus, 
  Trash2, 
  Send, 
  ExternalLink,
  Info,
  Clock,
  Sparkles
} from 'lucide-react';

interface HistoryPageProps {
  historyRecords: ScreeningHistoryRecord[];
  onDeleteRecord?: (id: string) => void;
  onStartNewScreening: () => void;
  language: LanguageCode;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  historyRecords,
  onDeleteRecord,
  onStartNewScreening,
  language,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStage, setFilterStage] = useState<string>('all');
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<ScreeningHistoryRecord | null>(null);

  // Filtered records
  const filteredRecords = historyRecords.filter((record) => {
    const matchesSearch =
      record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.phone.includes(searchTerm) ||
      record.id.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStage === 'all') return true;
    if (filterStage === 'normal') return record.predictedStage === 0;
    if (filterStage === 'mild') return record.predictedStage === 1;
    if (filterStage === 'moderate') return record.predictedStage === 2;
    if (filterStage === 'severe') return record.predictedStage >= 3;
    return true;
  });

  // Calculate quick camp metrics
  const totalScreened = historyRecords.length;
  const normalCount = historyRecords.filter((r) => r.predictedStage === 0).length;
  const referralCount = historyRecords.filter((r) => r.predictedStage >= 2).length;
  const mildCount = historyRecords.filter((r) => r.predictedStage === 1).length;

  const handleSendWhatsApp = (record: ScreeningHistoryRecord) => {
    const stageTxt = record.predictedStage === 0 
      ? 'NORMAL (Healthy Eyes)' 
      : record.predictedStage === 1 
      ? 'MILD Early Stage' 
      : record.predictedStage === 2 
      ? 'MODERATE Damage (Needs Doctor Visit)' 
      : 'URGENT Severe Damage (Hospital Laser/Injection required)';

    const text = `*Rural Eye Screening Report*
*Patient:* ${record.patientName} (${record.age}y, ${record.gender})
*Village:* ${record.village}
*Tested Eye:* ${record.eye === 'OD' ? 'Right Eye (OD)' : 'Left Eye (OS)'}
*Diagnosis:* ${stageTxt}
*Follow-Up Action:* ${record.followUpText}
*Sugar Level:* ${record.sugarLevel}
*Screened By:* ${record.healthWorkerName} (${record.centerName})
*Date:* ${record.date}`;

    const phoneClean = record.phone.replace(/[^0-9]/g, '');
    const url = `https://api.whatsapp.com/send?phone=${phoneClean.length === 10 ? '91' + phoneClean : phoneClean}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handlePrintIndividualSlip = (record: ScreeningHistoryRecord) => {
    setSelectedRecordForDetail(record);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Top Hero / Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Patients */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Screened</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <User className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-100">{totalScreened}</div>
          <p className="text-[11px] text-slate-500">Village camp participants</p>
        </div>

        {/* Normal / Safe */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Healthy Eyes (Normal)</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400">{normalCount}</div>
          <p className="text-[11px] text-slate-500">{totalScreened ? Math.round((normalCount / totalScreened) * 100) : 0}% of all tests</p>
        </div>

        {/* Mild Early */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Mild (Sugar Control)</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400">{mildCount}</div>
          <p className="text-[11px] text-slate-500">6-month re-check</p>
        </div>

        {/* Severe / Referrals */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Urgent Doctor Referrals</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-400">{referralCount}</div>
          <p className="text-[11px] text-slate-500">Hospital referral advised</p>
        </div>
      </div>

      {/* Main Table & Filter Controls Container */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
        
        {/* Header with Search & New Test Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              <span>Village Patient Screening History</span>
            </h2>
            <p className="text-xs text-slate-400">
              Archived records of retinal scans, MATLAB enhancement states, and AI classifications
            </p>
          </div>

          <button
            type="button"
            onClick={onStartNewScreening}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Eye Screening</span>
          </button>
        </div>

        {/* Search & Severity Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          
          {/* Search Box (7 cols) */}
          <div className="sm:col-span-7 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by patient name, village, mobile, or ID..."
              className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-100 placeholder-slate-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Severity Filter (5 cols) */}
          <div className="sm:col-span-5 flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilterStage('all')}
              className={`flex-1 py-1.5 rounded-xl font-bold transition-all ${
                filterStage === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({historyRecords.length})
            </button>
            <button
              onClick={() => setFilterStage('normal')}
              className={`flex-1 py-1.5 rounded-xl font-bold transition-all ${
                filterStage === 'normal' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🟢 Normal
            </button>
            <button
              onClick={() => setFilterStage('mild')}
              className={`flex-1 py-1.5 rounded-xl font-bold transition-all ${
                filterStage === 'mild' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🟡 Mild
            </button>
            <button
              onClick={() => setFilterStage('severe')}
              className={`flex-1 py-1.5 rounded-xl font-bold transition-all ${
                filterStage === 'severe' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🔴 Severe
            </button>
          </div>
        </div>

        {/* Records Table / List */}
        {filteredRecords.length === 0 ? (
          <div className="py-12 text-center space-y-3 bg-slate-950/40 rounded-2xl border border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <div className="text-slate-300 font-bold text-sm">No screening records found</div>
            <p className="text-xs text-slate-500">Try changing your search term or filter status</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRecords.map((record) => {
              const isNormal = record.predictedStage === 0;
              const isMild = record.predictedStage === 1;
              const isModerate = record.predictedStage === 2;
              const isSevere = record.predictedStage >= 3;

              return (
                <div
                  key={record.id}
                  className="p-4 rounded-2xl bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm"
                >
                  {/* Left: Patient Info & Thumbnail */}
                  <div className="flex items-center gap-3.5">
                    
                    {/* Thumbnail */}
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-black border border-slate-800 shrink-0">
                      <img
                        src={record.imageUrl}
                        alt="Retina thumbnail"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-100">{record.patientName}</h3>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                          {record.age}y • {record.gender}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-sky-300 font-bold font-mono">
                          {record.eye === 'OD' ? 'OD (Right)' : 'OS (Left)'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {record.village}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-500" />
                          {record.phone}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {record.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Clinical AI Result Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                    <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                      isNormal
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : isMild
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : isModerate
                        ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}>
                      <span>{isNormal ? '🟢' : isMild ? '🟡' : isModerate ? '🟠' : '🔴'}</span>
                      <span>{record.stageName}</span>
                    </div>

                    <span className="text-[11px] text-slate-400">
                      {record.followUpText}
                    </span>
                  </div>

                  {/* Right: PDF, Print & Share Action Buttons */}
                  <div className="flex items-center gap-1.5 self-end lg:self-center">
                    
                    {/* PDF Download Button */}
                    <button
                      type="button"
                      onClick={() => generatePatientReportPDF(record)}
                      title="Download PDF Report"
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>PDF</span>
                    </button>

                    {/* Print Slip Button */}
                    <button
                      type="button"
                      onClick={() => handlePrintIndividualSlip(record)}
                      title="Print Health Slip"
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors shadow-sm"
                    >
                      <Printer className="w-3.5 h-3.5 text-sky-400" />
                      <span>Print</span>
                    </button>

                    {/* WhatsApp / SMS Share */}
                    <button
                      type="button"
                      onClick={() => handleSendWhatsApp(record)}
                      title="Send Result via WhatsApp"
                      className="px-3 py-2 rounded-xl bg-emerald-700/60 hover:bg-emerald-600 text-emerald-100 text-xs font-bold flex items-center gap-1.5 border border-emerald-500/30 transition-colors shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </button>

                    {/* Delete record */}
                    {onDeleteRecord && (
                      <button
                        type="button"
                        onClick={() => onDeleteRecord(record.id)}
                        title="Delete Record"
                        className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Hidden Print Container for Printable Slip */}
      {selectedRecordForDetail && (
        <div className="hidden print:block p-8 bg-white text-black rounded-xl border border-black space-y-4">
          <div className="text-center border-b pb-3">
            <h2 className="text-xl font-bold">Village Primary Health Care Center</h2>
            <p className="text-xs">Diabetic Retinopathy Screening Card • Tele-Ophthalmology Mission</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <p><strong>Patient Name:</strong> {selectedRecordForDetail.patientName}</p>
            <p><strong>Age / Gender:</strong> {selectedRecordForDetail.age} yrs / {selectedRecordForDetail.gender}</p>
            <p><strong>Village:</strong> {selectedRecordForDetail.village}</p>
            <p><strong>Phone:</strong> {selectedRecordForDetail.phone}</p>
            <p><strong>Date:</strong> {selectedRecordForDetail.date}</p>
            <p><strong>Tested Eye:</strong> {selectedRecordForDetail.eye === 'OD' ? 'Right Eye (OD)' : 'Left Eye (OS)'}</p>
            <p><strong>Blood Sugar:</strong> {selectedRecordForDetail.sugarLevel}</p>
          </div>

          <div className="border p-3 rounded bg-slate-100 text-xs space-y-1">
            <p><strong>Screening Diagnosis:</strong> {selectedRecordForDetail.stageName}</p>
            <p><strong>Urgency:</strong> {selectedRecordForDetail.urgency.toUpperCase()}</p>
            <p><strong>Recommended Follow-up:</strong> {selectedRecordForDetail.followUpText}</p>
          </div>

          <div className="text-[11px] border p-2 rounded space-y-0.5">
            <strong>Key Advice:</strong>
            <p>1. Daily sugar medicine on time.</p>
            <p>2. Keep fasting sugar below 130 mg/dL.</p>
            <p>3. Walk 30 minutes daily and avoid sweets.</p>
          </div>

          <div className="pt-8 border-t flex justify-between text-xs">
            <p>Health Worker: {selectedRecordForDetail.healthWorkerName}</p>
            <p>Center: {selectedRecordForDetail.centerName}</p>
          </div>
        </div>
      )}
    </div>
  );
};
