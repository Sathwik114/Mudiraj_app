import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { memberService } from '@/services/memberService';
import { teamService } from '@/services/teamService';
import {
  UserPlus,
  Search,
  Network,
  UsersRound,
  Award,
  ShieldCheck,
  CheckCircle2,
  MapPin,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const stats = memberService.getDashboardAndReportStats().summary;
  const stateLeaders = teamService
    .getLeadersDirectory({ orgLevel: 'State' })
    .slice(0, 6);

  return (
    <div className="page-wrapper">
      <Header />

      <main className="main-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="container hero-grid">
            <div>
              <span className="hero-badge">Andhra Pradesh State Official Portal</span>
              <h1 className="hero-title">
                Mudiraj Community Membership &amp; Organizational Management System
              </h1>
              <p className="hero-description">
                Uniting the Mudiraj Community across all Districts, Assembly Constitutions, Mandals,
                and Gramams of Andhra Pradesh. Register online for official community membership,
                verify your status, and connect with our Main, Youth, and Mahila committees.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link href="/apply" className="btn btn-accent btn-lg">
                  <UserPlus size={18} /> Apply for Membership
                </Link>
                <Link
                  href="/membership"
                  className="btn btn-outline btn-lg"
                  style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
                >
                  <Search size={18} /> Check Application Status
                </Link>
              </div>
            </div>

            <div
              className="card"
              style={{
                background: 'rgba(255, 255, 255, 0.96)',
                color: 'var(--text-main)',
                borderTop: '4px solid var(--accent)',
              }}
            >
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--primary)', marginBottom: '12px' }}>
                 Andhra Pradesh Organizational Snapshot
              </h3>
              <div className="grid-2" style={{ gap: '12px', marginBottom: '16px' }}>
                <div style={{ padding: '12px', background: 'var(--bg-muted)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary)' }}>
                    {stats.activeDistricts}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Active Districts
                  </div>
                </div>
                <div style={{ padding: '12px', background: 'var(--bg-muted)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary)' }}>
                    {stats.activeConstitutions}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Constitutions
                  </div>
                </div>
                <div style={{ padding: '12px', background: 'var(--bg-muted)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary)' }}>
                    {stats.activeMandals}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Mandals
                  </div>
                </div>
                <div style={{ padding: '12px', background: 'var(--bg-muted)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent)' }}>
                    {stats.totalTeams}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Main / Youth / Mahila Teams
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={15} color="var(--success)" />
                <span>Engineered for 20,00,000+ (20 Lakh) Registered Community Members</span>
              </div>
            </div>
          </div>
        </section>

        {/* Core Pillars & Organizational Hierarchy Section */}
        <section style={{ padding: '48px 0' }}>
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 36px' }}>
              <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--primary-dark)' }}>
                5-Tier Organizational Governance &amp; 3 Leadership Wings
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                Every administrative level across Andhra Pradesh is structured with three dedicated
                committees—Main Team, Youth Team, and Mahila Team—each supporting ~30 leadership positions.
              </p>
            </div>

            <div className="grid-3">
              <div className="card" style={{ borderTop: '4px solid var(--primary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <Network size={22} color="var(--primary)" />
                  <h3 style={{ fontSize: '17px', fontWeight: 700 }}>5-Tier Hierarchy</h3>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  Structured representation from State level down to grassroots villages:
                </p>
                <div style={{ fontSize: '13px', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div>1. State — Andhra Pradesh</div>
                  <div>2. District Committees</div>
                  <div>3. Assembly Constitutions</div>
                  <div>4. Mandal Committees</div>
                  <div>
                    5. Gramam Committees{' '}
                    <span className="badge badge-future" style={{ marginLeft: '4px' }}>
                      Future Feature
                    </span>
                  </div>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <Link href="/organization" className="btn btn-outline btn-sm">
                    Explore Organization Tree →
                  </Link>
                </div>
              </div>

              <div className="card" style={{ borderTop: '4px solid #0369a1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <UsersRound size={22} color="#0369a1" />
                  <h3 style={{ fontSize: '17px', fontWeight: 700 }}>Main, Youth &amp; Mahila Wings</h3>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  Each organizational unit automatically operates three unified teams:
                </p>
                <ul style={{ listStyle: 'none', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li>
                    <strong>• Main Team:</strong> Core policy, social representation &amp; community welfare
                  </li>
                  <li>
                    <strong>• Youth Team:</strong> Education, employment drives &amp; youth mobilization
                  </li>
                  <li>
                    <strong>• Mahila Team:</strong> Women empowerment, self-help &amp; family support
                  </li>
                </ul>
                <div style={{ marginTop: '16px' }}>
                  <Link href="/leadership" className="btn btn-outline btn-sm">
                    View Leadership Teams →
                  </Link>
                </div>
              </div>

              <div className="card" style={{ borderTop: '4px solid var(--accent)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <ShieldCheck size={22} color="var(--accent)" />
                  <h3 style={{ fontSize: '17px', fontWeight: 700 }}>Verified Membership ID</h3>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  No account creation required for public applicants:
                </p>
                <ul style={{ listStyle: 'none', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li>
                    <strong>Step 1:</strong> Submit personal &amp; address details online
                  </li>
                  <li>
                    <strong>Step 2:</strong> Application enters <code>Pending</code> verification
                  </li>
                  <li>
                    <strong>Step 3:</strong> Admin approves &amp; generates unique ID (<code>MUD-00000001</code>)
                  </li>
                </ul>
                <div style={{ marginTop: '16px' }}>
                  <Link href="/apply" className="btn btn-primary btn-sm">
                    Apply for Membership →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* State Leadership Spotlight */}
        <section style={{ padding: '20px 0 48px' }}>
          <div className="container">
            <div className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">State &amp; Key Organizational Office Bearers</h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Verified registered members serving in Andhra Pradesh State Leadership Teams
                  </p>
                </div>
                <Link href="/leadership" className="btn btn-outline btn-sm">
                  View Full Leadership Directory
                </Link>
              </div>

              <div className="grid-3">
                {stateLeaders.map((leader) => (
                  <div
                    key={leader.id}
                    style={{
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-body)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span className="badge badge-info">
                        <Award size={12} /> {leader.positionTitle}
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)' }}>
                        {leader.membershipId}
                      </span>
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
                      {leader.memberName}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-hover)', marginTop: '2px' }}>
                      {leader.orgName} — {leader.teamType}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        marginTop: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <MapPin size={12} /> {leader.location}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
