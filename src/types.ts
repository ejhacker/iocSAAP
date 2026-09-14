export type SkillCategory = 'Highly Skilled' | 'Skilled' | 'Semi-Skilled' | 'Unskilled';

export type DeploymentStatus = 'ACTIVE' | 'ON_LEAVE' | 'RELIEVED' | 'STANDBY';

export type WageType = 'MONTHLY_FIXED' | 'DAILY_WAGE';

export interface IOCLSite {
  id: string;
  name: string;
  code: string;
  state: string;
  type: 'Refinery' | 'Pipeline' | 'Marketing Terminal' | 'LPG Plant' | 'Aviation Fuel Station';
  siteInchargeName: string;
  siteInchargeDesignation: string;
  siteInchargePhone: string;
  contractRefNo: string;
  address: string;
}

export interface Personnel {
  id: string;
  empCode: string; // e.g. "IOCL-M-101"
  contractorBadgeNo: string;
  name: string;
  fatherName: string;
  phone: string;
  designation: string; // e.g. "Mechanical Tech", "HSE Safety Officer", "Argon Welder"
  tradeCategory: string; // e.g. "Mechanical", "Electrical", "Safety", "Civil", "Operations"
  skillCategory: SkillCategory;
  siteId: string; // matches IOCLSite.id
  siteName: string;
  unitOrPlant: string; // e.g. "FCCU Unit", "Crude Distillation Unit (CDU)", "Tank Farm 3"
  monthlyGrossSalary: number; // e.g. ₹32,000
  annualPackage: number; // e.g. ₹3,84,000
  wageType: WageType;
  dailyWageRate: number; // derived or explicit
  overtimeHourlyRate: number; // ₹ per hour
  pfApplicable: boolean; // 12% PF
  esicApplicable: boolean; // 0.75% ESIC
  professionalTax: number; // e.g. ₹200
  specialSiteAllowance: number; // hazardous/refinery allowance
  bankDetails: {
    accountNo: string;
    ifsc: string;
    bankName: string;
    accountHolder: string;
  };
  aadhaarLastFour: string;
  uanNo: string;
  esicNo: string;
  joiningDate: string;
  status: DeploymentStatus;
}

export interface AttendanceRecord {
  empCode: string;
  name: string;
  daysPresent: number;
  halfDays: number;
  weeklyOffs: number; // Paid rest days
  paidHolidays: number; // National / IOCL holidays
  absentDays: number;
  overtimeHours: number;
  nightShiftAllowanceDays: number;
  supervisorRemarks?: string;
}

export interface AttendanceSubmission {
  id: string;
  siteId: string;
  siteName: string;
  month: string; // e.g., "September 2026"
  year: number;
  totalWorkingDaysInMonth: number; // e.g., 26 or 30
  authorizedOfficerName: string;
  authorizedOfficerDesignation: string;
  authorizedOfficerEmpId: string;
  authorizedOfficerContact: string;
  submissionDate: string;
  records: AttendanceRecord[];
  isSignedOff: boolean;
  signOffRemarks?: string;
}

export interface SalaryCalculation {
  empCode: string;
  employeeName: string;
  designation: string;
  skillCategory: SkillCategory;
  siteId: string;
  siteName: string;
  unitOrPlant: string;
  
  // Attendance inputs
  totalMonthDays: number;
  daysPresent: number;
  halfDays: number;
  weeklyOffs: number;
  paidHolidays: number;
  payableDays: number; // present + (halfDays * 0.5) + weeklyOffs + paidHolidays
  absentDays: number;
  overtimeHours: number;

  // Rate structures
  baseMonthlyGross: number;
  calculatedDailyRate: number;
  calculatedHourlyRate: number;
  otHourlyRate: number;

  // Earnings
  proRatedBasicSalary: number;
  overtimePay: number;
  specialSiteAllowance: number;
  nightShiftAllowance: number;
  grossPayable: number;

  // Deductions
  epfEmployeeDeduction: number; // 12%
  esicEmployeeDeduction: number; // 0.75%
  professionalTax: number;
  otherDeductions: number;
  totalDeductions: number;

  // Final Net Take Home
  netPayableSalary: number;

  // Payment info
  bankName: string;
  bankAccountNo: string;
  bankIfsc: string;
  paymentStatus: 'READY_FOR_PAYMENT' | 'PAID' | 'HELD';
  paymentRefNumber?: string;
}

export type MatchStatus = 
  | 'MATCHED_EXACT' 
  | 'UNMATCHED_IN_DATABASE' 
  | 'MISSING_FROM_ATTENDANCE'
  | 'SITE_MISMATCH';

export interface ReconciliationItem {
  id: string;
  matchStatus: MatchStatus;
  empCode: string;
  nameInSheet?: string;
  employee?: Personnel;
  attendance?: AttendanceRecord;
  salaryCalculation?: SalaryCalculation;
  discrepancyNote?: string;
}

export interface PayrollSummary {
  siteName: string;
  month: string;
  totalPersonnelDeployed: number;
  totalInSheet: number;
  matchedCount: number;
  unmatchedCount: number;
  missingCount: number;
  totalPayableGross: number;
  totalDeductions: number;
  totalNetPayable: number;
  totalOvertimeHours: number;
  totalOvertimePay: number;
}
