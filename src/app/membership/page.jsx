'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Search, UserPlus, CheckCircle2, Clock, XCircle, Shield } from 'lucide-react';

function MembershipLookupContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('query') || '';

  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function performLookup(searchValue) {
    if (!searchValue || !searchValue.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(
        `/api/public/apply?query=${encodeURIComponent(searchValue.trim())}`
      );
      const data = await res.json();
      if (!res.ok || !data.found) {
        setError(
          data.error || 'No membership or application record found with that ID or Mobile Number.'
        );
      } else {
        setResult(data.record);
      }
    } catch {
      setError('Unable to check status right now. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialQuery) {
      performLookup(initialQuery);
    }
  }, [initialQuery]);

  function handleSubmit(e) {
    e.preventDefault();
    performLookup(query);
  }

  return (
    <div className="container">
      <div className="grid-2" style={{ marginBottom: '28px', alignItems: 'start' }}>
        {/* Status Lookup Card */}
        <div className="card" style={{ borderTop: '4px solid var(--primary)' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '6px' }}>
            Verify Membership / Track Application Status
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
            Enter your <strong>Membership ID</strong> (e.g. <code>MUD-00000001</code>),{' '}
            <strong>Application Number</strong> (e.g. <code>APP-2026-0009</code>), or{' '}
            <strong>Registered Mobile Number</strong> (e.g. <code>9848011223</code>).
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Enter MUD-00000001, APP-2026-0009, or Mobile Number"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Search size={16} /> {loading ? 'Checking...' : 'Check Status'}
            </button>
          </form>

          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Try sample records:{' '}
            <button
              type="button"
              onClick={() => {
                setQuery('MUD-00000001');
                performLookup('MUD-00000001');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline',
                marginRight: '10px',
              }}
            >
              MUD-00000001 (Active)
            </button>
            <button
              type="button"
              onClick={() => {
                setQuery('APP-2026-0009');
                performLookup('APP-2026-0009');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--warning)',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              APP-2026-0009 (Pending)
            </button>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {result && (
            <div
              style={{
                marginTop: '16px',
                padding: '18px',
                borderRadius: '10px',
                border: '1px solid var(--border-strong)',
                background: 'var(--bg-body)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '12px',
                  marginBottom: '12px',
                  borderBottom: '1px solid var(--border-color)',
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Application No: {result.applicationNo}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary-dark)' }}>
                    {result.fullName}
                  </div>
                </div>
                <span
                  className={`badge ${
                    ['Active', 'Approved'].includes(result.status)
                      ? 'badge-active'
                      : result.status === 'Pending'
                      ? 'badge-pending'
                      : 'badge-rejected'
                  }`}
                >
                  {result.status}
                </span>
              </div>

              <div className="grid-2" style={{ gap: '10px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Membership ID:</span>
                  <div style={{ fontWeight: 800, color: 'var(--primary)' }}>
                    {result.membershipId || 'Issued Upon Admin Approval'}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Father Name:</span>
                  <div style={{ fontWeight: 600 }}>{result.fatherName}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>District &amp; Constitution:</span>
                  <div style={{ fontWeight: 600 }}>
                    {result.districtName} › {result.constitutionName}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Mandal &amp; Village/Gramam:</span>
                  <div style={{ fontWeight: 600 }}>
                    {result.mandalName} › {result.gramamName}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>ID Proof (Masked for Privacy):</span>
                  <div style={{ fontWeight: 600 }}>
                    {result.idType}: <code>{result.maskedIdNumber}</code>
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Status Remarks:</span>
                  <div style={{ fontWeight: 600 }}>{result.remarks || '—'}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Workflow & Membership Information Card */}
        <div className="card" style={{ borderTop: '4px solid var(--accent)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '12px' }}>
            Membership Application &amp; Verification Workflow
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
            Our membership process is transparent, secure, and does not require public users to create
            a login account.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '22px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Clock size={20} color="var(--warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>
                  1. Submit Online Application (Status = Pending)
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Fill out your Personal Details, Andhra Pradesh Address (District, Constitution, Mandal,
                  Village/Gramam), and Government ID details.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Shield size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>
                  2. Administrator Review &amp; Verification
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Authorized administrators review the application details and verify community
                  jurisdiction.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <CheckCircle2 size={20} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>
                  3. Approval &amp; Unique Membership ID Generation (Status = Active)
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Upon approval, the system automatically generates a permanent unique Membership ID
                  (e.g., <code>MUD-00000001</code>) supporting over 20 lakh members.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <XCircle size={20} color="var(--danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>
                  If Rejected (Status = Rejected)
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  If any details are incomplete, the administrator records clear rejection remarks so
                  you can correct and submit valid details.
                </div>
              </div>
            </div>
          </div>

          <Link href="/apply" className="btn btn-accent" style={{ width: '100%' }}>
            <UserPlus size={17} /> Proceed to Online Membership Application Form
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function MembershipPage() {
  return (
    <div className="page-wrapper">
      <Header />
      <main className="main-content" style={{ padding: '40px 0' }}>
        <Suspense fallback={<div className="container">Loading membership lookup...</div>}>
          <MembershipLookupContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
