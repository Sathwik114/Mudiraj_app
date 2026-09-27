import Link from 'next/link';
import { memberService } from '@/services/memberService';
import { formatMembershipId } from '@/lib/membershipId';
import {
  Users,
  Clock,
  CheckCircle2,
  UserCheck,
  UserX,
  Building2,
  Landmark,
  MapPin,
  UsersRound,
  Award,
  ArrowRight,
  Activity,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AdminDashboardPage() {
  const data = memberService.getDashboardAndReportStats();
  const s = data.summary;

  const statCards = [
    {
      label: 'Total Members (Issued ID)',
      value: s.totalMembers,
      subtext: `Total Database Records: ${s.totalRecords}`,
      icon: Users,
      bg: '#dbeafe',
      color: '#1e40af',
    },
    {
      label: 'Pending Applications',
      value: s.pendingApplications,
      subtext: 'Awaiting Admin Verification',
      icon: Clock,
      bg: '#fef3c7',
      color: '#b45309',
    },
    {
      label: 'Approved Members',
      value: s.approvedMembers,
      subtext: 'Verified with Membership ID',
      icon: CheckCircle2,
      bg: '#dcfce7',
      color: '#15803d',
    },
    {
      label: 'Active Members',
      value: s.activeMembers,
      subtext: 'In Good Standing',
      icon: UserCheck,
      bg: '#d1fae5',
      color: '#047857',
    },
    {
      label: 'Inactive Members',
      value: s.inactiveMembers,
      subtext: `Rejected Apps: ${s.rejectedApplications}`,
      icon: UserX,
      bg: '#fee2e2',
      color: '#b91c1c',
    },
    {
      label: 'Total Districts',
      value: s.totalDistricts,
      subtext: 'Under Andhra Pradesh State',
      icon: Building2,
      bg: '#e0e7ff',
      color: '#3730a3',
    },
    {
      label: 'Total Constitutions',
      value: s.totalConstitutions,
      subtext: 'Assembly Constituencies',
      icon: Landmark,
      bg: '#f3e8ff',
      color: '#6b21a8',
    },
    {
      label: 'Total Mandals',
      value: s.totalMandals,
      subtext: `Gramams Pre-configured: ${s.totalGramams}`,
      icon: MapPin,
      bg: '#ffedd5',
      color: '#c2410c',
    },
    {
      label: 'Total Teams',
      value: s.totalTeams,
      subtext: 'Main, Youth & Mahila Wings',
      icon: UsersRound,
      bg: '#cffafe',
      color: '#0e7490',
    },
    {
      label: 'Total Leaders',
      value: s.totalLeaders,
      subtext: 'Assigned Office Bearers',
      icon: Award,
      bg: '#fef9c3',
      color: '#a16207',
    },
  ];

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '22px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary-dark)' }}>
            Administrator Dashboard
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Real-time overview of Mudiraj Community Memberships, Hierarchy, and Leadership across
            Andhra Pradesh. Next Membership ID in sequence:{' '}
            <code style={{ fontWeight: 700, color: 'var(--primary)' }}>
              {formatMembershipId(s.nextMembershipSequence)}
            </code>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link href="/admin/applications" className="btn btn-accent">
            Review Pending Applications ({s.pendingApplications})
          </Link>
          <Link href="/admin/members" className="btn btn-primary">
            Manage Members
          </Link>
        </div>
      </div>

      {/* 10 Required Dashboard Statistics Cards */}
      <div className="grid-5" style={{ marginBottom: '26px' }}>
        {statCards.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="stat-card">
              <div>
                <div className="stat-label">{item.label}</div>
                <div className="stat-value">{item.value}</div>
                <div className="stat-subtext">{item.subtext}</div>
              </div>
              <div
                className="stat-icon"
                style={{ backgroundColor: item.bg, color: item.color }}
              >
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Navigation & Recent Applications */}
      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Membership Applications &amp; Registrations</h2>
            <Link href="/admin/applications" className="btn btn-outline btn-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Applicant / ID</th>
                  <th>District / Mandal</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentApplications.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{app.fullName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {app.membershipId || app.applicationNo} • {app.mobile}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>{app.districtName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {app.mandalName}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          ['Active', 'Approved'].includes(app.status)
                            ? 'badge-active'
                            : app.status === 'Pending'
                            ? 'badge-pending'
                            : 'badge-rejected'
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent System Audit Logs */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} color="var(--primary)" />
              <h2 className="card-title">Recent Administrative Audit Trail</h2>
            </div>
            <Link href="/admin/settings" className="btn btn-outline btn-sm">
              Full Logs
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data.recentAuditLogs.slice(0, 6).map((log) => (
              <div
                key={log.id}
                style={{
                  padding: '10px 12px',
                  background: 'var(--bg-body)',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  fontSize: '13px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{log.action}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {new Date(log.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                  {log.details}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
