import { useState, useEffect } from 'react';
import { 
  Personnel, 
  IOCLSite, 
  AttendanceSubmission, 
  ReconciliationItem, 
  PayrollSummary, 
  SalaryCalculation 
} from './types';
import { 
  INITIAL_IOCL_SITES, 
  INITIAL_PERSONNEL, 
  SAMPLE_IOCL_ATTENDANCE_PANIPAT,
  generateMonthlyAttendanceRecords 
} from './data/initialData';
import { reconcileAttendanceWithDatabase } from './utils/salaryCalculator';
import { parseAttendanceFile } from './utils/excelHelper';
import { Navbar } from './components/Navbar';
import { PersonnelDatabase } from './components/PersonnelDatabase';
import { AttendanceSection } from './components/AttendanceSection';
import { SalaryDisbursementView } from './components/SalaryDisbursementView';
import { SiteSummaryCards } from './components/SiteSummaryCards';
import { AddPersonnelModal } from './components/AddPersonnelModal';
import { PaySlipModal } from './components/PaySlipModal';
import { CompanyPortalSecurityModal } from './components/CompanyPortalSecurityModal';
import { AccessGate } from './components/AccessGate';
import { portalApi } from './services/api';
import { ShieldCheck, FileSpreadsheet, Users, Calculator, CheckCircle2, Sparkles, X } from 'lucide-react';

const STORAGE_KEY_PERSONNEL = 'iocl_contractor_personnel_v2_1000';
const STORAGE_KEY_SITES = 'iocl_contractor_sites_v2_1000';
const STORAGE_KEY_AUTH = 'iocl_access_gate_trial121';

export default function App() {
  // Authorized Access State (Code: trial121)
  const [isAuthorized, setIsAuthorized] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY_AUTH) === 'granted' || 
             localStorage.getItem(STORAGE_KEY_AUTH) === 'granted';
    } catch {
      return false;
    }
  });

  const handleUnlock = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY_AUTH, 'granted');
      localStorage.setItem(STORAGE_KEY_AUTH, 'granted');
    } catch (e) {
      console.warn(e);
    }
    setIsAuthorized(true);
  };

  const handleLockPortal = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY_AUTH);
      localStorage.removeItem(STORAGE_KEY_AUTH);
    } catch (e) {
      console.warn(e);
    }
    setIsAuthorized(false);
  };

  // Navigation - default start from IOCL site data
  const [activeTab, setActiveTab] = useState<'sites' | 'attendance' | 'salary' | 'database'>('sites');

  // Master Personnel List (1,000 manpower)
  const [personnelList, setPersonnelList] = useState<Personnel[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PERSONNEL);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 500) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load personnel from localStorage', e);
    }
    return INITIAL_PERSONNEL;
  });

  // Sites List
  const [sitesList, setSitesList] = useState<IOCLSite[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SITES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load sites from localStorage', e);
    }
    return INITIAL_IOCL_SITES;
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PERSONNEL, JSON.stringify(personnelList));
    } catch (e) {
      console.error(e);
    }
  }, [personnelList]);

  // Selected site filter for database view
  const [selectedSiteFilter, setSelectedSiteFilter] = useState<string>('ALL');

  // Selected site for attendance upload
  const [currentAttendanceSiteId, setCurrentAttendanceSiteId] = useState<string>(sitesList[0]?.id || 'site-panipat');

  // Current Reconciliation & Calculation State
  const [currentSubmission, setCurrentSubmission] = useState<AttendanceSubmission | null>(null);
  const [reconciliationItems, setReconciliationItems] = useState<ReconciliationItem[]>([]);
  const [payrollSummary, setPayrollSummary] = useState<PayrollSummary | null>(null);
  const [autoNotification, setAutoNotification] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState<Personnel | null>(null);
  const [viewingPaySlip, setViewingPaySlip] = useState<SalaryCalculation | null>(null);

  // Initialize with a default demonstration reconciliation for Panipat Refinery
  useEffect(() => {
    if (!currentSubmission) {
      const panipatSite = sitesList[0];
      const defaultSubmission: AttendanceSubmission = {
        id: 'sub-init-demo',
        siteId: panipatSite.id,
        siteName: panipatSite.name,
        month: 'August 2026',
        year: 2026,
        totalWorkingDaysInMonth: 26,
        authorizedOfficerName: panipatSite.siteInchargeName,
        authorizedOfficerDesignation: panipatSite.siteInchargeDesignation,
        authorizedOfficerEmpId: 'IOCL-CGM-4921',
        authorizedOfficerContact: panipatSite.siteInchargePhone,
        submissionDate: new Date().toISOString(),
        records: SAMPLE_IOCL_ATTENDANCE_PANIPAT,
        isSignedOff: true,
      };

      const result = reconcileAttendanceWithDatabase(
        personnelList,
        panipatSite.id,
        SAMPLE_IOCL_ATTENDANCE_PANIPAT,
        26
      );

      setCurrentSubmission(defaultSubmission);
      setReconciliationItems(result.reconciliationItems);
      setPayrollSummary(result.summary);
    }
  }, []);

  // Enforce Access Gate for Authorized Indian Oil Personnel (trial121)
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [activePortalRole, setActivePortalRole] = useState<'ADMIN' | 'IOCL_OFFICER' | 'AUDITOR' | 'EMPLOYEE'>('IOCL_OFFICER');

  // When attendance is processed by authorized officer (100% automated matching & salary calculation)
  const handleAttendanceProcessed = (submission: AttendanceSubmission) => {
    setCurrentSubmission(submission);
    setCurrentAttendanceSiteId(submission.siteId);

    // Run automated reconciliation & salary calculation
    const result = reconcileAttendanceWithDatabase(
      personnelList,
      submission.siteId,
      submission.records,
      submission.totalWorkingDaysInMonth
    );

    setReconciliationItems(result.reconciliationItems);
    setPayrollSummary(result.summary);

    // Switch directly to the calculated salary disbursement view
    setActiveTab('salary');

    // Notify user of completed automation
    setAutoNotification(
      `Attendance processed automatically! Matched ${result.summary.matchedCount} personnel from master database. Month's pro-rated salaries, overtime (${result.summary.totalOvertimeHours} hrs), and statutory deductions calculated on the basis of attendance. "Download Final Attendance & Salary (.xlsx)" is ready.`
    );

    // Synchronize with backend API and record cryptographic audit log
    portalApi.verifyAttendance({
      siteId: submission.siteId,
      month: submission.month,
      workingDays: submission.totalWorkingDaysInMonth,
      records: submission.records,
    }).catch((err) => console.log('Backend sync note:', err.message));
  };

  // Direct upload from Salary view with instant automatic calculation
  const handleQuickUploadFromSalary = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const result = parseAttendanceFile(buffer);
        if (!result.records || result.records.length === 0) {
          alert('No valid employee attendance records detected in the sheet.');
          return;
        }

        const isCombined = result.records.length > 200 || currentAttendanceSiteId === 'ALL';
        const targetSiteId = isCombined ? 'ALL' : currentAttendanceSiteId;
        const targetSiteName = isCombined 
          ? 'All Indian Oil Sites (Combined 1,000 Manpower)' 
          : (sitesList.find((s) => s.id === currentAttendanceSiteId)?.name || 'Indian Oil Site');

        const submission: AttendanceSubmission = {
          id: `sub-${Date.now()}`,
          siteId: targetSiteId,
          siteName: targetSiteName,
          month: result.detectedMonth || 'Current Month',
          year: 2026,
          totalWorkingDaysInMonth: 26,
          authorizedOfficerName: result.officerName || 'Shri A. K. Sharma',
          authorizedOfficerDesignation: 'Chief General Manager, IOCL Corporate',
          authorizedOfficerEmpId: 'IOCL-CGM-4921',
          authorizedOfficerContact: '+91 11 2436 0101',
          submissionDate: new Date().toISOString(),
          records: result.records,
          isSignedOff: true,
          signOffRemarks: 'Auto-verified from uploaded muster roll. Database matched & salaries calculated automatically.',
        };

        handleAttendanceProcessed(submission);
      } catch (err: any) {
        alert(err?.message || 'Failed to parse Excel file.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Direct 1-Click Load All 1,000 Combined Muster Roll
  const handleLoadAll1000Combined = () => {
    const records = generateMonthlyAttendanceRecords(personnelList, 26);
    const submission: AttendanceSubmission = {
      id: `sub-${Date.now()}`,
      siteId: 'ALL',
      siteName: 'All Indian Oil Sites (Combined 1,000 Manpower)',
      month: 'August 2026',
      year: 2026,
      totalWorkingDaysInMonth: 26,
      authorizedOfficerName: 'Shri A. K. Sharma',
      authorizedOfficerDesignation: 'Chief General Manager (Contract Operations), IOCL Corporate',
      authorizedOfficerEmpId: 'IOCL-CGM-4921',
      authorizedOfficerContact: '+91 11 2436 0101',
      submissionDate: new Date().toISOString(),
      records,
      isSignedOff: true,
      signOffRemarks: 'Auto-verified combined attendance for all 1,000 manpower across IOCL operating refineries.',
    };
    handleAttendanceProcessed(submission);
  };

  // Personnel CRUD
  const handleSavePersonnel = (person: Personnel) => {
    const isExisting = personnelList.some((p) => p.id === person.id);

    setPersonnelList((prev) => {
      const existsIndex = prev.findIndex((p) => p.id === person.id);
      if (existsIndex >= 0) {
        const copy = [...prev];
        copy[existsIndex] = person;
        return copy;
      } else {
        return [person, ...prev];
      }
    });

    // Background sync to backend API
    if (isExisting) {
      portalApi.updatePersonnel(person.id, person).catch((err) => console.log('Backend sync note:', err.message));
    } else {
      portalApi.createPersonnel(person).catch((err) => console.log('Backend sync note:', err.message));
    }

    // Re-run reconciliation if salary sheet is active
    if (currentSubmission) {
      setTimeout(() => {
        const updatedList = personnelList.map((p) => (p.id === person.id ? person : p));
        if (!personnelList.find((p) => p.id === person.id)) {
          updatedList.unshift(person);
        }
        const result = reconcileAttendanceWithDatabase(
          updatedList,
          currentSubmission.siteId,
          currentSubmission.records,
          currentSubmission.totalWorkingDaysInMonth
        );
        setReconciliationItems(result.reconciliationItems);
        setPayrollSummary(result.summary);
      }, 50);
    }
  };

  const handleDeletePersonnel = (id: string) => {
    if (window.confirm('Are you sure you want to remove/relieve this personnel from the active deployment database?')) {
      setPersonnelList((prev) => prev.filter((p) => p.id !== id));
      portalApi.deletePersonnel(id).catch((err) => console.log('Backend sync note:', err.message));
    }
  };

  // Enforce Access Gate for Authorized Indian Oil Personnel (trial121)
  if (!isAuthorized) {
    return <AccessGate onUnlock={handleUnlock} requiredCode="trial121" />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-[#F37021] selection:text-white">
      {/* Header & Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAddNewPersonnel={() => {
          setEditingPersonnel(null);
          setIsAddModalOpen(true);
        }}
        totalPersonnel={personnelList.length}
        activeSitesCount={sitesList.length}
        hasReconciledSalary={!!currentSubmission}
        onLockPortal={handleLockPortal}
        onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
        activeRole={activePortalRole}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Automated Workflow Toast Notification */}
        {autoNotification && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-xl flex items-start justify-between gap-3 shadow-xs animate-in fade-in duration-200">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-xs uppercase tracking-wide text-emerald-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Automated Match & Salary Calculation Complete
                </div>
                <div className="text-xs text-emerald-800 mt-0.5">{autoNotification}</div>
              </div>
            </div>
            <button
              onClick={() => setAutoNotification(null)}
              className="text-emerald-700 hover:text-emerald-950 text-xs font-bold px-2 py-1 rounded hover:bg-emerald-100 transition-colors"
              title="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 1: IOCL Sites Selection (Default Starting View) */}
        {activeTab === 'sites' && (
          <SiteSummaryCards
            sitesList={sitesList}
            personnelList={personnelList}
            onSelectSiteForAttendance={(siteId) => {
              setCurrentAttendanceSiteId(siteId);
              setActiveTab('attendance');
            }}
            onFilterDatabaseBySite={(siteId) => {
              setSelectedSiteFilter(siteId);
              setActiveTab('database');
            }}
          />
        )}

        {/* Step 2: Attendance Upload & Verification */}
        {activeTab === 'attendance' && (
          <AttendanceSection
            sitesList={sitesList}
            personnelList={personnelList}
            selectedSiteId={currentAttendanceSiteId}
            setSelectedSiteId={setCurrentAttendanceSiteId}
            onAttendanceProcessed={handleAttendanceProcessed}
            onBackToSites={() => setActiveTab('sites')}
          />
        )}

        {/* Step 3: Salary Disbursement & Shortlist View */}
        {activeTab === 'salary' && (
          <SalaryDisbursementView
            submission={currentSubmission}
            reconciliationItems={reconciliationItems}
            summary={payrollSummary}
            onViewPaySlip={(calc) => setViewingPaySlip(calc)}
            onBackToAttendance={() => setActiveTab('attendance')}
            onBackToSites={() => setActiveTab('sites')}
            onQuickUploadSheet={handleQuickUploadFromSalary}
            onLoadAll1000Combined={handleLoadAll1000Combined}
          />
        )}

        {/* Personnel Database (Master Records Kept As Is) */}
        {activeTab === 'database' && (
          <PersonnelDatabase
            personnelList={personnelList}
            sitesList={sitesList}
            selectedSiteFilter={selectedSiteFilter}
            setSelectedSiteFilter={setSelectedSiteFilter}
            onAddNew={() => {
              setEditingPersonnel(null);
              setIsAddModalOpen(true);
            }}
            onEdit={(person) => {
              setEditingPersonnel(person);
              setIsAddModalOpen(true);
            }}
            onDelete={handleDeletePersonnel}
            onQuickStartAttendance={(siteId) => {
              setCurrentAttendanceSiteId(siteId);
              setActiveTab('attendance');
            }}
          />
        )}
      </main>

      {/* IndianOil Official Corporate Footer */}
      <footer className="bg-[#002B49] text-slate-300 border-t-4 border-[#F37021] text-xs py-8 mt-12 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F37021] flex items-center justify-center text-white font-extrabold text-xs">
                IOCL
              </div>
              <div>
                <div className="text-white font-bold text-sm tracking-wide">
                  इंडियन ऑयल कॉर्पोरेशन लिमिटेड • Indian Oil Corporation Limited
                </div>
                <div className="text-slate-400 text-[11px]">
                  Refineries Division • Pipelines Division • Marketing Division
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="px-2.5 py-1 rounded bg-white/10 text-white font-medium border border-white/10">
                A Maharatna PSU
              </span>
              <span className="text-amber-400 font-bold">The Energy of India</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-[11px]">
            <div>
              Contract Labour (Regulation & Abolition) Act, 1970 & Central Rules 1971 Compliant
            </div>
            <div className="flex items-center gap-4">
              <span>Form XIX Wage Slips</span>
              <span>•</span>
              <span>EPF & ESIC Verified</span>
              <span>•</span>
              <span>Standard Bank NEFT Disbursement</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Add / Edit Personnel Modal */}
      <AddPersonnelModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingPersonnel(null);
        }}
        onSave={handleSavePersonnel}
        initialPersonnel={editingPersonnel}
        sitesList={sitesList}
      />

      {/* Official Printable Pay Slip Modal */}
      <PaySlipModal
        salary={viewingPaySlip}
        onClose={() => setViewingPaySlip(null)}
        month={currentSubmission?.month || 'Current Month'}
      />

      {/* Enterprise Company Portal Security & RBAC Center Modal */}
      <CompanyPortalSecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        activeRole={activePortalRole}
        onRoleChanged={(newRole) => setActivePortalRole(newRole)}
      />
    </div>
  );
}
