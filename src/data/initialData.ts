import { IOCLSite, Personnel, AttendanceRecord } from '../types';
import { generate1000Manpower, generateMonthlyAttendanceRecords } from './manpowerGenerator';

export const INITIAL_IOCL_SITES: IOCLSite[] = [
  {
    id: 'site-panipat',
    name: 'Panipat Refinery & Petrochemical Complex (PRPC)',
    code: 'IOCL-PNP-01',
    state: 'Haryana',
    type: 'Refinery',
    siteInchargeName: 'Er. Rajesh K. Sharma',
    siteInchargeDesignation: 'Chief General Manager (Technical & Manpower)',
    siteInchargePhone: '+91 98120 44210',
    contractRefNo: 'IOCL/PRPC/CIVIL-MECH/2025-26/CON-781',
    address: 'Baholi, Panipat, Haryana 132140',
  },
  {
    id: 'site-mathura',
    name: 'Mathura Refinery',
    code: 'IOCL-MTH-02',
    state: 'Uttar Pradesh',
    type: 'Refinery',
    siteInchargeName: 'Sanjay Kumar Verma',
    siteInchargeDesignation: 'Deputy General Manager (Operations)',
    siteInchargePhone: '+91 94122 88319',
    contractRefNo: 'IOCL/MTR/HR-MANPOWER/2025/CONT-419',
    address: 'P.O. Mathura Refinery, Mathura, UP 281005',
  },
  {
    id: 'site-paradip',
    name: 'Paradip Refinery',
    code: 'IOCL-PDP-03',
    state: 'Odisha',
    type: 'Refinery',
    siteInchargeName: 'Dr. Debasis Mohanty',
    siteInchargeDesignation: 'GM (HSE & Contract Administration)',
    siteInchargePhone: '+91 97760 11920',
    contractRefNo: 'IOCL/PDR/MAINT/2026/099',
    address: 'Paradip, Jagatsinghpur District, Odisha 754141',
  },
  {
    id: 'site-koyali',
    name: 'Gujarat Refinery (Koyali)',
    code: 'IOCL-KYL-04',
    state: 'Gujarat',
    type: 'Refinery',
    siteInchargeName: 'Nitesh R. Patel',
    siteInchargeDesignation: 'DGM (Engineering Services)',
    siteInchargePhone: '+91 98251 77304',
    contractRefNo: 'IOCL/GUJ/WR/CONT-552',
    address: 'Koyali, Vadodara, Gujarat 391320',
  },
  {
    id: 'site-mumbai-terminal',
    name: 'Mumbai Marketing Terminal & Aviation Fuel Station',
    code: 'IOCL-MUM-05',
    state: 'Maharashtra',
    type: 'Marketing Terminal',
    siteInchargeName: 'Alok Bhattacharya',
    siteInchargeDesignation: 'Terminal Operations Manager',
    siteInchargePhone: '+91 98200 45671',
    contractRefNo: 'IOCL/WR/MUM-TRM/MANP-112',
    address: 'Sewree / Santacruz AFS, Mumbai, MH 400015',
  },
];

// Generate exactly 1,000 active contractor manpower across the 5 IOCL sites
export const INITIAL_PERSONNEL: Personnel[] = generate1000Manpower(INITIAL_IOCL_SITES);

// Pre-generated Panipat Attendance (350 personnel)
export const SAMPLE_IOCL_ATTENDANCE_PANIPAT: AttendanceRecord[] = generateMonthlyAttendanceRecords(
  INITIAL_PERSONNEL.filter(p => p.siteId === 'site-panipat'),
  26
);

// Pre-generated All Sites Attendance (1,000 personnel)
export const SAMPLE_IOCL_ATTENDANCE_ALL_1000: AttendanceRecord[] = generateMonthlyAttendanceRecords(
  INITIAL_PERSONNEL,
  26
);

export { generateMonthlyAttendanceRecords } from './manpowerGenerator';
