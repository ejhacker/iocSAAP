import { Personnel, IOCLSite, AttendanceRecord, ReconciliationItem, PayrollSummary } from '../types';

export interface PortalSecurityStatus {
  portalSession: {
    authenticated: boolean;
    activeUser: {
      id: string;
      name: string;
      email: string;
      role: 'ADMIN' | 'IOCL_OFFICER' | 'AUDITOR' | 'EMPLOYEE';
      designation: string;
      badgeNo?: string;
    };
    availableRoles: string[];
    sessionExpiry: string;
  };
  securityPosture: {
    antiTampering: string;
    complianceFramework: string;
    epfEsicEnforcement: string;
    frameEmbedding: string;
    totalAuditEntriesLogged: number;
  };
  recentAuditTrail: Array<{
    id: string;
    timestamp: string;
    actorName: string;
    role: string;
    action: string;
    details: string;
    status: string;
    hash: string;
  }>;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  role: string;
  action: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  hash: string;
}

export const portalApi = {
  // 1. Health & Security
  async getHealth() {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
    return res.json();
  },

  async getSecurityStatus(): Promise<PortalSecurityStatus> {
    const res = await fetch('/api/security/status');
    if (!res.ok) throw new Error(`Failed to fetch security status: ${res.statusText}`);
    return res.json();
  },

  async getAuditLogs(limit = 50): Promise<AuditLogItem[]> {
    const res = await fetch(`/api/security/audit-logs?limit=${limit}`);
    if (!res.ok) throw new Error(`Failed to fetch audit logs: ${res.statusText}`);
    const data = await res.json();
    return data.logs || [];
  },

  // 2. Auth & Roles
  async getCurrentUser() {
    const res = await fetch('/api/auth/me');
    if (!res.ok) throw new Error('Failed to retrieve active portal session');
    return res.json();
  },

  async switchRole(role: 'ADMIN' | 'IOCL_OFFICER' | 'AUDITOR' | 'EMPLOYEE') {
    const res = await fetch('/api/auth/switch-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) throw new Error('Failed to switch portal role');
    return res.json();
  },

  // 3. Personnel Database
  async getPersonnel(params?: { siteId?: string; search?: string; status?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.siteId) query.set('siteId', params.siteId);
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());

    const res = await fetch(`/api/personnel?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch personnel from server');
    return res.json();
  },

  async createPersonnel(person: Personnel) {
    const res = await fetch('/api/personnel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(person),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.message || err.error || 'Failed to save personnel');
    }
    return res.json();
  },

  async updatePersonnel(id: string, person: Partial<Personnel>) {
    const res = await fetch(`/api/personnel/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(person),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.message || err.error || 'Failed to update personnel');
    }
    return res.json();
  },

  async deletePersonnel(id: string) {
    const res = await fetch(`/api/personnel/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.message || err.error || 'Failed to delete personnel');
    }
    return res.json();
  },

  // 4. Attendance Verification & Reconcile
  async verifyAttendance(payload: { siteId: string; month: string; workingDays: number; records: AttendanceRecord[] }) {
    const res = await fetch('/api/attendance/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.message || err.error || 'Failed to verify attendance with server');
    }
    return res.json() as Promise<{
      success: boolean;
      checksum: string;
      verifiedBy: string;
      verificationTimestamp: string;
      summary: PayrollSummary;
      items: ReconciliationItem[];
    }>;
  },

  // 5. Payroll Approval
  async approvePayroll(payload: { siteId: string; month: string; totalNetPayable: number; employeeCount: number; checksum?: string }) {
    const res = await fetch('/api/payroll/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.message || err.error || 'Failed to record payroll signoff');
    }
    return res.json();
  }
};
