import React, { useState } from 'react';
import { ViewMode } from '../types';

interface ForgotPasswordViewProps {
  onNavigate: (view: ViewMode) => void;
}

export const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('screener@clinic.org');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 450);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center p-4 py-8 antialiased">
      <main className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 to-sky-500 flex items-center justify-center text-white mx-auto shadow-md shadow-blue-500/20">
            <span className="material-symbols-outlined text-[32px]">visibility</span>
          </div>

          <div className="space-y-0.5">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              RetinaScan <span className="text-blue-600">AI</span>
            </h1>
            <p className="text-xs font-semibold text-slate-600">
              Reset Your Password
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1 text-center sm:text-left border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900">Password Recovery</h2>
                <p className="text-xs text-slate-500">
                  Enter your registered work email address and we'll send you instructions to reset your password.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="email">
                  Work Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="screener@clinic.org"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin material-symbols-outlined text-[18px]">progress_activity</span>
                      Sending Reset Link...
                    </span>
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-3 py-2">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[28px]">check_circle</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Reset Link Sent</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                If an account exists for <span className="font-semibold text-slate-900">{email}</span>, we've sent password reset instructions.
              </p>
            </div>
          )}

          <div className="pt-3 text-center border-t border-slate-100 text-xs">
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="text-blue-600 hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Back to Login
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
