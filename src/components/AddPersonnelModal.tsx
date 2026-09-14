import { FC, useState, useEffect, FormEvent } from 'react';
import { Personnel, IOCLSite, SkillCategory, WageType } from '../types';
import { X, UserPlus, Save, Building2, CreditCard, DollarSign } from 'lucide-react';

interface AddPersonnelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (person: Personnel) => void;
  initialPersonnel?: Personnel | null;
  sitesList: IOCLSite[];
}

export const AddPersonnelModal: FC<AddPersonnelModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPersonnel,
  sitesList,
}) => {
  const [empCode, setEmpCode] = useState('');
  const [contractorBadgeNo, setContractorBadgeNo] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');
  const [tradeCategory, setTradeCategory] = useState('Mechanical');
  const [skillCategory, setSkillCategory] = useState<SkillCategory>('Skilled');
  const [siteId, setSiteId] = useState(sitesList[0]?.id || '');
  const [unitOrPlant, setUnitOrPlant] = useState('FCCU & Main Distillation Unit');
  const [monthlyGrossSalary, setMonthlyGrossSalary] = useState<number>(28000);
  const [annualPackage, setAnnualPackage] = useState<number>(336000);
  const [dailyWageRate, setDailyWageRate] = useState<number>(1076);
  const [overtimeHourlyRate, setOvertimeHourlyRate] = useState<number>(200);
  const [pfApplicable, setPfApplicable] = useState(true);
  const [esicApplicable, setEsicApplicable] = useState(false);
  const [specialSiteAllowance, setSpecialSiteAllowance] = useState<number>(1500);
  const [bankName, setBankName] = useState('State Bank of India');
  const [accountNo, setAccountNo] = useState('');
  const [ifsc, setIfsc] = useState('SBIN0001234');
  const [aadhaarLastFour, setAadhaarLastFour] = useState('1234');

  useEffect(() => {
    if (initialPersonnel) {
      setEmpCode(initialPersonnel.empCode);
      setContractorBadgeNo(initialPersonnel.contractorBadgeNo);
      setName(initialPersonnel.name);
      setPhone(initialPersonnel.phone);
      setDesignation(initialPersonnel.designation);
      setTradeCategory(initialPersonnel.tradeCategory);
      setSkillCategory(initialPersonnel.skillCategory);
      setSiteId(initialPersonnel.siteId);
      setUnitOrPlant(initialPersonnel.unitOrPlant);
      setMonthlyGrossSalary(initialPersonnel.monthlyGrossSalary);
      setAnnualPackage(initialPersonnel.annualPackage);
      setDailyWageRate(initialPersonnel.dailyWageRate);
      setOvertimeHourlyRate(initialPersonnel.overtimeHourlyRate);
      setPfApplicable(initialPersonnel.pfApplicable);
      setEsicApplicable(initialPersonnel.esicApplicable);
      setSpecialSiteAllowance(initialPersonnel.specialSiteAllowance);
      setBankName(initialPersonnel.bankDetails.bankName);
      setAccountNo(initialPersonnel.bankDetails.accountNo);
      setIfsc(initialPersonnel.bankDetails.ifsc);
      setAadhaarLastFour(initialPersonnel.aadhaarLastFour);
    } else {
      // Auto-generate code
      const rand = Math.floor(100 + Math.random() * 900);
      setEmpCode(`IOCL-CTR-${rand}`);
      setContractorBadgeNo(`CTR-BDG-${rand + 1000}`);
      setName('');
      setPhone('+91 98');
      setDesignation('Mechanical Fitter');
      setMonthlyGrossSalary(28000);
      setAnnualPackage(336000);
      setDailyWageRate(1076);
      setOvertimeHourlyRate(200);
      setAccountNo(`3099${rand}8821`);
    }
  }, [initialPersonnel, isOpen]);

  if (!isOpen) return null;

  const handleSalaryChange = (monthly: number) => {
    setMonthlyGrossSalary(monthly);
    setAnnualPackage(monthly * 12);
    const daily = Math.round(monthly / 26);
    setDailyWageRate(daily);
    setOvertimeHourlyRate(Math.round((daily / 8) * 2));
    if (monthly <= 21000) {
      setEsicApplicable(true);
    } else {
      setEsicApplicable(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const siteObj = sitesList.find((s) => s.id === siteId);

    const person: Personnel = {
      id: initialPersonnel ? initialPersonnel.id : `p-${Date.now()}`,
      empCode: empCode.trim(),
      contractorBadgeNo: contractorBadgeNo.trim(),
      name: name.trim(),
      fatherName: 'Father Name',
      phone: phone.trim(),
      designation: designation.trim(),
      tradeCategory,
      skillCategory,
      siteId,
      siteName: siteObj?.name || 'Indian Oil Site',
      unitOrPlant: unitOrPlant.trim(),
      monthlyGrossSalary,
      annualPackage,
      wageType: 'MONTHLY_FIXED',
      dailyWageRate,
      overtimeHourlyRate,
      pfApplicable,
      esicApplicable,
      professionalTax: 150,
      specialSiteAllowance,
      bankDetails: {
        accountNo: accountNo.trim() || '1234567890',
        ifsc: ifsc.trim() || 'SBIN0001234',
        bankName: bankName.trim(),
        accountHolder: name.trim(),
      },
      aadhaarLastFour: aadhaarLastFour.trim() || '9999',
      uanNo: '100' + Math.floor(100000000 + Math.random() * 900000000),
      esicNo: esicApplicable ? '210' + Math.floor(1000000 + Math.random() * 9000000) : 'NA',
      joiningDate: initialPersonnel ? initialPersonnel.joiningDate : new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
    };

    onSave(person);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 text-slate-900 rounded-xl shadow-xl overflow-hidden my-6">
        {/* Header */}
        <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-700">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {initialPersonnel ? 'Edit Deployed Personnel' : 'Deploy Personnel to Indian Oil Site'}
              </h3>
              <p className="text-xs text-slate-500">Record deployment profile and statutory wage structure</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
          {/* Section 1: Basic Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-slate-700 font-semibold">Employee ID / Code *</label>
              <input
                type="text"
                required
                value={empCode}
                onChange={(e) => setEmpCode(e.target.value)}
                placeholder="e.g. IOCL-PNP-109"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:border-slate-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold">IOCL Contractor Badge *</label>
              <input
                type="text"
                required
                value={contractorBadgeNo}
                onChange={(e) => setContractorBadgeNo(e.target.value)}
                placeholder="e.g. CTR-BDG-8829"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:border-slate-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rajesh Kumar"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-slate-700 font-semibold">Designation / Role *</label>
              <input
                type="text"
                required
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. HSE Officer / Argon Welder"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold">Trade Category</label>
              <select
                value={tradeCategory}
                onChange={(e) => setTradeCategory(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-hidden"
              >
                <option value="Mechanical">Mechanical</option>
                <option value="Electrical">Electrical</option>
                <option value="Instrumentation">Instrumentation</option>
                <option value="Safety">Safety & HSE</option>
                <option value="Civil">Civil & Scaffolding</option>
                <option value="Operations">Operations</option>
                <option value="Security">Security & Logistics</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold">Skill Level</label>
              <select
                value={skillCategory}
                onChange={(e) => setSkillCategory(e.target.value as SkillCategory)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-hidden"
              >
                <option value="Highly Skilled">Highly Skilled</option>
                <option value="Skilled">Skilled</option>
                <option value="Semi-Skilled">Semi-Skilled</option>
                <option value="Unskilled">Unskilled</option>
              </select>
            </div>
          </div>

          {/* Section 2: Deployment Site & IOCL Plant Unit */}
          <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-700 font-semibold flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-orange-600" />
                Deployed Indian Oil Site *
              </label>
              <select
                value={siteId}
                onChange={(e) => setSiteId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-hidden"
              >
                {sitesList.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name} ({site.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold">IOCL Plant / Unit Area *</label>
              <input
                type="text"
                required
                value={unitOrPlant}
                onChange={(e) => setUnitOrPlant(e.target.value)}
                placeholder="e.g. FCCU Unit, CDU-II, Tank Farm 4"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Section 3: Salary & Annual Package */}
          <div className="pt-2 border-t border-slate-200 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-1.5 text-slate-900 font-bold">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Salary & Annual Package (CTC)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-slate-700 font-semibold">Monthly Gross Salary (₹) *</label>
                <input
                  type="number"
                  required
                  min="5000"
                  step="500"
                  value={monthlyGrossSalary}
                  onChange={(e) => handleSalaryChange(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold text-sm focus:border-slate-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-semibold">Annual Package / CTC (₹)</label>
                <input
                  type="number"
                  readOnly
                  value={annualPackage}
                  className="w-full bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-emerald-800 font-bold text-sm cursor-not-allowed"
                />
                <div className="text-[10px] text-slate-500">
                  (₹{(annualPackage / 100000).toFixed(2)} Lakhs per annum)
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-semibold">Daily Wage Rate (₹)</label>
                <input
                  type="number"
                  value={dailyWageRate}
                  onChange={(e) => setDailyWageRate(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:border-slate-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-slate-600">Overtime Rate (₹/hr)</label>
                <input
                  type="number"
                  value={overtimeHourlyRate}
                  onChange={(e) => setOvertimeHourlyRate(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-mono focus:border-slate-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600">Special Hazard Allowance (₹)</label>
                <input
                  type="number"
                  value={specialSiteAllowance}
                  onChange={(e) => setSpecialSiteAllowance(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-mono focus:border-slate-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-4 pt-4">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={pfApplicable}
                    onChange={(e) => setPfApplicable(e.target.checked)}
                    className="rounded border-slate-300 text-slate-900 focus:ring-0"
                  />
                  <span className="font-medium">12% EPF</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={esicApplicable}
                    onChange={(e) => setEsicApplicable(e.target.checked)}
                    className="rounded border-slate-300 text-slate-900 focus:ring-0"
                  />
                  <span className="font-medium">ESIC Eligible</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 4: Bank Details */}
          <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-slate-700 font-semibold flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                Bank Name
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. State Bank of India"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold">Account Number</label>
              <input
                type="text"
                value={accountNo}
                onChange={(e) => setAccountNo(e.target.value)}
                placeholder="e.g. 30998821104"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:border-slate-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold">IFSC Code</label>
              <input
                type="text"
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value)}
                placeholder="e.g. SBIN0001234"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono uppercase focus:border-slate-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium border border-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-xs active:scale-98 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{initialPersonnel ? 'Update Personnel' : 'Save & Deploy'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
