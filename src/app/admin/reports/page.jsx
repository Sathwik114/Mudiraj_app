'use client';

import { useState, useEffect } from 'react';
import { Download, BarChart3, UsersRound, Building2 } from 'lucide-react';

export default function AdminReportsPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((d) => {
        setReport(d);
        setLoading(false);
      });
  }, []);

  function handleExportDistrictCsv() {
    if (!report?.districtBreakdown) return;
    const headers = [
      'District Name',
      'District Code',
      'Status',
      'Constitutions Count',
      'Mandals Count',
      'Total Applications',
      'Active Members',
      'Pending Applications',
      'Assigned Leaders',
    ];
    const rows = report.districtBreakdown.map((d) => [
      `"${d.districtName}"`,
      d.districtCode,
      d.status,
      d.constitutionsCount,
      d.mandalsCount,
      d.totalApplications,
      d.activeMembers,
      d.pendingApplications,
      d.leadersCount,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mudiraj_ap_district_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (loading || !report) {
    return <div className="card">Generating analytical reports...</div>;
  }

  const s = report.summary;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary-dark)' }}>
            Community Statistics &amp; Analytical Reports
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            District-wise, Team-wise, and Demographic Membership Reports for Andhra Pradesh
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={handleExportDistrictCsv}>
          <Download size={16} /> Export District Report (CSV)
        </button>
      </div>

      {/* Summary Row */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="card" style={{ borderTop: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <BarChart3 size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Membership Status Distribution</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Active Members:</span>
              <strong style={{ color: 'var(--success)' }}>{s.activeMembers}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Approved (Total Issued IDs):</span>
              <strong style={{ color: 'var(--primary)' }}>{s.approvedMembers}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Pending Applications:</span>
              <strong style={{ color: 'var(--warning)' }}>{s.pendingApplications}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Inactive Members:</span>
              <strong>{s.inactiveMembers}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Rejected Applications:</span>
              <strong style={{ color: 'var(--danger)' }}>{s.rejectedApplications}</strong>
            </div>
          </div>
        </div>

        <div className="card" style={{ borderTop: '4px solid var(--accent)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <UsersRound size={18} color="var(--accent)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Wing-Wise Team Summary</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            {report.teamTypeBreakdown.map((tb) => (
              <div
                key={tb.teamType}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  background: 'var(--bg-muted)',
                  borderRadius: '6px',
                }}
              >
                <span style={{ fontWeight: 700 }}>{tb.teamType}</span>
                <span>
                  {tb.teamsCount} Teams • <strong>{tb.leadersCount} Leaders</strong>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ borderTop: '4px solid var(--success)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Building2 size={18} color="var(--success)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Demographic &amp; Capacity Metrics</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Male Applicants/Members:</span>
              <strong>{report.genderBreakdown.Male}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Female Applicants/Members:</span>
              <strong>{report.genderBreakdown.Female}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Other Gender:</span>
              <strong>{report.genderBreakdown.Other}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px solid var(--border-color)' }}>
              <span>Database Design Capacity:</span>
              <strong style={{ color: 'var(--primary)' }}>20,00,000+ Members</strong>
            </div>
          </div>
        </div>
      </div>

      {/* District-wise Detailed Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">District-Wise Organizational &amp; Membership Breakdown (Andhra Pradesh)</h2>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>District Name</th>
                <th>Code</th>
                <th>Constitutions</th>
                <th>Mandals</th>
                <th>Total Applications</th>
                <th>Active / Approved</th>
                <th>Pending Review</th>
                <th>Assigned Leaders</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {report.districtBreakdown.map((d) => (
                <tr key={d.districtId}>
                  <td style={{ fontWeight: 700 }}>{d.districtName}</td>
                  <td><code>{d.districtCode}</code></td>
                  <td>{d.constitutionsCount}</td>
                  <td>{d.mandalsCount}</td>
                  <td style={{ fontWeight: 700 }}>{d.totalApplications}</td>
                  <td style={{ color: 'var(--success)', fontWeight: 700 }}>{d.activeMembers}</td>
                  <td style={{ color: 'var(--warning)', fontWeight: 700 }}>{d.pendingApplications}</td>
                  <td style={{ color: 'var(--primary)', fontWeight: 700 }}>{d.leadersCount}</td>
                  <td>
                    <span className={`badge ${d.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
