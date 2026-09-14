import { Personnel, AttendanceRecord, SalaryCalculation, ReconciliationItem, PayrollSummary } from '../types';

export interface CalculationConfig {
  workingDaysBase: number; // e.g. 26 or 30
  nightShiftAllowanceRate: number; // ₹ per night shift, default 150
  pfRatePercent: number; // default 12%
  esicRatePercent: number; // default 0.75%
  applyEsicCeiling: boolean; // ceiling at 21,000
}

export const DEFAULT_CALC_CONFIG: CalculationConfig = {
  workingDaysBase: 26,
  nightShiftAllowanceRate: 150,
  pfRatePercent: 12,
  esicRatePercent: 0.75,
  applyEsicCeiling: true,
};

/**
 * Calculates itemized salary for a single employee based on their master deployment record
 * and the verified attendance record from Indian Oil authorized in-charge.
 */
export function calculateEmployeeSalary(
  person: Personnel,
  attendance: AttendanceRecord,
  totalWorkingDaysInMonth: number = 26,
  config: CalculationConfig = DEFAULT_CALC_CONFIG
): SalaryCalculation {
  const workingDays = totalWorkingDaysInMonth || 26;
  const baseMonthlyGross = person.monthlyGrossSalary;

  // Daily rate
  const calculatedDailyRate = Math.round(baseMonthlyGross / workingDays);
  const calculatedHourlyRate = Math.round(calculatedDailyRate / 8);
  const otHourlyRate = person.overtimeHourlyRate || Math.round(calculatedHourlyRate * 2); // Double wages for OT as per Factories Act

  // Payable days: Full Days Present + 0.5 * Half Days + Paid Weekly Offs + Paid National/IOCL Holidays
  const payableDays = Math.min(
    workingDays,
    Number(attendance.daysPresent || 0) +
      Number(attendance.halfDays || 0) * 0.5 +
      Number(attendance.weeklyOffs || 0) +
      Number(attendance.paidHolidays || 0)
  );

  // Pro-rated Basic Salary
  const attendanceRatio = Math.min(1, Math.max(0, payableDays / workingDays));
  const proRatedBasicSalary = Math.round(baseMonthlyGross * attendanceRatio);

  // Overtime Earnings
  const overtimeHours = Number(attendance.overtimeHours || 0);
  const overtimePay = Math.round(overtimeHours * otHourlyRate);

  // Allowances
  const nightShiftDays = Number(attendance.nightShiftAllowanceDays || 0);
  const nightShiftAllowance = nightShiftDays * config.nightShiftAllowanceRate;
  
  // Pro-rated special site allowance (hazardous/refinery allowance)
  const specialSiteAllowance = Math.round((person.specialSiteAllowance || 0) * attendanceRatio);

  // Gross Payable
  const grossPayable = proRatedBasicSalary + overtimePay + nightShiftAllowance + specialSiteAllowance;

  // Deductions
  // EPF: 12% on pro-rated wage (statutory ceiling ₹15,000 basic or actual basic)
  let epfEmployeeDeduction = 0;
  if (person.pfApplicable) {
    const epfWages = Math.min(15000, proRatedBasicSalary);
    epfEmployeeDeduction = Math.round((epfWages * config.pfRatePercent) / 100);
  }

  // ESIC: 0.75% of gross payable if gross <= 21,000 (or if explicitly applicable)
  let esicEmployeeDeduction = 0;
  if (person.esicApplicable || (config.applyEsicCeiling && person.monthlyGrossSalary <= 21000)) {
    esicEmployeeDeduction = Math.round((grossPayable * config.esicRatePercent) / 100);
  }

  // Professional Tax (Standard Indian State Slabs: ₹0 to ₹200)
  let professionalTax = person.professionalTax || 0;
  if (proRatedBasicSalary < 10000) {
    professionalTax = 0;
  }

  const otherDeductions = 0;
  const totalDeductions = epfEmployeeDeduction + esicEmployeeDeduction + professionalTax + otherDeductions;

  // Final Net Payable Salary (In-Hand amount to disburse via bank)
  const netPayableSalary = Math.max(0, grossPayable - totalDeductions);

  return {
    empCode: person.empCode,
    employeeName: person.name,
    designation: person.designation,
    skillCategory: person.skillCategory,
    siteId: person.siteId,
    siteName: person.siteName,
    unitOrPlant: person.unitOrPlant,
    
    totalMonthDays: workingDays,
    daysPresent: Number(attendance.daysPresent || 0),
    halfDays: Number(attendance.halfDays || 0),
    weeklyOffs: Number(attendance.weeklyOffs || 0),
    paidHolidays: Number(attendance.paidHolidays || 0),
    payableDays,
    absentDays: Number(attendance.absentDays || 0),
    overtimeHours,

    baseMonthlyGross,
    calculatedDailyRate,
    calculatedHourlyRate,
    otHourlyRate,

    proRatedBasicSalary,
    overtimePay,
    specialSiteAllowance,
    nightShiftAllowance,
    grossPayable,

    epfEmployeeDeduction,
    esicEmployeeDeduction,
    professionalTax,
    otherDeductions,
    totalDeductions,

    netPayableSalary,

    bankName: person.bankDetails?.bankName || 'State Bank of India',
    bankAccountNo: person.bankDetails?.accountNo || '',
    bankIfsc: person.bankDetails?.ifsc || '',
    paymentStatus: 'READY_FOR_PAYMENT',
  };
}

/**
 * Reconciles the Indian Oil authorized attendance sheet with our internal personnel database.
 * Shortlists matched staff, flags unregistered entries, and catches personnel missing from sheet.
 */
export function reconcileAttendanceWithDatabase(
  allPersonnel: Personnel[],
  selectedSiteId: string,
  attendanceRecords: AttendanceRecord[],
  totalWorkingDaysInMonth: number = 26,
  config: CalculationConfig = DEFAULT_CALC_CONFIG
): {
  reconciliationItems: ReconciliationItem[];
  summary: PayrollSummary;
} {
  const isAllSites = selectedSiteId === 'ALL' || selectedSiteId === 'site-all-1000' || !selectedSiteId;
  const activePersonnel = allPersonnel.filter((p) => p.status === 'ACTIVE');
  const sitePersonnel = isAllSites
    ? activePersonnel
    : activePersonnel.filter((p) => p.siteId === selectedSiteId);

  // High-performance index maps for automatic matching
  const normalize = (val?: string) => (val || '').trim().toUpperCase().replace(/[\s\-_]/g, '');
  const cleanName = (val?: string) => (val || '').trim().toLowerCase().replace(/\s+/g, ' ');

  const codeMap = new Map<string, Personnel>();
  const nameMap = new Map<string, Personnel>();

  for (const p of activePersonnel) {
    if (p.empCode) codeMap.set(normalize(p.empCode), p);
    if (p.name) nameMap.set(cleanName(p.name), p);
  }

  const matchedEmpCodes = new Set<string>();
  const reconciliationItems: ReconciliationItem[] = [];

  let totalPayableGross = 0;
  let totalDeductions = 0;
  let totalNetPayable = 0;
  let totalOvertimeHours = 0;
  let totalOvertimePay = 0;
  let matchedCount = 0;
  let unmatchedCount = 0;

  // 1. Process all attendance records uploaded from Indian Oil sheet
  for (const record of attendanceRecords) {
    const recCode = normalize(record.empCode);
    const recName = cleanName(record.name);

    // Automated matching priority:
    // 1. Exact match by employee code
    // 2. Exact match by normalized name
    // 3. Sub-code match
    let person: Personnel | undefined = codeMap.get(recCode);

    if (!person && recName) {
      person = nameMap.get(recName);
    }

    if (!person && recCode) {
      const numericPart = recCode.replace(/\D/g, '');
      if (numericPart.length >= 3) {
        person = activePersonnel.find((p) => normalize(p.empCode).includes(numericPart));
      }
    }

    if (person) {
      // Worker matched in contractor database
      matchedEmpCodes.add(person.empCode);
      matchedCount++;

      const salaryCalc = calculateEmployeeSalary(person, record, totalWorkingDaysInMonth, config);
      totalPayableGross += salaryCalc.grossPayable;
      totalDeductions += salaryCalc.totalDeductions;
      totalNetPayable += salaryCalc.netPayableSalary;
      totalOvertimeHours += salaryCalc.overtimeHours;
      totalOvertimePay += salaryCalc.overtimePay;

      reconciliationItems.push({
        id: `rec-match-${person.id}`,
        matchStatus: 'MATCHED_EXACT',
        empCode: person.empCode,
        nameInSheet: record.name,
        employee: person,
        attendance: record,
        salaryCalculation: salaryCalc,
      });
    } else {
      // UNREGISTERED PERSON: In IOCL attendance sheet but NOT in contractor database
      reconciliationItems.push({
        id: `rec-unmatched-${record.empCode}-${Math.random()}`,
        matchStatus: 'UNMATCHED_IN_DATABASE',
        empCode: record.empCode,
        nameInSheet: record.name,
        attendance: record,
        discrepancyNote: 'Employee Code / Name not found in contractor database. Cannot disburse salary without master registration.',
      });
      unmatchedCount++;
    }
  }

  // 2. Identify missing personnel: Deployed in database, but completely omitted from sheet
  let missingCount = 0;
  for (const person of sitePersonnel) {
    if (!matchedEmpCodes.has(person.empCode)) {
      missingCount++;
      reconciliationItems.push({
        id: `rec-missing-${person.id}`,
        matchStatus: 'MISSING_FROM_ATTENDANCE',
        empCode: person.empCode,
        employee: person,
        discrepancyNote: `Active personnel deployed in database, but NOT included in this attendance sheet.`,
      });
    }
  }

  const selectedSite = isAllSites 
    ? 'All Indian Oil Sites (Combined Manpower)' 
    : (allPersonnel.find((p) => p.siteId === selectedSiteId)?.siteName || 'Indian Oil Site');

  const summary: PayrollSummary = {
    siteName: selectedSite,
    month: 'Current Submission',
    totalPersonnelDeployed: sitePersonnel.length,
    totalInSheet: attendanceRecords.length,
    matchedCount,
    unmatchedCount,
    missingCount,
    totalPayableGross,
    totalDeductions,
    totalNetPayable,
    totalOvertimeHours,
    totalOvertimePay,
  };

  return {
    reconciliationItems,
    summary,
  };
}

/**
 * Format Indian Currency (INR) with standard Lakh / Crore grouping: ₹1,50,000
 */
export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
