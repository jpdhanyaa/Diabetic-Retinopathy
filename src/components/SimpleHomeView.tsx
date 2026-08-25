import React from 'react';

interface SimpleHomeViewProps {
  onStartScreening: () => void;
}

export const SimpleHomeView: React.FC<SimpleHomeViewProps> = ({
  onStartScreening
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-10 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center space-y-5 max-w-3xl mx-auto pt-2">
        {/* Project Logo & Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          Clinical AI Screening &amp; MATLAB Image Enhancement
        </div>

        <div className="flex items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <span className="material-symbols-outlined text-[32px]">visibility</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            RetinaScan <span className="text-blue-600">AI</span>
          </h1>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
          Early Eye Screening for Diabetic Retinopathy
        </h2>

        {/* Simple and catchy description */}
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
          Instant AI-powered retinal screening. Fast, clear, and accurate eye checks in seconds.
        </p>

        {/* Start Screening Button */}
        <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onStartScreening}
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-base font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[24px]">add_photo_alternate</span>
            Start Screening
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Hospital Resources & Clinical Knowledge Base Section - MILD COLORS */}
      <div className="bg-slate-50/90 rounded-2xl border border-slate-200/90 p-6 sm:p-7 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[22px]">medical_services</span>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 tracking-tight">
              Hospital Clinical Knowledge Base &amp; ML Diagnostic Feed
            </h3>
          </div>
          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 border border-slate-300">
            Clinical Reference
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          The RetinaScan AI neural classifier and MATLAB feature extraction pipeline are trained and validated against clinical standards from leading ophthalmic institutions:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
          {/* Source 1: Iowa EyeRounds Normal Reference */}
          <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 space-y-1 shadow-2xs">
            <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs">
              <span className="material-symbols-outlined text-[17px]">visibility</span>
              Univ. of Iowa EyeRounds
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Gold standard for normal fundus anatomy: clear foveal reflex, sharp optic disc margins, normal CDR (0.2–0.4), and smooth vascular caliber.
            </p>
          </div>

          {/* Source 2: Barbara Davis Center */}
          <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 space-y-1 shadow-2xs">
            <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs">
              <span className="material-symbols-outlined text-[17px]">biomedical</span>
              Barbara Davis Center
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              CU Anschutz Medical Campus: Microaneurysms, dot/blot hemorrhages, hard exudate rings, cotton wool spots, and IRMA lesion criteria.
            </p>
          </div>

          {/* Source 3: Eye7 Hospitals & Retina Today */}
          <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 space-y-1 shadow-2xs">
            <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs">
              <span className="material-symbols-outlined text-[17px]">difference</span>
              Eye7 Hospitals &amp; Retina Today
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              6-condition differential atlas: Diabetic Retinopathy, Hypertensive Retinopathy, Glaucoma, AMD, Retinal Detachment &amp; Optic Neuritis.
            </p>
          </div>
        </div>
      </div>

      {/* Simple 4-Step Process Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="text-center space-y-1">
          <h3 className="text-lg font-bold text-slate-900">How It Works</h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Simple 4-step workflow to analyze retinal fundus photos in seconds.
          </p>
        </div>

        {/* Step Flow Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center p-5 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-xs">Upload Eye Image</h4>
              <p className="text-[11px] text-slate-500">
                Choose a fundus photo from your device and enter patient details.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center p-5 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-xs">Quality Check</h4>
              <p className="text-[11px] text-slate-500">
                Automatic scan verifies blur, illumination, and field of view.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center p-5 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-xs">AI &amp; MATLAB Scan</h4>
              <p className="text-[11px] text-slate-500">
                MATLAB CLAHE enhances vessels and deep AI evaluates retinal lesions.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center text-center p-5 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
              4
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-xs">Download Report</h4>
              <p className="text-[11px] text-slate-500">
                View instant results and download the full screening PDF report.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Notice Disclaimer */}
      <div className="p-4 bg-slate-100/70 border border-slate-200 rounded-xl text-center text-xs text-slate-700 space-y-1">
        <p className="font-semibold flex items-center justify-center gap-1.5">
          <span className="material-symbols-outlined text-[18px] text-blue-700">info</span>
          Important Clinical Disclaimer
        </p>
        <p className="text-slate-500 max-w-2xl mx-auto text-[11px]">
          RetinaScan AI is an automated screening support tool designed to assist healthcare screeners. It does not replace a comprehensive dilated eye examination by an eye care specialist.
        </p>
      </div>
    </div>
  );
};
