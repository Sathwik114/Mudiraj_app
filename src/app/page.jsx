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
        <section className="hero-section" style={{ borderBottom: 'none', position: 'relative' }}>
          {/* Subtle gradient divider at the bottom instead of harsh line */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, rgba(29,78,216,0) 0%, rgba(217,119,6,0.5) 50%, rgba(29,78,216,0) 100%)' }} />
          
          <div className="container hero-grid">
            <div className="animate-fade-in-up">
              <span className="hero-badge">Andhra Pradesh State Official Portal</span>
              <h1 className="hero-title">
                Uniting the Mudiraj Community of Andhra Pradesh
              </h1>
              <p className="hero-description">
                <strong>Membership &amp; Organizational Management System.</strong> Register online for official community membership, verify your status, and connect with our Main, Youth, and Mahila committees across all Districts, Assembly Constitutions, Mandals, and Gramams.
              </p>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <Link href="/apply" className="btn btn-accent btn-lg" style={{ padding: '14px 28px', fontSize: '16px' }}>
                  <UserPlus size={20} /> Apply for Membership
                </Link>
                <Link
                  href="/membership"
                  className="btn btn-outline btn-lg"
                  style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', borderColor: 'rgba(255,255,255,0.3)', padding: '14px 28px', fontSize: '16px' }}
                >
                  <Search size={20} /> Check Application Status
                </Link>
              </div>
            </div>

            <div
              className="card animate-fade-in-up delay-200"
              style={{
                background: 'rgba(255, 255, 255, 0.98)',
                color: 'var(--text-main)',
                borderTop: '4px solid var(--accent)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              }}
            >
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary)', marginBottom: '16px' }}>
                 Andhra Pradesh Organizational Snapshot
              </h3>
              <div className="grid-2" style={{ gap: '16px', marginBottom: '24px' }}>
                <div style={{ padding: '16px', background: 'var(--bg-muted)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)' }}>
                    {stats.activeDistricts}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Active Districts
                  </div>
                </div>
                <div style={{ padding: '16px', background: 'var(--bg-muted)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)' }}>
                    {stats.activeConstitutions}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Constitutions
                  </div>
                </div>
                <div style={{ padding: '16px', background: 'var(--bg-muted)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)' }}>
                    {stats.activeMandals}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Mandals
                  </div>
                </div>
                <div style={{ padding: '16px', background: 'var(--bg-muted)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--accent)' }}>
                    {stats.totalTeams}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Main / Youth / Mahila Teams
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'var(--success-bg)', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                <CheckCircle2 size={18} color="var(--success)" />
                <span>Built for a growing community of <strong>20 Lakh+</strong> members.</span>
              </div>
            </div>
          </div>
        </section>

        {/* Core Pillars & Organizational Hierarchy Section */}
        <section style={{ padding: '64px 0' }}>
          <div className="container">
            <div className="animate-fade-in-up delay-100" style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 48px' }}>
              <h2 style={{ fontSize: '30px', fontWeight: 800, color: 'var(--primary-dark)' }}>
                5-Tier Organizational Governance &amp; 3 Leadership Wings
              </h2>
              <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginTop: '12px', lineHeight: 1.6 }}>
                Every administrative level across Andhra Pradesh is structured with three dedicated
                committees—Main Team, Youth Team, and Mahila Team—each supporting ~30 leadership positions.
              </p>
            </div>

            <div className="grid-3">
              <div className="card animate-fade-in-up stagger-1" style={{ borderTop: '4px solid var(--primary)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ padding: '10px', background: 'var(--primary-light)', borderRadius: '8px' }}>
                      <Network size={24} color="var(--primary)" />
                    </div>
                    <h3 style={{ fontSize: '19px', fontWeight: 700 }}>5-Tier Hierarchy</h3>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
                    Structured representation from State level down to grassroots villages:
                  </p>
                  <div style={{ fontSize: '14px', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }}></div> State — Andhra Pradesh</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }}></div> District Committees</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }}></div> Assembly Constitutions</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }}></div> Mandal Committees</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-muted)' }}></div>
                      Gramam Committees{' '}
                      <span className="badge badge-future" style={{ marginLeft: '6px' }}>
                        Future
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                  <Link href="/organization" className="btn btn-outline btn-sm" style={{ width: '100%' }}>
                    Explore Organization Tree →
                  </Link>
                </div>
              </div>

              <div className="card animate-fade-in-up stagger-2" style={{ borderTop: '4px solid #0369a1', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ padding: '10px', background: '#e0f2fe', borderRadius: '8px' }}>
                      <UsersRound size={24} color="#0369a1" />
                    </div>
                    <h3 style={{ fontSize: '19px', fontWeight: 700 }}>Main, Youth &amp; Mahila Wings</h3>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
                    Each organizational unit automatically operates three unified teams:
                  </p>
                  <ul style={{ listStyle: 'none', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <li style={{ display: 'flex', gap: '8px' }}>
                      <div style={{ marginTop: '4px', width: '6px', height: '6px', borderRadius: '50%', background: '#0369a1', flexShrink: 0 }}></div>
                      <span><strong>Main Team:</strong> Core policy, social representation &amp; community welfare</span>
                    </li>
                    <li style={{ display: 'flex', gap: '8px' }}>
                      <div style={{ marginTop: '4px', width: '6px', height: '6px', borderRadius: '50%', background: '#0369a1', flexShrink: 0 }}></div>
                      <span><strong>Youth Team:</strong> Education, employment drives &amp; youth mobilization</span>
                    </li>
                    <li style={{ display: 'flex', gap: '8px' }}>
                      <div style={{ marginTop: '4px', width: '6px', height: '6px', borderRadius: '50%', background: '#0369a1', flexShrink: 0 }}></div>
                      <span><strong>Mahila Team:</strong> Women empowerment, self-help &amp; family support</span>
                    </li>
                  </ul>
                </div>
                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                  <Link href="/leadership" className="btn btn-outline btn-sm" style={{ width: '100%' }}>
                    View Leadership Teams →
                  </Link>
                </div>
              </div>

              <div className="card animate-fade-in-up stagger-3" style={{ borderTop: '4px solid var(--accent)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ padding: '10px', background: 'var(--accent-light)', borderRadius: '8px' }}>
                      <ShieldCheck size={24} color="var(--accent)" />
                    </div>
                    <h3 style={{ fontSize: '19px', fontWeight: 700 }}>Verified Membership ID</h3>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
                    No account creation required for public applicants:
                  </p>
                  <ul style={{ listStyle: 'none', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ background: 'var(--accent)', color: 'white', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', flexShrink: 0, marginTop: '2px' }}>1</div>
                      <span>Submit personal &amp; address details online</span>
                    </li>
                    <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ background: 'var(--accent)', color: 'white', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', flexShrink: 0, marginTop: '2px' }}>2</div>
                      <span>Application enters <code>Pending</code> verification</span>
                    </li>
                    <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ background: 'var(--accent)', color: 'white', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', flexShrink: 0, marginTop: '2px' }}>3</div>
                      <span>Admin approves &amp; generates unique ID (<code>MUD-00001</code>)</span>
                    </li>
                  </ul>
                </div>
                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                  <Link href="/apply" className="btn btn-primary btn-sm" style={{ width: '100%', background: 'var(--accent)' }}>
                    Apply for Membership →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* State Leadership Spotlight */}
        <section className="animate-fade-in-up delay-200" style={{ padding: '20px 0 64px' }}>
          <div className="container">
            <div className="card">
              <div className="card-header" style={{ paddingBottom: '20px', marginBottom: '24px' }}>
                <div>
                  <h2 className="card-title" style={{ fontSize: '22px' }}>State &amp; Key Organizational Office Bearers</h2>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
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
                      padding: '20px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-body)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      cursor: 'pointer',
                    }}
                    className="leader-card"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span className="badge badge-info" style={{ padding: '4px 10px' }}>
                        <Award size={14} /> {leader.positionTitle}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>
                        {leader.membershipId}
                      </span>
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
                      {leader.memberName}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-hover)' }}>
                      {leader.orgName} — {leader.teamType}
                    </div>
                    <div
                      style={{
                        fontSize: '13px',
                        color: 'var(--text-secondary)',
                        marginTop: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <MapPin size={14} /> {leader.location}
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
