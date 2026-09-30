'use client';

import { useState, useEffect } from 'react';
import {
  Lock,
  Database,
  Download,
  Activity,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  Smartphone,
} from 'lucide-react';
import { extractTenDigitMobile, formatIndianMobile } from '@/lib/validation';

export default function AdminSettingsPage() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [smsLogs, setSmsLogs] = useState([]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwdFeedback, setPwdFeedback] = useState({ type: '', text: '' });

  // India (+91) SMS Gateway Configuration
  const [smsProvider, setSmsProvider] = useState('fast2sms');
  const [smsApiKey, setSmsApiKey] = useState('');
  const [twilioAccountSid, setTwilioAccountSid] = useState('');
  const [twilioAuthToken, setTwilioAuthToken] = useState('');
  const [twilioPhoneNumber, setTwilioPhoneNumber] = useState('');
  const [smsConfigured, setSmsConfigured] = useState(false);
  const [smsFeedback, setSmsFeedback] = useState({ type: '', text: '', smsResult: null });

  // Test SMS state
  const [testMobile, setTestMobile] = useState('7285972050');
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((d) => {
        if (d.recentAuditLogs) setAuditLogs(d.recentAuditLogs);
        if (d.recentSmsLogs) setSmsLogs(d.recentSmsLogs);
        if (d.smsConfig) {
          setSmsProvider(d.smsConfig.provider || 'fast2sms');
          setTwilioAccountSid(d.smsConfig.twilioAccountSid || '');
          setTwilioPhoneNumber(d.smsConfig.twilioPhoneNumber || '');
          setSmsConfigured(Boolean(d.smsConfig.isConfigured));
        }
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

  async function handleSmsConfigSave(e) {
    e.preventDefault();
    setSmsFeedback({ type: '', text: '', smsResult: null });

    const res = await fetch('/api/admin/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'SAVE_SMS_CONFIG',
        provider: smsProvider,
        smsApiKey,
        twilioAccountSid,
        twilioAuthToken,
        twilioPhoneNumber,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setSmsFeedback({
        type: 'error',
        text: data.error || 'Failed to save SMS Gateway settings.',
        smsResult: null,
      });
      return;
    }

    setSmsConfigured(Boolean(data.smsConfig?.isConfigured));
    setSmsApiKey('');
    setTwilioAuthToken('');
    setSmsFeedback({ type: 'success', text: data.message, smsResult: null });
  }

  async function handleSendTestSms() {
    setSendingTest(true);
    setSmsFeedback({ type: '', text: '', smsResult: null });
    try {
      const res = await fetch('/api/admin/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TEST_SMS',
          mobile: formatIndianMobile(testMobile),
          fullName: 'Sathya Sathwik Pushpagiri',
          membershipId: 'MUD-00000003',
          memberPassword: 'PUS728',
        }),
      });
      const data = await res.json();
      if (data.recentSmsLogs) setSmsLogs(data.recentSmsLogs);
      setSmsFeedback({
        type: data.smsResult?.sent ? 'success' : 'warning',
        text: data.message,
        smsResult: data.smsResult || null,
      });
    } catch (err) {
      setSmsFeedback({
        type: 'error',
        text: err.message || 'Failed to trigger test SMS.',
        smsResult: null,
      });
    } finally {
      setSendingTest(false);
    }
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
          System Settings, India (+91) SMS Gateway &amp; Security
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Configure automated +91 SMS delivery for Membership ID &amp; Password, manage administrator security, and view SMS &amp; audit logs.
        </p>
      </div>

      {/* India (+91) SMS Gateway Configuration Card */}
      <div className="card" style={{ marginBottom: '24px', borderTop: '4px solid var(--success)' }}>
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={18} color="var(--success)" />
            <h2 className="card-title">
              India (+91) SMS Gateway Configuration (Automated Membership ID &amp; Password SMS)
            </h2>
          </div>
          <span className={`badge ${smsConfigured ? 'badge-active' : 'badge-pending'}`}>
            {smsConfigured ? 'SMS Gateway Connected (+91)' : 'API Key Required for Auto-SMS'}
          </span>
        </div>

        {smsFeedback.text && (
          <div
            className={`alert ${
              smsFeedback.type === 'error'
                ? 'alert-error'
                : smsFeedback.type === 'warning'
                ? 'alert-warning'
                : 'alert-success'
            }`}
            style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {smsFeedback.type === 'error' ? (
                <AlertCircle size={18} />
              ) : (
                <CheckCircle2 size={18} />
              )}
              <span>{smsFeedback.text}</span>
            </div>

            {smsFeedback.smsResult && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
                {smsFeedback.smsResult.smsUri && (
                  <a
                    href={smsFeedback.smsResult.smsUri}
                    className="btn btn-primary btn-sm"
                    style={{ textDecoration: 'none' }}
                  >
                    <Smartphone size={14} /> Open Device SMS App ({smsFeedback.smsResult.mobile})
                  </a>
                )}
                {smsFeedback.smsResult.whatsappUri && (
                  <a
                    href={smsFeedback.smsResult.whatsappUri}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-success btn-sm"
                    style={{ textDecoration: 'none' }}
                  >
                    <Send size={14} /> Send via WhatsApp ({smsFeedback.smsResult.mobile})
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSmsConfigSave} style={{ marginBottom: '16px' }}>
          <div className="form-grid" style={{ alignItems: 'end' }}>
            <div className="form-group">
              <label className="form-label">SMS Gateway Provider (India +91)</label>
              <select
                className="form-control"
                value={smsProvider}
                onChange={(e) => setSmsProvider(e.target.value)}
              >
                <option value="fast2sms">Fast2SMS (India +91 Bulk SMS)</option>
                <option value="twilio">Twilio SMS (+91 E.164 India)</option>
                <option value="2factor">2Factor.in (India +91 SMS)</option>
                <option value="textbelt">Textbelt (+91 International SMS)</option>
              </select>
            </div>

            {smsProvider === 'twilio' ? (
              <>
                <div className="form-group">
                  <label className="form-label">Twilio Account SID</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={twilioAccountSid}
                    onChange={(e) => setTwilioAccountSid(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Twilio Auth Token</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder={
                      smsConfigured
                        ? '•••••••••••••••• (Saved — enter new to update)'
                        : 'Enter Twilio Auth Token'
                    }
                    value={twilioAuthToken}
                    onChange={(e) => setTwilioAuthToken(e.target.value)}
                    required={!smsConfigured}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Twilio Sender Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="+1234567890"
                    value={twilioPhoneNumber}
                    onChange={(e) => setTwilioPhoneNumber(e.target.value)}
                    required
                  />
                </div>
              </>
            ) : (
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">
                  {smsProvider === 'fast2sms'
                    ? 'Fast2SMS Authorization API Key'
                    : smsProvider === '2factor'
                    ? '2Factor.in API Key'
                    : 'Textbelt API Key'}
                </label>
                <input
                  type="password"
                  className="form-control"
                  placeholder={
                    smsConfigured
                      ? '•••••••••••••••• (Saved — enter new key to update)'
                      : 'Paste your SMS Gateway API Key here'
                  }
                  value={smsApiKey}
                  onChange={(e) => setSmsApiKey(e.target.value)}
                  required={!smsConfigured}
                />
              </div>
            )}

            <div>
              <button type="submit" className="btn btn-success" style={{ width: '100%' }}>
                Save +91 SMS Gateway
              </button>
            </div>
          </div>
        </form>

        {/* Quick Test SMS Dispatch Box */}
        <div
          style={{
            background: 'var(--bg-muted)',
            padding: '14px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            <strong>Test India (+91) SMS Delivery:</strong> Send a sample credentials message (
            <code>MUD-00000003</code> / <code>PUS728</code>) to verify delivery.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'stretch' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0 10px',
                  fontWeight: 700,
                  fontSize: '13px',
                  color: 'var(--primary-dark)',
                  background: '#e2e8f0',
                  border: '1px solid var(--border-color)',
                  borderRight: 'none',
                  borderRadius: '6px 0 0 6px',
                }}
              >
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                className="form-control"
                style={{ width: '150px', borderRadius: '0 6px 6px 0', padding: '6px 10px' }}
                placeholder="10-digit mobile"
                value={testMobile}
                onChange={(e) => setTestMobile(extractTenDigitMobile(e.target.value))}
              />
            </div>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={sendingTest}
              onClick={handleSendTestSms}
            >
              <Send size={14} /> {sendingTest ? 'Sending...' : `Send Test SMS (+91${testMobile})`}
            </button>
          </div>
        </div>
      </div>

      {/* Recent SMS Dispatch Logs */}
      {smsLogs.length > 0 && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Smartphone size={18} color="var(--primary)" />
              <h2 className="card-title">Recent +91 SMS Dispatch Log</h2>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Recipient (+91)</th>
                  <th>Membership ID &amp; Password</th>
                  <th>Status</th>
                  <th>Direct Action</th>
                </tr>
              </thead>
              <tbody>
                {smsLogs.map((item) => {
                  const formatted = formatIndianMobile(item.mobile);
                  const tenDigits = extractTenDigitMobile(item.mobile);
                  const smsHref = `sms:${formatted}?body=${encodeURIComponent(item.message || '')}`;
                  const waHref = `https://wa.me/91${tenDigits}?text=${encodeURIComponent(
                    item.message || ''
                  )}`;
                  return (
                    <tr key={item.id}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '12px', color: 'var(--text-muted)' }}>
                        {new Date(item.createdAt).toLocaleString()}
                      </td>
                      <td style={{ fontWeight: 700 }}>{formatted}</td>
                      <td style={{ fontSize: '13px' }}>
                        <strong>{item.membershipId}</strong> | Pass: <code>{item.password}</code>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            item.status === 'DELIVERED' ? 'badge-active' : 'badge-pending'
                          }`}
                        >
                          {item.status === 'DELIVERED' ? 'Delivered via Gateway' : 'Manual / Ready'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <a
                            href={smsHref}
                            className="btn btn-outline btn-sm"
                            style={{ textDecoration: 'none', padding: '4px 8px', fontSize: '12px' }}
                          >
                            SMS ({formatted})
                          </a>
                          <a
                            href={waHref}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-success btn-sm"
                            style={{ textDecoration: 'none', padding: '4px 8px', fontSize: '12px' }}
                          >
                            WhatsApp
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
