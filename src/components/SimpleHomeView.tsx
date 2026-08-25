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
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold shadow-xs">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          AI-Powered Retinal Health Screening &amp; MATLAB Image Enhancement
        </div>

        <div className="flex items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <span className="material-symbols-outlined text-[34px]">visibility</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            RetinaScan <span className="text-blue-600">AI</span>
          </h1>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
          Early Eye Screening for Diabetic Retinopathy
        </h2>

        <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
          Upload a retinal image to screen for possible signs of diabetic retinopathy. Fast, simple, and explainable assistance for healthcare workers and individuals.
        </p>

        {/* Large Start Screening Button */}
        <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onStartScreening}
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-base font-bold rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[24px]">add_photo_alternate</span>
            Start Screening
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center p-5 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base shadow-xs">
              1
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-sm">Upload Eye Image</h4>
              <p className="text-xs text-slate-500">
                Choose a fundus photo from your device and enter patient details.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center p-5 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base shadow-xs">
              2
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-sm">Image is Checked</h4>
              <p className="text-xs text-slate-500">
                Automatic quality check verifies blur, illumination &amp; 45° field of view.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center p-5 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base shadow-xs">
              3
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-sm">AI Analyzes Retina</h4>
              <p className="text-xs text-slate-500">
                MATLAB CLAHE enhancement reveals microvascular structures for AI diagnosis.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center text-center p-5 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base shadow-xs">
              4
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-sm">View &amp; Download Result</h4>
              <p className="text-xs text-slate-500">
                Preview screening results with AI explainability and download full PDF report.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Notice Disclaimer */}
      <div className="p-4 bg-blue-50/60 border border-blue-200/80 rounded-xl text-center text-xs text-blue-900 space-y-1">
        <p className="font-semibold flex items-center justify-center gap-1.5">
          <span className="material-symbols-outlined text-[18px] text-blue-700">info</span>
          Important Clinical Disclaimer
        </p>
        <p className="text-slate-600 max-w-2xl mx-auto text-[11px]">
          RetinaScan AI is an automated screening support tool designed to assist healthcare screeners. It does not replace a comprehensive dilated eye examination by an ophthalmologist or optometrist.
        </p>
      </div>
    </div>
  );
};
