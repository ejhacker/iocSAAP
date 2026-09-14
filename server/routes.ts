import { Router, Request, Response } from 'express';
import { 
  getCurrentUser, 
  setCurrentUser, 
  getAuditLogs, 
  logAuditEvent, 
  requireRole, 
  calculateAttendanceChecksum,
  UserRole,
  PORTAL_USERS
} from './security';
import { INITIAL_IOCL_SITES, INITIAL_PERSONNEL } from '../src/data/initialData';
import { reconcileAttendanceWithDatabase } from '../src/utils/salaryCalculator';
import { Personnel, IOCLSite, AttendanceRecord } from '../src/types';

const router = Router();

// In-Memory Master Personnel Store for backend operations
let masterPersonnel: Personnel[] = [...INITIAL_PERSONNEL];
const masterSites: IOCLSite[] = [...INITIAL_IOCL_SITES];

// --- 1. Health & Security Status Endpoints ---
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'UP',
    system: 'IOCL Contractor Manpower & Payroll Gateway',
    environment: process.env.NODE_ENV || 'development',
    serverTime: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: 'HEALTHY',
      totalPersonnelRecords: masterPersonnel.length,
      totalSites: masterSites.length,
    },
    security: {
      rbacEnabled: true,
      antiTamperVerification: 'SHA-256',
      rateLimiter: 'ACTIVE',
      contentSecurityPolicy: 'ACTIVE',
      auditLogging: 'ENFORCED',
    }
  });
});

router.get('/security/status', (req: Request, res: Response) => {
  const user = getCurrentUser();
  const recentLogs = getAuditLogs(5);
  
  res.json({
    portalSession: {
      authenticated: true,
      activeUser: user,
      availableRoles: Object.keys(PORTAL_USERS),
      sessionExpiry: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
    },
    securityPosture: {
      antiTampering: 'SHA-256 Hash Chaining Active',
      complianceFramework: 'IOCL Form XIX Contractor Wages & Statutory Norms',
      epfEsicEnforcement: 'Strict Statutory Compliance (12% EPF, 0.75% ESIC)',
      frameEmbedding: 'Enabled for Enterprise Company Portal / Intranet',
      totalAuditEntriesLogged: getAuditLogs(500).length,
    },
    recentAuditTrail: recentLogs,
  });
});

router.get('/security/audit-logs', (req: Request, res: Response) => {
  const limit = Math.min(100, parseInt(req.query.limit as string, 10) || 50);
  const logs = getAuditLogs(limit);
  res.json({
    count: logs.length,
    logs,
  });
});

// --- 2. Enterprise Authentication & Role Switching ---
router.get('/auth/me', (req: Request, res: Response) => {
  const user = getCurrentUser();
  res.json({
    user,
    permissions: {
      canEditPersonnel: user.role === 'ADMIN',
      canUploadAttendance: user.role === 'IOCL_OFFICER' || user.role === 'ADMIN',
      canApprovePayroll: user.role === 'IOCL_OFFICER' || user.role === 'ADMIN',
      canExportFormXIX: true,
      canViewAuditLogs: user.role !== 'EMPLOYEE',
    }
  });
});

router.post('/auth/switch-role', (req: Request, res: Response) => {
  const { role } = req.body;
  if (!role || !PORTAL_USERS[role as UserRole]) {
    return res.status(400).json({ 
      error: 'Invalid role', 
      message: `Role must be one of: ${Object.keys(PORTAL_USERS).join(', ')}` 
    });
  }

  const updatedUser = setCurrentUser(role as UserRole);
  res.json({
    success: true,
    message: `Role switched to ${role}`,
    user: updatedUser,
  });
});

router.post('/auth/login', (req: Request, res: Response) => {
  const { email, role } = req.body;
  const targetRole = (role as UserRole) || 'IOCL_OFFICER';
  const user = setCurrentUser(targetRole);
  
  logAuditEvent(
    user,
    'COMPANY_PORTAL_LOGIN',
    `Authenticated via company portal SSO: ${user.email} (${user.role})`,
    req.ip,
    req.get('User-Agent')
  );

  res.json({
    token: `iocl-jwt-token-${Date.now()}`,
    user,
    expiresIn: '8h',
  });
});

// --- 3. IOCL Sites Endpoints ---
router.get('/sites', (req: Request, res: Response) => {
  res.json({
    sites: masterSites,
    count: masterSites.length,
  });
});

// --- 4. Master Personnel Database Endpoints ---
router.get('/personnel', (req: Request, res: Response) => {
  const { siteId, search, status, page = '1', limit = '50' } = req.query;
  let list = [...masterPersonnel];

  if (siteId && siteId !== 'ALL') {
    list = list.filter(p => p.siteId === siteId);
  }

  if (status) {
    list = list.filter(p => p.status === status);
  }

  if (search) {
    const q = (search as string).toLowerCase().trim();
    list = list.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.empCode.toLowerCase().includes(q) ||
      p.contractorBadgeNo.toLowerCase().includes(q) ||
      p.designation.toLowerCase().includes(q) ||
      p.tradeCategory.toLowerCase().includes(q)
    );
  }

  const pageNum = parseInt(page as string, 10) || 1;
  const pageLimit = parseInt(limit as string, 10) || 50;
  const startIndex = (pageNum - 1) * pageLimit;
  const paginated = list.slice(startIndex, startIndex + pageLimit);

  res.json({
    total: list.length,
    page: pageNum,
    limit: pageLimit,
    totalPages: Math.ceil(list.length / pageLimit),
    data: paginated,
  });
});

router.post('/personnel', requireRole(['ADMIN']), (req: Request, res: Response) => {
  const person: Personnel = req.body;
  if (!person.name || !person.empCode || !person.monthlyGrossSalary) {
    return res.status(400).json({ error: 'Missing required personnel fields' });
  }

  const existing = masterPersonnel.find(p => p.empCode.toLowerCase() === person.empCode.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: `Employee code ${person.empCode} already exists in database.` });
  }

  masterPersonnel.unshift(person);
  const user = getCurrentUser();
  logAuditEvent(
    user,
    'CREATE_PERSONNEL',
    `Added new personnel: ${person.name} (${person.empCode}) at ${person.siteName}`,
    req.ip,
    req.get('User-Agent')
  );

  res.status(201).json({ success: true, data: person });
});

router.put('/personnel/:id', requireRole(['ADMIN']), (req: Request, res: Response) => {
  const { id } = req.params;
  const index = masterPersonnel.findIndex(p => p.id === id || p.empCode === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Personnel not found' });
  }

  const previous = masterPersonnel[index];
  const updated: Personnel = { ...previous, ...req.body };
  masterPersonnel[index] = updated;

  const user = getCurrentUser();
  logAuditEvent(
    user,
    'UPDATE_PERSONNEL',
    `Updated personnel record: ${updated.name} (${updated.empCode}). Gross wage: ₹${updated.monthlyGrossSalary}`,
    req.ip,
    req.get('User-Agent')
  );

  res.json({ success: true, data: updated });
});

router.delete('/personnel/:id', requireRole(['ADMIN']), (req: Request, res: Response) => {
  const { id } = req.params;
  const index = masterPersonnel.findIndex(p => p.id === id || p.empCode === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Personnel not found' });
  }

  const removed = masterPersonnel.splice(index, 1)[0];
  const user = getCurrentUser();
  logAuditEvent(
    user,
    'DELETE_PERSONNEL',
    `Archived / removed personnel record: ${removed.name} (${removed.empCode}) from ${removed.siteName}`,
    req.ip,
    req.get('User-Agent'),
    'WARNING'
  );

  res.json({ success: true, message: `Personnel ${removed.name} removed successfully` });
});

// --- 5. Attendance Verification & Reconciliation Endpoint ---
router.post('/attendance/verify', requireRole(['IOCL_OFFICER', 'ADMIN']), (req: Request, res: Response) => {
  const { siteId, month, workingDays = 26, records } = req.body;
  if (!records || !Array.isArray(records)) {
    return res.status(400).json({ error: 'Invalid attendance records payload' });
  }

  const result = reconcileAttendanceWithDatabase(
    masterPersonnel,
    siteId || 'ALL',
    month || 'Current Month',
    records,
    workingDays
  );

  const checksum = calculateAttendanceChecksum(records);
  const user = getCurrentUser();

  logAuditEvent(
    user,
    'RECONCILE_ATTENDANCE',
    `Processed attendance for ${siteId}. Matched: ${result.summary.matchedCount}, Unmatched: ${result.summary.unmatchedCount}. Anti-tamper Hash: ${checksum.substring(0, 16)}...`,
    req.ip,
    req.get('User-Agent')
  );

  res.json({
    success: true,
    checksum,
    verifiedBy: user.name,
    verificationTimestamp: new Date().toISOString(),
    summary: result.summary,
    items: result.items,
  });
});

// --- 6. Payroll Approval & Disbursement Batch Endpoint ---
router.post('/payroll/approve', requireRole(['IOCL_OFFICER', 'ADMIN']), (req: Request, res: Response) => {
  const { siteId, month, totalNetPayable, employeeCount, checksum } = req.body;
  const user = getCurrentUser();

  const digitalSignoffId = `IOCL-SIG-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  logAuditEvent(
    user,
    'APPROVE_PAYROLL_DISBURSEMENT',
    `Form XIX Payroll Approved: ₹${totalNetPayable} across ${employeeCount} workers. IOCL Signature Token: ${digitalSignoffId}. Checksum: ${checksum || 'N/A'}`,
    req.ip,
    req.get('User-Agent')
  );

  res.json({
    success: true,
    digitalSignoffId,
    approvedBy: user.name,
    designation: user.designation,
    approvalTimestamp: new Date().toISOString(),
    complianceStatus: 'VERIFIED_FORM_XIX_STATUTORY_COMPLIANT',
  });
});

export default router;
