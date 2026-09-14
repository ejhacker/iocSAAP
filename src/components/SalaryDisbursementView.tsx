import { FC, useState, useMemo, useEffect, useRef } from 'react';
import { 
  ReconciliationItem, 
  PayrollSummary, 
  AttendanceSubmission, 
  SalaryCalculation 
} from '../types';
import { formatINR } from '../utils/salaryCalculator';
import { 
  exportSalaryDisbursementExcel, 
  exportFinalAttendanceWithSalaryExcel,
  exportBankNeftCSV 
} from '../utils/excelHelper';
import confetti from 'canvas-confetti';
import { 
  Calculator, 
  Download, 
  Printer, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  UserX, 
  FileSpreadsheet, 
  CreditCard, 
  Search, 
  ExternalLink,
  ChevronDown,
  Building2,
  Calendar,
  Layers,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ChevronFirst,
  ChevronLast,
  Upload,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

interface SalaryDisbursementViewProps {
  submission: AttendanceSubmission | null;
  reconciliationItems: ReconciliationItem[];
  summary: PayrollSummary | null;
  onViewPaySlip: (calc: SalaryCalculation) => void;
  onBackToAttendance: () => void;
  onBackToSites?: () => void;
  onQuickUploadSheet?: (file: File) => void;
  onLoadAll1000Combined?: () => void;
}

export const SalaryDisbursementView: FC<SalaryDisbursementViewProps> = ({
  submission,
  reconciliationItems,
  summary,
  onViewPaySlip,
  onBackToAttendance,
  onBackToSites,
  onQuickUploadSheet,
  onLoadAll1000Combined,
}) => {
  const [filterTab, setFilterTab] = useState<'ALL' | 'MATCHED' | 'UNMATCHED' | 'MISSING'>('MATCHED');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDisbursed, setIsDisbursed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(50);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  // Filter items
  const filteredItems = useMemo(() => {
    return reconciliationItems.filter((item) => {
      // Tab filter
      if (filterTab === 'MATCHED' && item.matchStatus !== 'MATCHED_EXACT') return false;
      if (filterTab === 'UNMATCHED' && item.matchStatus !== 'UNMATCHED_IN_DATABASE' && item.matchStatus !== 'SITE_MISMATCH') return false;
      if (filterTab === 'MISSING' && item.matchStatus !== 'MISSING_FROM_ATTENDANCE') return false;

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const code = item.empCode.toLowerCase();
        const name = (item.employee?.name || item.nameInSheet || '').toLowerCase();
        const desig = (item.employee?.designation || '').toLowerCase();
        const unit = (item.employee?.unitOrPlant || '').toLowerCase();
        return code.includes(q) || name.includes(q) || desig.includes(q) || unit.includes(q);
      }
      return true;
    });
  }, [reconciliationItems, filterTab, searchQuery]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterTab, searchQuery, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  // Calculations for matched personnel
  const matchedCalculations = useMemo(() => {
    return reconciliationItems
      .filter((item) => item.matchStatus === 'MATCHED_EXACT' && item.salaryCalculation)
      .map((item) => item.salaryCalculation!);
  }, [reconciliationItems]);

  const matchedCount = reconciliationItems.filter((i) => i.matchStatus === 'MATCHED_EXACT').length;
  const unmatchedCount = reconciliationItems.filter((i) => i.matchStatus === 'UNMATCHED_IN_DATABASE' || i.matchStatus === 'SITE_MISMATCH').length;
  const missingCount = reconciliationItems.filter((i) => i.matchStatus === 'MISSING_FROM_ATTENDANCE').length;

  const handleDisburseAll = () => {
    setIsDisbursed(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (!submission || !summary) {
    return (
      <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center space-y-4 shadow-xs">
        <Calculator className="w-14 h-14 text-slate-400 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900">No Attendance Sheet Reconciled Yet</h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Please upload the Indian Oil site attendance sheet or load a sample verified sheet to shortlist matching personnel and calculate salaries.
        </p>
        <button
          onClick={onBackToAttendance}
          className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs sm:text-sm rounded-lg transition-all shadow-xs"
        >
          Go to Attendance Upload
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 3-Step Guided Workflow Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Authorized Contractor Wage Disbursement Workflow
          </div>
          <div className="flex items-center gap-3">
            {onBackToSites && (
              <button
                onClick={onBackToSites}
                className="flex items-center gap-1 text-xs font-bold text-[#002B49] hover:text-[#F37021] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Process Another IOCL Site</span>
              </button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <button
            onClick={onBackToSites}
            disabled={!onBackToSites}
            className="p-3 rounded-lg bg-emerald-50 text-emerald-900 flex items-center gap-3 border border-emerald-200 text-left hover:bg-emerald-100 transition-colors"
          >
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-xs">
              ✓
            </span>
            <div>
              <div className="font-bold text-sm">Site Selected</div>
              <div className="text-[11px] text-emerald-700 truncate max-w-[180px]">
                {submission.siteName}
              </div>
            </div>
          </button>

          <button
            onClick={onBackToAttendance}
            className="p-3 rounded-lg bg-emerald-50 text-emerald-900 flex items-center gap-3 border border-emerald-200 text-left hover:bg-emerald-100 transition-colors"
          >
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-xs">
              ✓
            </span>
            <div>
              <div className="font-bold text-sm">Attendance Verified</div>
              <div className="text-[11px] text-emerald-700">
                {matchedCount} Matched Records
              </div>
            </div>
          </button>

          <div className="p-3 rounded-lg bg-[#002B49] text-white flex items-center gap-3 border border-[#002B49]">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#F37021] text-white font-bold text-xs">
              3
            </span>
            <div>
              <div className="font-bold text-sm">Salary Disbursed</div>
              <div className="text-[11px] text-slate-200">Form XIX Ready to Download</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Banner: Authorized Sign-off & High-Level Statement */}
      <div className="bg-white border-t-2 border-t-[#F37021] border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#002B49] font-bold text-xs uppercase tracking-wider">
              <span className="inline-block w-2 h-2 rounded-full bg-[#F37021]"></span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verified & Reconciled Salary Disbursement
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Indian Oil Site Wage Calculation Sheet
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-1">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-[#F37021]" />
                <strong className="text-slate-900">{submission.siteName}</strong>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Month: <strong className="text-slate-900">{submission.month}</strong> ({submission.totalWorkingDaysInMonth} Working Days Base)
              </span>
            </div>
          </div>

          {/* Export & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 no-print">
            {/* Direct Upload for Attendance Sheet */}
            {onQuickUploadSheet && (
              <>
                <input
                  ref={uploadInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      onQuickUploadSheet(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                <button
                  id="btn-quick-upload-salary"
                  onClick={() => uploadInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-98 border border-slate-300"
                  title="Upload attendance sheet or combined muster roll to auto-match & calculate salaries"
                >
                  <Upload className="w-3.5 h-3.5 text-[#002B49]" />
                  <span>Upload Attendance Sheet</span>
                </button>
              </>
            )}

            {/* Quick 1-click All 1,000 Combined Muster Roll */}
            {onLoadAll1000Combined && (
              <button
                id="btn-load-1000-combined-salary"
                onClick={onLoadAll1000Combined}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#002B49] hover:bg-[#001f35] text-white rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-98"
                title="Load and auto-calculate all 1,000 manpower combined attendance"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Load All 1,000 Combined</span>
              </button>
            )}

            {/* Main Primary Download: Final Attendance with Salary (.xlsx) */}
            <button
              id="btn-export-excel-salary"
              onClick={() => exportFinalAttendanceWithSalaryExcel(submission.siteName, submission.month, matchedCalculations, {
                name: submission.authorizedOfficerName,
                designation: submission.authorizedOfficerDesignation,
                empId: submission.authorizedOfficerEmpId,
              })}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition-all active:scale-98 border border-emerald-600 ring-2 ring-emerald-600/20"
              title="Download official Form XIX Final Attendance with Salary to be Given based on attendance"
            >
              <FileSpreadsheet className="w-4 h-4 text-white" />
              <span>Download Final Attendance & Salary (.xlsx)</span>
            </button>

            <button
              id="btn-export-bank-neft"
              onClick={() => exportBankNeftCSV(submission.siteName, submission.month, matchedCalculations)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#002B49] hover:bg-[#001f35] text-white rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-98"
              title="Download direct bank disbursement batch CSV"
            >
              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
              <span>Bank NEFT</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 transition-all shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print</span>
            </button>

            {!isDisbursed ? (
              <button
                id="btn-authorize-disbursement"
                onClick={handleDisburseAll}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#F37021] hover:bg-[#D95A0F] text-white font-bold text-xs rounded-lg shadow-xs active:scale-98 transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span>Mark as Disbursed</span>
              </button>
            ) : (
              <span className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Disbursed to Bank
              </span>
            )}
          </div>
        </div>

        {/* Automated Reconciliation Information Banner */}
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span>
              <strong>100% Automated Matching & Calculation:</strong> System automatically matched <strong>{matchedCount}</strong> personnel from your master database with attendance records and calculated the month's pro-rated salary, overtime & statutory deductions. Zero manual searching required.
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded bg-emerald-100/90 text-emerald-900 font-semibold text-[11px] border border-emerald-300 whitespace-nowrap">
            Auto-Reconciled
          </span>
        </div>

        {/* IOCL Authorization Badge Box */}
        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#002B49] text-white flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <div className="text-slate-700">
                Authorized By: <strong className="text-slate-900">{submission.authorizedOfficerName}</strong> ({submission.authorizedOfficerDesignation})
              </div>
              <div className="text-slate-500 text-[11px]">
                IOCL Emp ID: <span className="font-mono text-[#002B49] font-semibold">{submission.authorizedOfficerEmpId}</span> | Contact: {submission.authorizedOfficerContact}
              </div>
            </div>
          </div>
          <div className="text-[11px] text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200">
            Attendance Verification Code: <span className="font-mono text-[#F37021] font-bold">IOCL-VERIF-{submission.id.slice(-6)}</span>
          </div>
        </div>
      </div>

      {/* Aggregate KPI Financial Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white border-t-2 border-t-emerald-600 border-slate-200 p-4 sm:p-5 rounded-xl shadow-xs">
          <div className="text-[11px] text-emerald-700 font-semibold uppercase tracking-wider">Total Net Payable</div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-800 mt-1 tracking-tight">
            {formatINR(summary.totalNetPayable)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Disbursing to {matchedCount} workers</span>
            <span className="text-emerald-700 font-semibold">100% Match</span>
          </div>
        </div>

        <div className="bg-white border-t-2 border-t-[#002B49] border-slate-200 p-4 sm:p-5 rounded-xl shadow-xs">
          <div className="text-[11px] text-[#002B49] font-semibold uppercase tracking-wider">Gross Payable Earned</div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tracking-tight">
            {formatINR(summary.totalPayableGross)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Pro-rated Basic + Site Allow. + OT
          </div>
        </div>

        <div className="bg-white border-t-2 border-t-[#F37021] border-slate-200 p-4 sm:p-5 rounded-xl shadow-xs">
          <div className="text-[11px] text-[#F37021] font-semibold uppercase tracking-wider">Total Overtime (OT) Pay</div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tracking-tight">
            {formatINR(summary.totalOvertimePay)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Total {summary.totalOvertimeHours} Overtime Hours
          </div>
        </div>

        <div className="bg-white border-t-2 border-t-rose-600 border-slate-200 p-4 sm:p-5 rounded-xl shadow-xs">
          <div className="text-[11px] text-rose-700 font-semibold uppercase tracking-wider">Statutory Deductions</div>
          <div className="text-2xl sm:text-3xl font-bold text-rose-700 mt-1 tracking-tight">
            {formatINR(summary.totalDeductions)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            EPF (12%) + ESIC + Prof. Tax
          </div>
        </div>
      </div>

      {/* Reconciliation Tabs & Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              id="tab-matched"
              onClick={() => setFilterTab('MATCHED')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterTab === 'MATCHED'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Matched & Payable</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${filterTab === 'MATCHED' ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-200 text-slate-700'}`}>
                {matchedCount}
              </span>
            </button>

            <button
              id="tab-all"
              onClick={() => setFilterTab('ALL')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterTab === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Reconciled</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${filterTab === 'ALL' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {reconciliationItems.length}
              </span>
            </button>

            {unmatchedCount > 0 && (
              <button
                id="tab-unmatched"
                onClick={() => setFilterTab('UNMATCHED')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterTab === 'UNMATCHED'
                    ? 'bg-rose-50 text-rose-900 border border-rose-200'
                    : 'text-rose-700 hover:bg-rose-50'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Unmatched / Ghost</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-200 text-rose-900">
                  {unmatchedCount}
                </span>
              </button>
            )}

            {missingCount > 0 && (
              <button
                id="tab-missing"
                onClick={() => setFilterTab('MISSING')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterTab === 'MISSING'
                    ? 'bg-amber-50 text-amber-900 border border-amber-200'
                    : 'text-amber-800 hover:bg-amber-50'
                }`}
              >
                <UserX className="w-3.5 h-3.5 text-amber-600" />
                <span>Missing from Sheet</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200 text-amber-900">
                  {missingCount}
                </span>
              </button>
            )}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-salary"
              type="text"
              placeholder="Search employee, ID, trade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 text-xs text-slate-900 rounded-lg focus:outline-none focus:bg-white focus:border-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Discrepancy Alert Notification (if unmatched or missing staff found) */}
      {(unmatchedCount > 0 || missingCount > 0) && filterTab === 'ALL' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-amber-900">
              Reconciliation Attention Required: Discrepancies Shortlisted
            </div>
            <div className="text-slate-700">
              {unmatchedCount > 0 && (
                <p>• {unmatchedCount} entries found in the Indian Oil attendance sheet that are <strong>not registered in our master database</strong>. Review the "Unmatched / Ghost" tab before payment.</p>
              )}
              {missingCount > 0 && (
                <p>• {missingCount} personnel registered for this site were <strong>omitted from this month's attendance sheet</strong>. Check the "Missing from Sheet" tab.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Results Table (Desktop/Laptop) & Responsive Cards (Mobile/Tablet) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-[#002B49] text-white uppercase tracking-wider text-[11px] font-semibold border-b-2 border-[#F37021]">
              <tr>
                <th className="py-3.5 px-4 text-white">Employee Details</th>
                <th className="py-3.5 px-3 text-white">Status</th>
                <th className="py-3.5 px-3 text-center text-white">Attendance Days</th>
                <th className="py-3.5 px-3 text-right text-white">Base Package</th>
                <th className="py-3.5 px-3 text-right text-white">Pro-Rated Basic</th>
                <th className="py-3.5 px-3 text-right text-white">OT Pay</th>
                <th className="py-3.5 px-3 text-right text-white">Deductions</th>
                <th className="py-3.5 px-4 text-right text-white">Net Take-Home Salary</th>
                <th className="py-3.5 px-4 text-center text-white">Bank Account</th>
                <th className="py-3.5 px-3 text-center text-white">Payslip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedItems.map((item) => {
                const calc = item.salaryCalculation;
                const emp = item.employee;

                if (item.matchStatus === 'UNMATCHED_IN_DATABASE') {
                  return (
                    <tr key={item.id} className="bg-rose-50/50 hover:bg-rose-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-rose-900">{item.nameInSheet || 'Unknown Name'}</div>
                        <div className="font-mono text-rose-700 text-[11px]">{item.empCode}</div>
                        <div className="text-[10px] text-rose-600 mt-0.5">Found in IOCL Attendance Sheet</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                          Unregistered in DB
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center text-slate-500">
                        {item.attendance?.daysPresent || 0} days present
                      </td>
                      <td colSpan={4} className="py-3.5 px-3 text-rose-800 text-xs italic">
                        {item.discrepancyNote}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-400">₹0 (Held)</td>
                      <td className="py-3.5 px-4 text-center text-slate-400 text-[11px]">No Bank on Record</td>
                      <td className="py-3.5 px-3 text-center text-slate-400">—</td>
                    </tr>
                  );
                }

                if (item.matchStatus === 'SITE_MISMATCH') {
                  return (
                    <tr key={item.id} className="bg-amber-50/50 hover:bg-amber-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-amber-900">{item.employee?.name}</div>
                        <div className="font-mono text-amber-700 text-[11px]">{item.empCode}</div>
                        <div className="text-[10px] text-slate-500">{item.employee?.designation}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                          Site Mismatch
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center text-slate-500">
                        {item.attendance?.daysPresent || 0} days
                      </td>
                      <td colSpan={4} className="py-3.5 px-3 text-amber-900 text-xs">
                        {item.discrepancyNote}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-400">Review Transfer</td>
                      <td className="py-3.5 px-4 text-center text-slate-600 text-[11px]">{item.employee?.bankDetails?.bankName}</td>
                      <td className="py-3.5 px-3 text-center text-slate-400">—</td>
                    </tr>
                  );
                }

                if (item.matchStatus === 'MISSING_FROM_ATTENDANCE') {
                  return (
                    <tr key={item.id} className="bg-slate-50/50 hover:bg-slate-50 transition-colors opacity-75">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-700">{item.employee?.name}</div>
                        <div className="font-mono text-slate-500 text-[11px]">{item.empCode}</div>
                        <div className="text-[10px] text-slate-400">{item.employee?.designation}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-200 text-slate-700">
                          Missing in Sheet
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center text-rose-600 font-semibold">0 days</td>
                      <td colSpan={4} className="py-3.5 px-3 text-slate-500 text-xs italic">
                        {item.discrepancyNote}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-400">₹0</td>
                      <td className="py-3.5 px-4 text-center text-slate-500 text-[11px]">{item.employee?.bankDetails?.bankName}</td>
                      <td className="py-3.5 px-3 text-center text-slate-400">—</td>
                    </tr>
                  );
                }

                if (!calc || !emp) return null;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Employee & Unit */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 text-sm">{calc.employeeName}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-800 rounded border border-slate-200 font-medium">
                          {calc.empCode}
                        </span>
                        <span className="text-[11px] text-slate-500">{calc.designation}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Unit: {calc.unitOrPlant}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Verified
                      </span>
                    </td>

                    {/* Attendance breakdown */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="font-bold text-slate-900 text-sm">
                        {calc.daysPresent} <span className="text-[10px] text-slate-500 font-normal">/ {calc.totalMonthDays}d</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        +{calc.weeklyOffs + calc.paidHolidays} off | {calc.absentDays} abs
                      </div>
                      {calc.overtimeHours > 0 && (
                        <div className="text-[10px] text-orange-700 font-medium">
                          +{calc.overtimeHours}h OT
                        </div>
                      )}
                    </td>

                    {/* Base package */}
                    <td className="py-3.5 px-3 text-right">
                      <div className="text-slate-700 font-semibold">{formatINR(calc.baseMonthlyGross)}</div>
                      <div className="text-[10px] text-slate-400">₹{calc.calculatedDailyRate}/day</div>
                    </td>

                    {/* Pro-rated basic */}
                    <td className="py-3.5 px-3 text-right">
                      <div className="text-slate-800 font-semibold">{formatINR(calc.proRatedBasicSalary)}</div>
                      {calc.specialSiteAllowance > 0 && (
                        <div className="text-[10px] text-slate-500">+{formatINR(calc.specialSiteAllowance)} allow.</div>
                      )}
                    </td>

                    {/* OT Pay */}
                    <td className="py-3.5 px-3 text-right">
                      <div className="text-slate-900 font-semibold">
                        {calc.overtimePay > 0 ? formatINR(calc.overtimePay) : '—'}
                      </div>
                      {calc.overtimeHours > 0 && (
                        <div className="text-[10px] text-slate-400">@ ₹{calc.otHourlyRate}/h</div>
                      )}
                    </td>

                    {/* Total Deductions */}
                    <td className="py-3.5 px-3 text-right text-rose-700">
                      <div className="font-medium">-{formatINR(calc.totalDeductions)}</div>
                      <div className="text-[10px] text-slate-400">
                        PF: {formatINR(calc.epfEmployeeDeduction)}
                      </div>
                    </td>

                    {/* NET TAKE HOME (Final amount to be paid) */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="text-base font-bold text-emerald-700">
                        {formatINR(calc.netPayableSalary)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Gross: {formatINR(calc.grossPayable)}
                      </div>
                    </td>

                    {/* Bank details */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="text-slate-800 text-[11px] font-medium">{calc.bankName}</div>
                      <div className="font-mono text-slate-500 text-[10px]">A/C: {calc.bankAccountNo}</div>
                      <div className="font-mono text-slate-400 text-[9px]">IFSC: {calc.bankIfsc}</div>
                    </td>

                    {/* Payslip action */}
                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={() => onViewPaySlip(calc)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors inline-flex items-center gap-1 text-[11px] font-medium border border-slate-200"
                        title="View and print official salary wage slip"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span className="hidden lg:inline">Slip</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile & Tablet Cards View (Fully responsive for Android, iOS, and smaller screens) */}
        <div className="md:hidden divide-y divide-slate-100">
          {paginatedItems.map((item) => {
            const calc = item.salaryCalculation;

            if (!calc) {
              return (
                <div key={item.id} className="p-4 bg-rose-50/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-rose-900 text-sm">{item.nameInSheet || item.employee?.name}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full font-semibold border border-rose-200">
                      {item.matchStatus.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-rose-700">{item.empCode}</div>
                  <p className="text-xs text-rose-800">{item.discrepancyNote}</p>
                </div>
              );
            }

            return (
              <div key={item.id} className="p-4 space-y-3 bg-white">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-base">{calc.employeeName}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-[11px] px-1.5 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-200 font-medium">
                        {calc.empCode}
                      </span>
                      <span className="text-xs text-slate-500">{calc.designation}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      {calc.unitOrPlant}
                    </div>
                  </div>

                  <button
                    onClick={() => onViewPaySlip(calc)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-md border border-slate-200 shadow-xs"
                  >
                    <span>Slip</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Days present & OT metrics */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center text-xs">
                  <div>
                    <div className="text-[10px] text-slate-500">Present</div>
                    <div className="font-bold text-slate-900 text-sm">{calc.daysPresent} d</div>
                    <div className="text-[10px] text-slate-400">of {calc.totalMonthDays}d</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Overtime</div>
                    <div className="font-bold text-slate-900 text-sm">{calc.overtimeHours} hrs</div>
                    <div className="text-[10px] text-slate-500">+{formatINR(calc.overtimePay)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Deductions</div>
                    <div className="font-bold text-rose-700 text-sm">-{formatINR(calc.totalDeductions)}</div>
                    <div className="text-[10px] text-slate-400">PF + ESIC</div>
                  </div>
                </div>

                {/* Final Net Salary Box */}
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-emerald-800 font-semibold uppercase tracking-wider">
                      Net Salary Disbursement
                    </div>
                    <div className="text-xl font-bold text-emerald-800">
                      {formatINR(calc.netPayableSalary)}
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-slate-700">
                    <div>{calc.bankName}</div>
                    <div className="font-mono text-slate-500">A/C: {calc.bankAccountNo}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Navigation Bar */}
        <div className="bg-white border-t border-slate-200 p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span>Showing</span>
            <strong className="text-slate-900 font-semibold">
              {filteredItems.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </strong>
            <span>to</span>
            <strong className="text-slate-900 font-semibold">
              {Math.min(currentPage * pageSize, filteredItems.length)}
            </strong>
            <span>of</span>
            <strong className="text-slate-900 font-bold">{filteredItems.length}</strong>
            <span>reconciled records</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Rows per page selector */}
            <div className="flex items-center gap-1.5 text-slate-600">
              <span>Per Page:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800 font-medium focus:outline-none focus:border-[#002B49]"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={1000}>All (1000)</option>
              </select>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage <= 1}
                className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                title="First Page"
              >
                <ChevronFirst className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="px-3 py-1 bg-slate-100 border border-slate-200 rounded font-semibold text-slate-800 text-xs">
                Page {currentPage} of {totalPages}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Last Page"
              >
                <ChevronLast className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
