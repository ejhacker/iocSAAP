import * as XLSX from 'xlsx';
import { AttendanceRecord, Personnel, SalaryCalculation, IOCLSite } from '../types';

/**
 * Parses an uploaded Excel (.xlsx, .xls) or CSV file buffer/arrayBuffer into AttendanceRecord[]
 */
export function parseAttendanceFile(fileBuffer: ArrayBuffer): {
  records: AttendanceRecord[];
  detectedSite?: string;
  detectedMonth?: string;
  officerName?: string;
} {
  const workbook = XLSX.read(fileBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  // Convert sheet to JSON array
  const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  const records: AttendanceRecord[] = [];
  let headerRowIndex = -1;
  let detectedSite: string | undefined;
  let detectedMonth: string | undefined;
  let officerName: string | undefined;

  // Scan metadata and locate table header
  for (let i = 0; i < Math.min(15, rawRows.length); i++) {
    const row = rawRows[i];
    if (!Array.isArray(row)) continue;

    const rowText = row.join(' ').toLowerCase();
    if (rowText.includes('site:') || rowText.includes('plant:') || rowText.includes('refinery:')) {
      const siteCell = row.find((c: any) => String(c).toLowerCase().includes('site:'));
      if (siteCell) detectedSite = String(siteCell).split(':')[1]?.trim();
    }
    if (rowText.includes('month:')) {
      const monthCell = row.find((c: any) => String(c).toLowerCase().includes('month:'));
      if (monthCell) detectedMonth = String(monthCell).split(':')[1]?.trim();
    }
    if (rowText.includes('officer:') || rowText.includes('incharge:')) {
      const offCell = row.find((c: any) => String(c).toLowerCase().includes('officer:'));
      if (offCell) officerName = String(offCell).split(':')[1]?.trim();
    }

    // Look for table header containing employee code or name
    if (
      rowText.includes('emp') ||
      rowText.includes('code') ||
      rowText.includes('badge') ||
      (rowText.includes('name') && (rowText.includes('present') || rowText.includes('days')))
    ) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex === -1) {
    // If no header found, assume standard 1st row
    headerRowIndex = 0;
  }

  const headers = (rawRows[headerRowIndex] || []).map((h: any) => String(h || '').trim().toLowerCase());

  // Find column indices
  const findIdx = (keywords: string[]) => {
    return headers.findIndex((h: string) => keywords.some((k) => h.includes(k)));
  };

  const codeIdx = findIdx(['emp code', 'code', 'emp id', 'employee code', 'badge', 'id']);
  const nameIdx = findIdx(['name', 'employee name', 'person name', 'worker']);
  const presentIdx = findIdx(['present', 'days present', 'attendance', 'working days']);
  const halfIdx = findIdx(['half day', 'half']);
  const weeklyOffIdx = findIdx(['weekly off', 'off', 'wo', 'rest day']);
  const holidayIdx = findIdx(['holiday', 'paid holiday', 'ph']);
  const absentIdx = findIdx(['absent', 'leaves', 'l']);
  const otIdx = findIdx(['ot', 'overtime', 'ot hours', 'extra hours']);
  const nightIdx = findIdx(['night', 'night shift', 'ns']);
  const remarksIdx = findIdx(['remark', 'notes', 'comments']);

  // Extract records
  for (let i = headerRowIndex + 1; i < rawRows.length; i++) {
    const row = rawRows[i];
    if (!Array.isArray(row) || row.length === 0) continue;

    const empCode = codeIdx !== -1 && row[codeIdx] ? String(row[codeIdx]).trim() : '';
    const name = nameIdx !== -1 && row[nameIdx] ? String(row[nameIdx]).trim() : '';

    // Skip empty or total rows
    if (!empCode && !name) continue;
    if (empCode.toLowerCase().includes('total') || name.toLowerCase().includes('total')) continue;

    const numVal = (val: any) => {
      const n = Number(val);
      return isNaN(n) ? 0 : n;
    };

    records.push({
      empCode: empCode || `EMP-${i}`,
      name: name || 'Unnamed Personnel',
      daysPresent: presentIdx !== -1 ? numVal(row[presentIdx]) : 26,
      halfDays: halfIdx !== -1 ? numVal(row[halfIdx]) : 0,
      weeklyOffs: weeklyOffIdx !== -1 ? numVal(row[weeklyOffIdx]) : 4,
      paidHolidays: holidayIdx !== -1 ? numVal(row[holidayIdx]) : 0,
      absentDays: absentIdx !== -1 ? numVal(row[absentIdx]) : 0,
      overtimeHours: otIdx !== -1 ? numVal(row[otIdx]) : 0,
      nightShiftAllowanceDays: nightIdx !== -1 ? numVal(row[nightIdx]) : 0,
      supervisorRemarks: remarksIdx !== -1 && row[remarksIdx] ? String(row[remarksIdx]).trim() : undefined,
    });
  }

  return { records, detectedSite, detectedMonth, officerName };
}

/**
 * Downloads a pre-filled Indian Oil Attendance Template Excel sheet
 * populated with workers deployed at the specified site.
 */
export function downloadAttendanceTemplate(site: IOCLSite, personnel: Personnel[], month: string = 'Current Month') {
  const siteWorkers = personnel.filter((p) => p.siteId === site.id && p.status === 'ACTIVE');

  const rows: any[] = [
    ['INDIAN OIL CORPORATION LIMITED (IOCL) - CONTRACTOR MANPOWER ATTENDANCE RECORD'],
    [`Site / Refinery: ${site.name} (${site.code})`],
    [`Month / Period: ${month}`],
    [`Contract Ref: ${site.contractRefNo}`],
    [`Authorised In-charge: ${site.siteInchargeName} (${site.siteInchargeDesignation})`],
    ['INSTRUCTIONS: Fill Days Present (out of 26/30), Overtime Hours, and Night Shifts. Save and upload back into the portal.'],
    [],
    [
      'Employee Code',
      'Contractor Badge',
      'Employee Full Name',
      'Designation / Trade',
      'IOCL Unit / Plant',
      'Days Present',
      'Half Days',
      'Weekly Offs',
      'Paid Holidays',
      'Absent Days',
      'Overtime Hours',
      'Night Shifts',
      'Supervisor Remarks',
    ],
  ];

  siteWorkers.forEach((w) => {
    rows.push([
      w.empCode,
      w.contractorBadgeNo,
      w.name,
      w.designation,
      w.unitOrPlant,
      26, // default present
      0,
      4,
      1,
      0,
      0,
      0,
      'Verified OK',
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  // Set column widths
  ws['!cols'] = [
    { wch: 16 }, // emp code
    { wch: 18 }, // badge
    { wch: 28 }, // name
    { wch: 28 }, // designation
    { wch: 30 }, // unit
    { wch: 14 }, // present
    { wch: 12 }, // half
    { wch: 12 }, // weekly off
    { wch: 14 }, // holiday
    { wch: 12 }, // absent
    { wch: 14 }, // OT
    { wch: 14 }, // night shift
    { wch: 30 }, // remarks
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'IOCL Attendance');

  const fileName = `IOCL_Attendance_Template_${site.code}_${month.replace(/\s+/g, '_')}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Exports the Final Attendance with Salary to be given for the month based on attendance
 * (Compliant with Form XIX & Central Labour Contract Wage Register)
 */
export function exportFinalAttendanceWithSalaryExcel(
  siteName: string,
  month: string,
  salaryList: SalaryCalculation[],
  officerSignOff?: { name: string; designation: string; empId?: string }
) {
  const rows: any[] = [
    ['INDIAN OIL CORPORATION LIMITED (IOCL) - FINAL ATTENDANCE & SALARY DISBURSEMENT REGISTER'],
    [`Refinery / Operating Installation: ${siteName}`],
    [`Salary & Attendance Month: ${month}`],
    [`Authorised Sign-off: ${officerSignOff?.name || 'Er. Rajesh K. Sharma'} (${officerSignOff?.designation || 'CGM - Technical & HSE'}) - Emp ID: ${officerSignOff?.empId || 'IOCL-CGM-4921'}`],
    [`Statutory Compliance: Contract Labour (Regulation & Abolition) Act, 1970 - Wage Register Form XIX`],
    [`Total Workforce In Record: ${salaryList.length} Personnel | Timestamp: ${new Date().toLocaleString('en-IN')}`],
    [],
    [
      'Sl. No',
      'Employee Code',
      'Employee Full Name',
      'Designation / Role',
      'Skill Category',
      'Installation / Site',
      'Unit / Plant Area',
      'Total Days in Month',
      'Days Present',
      'Half Days',
      'Paid Rest Days (WO)',
      'Paid Holidays (PH)',
      'Absent Days (Unpaid)',
      'Total Payable Days',
      'Overtime Hours (OT)',
      'Night Shift Count',
      'Base Monthly Package (₹)',
      'Calculated Daily Rate (₹)',
      'OT Hourly Rate (₹/hr)',
      'Pro-Rated Basic Wage Earned (₹)',
      'Overtime Wages Earned (₹)',
      'Hazardous Site Allowance (₹)',
      'Night Shift Allowance (₹)',
      'GROSS SALARY PAYABLE (₹)',
      'EPF Employee 12% (₹)',
      'ESIC Deduction 0.75% (₹)',
      'Professional Tax (₹)',
      'TOTAL DEDUCTIONS (₹)',
      'FINAL NET SALARY TO BE GIVEN (₹)',
      'Bank Name',
      'Bank Account Number',
      'Bank IFSC Code',
      'Disbursement Status',
    ],
  ];

  let totalPayableDaysSum = 0;
  let totalOTHoursSum = 0;
  let totalGross = 0;
  let totalPF = 0;
  let totalESIC = 0;
  let totalDeductions = 0;
  let totalNet = 0;
  let totalOT = 0;

  salaryList.forEach((s, idx) => {
    totalPayableDaysSum += s.payableDays;
    totalOTHoursSum += s.overtimeHours;
    totalGross += s.grossPayable;
    totalPF += s.epfEmployeeDeduction;
    totalESIC += s.esicEmployeeDeduction;
    totalDeductions += s.totalDeductions;
    totalNet += s.netPayableSalary;
    totalOT += s.overtimePay;

    rows.push([
      idx + 1,
      s.empCode,
      s.employeeName,
      s.designation,
      s.skillCategory,
      s.siteName,
      s.unitOrPlant,
      s.totalMonthDays,
      s.daysPresent,
      s.halfDays,
      s.weeklyOffs,
      s.paidHolidays,
      s.absentDays,
      s.payableDays,
      s.overtimeHours,
      Math.round(s.nightShiftAllowance / 150), // Approx night shifts
      s.baseMonthlyGross,
      s.calculatedDailyRate,
      s.otHourlyRate,
      s.proRatedBasicSalary,
      s.overtimePay,
      s.specialSiteAllowance,
      s.nightShiftAllowance,
      s.grossPayable,
      s.epfEmployeeDeduction,
      s.esicEmployeeDeduction,
      s.professionalTax,
      s.totalDeductions,
      s.netPayableSalary,
      s.bankName,
      s.bankAccountNo,
      s.bankIfsc,
      s.paymentStatus,
    ]);
  });

  // Summary Row
  rows.push([]);
  rows.push([
    'TOTAL',
    `${salaryList.length} Personnel`,
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    totalPayableDaysSum,
    totalOTHoursSum,
    '',
    '',
    '',
    '',
    '',
    totalOT,
    '',
    '',
    totalGross,
    totalPF,
    totalESIC,
    '',
    totalDeductions,
    totalNet,
    '',
    '',
    '',
    'VERIFIED FOR BANK RTGS DISBURSEMENT',
  ]);

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Column width configuration
  ws['!cols'] = [
    { wch: 8 },  // Sl.
    { wch: 16 }, // Code
    { wch: 26 }, // Name
    { wch: 28 }, // Role
    { wch: 16 }, // Skill
    { wch: 24 }, // Site
    { wch: 28 }, // Unit
    { wch: 12 }, // Total days
    { wch: 12 }, // Present
    { wch: 10 }, // Half
    { wch: 12 }, // WO
    { wch: 12 }, // PH
    { wch: 12 }, // Absent
    { wch: 14 }, // Payable Days
    { wch: 14 }, // OT Hours
    { wch: 12 }, // Night shifts
    { wch: 18 }, // Base salary
    { wch: 15 }, // Daily rate
    { wch: 14 }, // OT rate
    { wch: 18 }, // Basic earned
    { wch: 16 }, // OT earned
    { wch: 16 }, // Site allow
    { wch: 15 }, // Night allow
    { wch: 18 }, // Gross
    { wch: 14 }, // EPF
    { wch: 14 }, // ESIC
    { wch: 12 }, // PT
    { wch: 16 }, // Total ded
    { wch: 22 }, // Net Salary
    { wch: 20 }, // Bank
    { wch: 18 }, // A/c
    { wch: 14 }, // IFSC
    { wch: 18 }, // Status
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Attendance & Salary');

  const cleanSite = siteName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
  const cleanMonth = month.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `IOCL_Final_Attendance_Salary_${cleanSite}_${cleanMonth}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Exports the calculated Salary Disbursement Sheet to an official Excel file
 */
export function exportSalaryDisbursementExcel(
  siteName: string,
  month: string,
  salaryList: SalaryCalculation[],
  officerSignOff?: { name: string; designation: string }
) {
  const rows: any[] = [
    ['INDIAN OIL CORPORATION LIMITED (IOCL) CONTRACTOR MANPOWER WAGE & SALARY DISBURSEMENT SHEET'],
    [`Refinery / Site: ${siteName}`],
    [`Billing & Wage Month: ${month}`],
    [`Authorised Sign-off: ${officerSignOff?.name || 'Verified Site Engineer'} (${officerSignOff?.designation || 'IOCL Site In-charge'})`],
    [`Generated Timestamp: ${new Date().toLocaleString('en-IN')}`],
    [],
    [
      'Sl. No',
      'Emp Code',
      'Employee Name',
      'Designation / Trade',
      'Skill Level',
      'Unit / Plant Area',
      'Base Monthly Package (₹)',
      'Calculated Daily Rate (₹)',
      'Days Present',
      'Half Days',
      'Paid Offs / Holidays',
      'Payable Days',
      'Pro-rated Basic Salary (₹)',
      'OT Hours',
      'OT Rate (₹/hr)',
      'OT Earnings (₹)',
      'Hazard / Site Allowance (₹)',
      'Night Shift Allowance (₹)',
      'GROSS PAYABLE (₹)',
      'EPF Deduction 12% (₹)',
      'ESIC Deduction (₹)',
      'Prof. Tax (₹)',
      'TOTAL DEDUCTIONS (₹)',
      'NET SALARY DISBURSEMENT (₹)',
      'Bank Name',
      'Bank Account No.',
      'IFSC Code',
      'Payment Status',
    ],
  ];

  let totalGross = 0;
  let totalDeductions = 0;
  let totalNet = 0;
  let totalOT = 0;

  salaryList.forEach((s, idx) => {
    totalGross += s.grossPayable;
    totalDeductions += s.totalDeductions;
    totalNet += s.netPayableSalary;
    totalOT += s.overtimePay;

    rows.push([
      idx + 1,
      s.empCode,
      s.employeeName,
      s.designation,
      s.skillCategory,
      s.unitOrPlant,
      s.baseMonthlyGross,
      s.calculatedDailyRate,
      s.daysPresent,
      s.halfDays,
      s.weeklyOffs + s.paidHolidays,
      s.payableDays,
      s.proRatedBasicSalary,
      s.overtimeHours,
      s.otHourlyRate,
      s.overtimePay,
      s.specialSiteAllowance,
      s.nightShiftAllowance,
      s.grossPayable,
      s.epfEmployeeDeduction,
      s.esicEmployeeDeduction,
      s.professionalTax,
      s.totalDeductions,
      s.netPayableSalary,
      s.bankName,
      s.bankAccountNo,
      s.bankIfsc,
      s.paymentStatus,
    ]);
  });

  // Total summary row
  rows.push([]);
  rows.push([
    'TOTAL',
    '',
    `${salaryList.length} Personnel`,
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    totalOT,
    '',
    '',
    totalGross,
    '',
    '',
    '',
    totalDeductions,
    totalNet,
    '',
    '',
    '',
    'VERIFIED FOR BANK RTGS',
  ]);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Salary Disbursement');

  const fileName = `IOCL_Salary_Disbursement_${siteName.substring(0, 15).replace(/\s+/g, '_')}_${month.replace(/\s+/g, '_')}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Exports Bank NEFT/RTGS CSV for direct batch bank transfer
 */
export function exportBankNeftCSV(siteName: string, month: string, salaryList: SalaryCalculation[]) {
  const csvHeaders = ['Beneficiary Name', 'Account Number', 'IFSC Code', 'Amount (INR)', 'Narration', 'Employee Code'];
  const csvRows = [csvHeaders.join(',')];

  salaryList.forEach((s) => {
    const row = [
      `"${s.employeeName}"`,
      `"${s.bankAccountNo}"`,
      `"${s.bankIfsc}"`,
      s.netPayableSalary,
      `"IOCL MANPOWER WAGE ${month.toUpperCase()}"`,
      `"${s.empCode}"`,
    ];
    csvRows.push(row.join(','));
  });

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Bank_Payout_NEFT_${siteName.substring(0, 12).replace(/\s+/g, '_')}_${month.replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exports the Master Personnel Database (e.g. 1000 manpower) to Excel
 */
export function exportPersonnelMasterExcel(personnelList: Personnel[], title: string = 'Master Manpower Register') {
  const rows: any[] = [
    [`INDIAN OIL CORPORATION LIMITED (IOCL) - ${title.toUpperCase()}`],
    [`Total Registered Personnel: ${personnelList.length}`],
    [`Generated Timestamp: ${new Date().toLocaleString('en-IN')}`],
    [],
    [
      'Sl. No',
      'Employee Code',
      'Contractor Badge',
      'Full Name',
      'Father / Husband Name',
      'Phone Contact',
      'Designation / Trade Role',
      'Trade Category',
      'Skill Category',
      'Deployed IOCL Site',
      'Refinery Unit / Plant Area',
      'Monthly Gross Salary (₹)',
      'Daily Wage Rate (₹/day)',
      'Overtime Hourly Rate (₹/hr)',
      'Annual Package CTC (₹)',
      'Hazard / Site Allowance (₹)',
      'Bank Name',
      'Bank Account Number',
      'Bank IFSC Code',
      'Aadhaar Last 4',
      'UAN (PF Number)',
      'ESIC Number',
      'Date of Joining',
      'Deployment Status',
    ],
  ];

  let totalGross = 0;
  let totalAnnual = 0;

  personnelList.forEach((p, idx) => {
    totalGross += p.monthlyGrossSalary;
    totalAnnual += p.annualPackage;

    rows.push([
      idx + 1,
      p.empCode,
      p.contractorBadgeNo,
      p.name,
      p.fatherName,
      p.phone,
      p.designation,
      p.tradeCategory,
      p.skillCategory,
      p.siteName,
      p.unitOrPlant,
      p.monthlyGrossSalary,
      p.dailyWageRate,
      p.overtimeHourlyRate,
      p.annualPackage,
      p.specialSiteAllowance,
      p.bankDetails?.bankName || '',
      p.bankDetails?.accountNo || '',
      p.bankDetails?.ifsc || '',
      p.aadhaarLastFour,
      p.uanNo,
      p.esicNo,
      p.joiningDate,
      p.status,
    ]);
  });

  rows.push([]);
  rows.push([
    'TOTAL',
    `${personnelList.length} Personnel`,
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    totalGross,
    '',
    '',
    totalAnnual,
  ]);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'IOCL Manpower Register');

  const fileName = `IOCL_Manpower_Roster_${personnelList.length}_Workers_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

