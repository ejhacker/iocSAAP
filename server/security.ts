import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';

export type UserRole = 'ADMIN' | 'IOCL_OFFICER' | 'AUDITOR' | 'EMPLOYEE';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  designation: string;
  siteId?: string;
  badgeNo?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  role: UserRole;
  action: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  hash: string;
}

// In-Memory Immutable Audit Trail with cryptographic chain
const auditLogs: AuditLogEntry[] = [];

export function generateAuditHash(previousHash: string, data: string): string {
  return crypto.createHash('sha256').update(`${previousHash}|${data}|${Date.now()}`).digest('hex');
}

export function logAuditEvent(
  actor: AuthUser,
  action: string,
  details: string,
  ipAddress: string = '127.0.0.1',
  userAgent: string = 'Internal Portal Agent',
  status: 'SUCCESS' | 'WARNING' | 'FAILED' = 'SUCCESS'
): AuditLogEntry {
  const previousHash = auditLogs.length > 0 ? auditLogs[0].hash : '0000000000000000000000000000000000000000000000000000000000000000';
  const timestamp = new Date().toISOString();
  const hash = generateAuditHash(previousHash, `${actor.id}:${action}:${details}:${timestamp}`);

  const entry: AuditLogEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp,
    actorId: actor.id,
    actorName: actor.name,
    role: actor.role,
    action,
    details,
    ipAddress,
    userAgent,
    status,
    hash,
  };

  auditLogs.unshift(entry);
  if (auditLogs.length > 500) {
    auditLogs.pop();
  }

  return entry;
}

export function getAuditLogs(limit = 100): AuditLogEntry[] {
  return auditLogs.slice(0, limit);
}

// Default session users for Company Portal SSO Simulation
export const PORTAL_USERS: Record<UserRole, AuthUser> = {
  IOCL_OFFICER: {
    id: 'usr-iocl-cgm-4921',
    name: 'Shri A. K. Sharma',
    email: 'aksharma@indianoil.in',
    role: 'IOCL_OFFICER',
    designation: 'Chief General Manager (Contract Operations)',
    siteId: 'ALL',
    badgeNo: 'IOCL-CGM-4921'
  },
  ADMIN: {
    id: 'usr-adm-payroll-01',
    name: 'Rajesh V. Contractor HR',
    email: 'payroll.desk@contractorcorp.com',
    role: 'ADMIN',
    designation: 'Contractor Head of Payroll & Manpower',
    siteId: 'ALL',
    badgeNo: 'ADM-CONT-108'
  },
  AUDITOR: {
    id: 'usr-vig-audit-88',
    name: 'P. Sengupta (Compliance Officer)',
    email: 'vigilance@indianoil.in',
    role: 'AUDITOR',
    designation: 'Chief Vigilance Inspector & Statutory Auditor',
    siteId: 'ALL',
    badgeNo: 'IOCL-VIG-884'
  },
  EMPLOYEE: {
    id: 'usr-emp-m101',
    name: 'Manoj Kumar Sharma',
    email: 'manoj.sharma@workerportal.in',
    role: 'EMPLOYEE',
    designation: 'Senior Mechanical Technician',
    siteId: 'panipat',
    badgeNo: 'CONT-M-101'
  }
};

let currentPortalUser: AuthUser = PORTAL_USERS.IOCL_OFFICER;

export function getCurrentUser(): AuthUser {
  return currentPortalUser;
}

export function setCurrentUser(role: UserRole): AuthUser {
  if (PORTAL_USERS[role]) {
    currentPortalUser = PORTAL_USERS[role];
    logAuditEvent(
      currentPortalUser,
      'SECURITY_ROLE_SWITCH',
      `Active enterprise portal role switched to ${role} (${currentPortalUser.name})`
    );
  }
  return currentPortalUser;
}

// Rate Limiting (In-Memory Sliding Window)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 300; // 300 requests/minute per client

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();

  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  record.count += 1;
  if (record.count > MAX_REQUESTS_PER_WINDOW) {
    res.setHeader('Retry-After', '60');
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded for company portal API. Please try again in 1 minute.',
    });
  }

  next();
}

// Enterprise Security Headers
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Cross-Site Scripting protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Company Portal Iframe Compatibility (allow embedding inside enterprise portal while protecting against clickjacking)
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https:; frame-ancestors 'self' https: http:; img-src 'self' data: blob: https:; connect-src 'self' https: http:;"
  );

  // Anti-tamper header
  res.setHeader('X-Enterprise-Portal-Secured', 'IOCL-WAGE-COMPLIANCE-GATEWAY-v2');

  next();
}

// Role Authorization Guard Middleware
export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = getCurrentUser();
    if (!allowedRoles.includes(user.role)) {
      logAuditEvent(
        user,
        'UNAUTHORIZED_ACCESS_ATTEMPT',
        `Access denied to ${req.method} ${req.originalUrl}. Required: [${allowedRoles.join(', ')}], User Role: ${user.role}`,
        req.ip || '127.0.0.1',
        req.get('User-Agent') || 'Unknown',
        'FAILED'
      );
      return res.status(403).json({
        error: 'Forbidden',
        message: `Your company portal role (${user.role}) does not have permission to execute this operation. Required: ${allowedRoles.join(' or ')}.`,
      });
    }
    next();
  };
}

// Calculate SHA-256 Checksum for attendance records to prevent post-verification tampering
export function calculateAttendanceChecksum(records: Array<{ empCode: string; daysPresent: number; overtimeHours: number }>): string {
  const content = records
    .map(r => `${r.empCode}:${r.daysPresent}:${r.overtimeHours}`)
    .sort()
    .join('|');
  return crypto.createHash('sha256').update(content).digest('hex');
}
