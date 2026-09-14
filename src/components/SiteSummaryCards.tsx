import { FC } from 'react';
import { IOCLSite, Personnel } from '../types';
import { formatINR } from '../utils/salaryCalculator';
import { 
  Building2, 
  Users, 
  FileSpreadsheet, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  DollarSign,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface SiteSummaryCardsProps {
  sitesList: IOCLSite[];
  personnelList: Personnel[];
  onSelectSiteForAttendance: (siteId: string) => void;
  onFilterDatabaseBySite: (siteId: string) => void;
}

export const SiteSummaryCards: FC<SiteSummaryCardsProps> = ({
  sitesList,
  personnelList,
  onSelectSiteForAttendance,
  onFilterDatabaseBySite,
}) => {
  const totalDeployed = personnelList.filter((p) => p.status === 'ACTIVE').length;
  const totalMonthlyWage = personnelList.filter((p) => p.status === 'ACTIVE').reduce((sum, p) => sum + p.monthlyGrossSalary, 0);

  return (
    <div className="space-y-6">
      {/* 3-Step Guided Workflow Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">
          Authorized Contractor Wage Disbursement Workflow
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-[#002B49] text-white flex items-center gap-3 border border-[#002B49]">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#F37021] text-white font-bold text-xs">
              1
            </span>
            <div>
              <div className="font-bold text-sm">Select IOCL Site</div>
              <div className="text-[11px] text-slate-200">Choose operating refinery/unit below</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 text-slate-600 flex items-center gap-3 border border-slate-200">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-xs">
              2
            </span>
            <div>
              <div className="font-semibold text-slate-800 text-sm">Upload Attendance</div>
              <div className="text-[11px] text-slate-500">Auto-matches registered manpower</div>
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

      {/* Main Selection Header */}
      <div className="bg-white border-t-2 border-t-[#F37021] border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#002B49] font-bold text-xs uppercase tracking-wider">
              <span className="inline-block w-2 h-2 rounded-full bg-[#F37021]"></span>
              <Building2 className="w-4 h-4 text-[#F37021]" />
              Indian Oil Corporation Limited • Step 1: Site Selection
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Select Site to Upload Attendance
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Click on the Indian Oil site where you want to upload the verified monthly attendance sheet. 
              The system will automatically shortlist registered workers for that site and calculate wage disbursement.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#002B49]/5 px-4 py-2.5 rounded-lg border border-[#002B49]/15">
            <div>
              <div className="text-[10px] text-slate-600 uppercase font-semibold">Total Manpower</div>
              <div className="text-xl font-bold text-[#002B49]">{totalDeployed} Personnel</div>
              <div className="text-[11px] text-slate-500">{sitesList.length} Operating Sites</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Prominent Option: Process All 1,000 Combined Attendance */}
      <div className="bg-gradient-to-r from-[#002B49] to-[#003d66] text-white rounded-xl p-5 sm:p-6 shadow-md border border-[#002B49] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F37021] text-white text-[10px] font-bold tracking-wide uppercase">
              Combined Muster Roll
            </span>
            <span className="text-xs text-amber-300 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              All 1,000 Contractor Manpower
            </span>
          </div>
          <h3 className="text-lg font-bold text-white">
            Upload Combined Attendance for All IOCL Sites
          </h3>
          <p className="text-xs text-slate-200 leading-relaxed">
            Have a single master Excel sheet containing attendance for all 1,000 workers across Panipat, Mathura, Paradip, Gujarat & Mumbai? 
            Process the entire workforce at once with automated cross-site matching.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-300 pt-1">
            <span>• 1,000 Total Deployed</span>
            <span>• {formatINR(totalMonthlyWage)} Monthly Wage Liability</span>
            <span>• 5 Refineries</span>
          </div>
        </div>

        <button
          id="btn-select-all-sites"
          onClick={() => onSelectSiteForAttendance('ALL')}
          className="flex items-center gap-2 px-5 py-3 bg-[#F37021] hover:bg-[#d95a0f] text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm transition-all active:scale-98 whitespace-nowrap border border-orange-400/40"
        >
          <FileSpreadsheet className="w-4 h-4 text-white" />
          <span>Upload Combined Attendance (All Sites)</span>
          <ArrowRight className="w-4 h-4 text-white" />
        </button>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Or Select An Individual IOCL Refinery / Site</span>
        <div className="h-px bg-slate-200 flex-1" />
      </div>

      {/* Grid of Individual Sites */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sitesList.map((site) => {
          const sitePersonnel = personnelList.filter((p) => p.siteId === site.id && p.status === 'ACTIVE');
          const headcount = sitePersonnel.length;
          const monthlyPayroll = sitePersonnel.reduce((acc, p) => acc + p.monthlyGrossSalary, 0);
          const annualPackage = sitePersonnel.reduce((acc, p) => acc + p.annualPackage, 0);

          return (
            <div
              key={site.id}
              className="bg-white border-2 border-slate-200 hover:border-[#002B49] rounded-xl p-5 shadow-xs flex flex-col justify-between transition-all space-y-4 hover:shadow-md"
            >
              <div className="space-y-3">
                {/* Header: Code & Type badge */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-orange-50 text-[#C2410C] rounded border border-orange-200">
                    {site.code}
                  </span>
                  <span className="text-[11px] font-medium px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                    {site.type}
                  </span>
                </div>

                {/* Site Name */}
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug">{site.name}</h3>
                  <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#F37021] flex-shrink-0" />
                    <span>{site.state} • {site.address}</span>
                  </div>
                </div>

                {/* Financial & Headcount Bar */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                  <div>
                    <div className="text-[10px] text-slate-500 font-semibold uppercase flex items-center gap-1">
                      <Users className="w-3 h-3 text-[#002B49]" />
                      Manpower
                    </div>
                    <div className="text-base font-bold text-slate-900 mt-0.5">{headcount} Deployed</div>
                    <div className="text-[10px] text-slate-400">Registered Staff</div>
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-500 font-semibold uppercase flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-emerald-600" />
                      Monthly Payroll
                    </div>
                    <div className="text-base font-bold text-emerald-800 mt-0.5">{formatINR(monthlyPayroll)}</div>
                    <div className="text-[10px] text-slate-400">{formatINR(annualPackage)} /yr</div>
                  </div>
                </div>

                {/* Authorized Incharge Details */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs space-y-1">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Authorized Site In-Charge (IOCL)
                  </div>
                  <div className="font-semibold text-slate-900">{site.siteInchargeName}</div>
                  <div className="text-[11px] text-slate-600">{site.siteInchargeDesignation}</div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 pt-0.5 font-mono">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {site.siteInchargePhone}
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 truncate">
                  Contract Ref: <span className="font-mono text-slate-800 font-medium">{site.contractRefNo}</span>
                </div>
              </div>

              {/* Action Buttons: Primary is "Upload Attendance" */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <button
                  id={`btn-select-site-${site.id}`}
                  onClick={() => onSelectSiteForAttendance(site.id)}
                  className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 bg-[#F37021] hover:bg-[#D95A0F] text-white text-xs font-bold rounded-lg shadow-xs transition-all active:scale-98"
                >
                  <FileSpreadsheet className="w-4 h-4 text-white" />
                  <span>Upload Attendance for {site.code}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </button>

                <button
                  id={`btn-view-workers-${site.id}`}
                  onClick={() => onFilterDatabaseBySite(site.id)}
                  className="w-full px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg text-center transition-colors border border-slate-200"
                >
                  View {headcount} Workers in Database
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
