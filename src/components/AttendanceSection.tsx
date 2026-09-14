import { FC, useState, useRef } from 'react';
import { IOCLSite, Personnel, AttendanceRecord, AttendanceSubmission } from '../types';
import { parseAttendanceFile, downloadAttendanceTemplate } from '../utils/excelHelper';
import { generateMonthlyAttendanceRecords } from '../data/manpowerGenerator';
import { 
  SAMPLE_IOCL_ATTENDANCE_PANIPAT, 
  SAMPLE_IOCL_ATTENDANCE_ALL_1000 
} from '../data/initialData';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  Building2, 
  UserCheck, 
  Calendar, 
  ShieldCheck, 
  FileText,
  Clock,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

interface AttendanceSectionProps {
  sitesList: IOCLSite[];
  personnelList: Personnel[];
  selectedSiteId: string;
  setSelectedSiteId: (siteId: string) => void;
  onAttendanceProcessed: (submission: AttendanceSubmission) => void;
  onBackToSites?: () => void;
}

export const AttendanceSection: FC<AttendanceSectionProps> = ({
  sitesList,
  personnelList,
  selectedSiteId,
  setSelectedSiteId,
  onAttendanceProcessed,
  onBackToSites,
}) => {
  const currentSite: IOCLSite = selectedSiteId === 'ALL' ? {
    id: 'ALL',
    name: 'All Indian Oil Sites (1,000 Total Manpower)',
    code: 'IOCL-ALL-1000',
    location: 'Pan-India Refineries & Pipeline Units',
    state: 'National',
    contractRefNo: 'IOCL/CONT-OPS/2026/1000-MP',
    siteInchargeName: 'Shri A. K. Sharma',
    siteInchargeDesignation: 'Chief General Manager (Contract Operations), IOCL Corporate',
    siteInchargePhone: '+91 11 2436 0101',
    activeContractorPersonnelCount: personnelList.length,
    units: ['Panipat', 'Mathura', 'Paradip', 'Gujarat', 'Barauni'],
  } : (sitesList.find((s) => s.id === selectedSiteId) || sitesList[0]);

  const [month, setMonth] = useState('September 2026');
  const [totalWorkingDays, setTotalWorkingDays] = useState(26);
  const [officerName, setOfficerName] = useState(currentSite.siteInchargeName);
  const [officerDesignation, setOfficerDesignation] = useState(currentSite.siteInchargeDesignation);
  const [officerEmpId, setOfficerEmpId] = useState('IOCL-AUTH-8841');
  const [officerContact, setOfficerContact] = useState(currentSite.siteInchargePhone);

  const [uploadedRecords, setUploadedRecords] = useState<AttendanceRecord[] | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update officer defaults when site changes
  const handleSiteChange = (newSiteId: string) => {
    setSelectedSiteId(newSiteId);
    if (newSiteId === 'ALL') {
      setOfficerName('Shri A. K. Sharma');
      setOfficerDesignation('Chief General Manager (Contract Operations), IOCL Corporate');
      setOfficerContact('+91 11 2436 0101');
    } else {
      const s = sitesList.find((site) => site.id === newSiteId);
      if (s) {
        setOfficerName(s.siteInchargeName);
        setOfficerDesignation(s.siteInchargeDesignation);
        setOfficerContact(s.siteInchargePhone);
      }
    }
    setUploadedRecords(null);
    setFileName(null);
    setErrorMessage(null);
  };

  // Handle file upload (.xlsx, .xls, .csv) with 100% automated matching & salary calculation
  const handleFileUpload = (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const result = parseAttendanceFile(buffer);

        if (!result.records || result.records.length === 0) {
          throw new Error('No valid employee attendance records detected in the sheet. Please ensure column headers like "Employee Code", "Days Present" are present.');
        }

        setUploadedRecords(result.records);
        setFileName(file.name);
        const resolvedMonth = result.detectedMonth || month;
        const resolvedOfficer = result.officerName || officerName;
        if (result.officerName) setOfficerName(result.officerName);
        if (result.detectedMonth) setMonth(result.detectedMonth);

        // Auto-detect if this is a combined sheet (e.g. > 200 records, or user selected ALL)
        const isCombinedSheet = result.records.length > 200 || selectedSiteId === 'ALL';
        const targetSiteId = isCombinedSheet ? 'ALL' : currentSite.id;
        const targetSiteName = isCombinedSheet 
          ? 'All Indian Oil Sites (Combined Manpower)' 
          : currentSite.name;

        const submission: AttendanceSubmission = {
          id: `sub-${Date.now()}`,
          siteId: targetSiteId,
          siteName: targetSiteName,
          month: resolvedMonth,
          year: 2026,
          totalWorkingDaysInMonth: totalWorkingDays,
          authorizedOfficerName: resolvedOfficer,
          authorizedOfficerDesignation: officerDesignation,
          authorizedOfficerEmpId: officerEmpId,
          authorizedOfficerContact: officerContact,
          submissionDate: new Date().toISOString(),
          records: result.records,
          isSignedOff: true,
          signOffRemarks: 'Auto-verified from uploaded Indian Oil muster roll. Automatically matched with contractor database.',
        };

        // FULLY AUTOMATED: Immediately match database & calculate salaries without manual intervention
        onAttendanceProcessed(submission);
      } catch (err: any) {
        console.error(err);
        setErrorMessage(err?.message || 'Failed to parse Excel file. Please check template format.');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setIsProcessing(false);
      setErrorMessage('Could not read file from storage. Please check permissions.');
    };

    reader.readAsArrayBuffer(file);
  };

  // 1-Click Load Sample Verified Attendance from Indian Oil (Fully Automated)
  const handleLoadSampleSheet = (loadAll1000: boolean = false) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setTimeout(() => {
      let records: AttendanceRecord[] = [];
      let targetSiteId = selectedSiteId;
      let targetSiteName = currentSite.name;
      let targetFileName = '';

      if (loadAll1000 || selectedSiteId === 'ALL') {
        targetSiteId = 'ALL';
        setSelectedSiteId('ALL');
        records = generateMonthlyAttendanceRecords(personnelList, totalWorkingDays);
        targetFileName = `IOCL_All_1000_Manpower_Verified_Attendance_${month.replace(/\s+/g, '_')}.xlsx`;
        targetSiteName = 'All Indian Oil Sites (Combined 1,000 Manpower)';
      } else {
        const sitePersonnel = personnelList.filter(p => p.siteId === selectedSiteId);
        records = generateMonthlyAttendanceRecords(
          sitePersonnel.length > 0 ? sitePersonnel : personnelList.slice(0, 200),
          totalWorkingDays
        );
        targetFileName = `Sample_IOCL_${currentSite.code}_Attendance_${month.replace(/\s+/g, '_')}.xlsx`;
      }

      setUploadedRecords(records);
      setFileName(targetFileName);
      setIsProcessing(false);

      // FULLY AUTOMATED: Immediately match database and calculate salaries
      const submission: AttendanceSubmission = {
        id: `sub-${Date.now()}`,
        siteId: targetSiteId,
        siteName: targetSiteName,
        month,
        year: 2026,
        totalWorkingDaysInMonth: totalWorkingDays,
        authorizedOfficerName: officerName,
        authorizedOfficerDesignation: officerDesignation,
        authorizedOfficerEmpId: officerEmpId,
        authorizedOfficerContact: officerContact,
        submissionDate: new Date().toISOString(),
        records,
        isSignedOff: true,
        signOffRemarks: 'Verified and approved by Indian Oil Site In-charge for contractor wage disbursement.',
      };

      onAttendanceProcessed(submission);
    }, 200);
  };

  // Process and send to reconciliation
  const handleProceedToReconciliation = () => {
    if (!uploadedRecords || uploadedRecords.length === 0) {
      setErrorMessage('Please upload or load an attendance sheet first.');
      return;
    }

    const submission: AttendanceSubmission = {
      id: `sub-${Date.now()}`,
      siteId: currentSite.id,
      siteName: currentSite.name,
      month,
      year: 2026,
      totalWorkingDaysInMonth: totalWorkingDays,
      authorizedOfficerName: officerName,
      authorizedOfficerDesignation: officerDesignation,
      authorizedOfficerEmpId: officerEmpId,
      authorizedOfficerContact: officerContact,
      submissionDate: new Date().toISOString(),
      records: uploadedRecords,
      isSignedOff: true,
      signOffRemarks: 'Verified and approved by Indian Oil Site In-charge for contractor wage disbursement.',
    };

    onAttendanceProcessed(submission);
  };

  const deployedCountAtSite = personnelList.filter(
    (p) => p.siteId === currentSite.id && p.status === 'ACTIVE'
  ).length;

  return (
    <div className="space-y-6">
      {/* 3-Step Guided Workflow Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Authorized Contractor Wage Disbursement Workflow
          </div>
          {onBackToSites && (
            <button
              onClick={onBackToSites}
              className="flex items-center gap-1 text-xs font-bold text-[#002B49] hover:text-[#F37021] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change IOCL Site</span>
            </button>
          )}
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
              <div className="font-bold text-sm flex items-center gap-1">
                <span>Site Selected</span>
              </div>
              <div className="text-[11px] text-emerald-700 truncate max-w-[180px]">
                {currentSite.name}
              </div>
            </div>
          </button>

          <div className="p-3 rounded-lg bg-[#002B49] text-white flex items-center gap-3 border border-[#002B49]">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#F37021] text-white font-bold text-xs">
              2
            </span>
            <div>
              <div className="font-bold text-sm">Upload Attendance</div>
              <div className="text-[11px] text-slate-200">Auto-matches registered manpower</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 text-slate-600 flex items-center gap-3 border border-slate-200">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-xs">
              3
            </span>
            <div>
              <div className="font-semibold text-slate-800 text-sm">Disburse Salary</div>
              <div className="text-[11px] text-slate-500">Calculates pay & export Form XIX</div>
            </div>
          </div>
        </div>
      </div>

      {/* Informative Header */}
      <div className="bg-white border-t-2 border-t-[#F37021] border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#002B49] font-bold text-xs uppercase tracking-wider">
              <span className="inline-block w-2 h-2 rounded-full bg-[#F37021]"></span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Indian Oil Corporation Limited • Step 2: Upload Muster Roll
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Upload Attendance for {currentSite.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Upload the monthly verified muster roll for this site. 
              The system cross-references all records against your master database, shortlists matched personnel, and prepares the salary disbursement.
            </p>
          </div>

          {/* Quick template download */}
          <button
            onClick={() => downloadAttendanceTemplate(currentSite, personnelList, month)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-[#002B49] border border-slate-300 rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-98"
            title="Download blank Excel template pre-filled with workers for this site"
          >
            <Download className="w-4 h-4 text-[#F37021]" />
            <span>Download Site Excel Template</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Authorized Officer & Site Details Form */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-[#002B49] font-bold text-sm border-b border-slate-100 pb-3">
            <Building2 className="w-4 h-4 text-[#F37021]" />
            IOCL Site & Officer Authorization
          </div>

          {/* Site selection */}
          <div className="space-y-1.5">
            <label htmlFor="site-select-dropdown" className="text-xs font-semibold text-slate-700">
              Indian Oil Site / Unit:
            </label>
            <select
              id="site-select-dropdown"
              value={selectedSiteId}
              onChange={(e) => handleSiteChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-xs focus:outline-none focus:bg-white focus:border-[#002B49] font-medium"
            >
              <option value="ALL">★ All IOCL Sites (1,000 Contractor Manpower)</option>
              {sitesList.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name} ({site.code})
                </option>
              ))}
            </select>
            <div className="text-[11px] text-slate-500">
              Contract Ref: <span className="font-mono text-slate-800 font-medium">{currentSite.contractRefNo}</span>
            </div>
          </div>

          {/* Month & Working Days */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="attendance-month-input" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Wage Month:
              </label>
              <input
                id="attendance-month-input"
                type="text"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                placeholder="e.g. September 2026"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-xs focus:outline-none focus:bg-white focus:border-[#002B49]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="working-days-input" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Working Days:
              </label>
              <input
                id="working-days-input"
                type="number"
                min="20"
                max="31"
                value={totalWorkingDays}
                onChange={(e) => setTotalWorkingDays(Number(e.target.value) || 26)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-xs focus:outline-none focus:bg-white focus:border-[#002B49] font-mono"
              />
            </div>
          </div>

          {/* Authorized Indian Oil Officer Details */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="text-xs font-semibold text-[#002B49] flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              Authorised Indian Oil Officer
            </div>

            <div className="space-y-1">
              <label htmlFor="officer-name-input" className="text-[11px] text-slate-600 font-medium">Officer Name:</label>
              <input
                id="officer-name-input"
                type="text"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                placeholder="e.g. Er. Rajesh Sharma"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:bg-white focus:border-[#002B49]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="officer-desig-input" className="text-[11px] text-slate-600 font-medium">Designation:</label>
              <input
                id="officer-desig-input"
                type="text"
                value={officerDesignation}
                onChange={(e) => setOfficerDesignation(e.target.value)}
                placeholder="e.g. CGM (Operations & HSE)"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:bg-white focus:border-[#002B49]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label htmlFor="officer-id-input" className="text-[11px] text-slate-600 font-medium">IOCL Emp ID:</label>
                <input
                  id="officer-id-input"
                  type="text"
                  value={officerEmpId}
                  onChange={(e) => setOfficerEmpId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:bg-white focus:border-[#002B49]"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="officer-phone-input" className="text-[11px] text-slate-600 font-medium">Contact No.:</label>
                <input
                  id="officer-phone-input"
                  type="text"
                  value={officerContact}
                  onChange={(e) => setOfficerContact(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:bg-white focus:border-[#002B49]"
                />
              </div>
            </div>
          </div>

          {/* Current site deployment headcount info */}
          <div className="bg-[#002B49]/5 p-3 rounded-lg border border-[#002B49]/15 text-xs">
            <div className="flex items-center justify-between text-slate-700">
              <span className="font-semibold text-[#002B49]">Registered at this Site:</span>
              <span className="font-bold text-[#F37021]">{deployedCountAtSite} Personnel</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1">
              Once uploaded, the engine matches records by Employee ID (e.g. <span className="text-[#002B49] font-mono font-semibold">IOCL-PNP-101</span>).
            </p>
          </div>
        </div>

        {/* Right Column (2 cols): File Upload Dropzone & Sample Sheet Loader */}
        <div className="lg:col-span-2 space-y-4">
          {/* Dropzone Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-[#F37021]" />
                Upload Indian Oil Attendance Muster Roll
              </h3>

              {/* Sample loader buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  id="btn-load-all-1000-attendance"
                  onClick={() => handleLoadSampleSheet(true)}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#002B49] hover:bg-[#001f35] text-white rounded-lg text-xs font-semibold transition-all active:scale-98 shadow-xs"
                  title="Load verified muster roll for all 1,000 contractor personnel"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Load All 1,000 Sheet</span>
                </button>

                <button
                  id="btn-load-sample-attendance"
                  onClick={() => handleLoadSampleSheet(false)}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F37021]/10 hover:bg-[#F37021]/20 text-[#C2410C] border border-[#F37021]/30 rounded-lg text-xs font-semibold transition-all active:scale-98"
                  title="Load verified sample attendance for currently selected site"
                >
                  <span>Load Site Sheet</span>
                </button>
              </div>
            </div>

            {/* Drag and Drop Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-[#002B49] bg-slate-50/60 hover:bg-slate-50 rounded-xl p-8 text-center cursor-pointer transition-all group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-105 transition-transform border border-slate-200">
                <Upload className="w-6 h-6 text-[#002B49]" />
              </div>

              <div className="mt-3">
                <p className="text-sm font-semibold text-slate-800">
                  Drop attendance file here, or <span className="text-[#F37021] underline font-semibold">browse device</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supports Excel (.xlsx, .xls) and CSV sheets. Compatible across iOS, Android, laptops & mobile.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-[11px] text-slate-500">
                <span className="px-2 py-0.5 bg-white rounded border border-slate-200">Employee Code</span>
                <span className="px-2 py-0.5 bg-white rounded border border-slate-200">Days Present</span>
                <span className="px-2 py-0.5 bg-white rounded border border-slate-200">Overtime Hours</span>
                <span className="px-2 py-0.5 bg-white rounded border border-slate-200">Night Shifts</span>
              </div>
            </div>

            {/* Error Display */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Error Reading Attendance Sheet</div>
                  <div>{errorMessage}</div>
                </div>
              </div>
            )}

            {/* Status of Loaded Records */}
            {uploadedRecords && (
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Attendance Sheet Loaded Successfully
                  </div>
                  <span className="text-xs font-mono text-emerald-800 bg-white px-2.5 py-0.5 rounded-full border border-emerald-200 font-medium">
                    {uploadedRecords.length} Entries in Sheet
                  </span>
                </div>

                <div className="text-xs text-slate-600">
                  Source file: <span className="font-mono font-medium text-slate-900">{fileName}</span>
                </div>

                {/* Quick preview snippet of parsed records */}
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg bg-white text-xs">
                  <table className="w-full text-left text-slate-700">
                    <thead className="bg-[#002B49] text-[11px] text-white font-semibold uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3 text-white">Emp ID</th>
                        <th className="py-2 px-3 text-white">Name in Sheet</th>
                        <th className="py-2 px-3 text-center text-white">Days Present</th>
                        <th className="py-2 px-3 text-center text-white">OT Hours</th>
                        <th className="py-2 px-3 text-center text-white">Night Shifts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {uploadedRecords.slice(0, 6).map((rec, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70">
                          <td className="py-1.5 px-3 font-mono text-[#002B49] font-semibold">{rec.empCode}</td>
                          <td className="py-1.5 px-3 font-medium text-slate-800">{rec.name}</td>
                          <td className="py-1.5 px-3 text-center font-bold text-slate-900">{rec.daysPresent}</td>
                          <td className="py-1.5 px-3 text-center text-slate-700">{rec.overtimeHours} hrs</td>
                          <td className="py-1.5 px-3 text-center text-slate-700">{rec.nightShiftAllowanceDays}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {uploadedRecords.length > 6 && (
                    <div className="p-2 text-center text-[11px] text-slate-500 bg-slate-50 border-t border-slate-200">
                      + {uploadedRecords.length - 6} more attendance records
                    </div>
                  )}
                </div>

                {/* Next Step CTA */}
                <div className="pt-2 flex justify-end">
                  <button
                    id="btn-reconcile-and-calculate"
                    onClick={handleProceedToReconciliation}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#F37021] hover:bg-[#D95A0F] text-white font-bold text-sm rounded-lg shadow-xs active:scale-98 transition-all"
                  >
                    <span>Match Database & Calculate Salaries</span>
                    <ArrowRight className="w-4 h-4 text-white stroke-[3]" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
