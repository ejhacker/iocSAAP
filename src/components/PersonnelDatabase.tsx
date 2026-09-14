import { FC, useState, useMemo, useEffect } from 'react';
import { Personnel, IOCLSite } from '../types';
import { formatINR } from '../utils/salaryCalculator';
import { exportPersonnelMasterExcel } from '../utils/excelHelper';
import { 
  Search, 
  Filter, 
  MapPin, 
  CreditCard, 
  Edit3, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  Clock, 
  DollarSign,
  TrendingUp,
  Award,
  Users,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  ChevronFirst,
  ChevronLast
} from 'lucide-react';

interface PersonnelDatabaseProps {
  personnelList: Personnel[];
  sitesList: IOCLSite[];
  selectedSiteFilter: string;
  setSelectedSiteFilter: (siteId: string) => void;
  onAddNew: () => void;
  onEdit: (person: Personnel) => void;
  onDelete: (id: string) => void;
  onQuickStartAttendance: (siteId: string) => void;
}

export const PersonnelDatabase: FC<PersonnelDatabaseProps> = ({
  personnelList,
  sitesList,
  selectedSiteFilter,
  setSelectedSiteFilter,
  onAddNew,
  onEdit,
  onDelete,
  onQuickStartAttendance,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tradeFilter, setTradeFilter] = useState('ALL');
  const [skillFilter, setSkillFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(50);

  // Filtered personnel
  const filteredPersonnel = useMemo(() => {
    return personnelList.filter((p) => {
      // Site filter
      if (selectedSiteFilter !== 'ALL' && p.siteId !== selectedSiteFilter) return false;
      // Trade filter
      if (tradeFilter !== 'ALL' && p.tradeCategory !== tradeFilter) return false;
      // Skill filter
      if (skillFilter !== 'ALL' && p.skillCategory !== skillFilter) return false;
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(query);
        const matchCode = p.empCode.toLowerCase().includes(query);
        const matchBadge = p.contractorBadgeNo.toLowerCase().includes(query);
        const matchDesignation = p.designation.toLowerCase().includes(query);
        const matchUnit = p.unitOrPlant.toLowerCase().includes(query);
        const matchSite = p.siteName.toLowerCase().includes(query);
        return matchName || matchCode || matchBadge || matchDesignation || matchUnit || matchSite;
      }
      return true;
    });
  }, [personnelList, selectedSiteFilter, tradeFilter, skillFilter, searchQuery]);

  // Reset to first page whenever search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSiteFilter, tradeFilter, skillFilter, searchQuery, pageSize]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredPersonnel.length / pageSize));
  const paginatedPersonnel = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPersonnel.slice(start, start + pageSize);
  }, [filteredPersonnel, currentPage, pageSize]);

  // Aggregate stats for current filter
  const stats = useMemo(() => {
    const totalCount = filteredPersonnel.length;
    const totalMonthlyPayroll = filteredPersonnel.reduce((acc, p) => acc + p.monthlyGrossSalary, 0);
    const totalAnnualCommitment = filteredPersonnel.reduce((acc, p) => acc + p.annualPackage, 0);
    const avgMonthlySalary = totalCount > 0 ? Math.round(totalMonthlyPayroll / totalCount) : 0;
    return { totalCount, totalMonthlyPayroll, totalAnnualCommitment, avgMonthlySalary };
  }, [filteredPersonnel]);

  // Trades list
  const uniqueTrades = useMemo(() => {
    const trades = new Set(personnelList.map((p) => p.tradeCategory).filter(Boolean));
    return Array.from(trades);
  }, [personnelList]);

  const handleExportExcel = () => {
    const title = selectedSiteFilter === 'ALL'
      ? `IOCL 1000 Manpower Database Master Register`
      : `${sitesList.find(s => s.id === selectedSiteFilter)?.name || 'Site'} Manpower Register`;
    exportPersonnelMasterExcel(filteredPersonnel, title);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-white border-t-2 border-t-[#002B49] border-slate-200 p-4 sm:p-5 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#002B49]">Total Manpower</span>
            <span className="p-2 bg-[#002B49]/10 text-[#002B49] rounded-lg">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{stats.totalCount}</div>
          <div className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-600"></span>
            <span className="text-slate-700 font-medium">Active Deployment</span>
          </div>
        </div>

        <div className="bg-white border-t-2 border-t-[#F37021] border-slate-200 p-4 sm:p-5 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#F37021]">Monthly Gross Bill</span>
            <span className="p-2 bg-[#F37021]/10 text-[#C2410C] rounded-lg">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{formatINR(stats.totalMonthlyPayroll)}</div>
          <div className="text-[11px] text-slate-500 mt-1.5">
            Monthly IOCL commitment
          </div>
        </div>

        <div className="bg-white border-t-2 border-t-emerald-600 border-slate-200 p-4 sm:p-5 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">Annual CTC Package</span>
            <span className="p-2 bg-emerald-50 text-emerald-800 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-800 tracking-tight">{formatINR(stats.totalAnnualCommitment)}</div>
          <div className="text-[11px] text-slate-500 mt-1.5">
            Annualized contract value
          </div>
        </div>

        <div className="bg-white border-t-2 border-t-[#002B49] border-slate-200 p-4 sm:p-5 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#002B49]">Average Monthly Wage</span>
            <span className="p-2 bg-slate-100 text-slate-700 rounded-lg">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {formatINR(stats.avgMonthlySalary)}
            <span className="text-xs text-slate-500 font-normal ml-1">/mo</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1.5">
            Per worker average wage
          </div>
        </div>
      </div>

      {/* Control Filters & Search Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-personnel-search"
              type="text"
              placeholder="Search by worker name, ID (IOCL-PNP-101), badge, designation, unit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-16 py-2.5 bg-slate-50/70 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#002B49] focus:ring-1 focus:ring-[#002B49] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-800 bg-slate-200 px-2 py-0.5 rounded font-medium"
              >
                Clear
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              id="btn-export-personnel-excel"
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm rounded-lg shadow-xs transition-all active:scale-98"
              title="Download full Manpower Roster Excel file"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">Export Excel</span>
            </button>

            <button
              id="btn-add-personnel-toolbar"
              onClick={onAddNew}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 bg-[#F37021] hover:bg-[#D95A0F] text-white font-semibold text-xs sm:text-sm rounded-lg shadow-xs transition-all active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Deploy Person</span>
            </button>

            {/* View Mode Toggle (Mobile/Desktop friendly) */}
            <div className="hidden sm:flex bg-slate-100 border border-slate-200 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
                  viewMode === 'table' ? 'bg-[#002B49] text-white shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
                  viewMode === 'cards' ? 'bg-[#002B49] text-white shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cards
              </button>
            </div>
          </div>
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Site Filter */}
          <div className="flex items-center gap-2">
            <label htmlFor="filter-site-select" className="text-slate-600 whitespace-nowrap font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#F37021]" />
              IOCL Site:
            </label>
            <select
              id="filter-site-select"
              value={selectedSiteFilter}
              onChange={(e) => setSelectedSiteFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 py-1.5 px-2.5 rounded-lg focus:outline-none focus:bg-white focus:border-[#002B49] text-xs font-medium"
            >
              <option value="ALL">All Indian Oil Sites ({sitesList.length})</option>
              {sitesList.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name} ({site.code})
                </option>
              ))}
            </select>
          </div>

          {/* Trade Filter */}
          <div className="flex items-center gap-2">
            <label htmlFor="filter-trade-select" className="text-slate-600 whitespace-nowrap font-medium flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              Trade:
            </label>
            <select
              id="filter-trade-select"
              value={tradeFilter}
              onChange={(e) => setTradeFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 py-1.5 px-2.5 rounded-lg focus:outline-none focus:bg-white focus:border-[#002B49] text-xs font-medium"
            >
              <option value="ALL">All Trades ({uniqueTrades.length})</option>
              {uniqueTrades.map((trade) => (
                <option key={trade} value={trade}>
                  {trade}
                </option>
              ))}
            </select>
          </div>

          {/* Skill Filter */}
          <div className="flex items-center gap-2">
            <label htmlFor="filter-skill-select" className="text-slate-600 whitespace-nowrap font-medium flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-slate-500" />
              Skill Level:
            </label>
            <select
              id="filter-skill-select"
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 py-1.5 px-2.5 rounded-lg focus:outline-none focus:bg-white focus:border-[#002B49] text-xs font-medium"
            >
              <option value="ALL">All Skill Categories</option>
              <option value="Highly Skilled">Highly Skilled</option>
              <option value="Skilled">Skilled</option>
              <option value="Semi-Skilled">Semi-Skilled</option>
              <option value="Unskilled">Unskilled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Database Presentation: Responsive Table or Cards */}
      {filteredPersonnel.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center shadow-xs">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No personnel found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            No deployed personnel matched your search query or filters. Clear your filters or add a new personnel record.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedSiteFilter('ALL');
              setTradeFilter('ALL');
              setSkillFilter('ALL');
            }}
            className="mt-4 px-4 py-2 bg-[#002B49] hover:bg-[#001f35] text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className={`${viewMode === 'cards' ? 'hidden' : 'hidden lg:block'} bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-[#002B49] text-white uppercase tracking-wider text-[11px] font-semibold border-b-2 border-[#F37021]">
                  <tr>
                    <th className="py-3.5 px-4 text-white">Employee & Badge</th>
                    <th className="py-3.5 px-4 text-white">Designation & Skill</th>
                    <th className="py-3.5 px-4 text-white">Deployed IOCL Site & Unit</th>
                    <th className="py-3.5 px-4 text-right text-white">Salary Per Month</th>
                    <th className="py-3.5 px-4 text-right text-white">Annual Package (CTC)</th>
                    <th className="py-3.5 px-4 text-white">Bank Details</th>
                    <th className="py-3.5 px-4 text-center text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedPersonnel.map((person) => (
                    <tr key={person.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Badge */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 text-sm">{person.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[11px] px-1.5 py-0.2 bg-orange-50 text-[#C2410C] rounded border border-orange-200 font-semibold">
                            {person.empCode}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Badge: {person.contractorBadgeNo}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Aadhaar: •••• {person.aadhaarLastFour} | Ph: {person.phone}
                        </div>
                      </td>

                      {/* Designation */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{person.designation}</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            person.skillCategory === 'Highly Skilled'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : person.skillCategory === 'Skilled'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {person.skillCategory}
                          </span>
                          <span className="text-[11px] text-slate-500">{person.tradeCategory}</span>
                        </div>
                      </td>

                      {/* Site & Unit */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#F37021] flex-shrink-0" />
                          <span className="truncate max-w-[200px]" title={person.siteName}>
                            {person.siteName}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 pl-5">
                          Unit: {person.unitOrPlant}
                        </div>
                      </td>

                      {/* Monthly Gross Salary */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-bold text-slate-900 text-sm">
                          {formatINR(person.monthlyGrossSalary)}
                          <span className="text-[10px] text-slate-500 font-normal"> /mo</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Rate: ₹{person.dailyWageRate}/day
                        </div>
                        <div className="text-[10px] text-slate-400">
                          OT: ₹{person.overtimeHourlyRate}/hr
                        </div>
                      </td>

                      {/* Annual Package */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-bold text-emerald-700 text-sm">
                          {formatINR(person.annualPackage)}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          (₹{(person.annualPackage / 100000).toFixed(2)} Lakh / yr)
                        </div>
                      </td>

                      {/* Bank Details */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 text-[11px]">
                          {person.bankDetails?.bankName}
                        </div>
                        <div className="font-mono text-slate-600 text-[11px] mt-0.5">
                          A/C: {person.bankDetails?.accountNo}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          IFSC: {person.bankDetails?.ifsc}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            id={`btn-edit-${person.id}`}
                            onClick={() => onEdit(person)}
                            title="Edit details & package"
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors border border-slate-200"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`btn-delete-${person.id}`}
                            onClick={() => onDelete(person.id)}
                            title="Remove / Relieve personnel"
                            className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-700 rounded-md transition-colors border border-slate-200"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile & Tablet Card Layout */}
          <div className={`${viewMode === 'table' ? 'lg:hidden' : ''} grid grid-cols-1 md:grid-cols-2 gap-3.5`}>
            {paginatedPersonnel.map((person) => (
              <div
                key={person.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3"
              >
                {/* Header: Name, Badge, Actions */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-base leading-tight">{person.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-[11px] px-1.5 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-200 font-medium">
                        {person.empCode}
                      </span>
                      <span className="text-xs text-slate-500">
                        Badge: {person.contractorBadgeNo}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit(person)}
                      className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md border border-slate-200"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(person.id)}
                      className="p-1.5 bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-700 rounded-md border border-slate-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Designation & Skill */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-medium text-slate-800">{person.designation}</span>
                  <span className="text-slate-400">•</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                    {person.skillCategory}
                  </span>
                </div>

                {/* Indian Oil Site Deployment */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
                    <span className="truncate">{person.siteName}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 pl-5">
                    Unit: {person.unitOrPlant}
                  </div>
                </div>

                {/* Salary Package Box */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50/70 p-2.5 rounded-lg border border-slate-200">
                  <div>
                    <div className="text-[10px] text-slate-500 font-medium uppercase">Monthly Salary</div>
                    <div className="text-base font-bold text-slate-900">{formatINR(person.monthlyGrossSalary)}</div>
                    <div className="text-[10px] text-slate-500">₹{person.dailyWageRate}/day</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-medium uppercase">Annual CTC</div>
                    <div className="text-base font-bold text-emerald-700">{formatINR(person.annualPackage)}</div>
                    <div className="text-[10px] text-slate-500">₹{(person.annualPackage / 100000).toFixed(2)} Lakh / yr</div>
                  </div>
                </div>

                {/* Bank details info */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-slate-400" />
                    {person.bankDetails?.bankName} ({person.bankDetails?.accountNo.slice(-4)})
                  </span>
                  <span className="text-slate-500 font-mono">
                    IFSC: {person.bankDetails?.ifsc}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Navigation Bar for 1000 Manpower Database */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <span>Showing</span>
              <strong className="text-slate-900 font-semibold">
                {filteredPersonnel.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
              </strong>
              <span>to</span>
              <strong className="text-slate-900 font-semibold">
                {Math.min(currentPage * pageSize, filteredPersonnel.length)}
              </strong>
              <span>of</span>
              <strong className="text-slate-900 font-bold">{filteredPersonnel.length}</strong>
              <span>contractor personnel</span>
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
        </>
      )}
    </div>
  );
};
