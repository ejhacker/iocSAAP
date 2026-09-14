import React, { useState } from 'react';
import { IOCLLogo } from './IOCLLogo';
import { Lock, KeyRound, ShieldAlert, ArrowRight, CheckCircle2, Eye, EyeOff, Sparkles, Building2, Users, FileSpreadsheet } from 'lucide-react';

interface AccessGateProps {
  onUnlock: () => void;
  requiredCode?: string;
}

export const AccessGate: React.FC<AccessGateProps> = ({ 
  onUnlock, 
  requiredCode = 'trial121' 
}) => {
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    const trimmed = inputCode.trim();
    if (!trimmed) {
      setError('Please enter the security access code.');
      return;
    }

    setIsSubmitting(true);

    // Smooth check
    setTimeout(() => {
      if (trimmed.toLowerCase() === requiredCode.toLowerCase()) {
        setError('');
        onUnlock();
      } else {
        setError('Access Denied: Invalid security access code. Please verify authorization.');
        setIsSubmitting(false);
      }
    }, 250);
  };

  const handleQuickFill = () => {
    setInputCode(requiredCode);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#001f35] text-slate-100 flex flex-col justify-between selection:bg-[#F37021] selection:text-white">
      {/* Top Maharatna Notice Bar */}
      <div className="bg-[#001726] border-b border-slate-800 text-[11px] py-2 px-4 sm:px-8 text-slate-300">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F37021] animate-pulse"></span>
            <span className="tracking-wider uppercase font-semibold text-slate-200">
              भारत सरकार का उपक्रम • A Govt. of India Enterprise (Maharatna)
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-[11px]">
            <span className="text-amber-400 font-medium">Secured PSU Gateway</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">1,000 Manpower Database</span>
          </div>
        </div>
      </div>

      {/* Main Login / Access Gate Card */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-lg">
          {/* Card Container */}
          <div className="bg-[#002B49] border-2 border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
            {/* Top Brand Accent Line */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#F37021] via-amber-500 to-[#F37021]" />

            <div className="p-6 sm:p-8 space-y-6">
              {/* Logo & Portal Header */}
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="bg-white p-3 rounded-2xl shadow-md border border-slate-200 inline-block">
                  <IOCLLogo size="lg" showText={false} />
                </div>

                <div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl font-black tracking-tight text-white">
                      IndianOil
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#F37021] text-white tracking-wide">
                      IOCL
                    </span>
                  </div>
                  <h1 className="text-sm sm:text-base font-semibold text-slate-200 mt-1">
                    Contract Labour & Statutory Payroll Portal
                  </h1>
                  <p className="text-[12px] text-slate-400">
                    Muster Roll Attendance Shortlisting & Salary Disbursement
                  </p>
                </div>
              </div>

              {/* Security Clearance Notice */}
              <div className="bg-[#001f35]/90 border border-slate-700 rounded-xl p-3.5 text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-amber-400 font-semibold">
                  <Lock className="w-4 h-4 text-[#F37021]" />
                  <span>Restricted Access Clearance Required</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  This portal handles statutory wage disbursement & verified biometric muster rolls for <strong>1,000 contractor personnel</strong> deployed across IndianOil Refineries.
                </p>
              </div>

              {/* Access Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label 
                    htmlFor="access-code-input" 
                    className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                      Authorised Access Code
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Case-insensitive</span>
                  </label>

                  <div className="relative">
                    <input
                      id="access-code-input"
                      type={showCode ? 'text' : 'password'}
                      autoFocus
                      value={inputCode}
                      onChange={(e) => {
                        setInputCode(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="Enter access code (e.g. trial121)"
                      className={`w-full bg-[#001726] border ${
                        error ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-600 focus:border-[#F37021] focus:ring-1 focus:ring-[#F37021]'
                      } rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 font-mono tracking-wider focus:outline-none transition-all pr-12`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowCode(!showCode)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                      title={showCode ? 'Hide Code' : 'Show Code'}
                    >
                      {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {error && (
                    <div className="flex items-center gap-1.5 text-rose-400 text-xs mt-2 animate-fadeIn">
                      <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>

                {/* Quick Fill / Hint Helper */}
                <div className="flex items-center justify-between bg-white/5 p-2.5 rounded-lg border border-white/10 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="text-[11px]">Authorized Demo Code:</span>
                    <code className="px-1.5 py-0.5 rounded bg-[#F37021]/20 text-amber-300 font-mono font-bold border border-[#F37021]/30">
                      trial121
                    </code>
                  </div>
                  <button
                    type="button"
                    onClick={handleQuickFill}
                    className="text-amber-400 hover:text-amber-300 text-[11px] font-semibold underline underline-offset-2 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Auto-fill Code
                  </button>
                </div>

                {/* Unlock Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#F37021] hover:bg-[#D95A0F] active:bg-[#C2410C] text-white font-bold text-sm py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer disabled:opacity-75"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Authorizing Security Credentials...
                    </span>
                  ) : (
                    <>
                      <span>Unlock Portal Access</span>
                      <ArrowRight className="w-4 h-4 stroke-[3]" />
                    </>
                  )}
                </button>
              </form>

              {/* System Stats Footer */}
              <div className="pt-4 border-t border-slate-700/80 grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="bg-[#001f35] p-2 rounded-lg border border-slate-800">
                  <div className="text-amber-400 font-bold flex items-center justify-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    1,000
                  </div>
                  <div className="text-slate-400 text-[10px] mt-0.5">Manpower</div>
                </div>

                <div className="bg-[#001f35] p-2 rounded-lg border border-slate-800">
                  <div className="text-emerald-400 font-bold flex items-center justify-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    5 Sites
                  </div>
                  <div className="text-slate-400 text-[10px] mt-0.5">Refineries</div>
                </div>

                <div className="bg-[#001f35] p-2 rounded-lg border border-slate-800">
                  <div className="text-cyan-400 font-bold flex items-center justify-center gap-1">
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    Excel Ready
                  </div>
                  <div className="text-slate-400 text-[10px] mt-0.5">Wages & OT</div>
                </div>
              </div>
            </div>
          </div>

          {/* Legal Compliance Disclaimer */}
          <div className="mt-4 text-center text-[11px] text-slate-400">
            Compliant with Contract Labour (Regulation & Abolition) Act, 1970 • Form XIX Wage Register
          </div>
        </div>
      </div>

      {/* Footer Strip */}
      <div className="bg-[#001726] border-t border-slate-800 py-3 px-4 text-center text-xs text-slate-400">
        Indian Oil Corporation Limited • A Maharatna Company • The Energy of India
      </div>
    </div>
  );
};
