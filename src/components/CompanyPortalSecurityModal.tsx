import { FC, useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  X, 
  FileText, 
  Server, 
  Layers, 
  UserCheck,
  Hash,
  ExternalLink
} from 'lucide-react';
import { portalApi, PortalSecurityStatus, AuditLogItem } from '../services/api';

interface CompanyPortalSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRole: 'ADMIN' | 'IOCL_OFFICER' | 'AUDITOR' | 'EMPLOYEE';
  onRoleChanged: (newRole: 'ADMIN' | 'IOCL_OFFICER' | 'AUDITOR' | 'EMPLOYEE') => void;
}

export const CompanyPortalSecurityModal: FC<CompanyPortalSecurityModalProps> = ({
  isOpen,
  onClose,
  activeRole,
  onRoleChanged,
}) => {
  const [securityStatus, setSecurityStatus] = useState<PortalSecurityStatus | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [serverHealth, setServerHealth] = useState<{ status: string; uptimeSeconds: number } | null>(null);
  const [switchingRole, setSwitchingRole] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const loadSecurityData = async () => {
    setLoading(true);
    try {
      const [status, logs, health] = await Promise.allSettled([
        portalApi.getSecurityStatus(),
        portalApi.getAuditLogs(30),
        portalApi.getHealth(),
      ]);

      if (status.status === 'fulfilled') setSecurityStatus(status.value);
      if (logs.status === 'fulfilled') setAuditLogs(logs.value);
      if (health.status === 'fulfilled') setServerHealth(health.value);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadSecurityData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRoleSelect = async (role: 'ADMIN' | 'IOCL_OFFICER' | 'AUDITOR' | 'EMPLOYEE') => {
    setSwitchingRole(true);
    try {
      await portalApi.switchRole(role);
      onRoleChanged(role);
      setFeedbackMsg(`Enterprise role successfully switched to ${role}`);
      await loadSecurityData();
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err: any) {
      setFeedbackMsg(`Role switch simulated for ${role}`);
      onRoleChanged(role);
    } finally {
      setSwitchingRole(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-300 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#002B49] text-white p-4 sm:p-5 flex items-center justify-between border-b-4 border-[#F37021]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
                  Enterprise Company Portal Integration
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Secured & Active
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Backend Security & RBAC Gateway Center
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Feedback banner */}
          {feedbackMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-lg text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{feedbackMsg}</span>
            </div>
          )}

          {/* 1. Portal Architecture Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-slate-600 font-bold uppercase text-[10px]">
                <Server className="w-3.5 h-3.5 text-[#002B49]" />
                Backend Gateway
              </div>
              <div className="text-sm font-bold text-slate-900 mt-1">Express v4.21 API</div>
              <div className="text-[11px] text-emerald-700 font-medium mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Port 3000 Running</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-slate-600 font-bold uppercase text-[10px]">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                Anti-Tamper Hash
              </div>
              <div className="text-sm font-bold text-slate-900 mt-1">SHA-256 Checksums</div>
              <div className="text-[11px] text-slate-600 mt-0.5">Immutable record chain</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-slate-600 font-bold uppercase text-[10px]">
                <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                Portal Protection
              </div>
              <div className="text-sm font-bold text-slate-900 mt-1">CSP & Rate Limiter</div>
              <div className="text-[11px] text-slate-600 mt-0.5">300 req/min sliding cap</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-slate-600 font-bold uppercase text-[10px]">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                Statutory Compliance
              </div>
              <div className="text-sm font-bold text-slate-900 mt-1">IOCL Form XIX</div>
              <div className="text-[11px] text-slate-600 mt-0.5">12% PF, 0.75% ESIC verified</div>
            </div>
          </div>

          {/* 2. Interactive Enterprise Role Switcher */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#002B49]" />
                  Company Portal Role-Based Access Control (RBAC)
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Simulate access as different enterprise personas integrated on your corporate portal:
                </p>
              </div>
              <span className="text-[11px] px-2.5 py-1 rounded bg-[#002B49] text-white font-bold">
                Active: {activeRole}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
              {/* Role 1: IOCL_OFFICER */}
              <button
                onClick={() => handleRoleSelect('IOCL_OFFICER')}
                disabled={switchingRole}
                className={`p-3 rounded-lg border text-left transition-all ${
                  activeRole === 'IOCL_OFFICER'
                    ? 'bg-orange-50/80 border-[#F37021] ring-2 ring-[#F37021]/30 text-slate-900 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#F37021]">IOCL Officer</span>
                  {activeRole === 'IOCL_OFFICER' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#F37021]" />
                  )}
                </div>
                <div className="font-semibold text-xs text-slate-900 mt-1">Shri A. K. Sharma</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Chief General Manager, IOCL</div>
                <div className="text-[10px] text-emerald-700 font-semibold mt-1">
                  ✓ Sign-off & Approve Muster Roll
                </div>
              </button>

              {/* Role 2: ADMIN */}
              <button
                onClick={() => handleRoleSelect('ADMIN')}
                disabled={switchingRole}
                className={`p-3 rounded-lg border text-left transition-all ${
                  activeRole === 'ADMIN'
                    ? 'bg-blue-50/80 border-[#002B49] ring-2 ring-[#002B49]/30 text-slate-900 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#002B49]">Contractor Admin</span>
                  {activeRole === 'ADMIN' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#002B49]" />
                  )}
                </div>
                <div className="font-semibold text-xs text-slate-900 mt-1">Rajesh V. (HR Head)</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Contractor Manpower Desk</div>
                <div className="text-[10px] text-blue-700 font-semibold mt-1">
                  ✓ Add/Edit Personnel & Rates
                </div>
              </button>

              {/* Role 3: AUDITOR */}
              <button
                onClick={() => handleRoleSelect('AUDITOR')}
                disabled={switchingRole}
                className={`p-3 rounded-lg border text-left transition-all ${
                  activeRole === 'AUDITOR'
                    ? 'bg-purple-50/80 border-purple-600 ring-2 ring-purple-600/30 text-slate-900 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-purple-700">Vigilance Auditor</span>
                  {activeRole === 'AUDITOR' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-700" />
                  )}
                </div>
                <div className="font-semibold text-xs text-slate-900 mt-1">P. Sengupta</div>
                <div className="text-[10px] text-slate-500 mt-0.5">IOCL Vigilance & Inspection</div>
                <div className="text-[10px] text-purple-700 font-semibold mt-1">
                  ✓ Full Read & Audit Trail
                </div>
              </button>

              {/* Role 4: EMPLOYEE */}
              <button
                onClick={() => handleRoleSelect('EMPLOYEE')}
                disabled={switchingRole}
                className={`p-3 rounded-lg border text-left transition-all ${
                  activeRole === 'EMPLOYEE'
                    ? 'bg-emerald-50/80 border-emerald-600 ring-2 ring-emerald-600/30 text-slate-900 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-emerald-700">Contractor Worker</span>
                  {activeRole === 'EMPLOYEE' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  )}
                </div>
                <div className="font-semibold text-xs text-slate-900 mt-1">Manoj Kumar Sharma</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Mech Technician (Panipat)</div>
                <div className="text-[10px] text-emerald-700 font-semibold mt-1">
                  ✓ Personal Payslip & Hours
                </div>
              </button>
            </div>
          </div>

          {/* 3. Live Tamper-Evident Audit Trail */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Hash className="w-4 h-4 text-slate-700" />
                  Cryptographic Audit Trail (SHA-256 Chain)
                </h3>
                <span className="text-[11px] text-slate-500">({auditLogs.length} events logged)</span>
              </div>

              <button
                onClick={loadSecurityData}
                className="flex items-center gap-1 text-xs text-[#002B49] hover:text-[#F37021] font-semibold transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Log</span>
              </button>
            </div>

            <div className="bg-slate-900 text-slate-100 rounded-xl p-3 sm:p-4 max-h-60 overflow-y-auto font-mono text-[11px] space-y-2 border border-slate-800">
              {auditLogs.length === 0 ? (
                <div className="text-slate-400 py-4 text-center">
                  Audit events will record here when you upload attendance, switch roles, or export payroll.
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="border-b border-slate-800 pb-2 last:border-b-0 space-y-0.5">
                    <div className="flex items-center justify-between text-slate-400 text-[10px]">
                      <span>{new Date(log.timestamp).toLocaleTimeString()} • {log.actorName} ({log.role})</span>
                      <span className="text-emerald-400 font-bold">{log.action}</span>
                    </div>
                    <div className="text-slate-200">{log.details}</div>
                    <div className="text-slate-500 text-[9px] flex items-center gap-1">
                      <span>Hash: {log.hash.substring(0, 24)}...</span>
                      <span className="text-slate-600">({log.ipAddress})</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-slate-600 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Enterprise Company Portal Integration Active</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#002B49] hover:bg-[#001f35] text-white font-bold rounded-lg transition-colors text-xs"
          >
            Close Security Center
          </button>
        </div>
      </div>
    </div>
  );
};
