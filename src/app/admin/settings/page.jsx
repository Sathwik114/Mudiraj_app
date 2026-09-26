'use client';

import { useState, useEffect } from 'react';
import { Lock, Database, Download, Activity, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminSettingsPage() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwdFeedback, setPwdFeedback] = useState({ type: '', text: '' });

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((d) => {
        if (d.recentAuditLogs) setAuditLogs(d.recentAuditLogs);
      });
  }, []);

  async function handlePasswordUpdate(e) {
    e.preventDefault();
    setPwdFeedback({ type: '', text: '' });

    const res = await fetch('/api/auth/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) {
      setPwdFeedback({ type: 'error', text: data.error || 'Failed to update password.' });
      return;
    }

    setPwdFeedback({ type: 'success', text: data.message });
    setCurrentPassword('');
    setNewPassword('');
  }

  async function handleDownloadBackup() {
    const res = await fetch('/api/admin/stats?backup=1');
    const data = await res.json();
    if (!res.ok || !data.backup) return;

    const blob = new Blob([JSON.stringify(data.backup, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mudiraj_community_db_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary-dark)' }}>
          System Settings, Security &amp; Database Architecture
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Manage administrator security, download database backups, view audit logs, and review external SQL database migration settings.
        </p>
      </div>

      <div className="grid-2" style={{ marginBottom: '24px', alignItems: 'start' }}>
        {/* Change Admin Password */}
        <div className="card" style={{ borderTop: '4px solid var(--primary)' }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={18} color="var(--primary)" />
              <h2 className="card-title">Change Administrator Password</h2>
            </div>
          </div>

          {pwdFeedback.text && (
            <div
              className={`alert ${
                pwdFeedback.type === 'error' ? 'alert-error' : 'alert-success'
              }`}
            >
              {pwdFeedback.type === 'error' ? (
                <AlertCircle size={18} />
              ) : (
                <CheckCircle2 size={18} />
              )}
              <span>{pwdFeedback.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-control"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password (minimum 6 characters)</label>
              <input
                type="password"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Update Password
            </button>
          </form>
        </div>

        {/* Database Adapter & Backup */}
        <div className="card" style={{ borderTop: '4px solid var(--accent)' }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={18} color="var(--accent)" />
              <h2 className="card-title">Database Layer &amp; Backup</h2>
            </div>
          </div>

          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
            <div>
              <strong>Current Active Adapter:</strong> Local Persistent JSON Database (<code>data/mudiraj_db.json</code>)
            </div>
            <div>
              <strong>Service/Repository Isolation:</strong> All UI pages communicate exclusively via{' '}
              <code>services/*</code> and <code>lib/*</code>. Zero database queries exist inside React UI components.
            </div>
            <div>
              <strong>Production SQL DDL Ready:</strong> Full schema for <strong>SQL Server, PostgreSQL, and MySQL</strong> with indexes for 2,000,000+ members is included at <code>database/schema.sql</code>.
            </div>
            <div>
              <strong>Membership ID Format:</strong> <code>MUD-00000001</code> (8-digit padded sequence supporting up to 9.99 Crore members).
            </div>
          </div>

          <button type="button" className="btn btn-accent" onClick={handleDownloadBackup}>
            <Download size={16} /> Download Full Database Backup (.JSON)
          </button>
        </div>
      </div>

      {/* System Audit Logs */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="var(--primary)" />
            <h2 className="card-title">Administrative Audit Trail</h2>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Entity Type</th>
                <th>Actor</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '12px', color: 'var(--text-muted)' }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td>
                    <span className="badge badge-info">{log.action}</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{log.entityType}</td>
                  <td><code>{log.actor}</code></td>
                  <td style={{ fontSize: '13px' }}>{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
