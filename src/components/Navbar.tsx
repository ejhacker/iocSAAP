import { FC } from 'react';
import { Building2, Users, FileSpreadsheet, Calculator, Plus, ShieldCheck, Lock } from 'lucide-react';
import { IOCLLogo } from './IOCLLogo';

interface NavbarProps {
  activeTab: 'database' | 'attendance' | 'salary' | 'sites';
  setActiveTab: (tab: 'database' | 'attendance' | 'salary' | 'sites') => void;
  onAddNewPersonnel: () => void;
  totalPersonnel: number;
  activeSitesCount: number;
  hasReconciledSalary: boolean;
  onLockPortal?: () => void;
  onOpenSecurityModal?: () => void;
  activeRole?: 'ADMIN' | 'IOCL_OFFICER' | 'AUDITOR' | 'EMPLOYEE';
}

export const Navbar: FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onAddNewPersonnel,
  totalPersonnel,
  activeSitesCount,
  hasReconciledSalary,
  onLockPortal,
  onOpenSecurityModal,
  activeRole = 'IOCL_OFFICER',
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Official Government of India & IndianOil Maharatna Top Strip */}
      <div className="bg-[#002B49] text-white text-[11px] font-medium py-1 px-4 sm:px-6 lg:px-8 border-b border-[#001f35]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#F37021]"></span>
            <span className="tracking-wide">
              भारत सरकार का उपक्रम • A Govt. of India Enterprise (Maharatna)
            </span>
            <span className="hidden md:inline text-slate-400">|</span>
            <span className="hidden md:inline text-slate-300">
              Contract Labour Deployment & Statutory Wages Portal
            </span>
          </div>
          <div className="flex items-center gap-3 text-[10px] sm:text-[11px]">
            <span className="text-amber-400 font-semibold">The Energy of India</span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="hidden sm:inline text-slate-300 font-mono">Refineries & Pipelines</span>
          </div>
        </div>
      </div>

      {/* Signature IndianOil Saffron & Navy Accent Line */}
      <div className="h-1 w-full bg-gradient-to-r from-[#F37021] via-[#F37021] to-[#002B49]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Logo & Portal Title */}
          <div className="flex items-center gap-3">
            <IOCLLogo size="md" />

            <div className="hidden xl:block h-8 w-[1px] bg-slate-200 ml-1" />

            <div className="hidden xl:block">
              <span className="font-bold text-slate-800 text-xs uppercase tracking-wider block">
                Contractor Manpower Portal
              </span>
              <span className="text-[11px] text-slate-500">
                Attendance Shortlisting & Salary Disbursement Engine
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs - Guided Workflow: Sites -> Attendance -> Disbursement | Database */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              id="nav-tab-sites"
              onClick={() => setActiveTab('sites')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'sites'
                  ? 'bg-[#002B49] text-white shadow-xs'
                  : 'text-slate-700 hover:text-[#002B49] hover:bg-slate-200/70'
              }`}
            >
              <Building2 className={`w-4 h-4 ${activeTab === 'sites' ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>1. IOCL Sites ({activeSitesCount})</span>
            </button>

            <button
              id="nav-tab-attendance"
              onClick={() => setActiveTab('attendance')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'attendance'
                  ? 'bg-[#002B49] text-white shadow-xs'
                  : 'text-slate-700 hover:text-[#002B49] hover:bg-slate-200/70'
              }`}
            >
              <FileSpreadsheet className={`w-4 h-4 ${activeTab === 'attendance' ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>2. Attendance</span>
            </button>

            <button
              id="nav-tab-salary"
              onClick={() => setActiveTab('salary')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold transition-all relative ${
                activeTab === 'salary'
                  ? 'bg-[#002B49] text-white shadow-xs'
                  : 'text-slate-700 hover:text-[#002B49] hover:bg-slate-200/70'
              }`}
            >
              <Calculator className={`w-4 h-4 ${activeTab === 'salary' ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>3. Disbursement</span>
              {hasReconciledSalary && (
                <span className="w-2 h-2 rounded-full bg-[#F37021] inline-block ring-2 ring-white" />
              )}
            </button>

            <button
              id="nav-tab-database"
              onClick={() => setActiveTab('database')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'database'
                  ? 'bg-[#002B49] text-white shadow-xs'
                  : 'text-slate-700 hover:text-[#002B49] hover:bg-slate-200/70'
              }`}
            >
              <Users className={`w-4 h-4 ${activeTab === 'database' ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>Personnel Database</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'database' ? 'bg-[#F37021] text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {totalPersonnel}
              </span>
            </button>
          </nav>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            {onOpenSecurityModal && (
              <button
                id="btn-portal-security"
                onClick={onOpenSecurityModal}
                className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold px-2.5 sm:px-3 py-2 rounded-lg border border-emerald-300 transition-all active:scale-98 shadow-2xs"
                title="Company Portal Security Gateway, RBAC & Audit Trail"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Portal Security:</span>
                <span className="font-mono text-[11px] text-emerald-700 underline decoration-emerald-400">
                  {activeRole === 'IOCL_OFFICER' ? 'IOCL Officer' : activeRole === 'ADMIN' ? 'Admin' : activeRole === 'AUDITOR' ? 'Auditor' : 'Employee'}
                </span>
              </button>
            )}

            <button
              id="btn-add-personnel-header"
              onClick={onAddNewPersonnel}
              className="flex items-center gap-1.5 bg-[#F37021] hover:bg-[#D95A0F] text-white text-xs sm:text-sm font-bold px-3 sm:px-3.5 py-2 rounded-lg shadow-xs active:scale-98 transition-all border border-[#C2410C]/20"
            >
              <Plus className="w-4 h-4 text-white stroke-[3]" />
              <span className="hidden sm:inline">Add Personnel</span>
              <span className="sm:hidden">Add</span>
            </button>

            {onLockPortal && (
              <button
                id="btn-lock-portal"
                onClick={onLockPortal}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-2.5 sm:px-3 py-2 rounded-lg border border-slate-300 transition-all active:scale-98"
                title="Lock Session / Authorized Access Only (Code: trial121)"
              >
                <Lock className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden md:inline">Lock Session</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar (for iPhone, Android, Touch Screens) */}
      <div className="lg:hidden border-t border-slate-200 bg-white px-2 py-1.5 flex items-center justify-around overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('sites')}
          className={`flex flex-col items-center py-1.5 px-2 rounded-lg text-[11px] transition-colors ${
            activeTab === 'sites' ? 'text-[#F37021] font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4 mb-0.5" />
          <span>1. Sites</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex flex-col items-center py-1.5 px-2 rounded-lg text-[11px] transition-colors ${
            activeTab === 'attendance' ? 'text-[#F37021] font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 mb-0.5" />
          <span>2. Attendance</span>
        </button>

        <button
          onClick={() => setActiveTab('salary')}
          className={`flex flex-col items-center py-1.5 px-2 rounded-lg text-[11px] transition-colors relative ${
            activeTab === 'salary' ? 'text-[#F37021] font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calculator className="w-4 h-4 mb-0.5" />
          <span>3. Salary</span>
          {hasReconciledSalary && (
            <span className="absolute top-1 right-2 h-2 w-2 rounded-full bg-[#F37021]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`flex flex-col items-center py-1.5 px-2 rounded-lg text-[11px] transition-colors ${
            activeTab === 'database' ? 'text-[#F37021] font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 mb-0.5" />
          <span>Database</span>
        </button>
      </div>
    </header>
  );
};
