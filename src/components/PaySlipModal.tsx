import { FC } from 'react';
import { SalaryCalculation } from '../types';
import { formatINR } from '../utils/salaryCalculator';
import { X, Printer, ShieldCheck, Fuel, CheckCircle, Download } from 'lucide-react';

interface PaySlipModalProps {
  salary: SalaryCalculation | null;
  onClose: () => void;
  month: string;
}

export const PaySlipModal: FC<PaySlipModalProps> = ({ salary, onClose, month }) => {
  if (!salary) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden my-6 border border-slate-200">
        {/* Top Control Bar (Hidden when printed) */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3 flex items-center justify-between no-print">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-400">
            <Fuel className="w-4 h-4 text-orange-500" />
            IOCL Contractor Workforce • Monthly Wage Slip
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg shadow transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Official Printable Slip Container */}
        <div className="p-6 sm:p-8 space-y-6 text-xs sm:text-sm">
          {/* Slip Header */}
          <div className="text-center border-b-2 border-slate-800 pb-4">
            <div className="text-xs uppercase font-bold text-amber-700 tracking-wider">
              INDIAN OIL CORPORATION LIMITED (IOCL)
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 uppercase">
              Contractor Manpower Pay Slip
            </h2>
            <p className="text-xs font-semibold text-slate-600">
              Deployed Site: {salary.siteName}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Wage Month: <strong className="text-slate-800">{month}</strong> • Standard Form XIX under Contract Labour (R&A) Act
            </p>
          </div>

          {/* Personnel & Deployment Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500">Employee Name:</span>{' '}
              <strong className="text-slate-900 text-sm block">{salary.employeeName}</strong>
            </div>
            <div>
              <span className="text-slate-500">Employee Code / ID:</span>{' '}
              <strong className="font-mono text-amber-700 block">{salary.empCode}</strong>
            </div>
            <div>
              <span className="text-slate-500">Designation / Trade:</span>{' '}
              <span className="font-semibold text-slate-800 block">{salary.designation}</span>
            </div>
            <div>
              <span className="text-slate-500">Skill Category:</span>{' '}
              <span className="font-semibold text-slate-800 block">{salary.skillCategory}</span>
            </div>
            <div>
              <span className="text-slate-500">Deployed IOCL Unit:</span>{' '}
              <span className="font-semibold text-slate-800 block">{salary.unitOrPlant}</span>
            </div>
            <div>
              <span className="text-slate-500">Bank Disbursement:</span>{' '}
              <span className="font-mono text-slate-800 block">{salary.bankName} (A/C: {salary.bankAccountNo})</span>
            </div>
          </div>

          {/* Verified Attendance Record */}
          <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/80 text-xs">
            <div className="font-bold text-amber-900 mb-1.5 uppercase text-[11px]">
              IOCL Site Verified Attendance
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-white p-2 rounded border border-amber-100">
                <div className="text-[10px] text-slate-500">Month Days</div>
                <div className="font-bold text-slate-900">{salary.totalMonthDays}</div>
              </div>
              <div className="bg-white p-2 rounded border border-amber-100">
                <div className="text-[10px] text-slate-500">Days Present</div>
                <div className="font-bold text-emerald-700">{salary.daysPresent}</div>
              </div>
              <div className="bg-white p-2 rounded border border-amber-100">
                <div className="text-[10px] text-slate-500">Paid Offs/Holidays</div>
                <div className="font-bold text-slate-900">{salary.weeklyOffs + salary.paidHolidays}</div>
              </div>
              <div className="bg-white p-2 rounded border border-amber-100">
                <div className="text-[10px] text-slate-500">OT Hours</div>
                <div className="font-bold text-orange-600">{salary.overtimeHours} hrs</div>
              </div>
            </div>
          </div>

          {/* Earnings & Deductions Tables */}
          <div className="grid grid-cols-2 gap-4">
            {/* Earnings */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100 font-bold px-3 py-2 text-slate-800 border-b border-slate-200 text-xs">
                EARNINGS (GROSS)
              </div>
              <div className="p-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Base Monthly Package:</span>
                  <span className="font-medium text-slate-900">{formatINR(salary.baseMonthlyGross)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Pro-Rated Basic Wage:</span>
                  <span className="font-semibold text-slate-900">{formatINR(salary.proRatedBasicSalary)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Overtime Wages ({salary.overtimeHours}h):</span>
                  <span className="font-semibold text-amber-700">{formatINR(salary.overtimePay)}</span>
                </div>
                {salary.specialSiteAllowance > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Hazard / Site Allowance:</span>
                    <span className="font-medium text-slate-900">{formatINR(salary.specialSiteAllowance)}</span>
                  </div>
                )}
                {salary.nightShiftAllowance > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Night Shift Allowance:</span>
                    <span className="font-medium text-slate-900">{formatINR(salary.nightShiftAllowance)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                  <span>Gross Earnings:</span>
                  <span>{formatINR(salary.grossPayable)}</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100 font-bold px-3 py-2 text-slate-800 border-b border-slate-200 text-xs">
                DEDUCTIONS (STATUTORY)
              </div>
              <div className="p-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">EPF Employee (12%):</span>
                  <span className="font-medium text-red-600">{formatINR(salary.epfEmployeeDeduction)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">ESIC Employee:</span>
                  <span className="font-medium text-red-600">{formatINR(salary.esicEmployeeDeduction)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Professional Tax (PT):</span>
                  <span className="font-medium text-red-600">{formatINR(salary.professionalTax)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-red-700">
                  <span>Total Deductions:</span>
                  <span>{formatINR(salary.totalDeductions)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* NET TAKE HOME SALARY BOX */}
          <div className="bg-emerald-50 border-2 border-emerald-500/40 p-4 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                Net Salary Payable (In Hand)
              </div>
              <div className="text-2xl font-black text-emerald-700 mt-0.5">
                {formatINR(salary.netPayableSalary)}
              </div>
            </div>
            <div className="text-right text-xs text-slate-600">
              <div>Direct Bank Credit (NEFT/RTGS)</div>
              <div className="font-mono font-semibold text-slate-800">IFSC: {salary.bankIfsc}</div>
            </div>
          </div>

          {/* Signatures & Seal */}
          <div className="pt-8 flex items-center justify-between text-xs text-slate-500 border-t border-slate-200">
            <div className="text-center">
              <div className="h-10"></div>
              <div className="border-t border-slate-400 pt-1 font-semibold text-slate-700">
                Authorized Signature (Contractor)
              </div>
            </div>

            <div className="text-center">
              <div className="text-[10px] text-emerald-700 font-bold mb-1">
                ✓ VERIFIED AT IOCL SITE
              </div>
              <div className="border-t border-slate-400 pt-1 font-semibold text-slate-700">
                IOCL Site Engineer / Officer Sign & Stamp
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
