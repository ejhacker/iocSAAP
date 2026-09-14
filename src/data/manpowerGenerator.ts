import { IOCLSite, Personnel, AttendanceRecord, SkillCategory, WageType } from '../types';

// Authentic first names, middle names, and last names across India
const FIRST_NAMES = [
  'Rameshwar', 'Manoj', 'Brijendra', 'Radhe Mohan', 'Satendra', 'Hari Om', 'Dharmendra', 'Pankaj',
  'Sunil', 'Rajesh', 'Vikram', 'Mahendra', 'Suresh', 'Anand', 'Dilip', 'Arvind', 'Subhash', 'Pradeep',
  'Bikash', 'Arindam', 'Debashis', 'Tapas', 'Girish', 'Kamlesh', 'Nitesh', 'Bhavesh', 'Chetan', 'Paresh',
  'Hasmukh', 'Alok', 'Sachin', 'Santosh', 'Vinod', 'Deepak', 'Mukesh', 'Ashok', 'Sanjay', 'Ajay',
  'Virendra', 'Surendra', 'Govind', 'Gopal', 'Naresh', 'Kailash', 'Mohan', 'Lalit', 'Jitendra', 'Hemant',
  'Chandan', 'Amit', 'Sumit', 'Ravi', 'Pawan', 'Kishore', 'Gautam', 'Kunal', 'Manish', 'Devendra',
  'Babulal', 'Jagdish', 'Nand Kishore', 'Om Prakash', 'Shyam', 'Trilochan', 'Bibhuti', 'Sourav', 'Chirag'
];

const LAST_NAMES = [
  'Singh', 'Sharma', 'Verma', 'Yadav', 'Chauhan', 'Kushwaha', 'Patel', 'Pandey', 'Mishra', 'Tiwari',
  'Shukla', 'Dubey', 'Mohanty', 'Panda', 'Das', 'Swain', 'Behera', 'Pradhan', 'Nayak', 'Ghosh',
  'Mandal', 'Chakraborty', 'Banerjee', 'Deshmukh', 'Jadhav', 'Shinde', 'Patil', 'Kadam', 'Pawar',
  'Rathore', 'Gehlot', 'Solanki', 'Meena', 'Gurjar', 'Rawat', 'Negi', 'Bhatt', 'Joshi', 'Gupta',
  'Agarwal', 'Bansal', 'Goyal', 'Soni', 'Chopra', 'Malhotra', 'Bhatia', 'Kohli', 'Sethi', 'Narang'
];

const FATHER_PREFIXES = ['Late', 'Shri', 'Shri', 'Shri'];

const TRADES_AND_ROLES: {
  designation: string;
  trade: string;
  skill: SkillCategory;
  baseSalaryMin: number;
  baseSalaryMax: number;
  hazardAllowance: number;
}[] = [
  { designation: 'Senior HSE Safety Officer', trade: 'Safety', skill: 'Highly Skilled', baseSalaryMin: 46000, baseSalaryMax: 54000, hazardAllowance: 3500 },
  { designation: 'HSE Safety Supervisor', trade: 'Safety', skill: 'Skilled', baseSalaryMin: 32000, baseSalaryMax: 38000, hazardAllowance: 2500 },
  { designation: 'Fire & Gas Safety Watchman', trade: 'Safety', skill: 'Semi-Skilled', baseSalaryMin: 23000, baseSalaryMax: 27000, hazardAllowance: 2000 },
  { designation: 'Argon 6G High-Pressure Welder', trade: 'Mechanical', skill: 'Highly Skilled', baseSalaryMin: 38000, baseSalaryMax: 45000, hazardAllowance: 3000 },
  { designation: 'ARC & MIG Certified Welder', trade: 'Mechanical', skill: 'Skilled', baseSalaryMin: 29000, baseSalaryMax: 34000, hazardAllowance: 2000 },
  { designation: 'Pipe Fabricator & Layout Specialist', trade: 'Mechanical', skill: 'Skilled', baseSalaryMin: 31000, baseSalaryMax: 36000, hazardAllowance: 2000 },
  { designation: 'Millwright Fitter (Turbines & Pumps)', trade: 'Mechanical', skill: 'Highly Skilled', baseSalaryMin: 37000, baseSalaryMax: 43000, hazardAllowance: 2500 },
  { designation: 'Flange & High-Pressure Gasket Fitter', trade: 'Mechanical', skill: 'Skilled', baseSalaryMin: 28000, baseSalaryMax: 33000, hazardAllowance: 1800 },
  { designation: 'Mechanical General Assistant / Fitter Helper', trade: 'Mechanical', skill: 'Unskilled', baseSalaryMin: 18500, baseSalaryMax: 21500, hazardAllowance: 1200 },
  { designation: 'Class-I Boiler Attendant', trade: 'Operations', skill: 'Highly Skilled', baseSalaryMin: 40000, baseSalaryMax: 47000, hazardAllowance: 3000 },
  { designation: 'Class-II Boiler Attendant', trade: 'Operations', skill: 'Skilled', baseSalaryMin: 30000, baseSalaryMax: 35000, hazardAllowance: 2200 },
  { designation: 'HT Substation Electrician & Cable Jointer', trade: 'Electrical', skill: 'Skilled', baseSalaryMin: 31000, baseSalaryMax: 36000, hazardAllowance: 2500 },
  { designation: 'Electrical Panel Maintenance Wireman', trade: 'Electrical', skill: 'Skilled', baseSalaryMin: 28000, baseSalaryMax: 32000, hazardAllowance: 1800 },
  { designation: 'Electrical Helper / Cable Puller', trade: 'Electrical', skill: 'Unskilled', baseSalaryMin: 18500, baseSalaryMax: 21000, hazardAllowance: 1200 },
  { designation: 'DCS / PLC Instrumentation Technician', trade: 'Instrumentation', skill: 'Highly Skilled', baseSalaryMin: 39000, baseSalaryMax: 46000, hazardAllowance: 2800 },
  { designation: 'Control Valve Calibration Specialist', trade: 'Instrumentation', skill: 'Skilled', baseSalaryMin: 32000, baseSalaryMax: 37000, hazardAllowance: 2200 },
  { designation: 'Heavy Rigging Supervisor (300T Crane)', trade: 'Civil & Rigging', skill: 'Highly Skilled', baseSalaryMin: 38000, baseSalaryMax: 44000, hazardAllowance: 3000 },
  { designation: 'Certified Scaffold Erector (Cuplock/Tubular)', trade: 'Civil & Rigging', skill: 'Skilled', baseSalaryMin: 27000, baseSalaryMax: 31000, hazardAllowance: 2500 },
  { designation: 'Rigger & Material Sling Handler', trade: 'Civil & Rigging', skill: 'Semi-Skilled', baseSalaryMin: 22000, baseSalaryMax: 26000, hazardAllowance: 1800 },
  { designation: 'NDT Level-II Radiography & Ultrasonic Tech', trade: 'Quality', skill: 'Highly Skilled', baseSalaryMin: 42000, baseSalaryMax: 49000, hazardAllowance: 2500 },
  { designation: 'Hydro-Jetting & Hydro-Testing Operator', trade: 'Mechanical', skill: 'Skilled', baseSalaryMin: 29000, baseSalaryMax: 34000, hazardAllowance: 2400 },
  { designation: 'Insulation & Cladding Applicator', trade: 'Civil & Rigging', skill: 'Semi-Skilled', baseSalaryMin: 22000, baseSalaryMax: 25000, hazardAllowance: 1500 },
  { designation: 'Industrial Sandblaster & Airless Painter', trade: 'Civil & Rigging', skill: 'Semi-Skilled', baseSalaryMin: 23000, baseSalaryMax: 26000, hazardAllowance: 1600 },
  { designation: 'General Refinery Maintenance Labour', trade: 'Civil & Rigging', skill: 'Unskilled', baseSalaryMin: 18500, baseSalaryMax: 21000, hazardAllowance: 1200 },
  { designation: 'Tank Cleaning & Confined Space Attendant', trade: 'Operations', skill: 'Semi-Skilled', baseSalaryMin: 24000, baseSalaryMax: 28000, hazardAllowance: 2800 },
];

const REFINERY_UNITS: Record<string, string[]> = {
  'site-panipat': [
    'FCCU Unit (Fluidized Catalytic Cracking)',
    'Crude Distillation Unit (CDU-I)',
    'Vacuum Distillation Unit (VDU-II)',
    'Naphtha Cracker Complex (NCU)',
    'Continuous Catalytic Reforming Unit (CCRU)',
    'Diesel Hydrotreating Unit (DHDT)',
    'Sulphur Recovery Unit (SRU-III)',
    'Offsite Tank Farm & Dispatch Gantry',
    'Captive Power Plant (CPP-2)',
    'Effluent Treatment Plant (ETP)'
  ],
  'site-mathura': [
    'AVU Crude Distillation Block',
    'Diesel Hydrodesulphurisation (DHDS)',
    'Fluid Catalytic Cracking Unit (FCCU)',
    'Bitumen Blowing Unit (BBU)',
    'Visbreaker & Coker Unit',
    'Hydrogen Generation Unit (HGU)',
    'LPG Bottling & Storage Sphere Zone',
    'Railway Loading Gantry (TLG)'
  ],
  'site-paradip': [
    'Atmospheric & Vacuum Distillation Unit (AVU)',
    'Indmax FCC Unit (High Propylene)',
    'Delayed Coker Unit (DCU)',
    'VGO Hydrotreater Unit (VGOHDT)',
    'Motor Spirit Quality Upgradation Unit (MSQU)',
    'Single Point Mooring (SPM) Crude Terminal',
    'South Jetty Crude Pipeline Corridor',
    'Coke Drum Structure Rigging Zone'
  ],
  'site-koyali': [
    'Crude Distillation Unit (CDU-V)',
    'Hydrocracker Unit (HCU)',
    'Isomerization Unit (ISOM)',
    'Heavy Oil Processing Unit',
    'Sulphur Recovery & Amine Unit',
    'Pipelines Pumping Station (Koyali-Ahmedabad)'
  ],
  'site-mumbai-terminal': [
    'Aviation Fuel Hydrant Station (CSMIA)',
    'Marine Tanker Discharge Jetty (Sewree)',
    'Automatic High-Speed Rail Gantry',
    'LPG Bulk Storage Mounded Bullets',
    'Petrochemical Drums Warehouse & Dispatch'
  ]
};

const BANKS = [
  { name: 'State Bank of India', ifsc: 'SBIN000', digits: 11 },
  { name: 'Punjab National Bank', ifsc: 'PUNB0', digits: 16 },
  { name: 'Bank of Baroda', ifsc: 'BARB0', digits: 14 },
  { name: 'Canara Bank', ifsc: 'CNRB000', digits: 13 },
  { name: 'HDFC Bank', ifsc: 'HDFC000', digits: 14 },
  { name: 'Union Bank of India', ifsc: 'UBIN0', digits: 15 },
  { name: 'ICICI Bank', ifsc: 'ICIC000', digits: 12 },
];

/**
 * Generates deterministic 1,000 manpower personnel records across 5 IOCL sites
 */
export function generate1000Manpower(sites: IOCLSite[]): Personnel[] {
  const distribution: { siteId: string; prefix: string; count: number }[] = [
    { siteId: 'site-panipat', prefix: 'PNP', count: 350 },
    { siteId: 'site-mathura', prefix: 'MTH', count: 250 },
    { siteId: 'site-paradip', prefix: 'PDP', count: 200 },
    { siteId: 'site-koyali', prefix: 'KYL', count: 120 },
    { siteId: 'site-mumbai-terminal', prefix: 'MUM', count: 80 },
  ];

  const allPersonnel: Personnel[] = [];
  let globalIndex = 1;

  distribution.forEach(({ siteId, prefix, count }) => {
    const site = sites.find(s => s.id === siteId) || sites[0];
    const unitList = REFINERY_UNITS[siteId] || REFINERY_UNITS['site-panipat'];

    for (let i = 1; i <= count; i++) {
      const codeNumber = 1000 + i;
      const empCode = `IOCL-${prefix}-${codeNumber}`;
      const contractorBadgeNo = `CTR-${prefix}-${4000 + i}`;

      // Pick name deterministically
      const fnIdx = (globalIndex * 7 + i * 3) % FIRST_NAMES.length;
      const lnIdx = (globalIndex * 11 + i * 5) % LAST_NAMES.length;
      const fFatherIdx = (globalIndex * 13 + i * 7) % FIRST_NAMES.length;
      const fatherPrefix = FATHER_PREFIXES[i % FATHER_PREFIXES.length];

      const name = `${FIRST_NAMES[fnIdx]} ${LAST_NAMES[lnIdx]}`;
      const fatherName = `${fatherPrefix} ${FIRST_NAMES[fFatherIdx]} ${LAST_NAMES[lnIdx]}`;

      // Phone
      const phoneDigits = String(7000000000 + ((globalIndex * 9876543) % 2999999999));
      const phone = `+91 ${phoneDigits.slice(0, 5)} ${phoneDigits.slice(5)}`;

      // Trade & Role
      const roleConfig = TRADES_AND_ROLES[(i + globalIndex) % TRADES_AND_ROLES.length];
      const unit = unitList[i % unitList.length];

      // Salary calculation
      const salarySpread = (globalIndex * 100) % (roleConfig.baseSalaryMax - roleConfig.baseSalaryMin);
      const monthlyGrossSalary = Math.round((roleConfig.baseSalaryMin + salarySpread) / 500) * 500;
      const annualPackage = monthlyGrossSalary * 12;
      const dailyWageRate = Math.round(monthlyGrossSalary / 26);
      const overtimeHourlyRate = Math.round((dailyWageRate / 8) * 2); // Double rate under Factories Act
      const pfApplicable = true;
      const esicApplicable = monthlyGrossSalary <= 21000;
      const specialSiteAllowance = roleConfig.hazardAllowance;
      const professionalTax = 200;

      // Bank details
      const bankConfig = BANKS[(i + globalIndex) % BANKS.length];
      const bankAcSuffix = String(1000000000 + ((i * 876543 + globalIndex * 12345) % 8999999999));
      const accountNo = bankAcSuffix.padStart(bankConfig.digits, '3');
      const ifsc = `${bankConfig.ifsc}${String(1000 + (i % 900))}`;

      // Aadhaar, UAN, ESIC
      const aadhaarLastFour = String(1000 + ((i * 91 + globalIndex * 37) % 9000));
      const uanNo = `1009${String(10000000 + ((globalIndex * 4321 + i * 789) % 89999999))}`;
      const esicNo = esicApplicable ? `2100${String(1000000000000 + i * 4567)}`.slice(0, 17) : 'NA';

      // Joining date between 2022 and 2026
      const joinYear = 2022 + (i % 5);
      const joinMonth = String(1 + (i % 12)).padStart(2, '0');
      const joinDay = String(1 + (i % 28)).padStart(2, '0');
      const joiningDate = `${joinYear}-${joinMonth}-${joinDay}`;

      // Status
      const status = i % 45 === 0 ? 'ON_LEAVE' : 'ACTIVE';

      allPersonnel.push({
        id: `p-${1000 + globalIndex}`,
        empCode,
        contractorBadgeNo,
        name,
        fatherName,
        phone,
        designation: roleConfig.designation,
        tradeCategory: roleConfig.trade,
        skillCategory: roleConfig.skill,
        siteId: site.id,
        siteName: site.name,
        unitOrPlant: unit,
        monthlyGrossSalary,
        annualPackage,
        wageType: 'MONTHLY_FIXED',
        dailyWageRate,
        overtimeHourlyRate,
        pfApplicable,
        esicApplicable,
        professionalTax,
        specialSiteAllowance,
        bankDetails: {
          accountNo,
          ifsc,
          bankName: bankConfig.name,
          accountHolder: name,
        },
        aadhaarLastFour,
        uanNo,
        esicNo,
        joiningDate,
        status,
      });

      globalIndex++;
    }
  });

  return allPersonnel;
}

/**
 * Generates verified monthly attendance records for the given personnel list
 * Simulates real-world attendance (22-26 days present, varied overtime, night shifts, remarks)
 */
export function generateMonthlyAttendanceRecords(personnel: Personnel[], workingDays: number = 26): AttendanceRecord[] {
  return personnel.map((person, idx) => {
    // Determine realistic attendance
    const attendanceVariant = idx % 20;

    let daysPresent = workingDays;
    let halfDays = 0;
    let absentDays = 0;
    let weeklyOffs = 4;
    let paidHolidays = 1;
    let overtimeHours = 0;
    let nightShiftAllowanceDays = 0;
    let supervisorRemarks = 'Verified & Regular Deployment';

    if (person.status === 'ON_LEAVE') {
      daysPresent = 10;
      absentDays = workingDays - 10;
      weeklyOffs = 4;
      supervisorRemarks = 'Approved Medical / Personal Leave (16 Days)';
    } else if (attendanceVariant === 3) {
      // 1 absent, 1 half-day
      daysPresent = workingDays - 2;
      halfDays = 1;
      absentDays = 1;
      overtimeHours = 8;
      nightShiftAllowanceDays = 4;
      supervisorRemarks = 'Authorized leave 1 day, half-day reported';
    } else if (attendanceVariant === 7) {
      // High overtime turnaround worker
      daysPresent = workingDays;
      overtimeHours = 32;
      nightShiftAllowanceDays = 12;
      supervisorRemarks = 'Shutdown turnaround emergency OT duty approved';
    } else if (attendanceVariant === 11) {
      // Moderate overtime
      daysPresent = workingDays;
      overtimeHours = 18;
      nightShiftAllowanceDays = 8;
      supervisorRemarks = 'Night shift hydrocarbon leak surveillance';
    } else if (attendanceVariant === 15) {
      // Standard regular with minor OT
      daysPresent = workingDays - 1;
      absentDays = 1;
      overtimeHours = 12;
      nightShiftAllowanceDays = 6;
      supervisorRemarks = '1 day casual absence';
    } else {
      // Fully present
      daysPresent = workingDays;
      overtimeHours = (idx * 3) % 24;
      nightShiftAllowanceDays = (idx * 2) % 10;
      supervisorRemarks = 'Muster roll verified by IOCL Site In-charge';
    }

    return {
      empCode: person.empCode,
      name: person.name,
      daysPresent,
      halfDays,
      weeklyOffs,
      paidHolidays,
      absentDays,
      overtimeHours,
      nightShiftAllowanceDays,
      supervisorRemarks,
    };
  });
}
