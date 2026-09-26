import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Users, BookOpen, HeartHandshake, Award, UserPlus } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="page-wrapper">
      <Header />

      <main className="main-content" style={{ padding: '40px 0' }}>
        <div className="container">
          <div className="card" style={{ marginBottom: '24px', borderTop: '4px solid var(--primary)' }}>
            <span className="badge badge-info" style={{ marginBottom: '10px' }}>
              About the Community
            </span>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '12px' }}>
              Andhra Pradesh Mudiraj Community Mahasabha
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              The Mudiraj Community is one of the largest, historically significant, and vibrant communities
              across Telugu states. With roots deeply connected to agrarian stewardship, inland fisheries,
              historic defense, trade, and public service, the Andhra Pradesh Mudiraj Community Membership
              Management System provides a unified digital backbone to connect over <strong>20 Lakh (2,000,000+)</strong>{' '}
              members across every District, Assembly Constitution, Mandal, and Gramam in Andhra Pradesh.
            </p>
          </div>

          <div className="grid-3" style={{ marginBottom: '24px' }}>
            <div className="card">
              <Users size={26} color="var(--primary)" style={{ marginBottom: '10px' }} />
              <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>
                Community Unity &amp; Identity
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Every approved member receives a lifelong unique Membership ID (<code>MUD-00000001</code> format),
                ensuring transparent representation from the village level to the State Executive Committee.
              </p>
            </div>

            <div className="card">
              <BookOpen size={26} color="var(--accent)" style={{ marginBottom: '10px' }} />
              <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>
                Youth Education &amp; Skill Drives
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Through our dedicated <strong>Youth Team</strong> at State, District, Constitution, and Mandal
                levels, we organize scholarship guidance, competitive exam coaching, and career mentorship.
              </p>
            </div>

            <div className="card">
              <HeartHandshake size={26} color="#9d174d" style={{ marginBottom: '10px' }} />
              <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>
                Mahila Empowerment
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Our <strong>Mahila Team</strong> empowers women across every Mandal and District with
                leadership representation, self-employment support, and welfare coordination.
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Standard 30-Member Team Leadership Structure</h2>
              <Award size={20} color="var(--accent)" />
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Every organizational level (State, District, Constitution, Mandal, and future Gramam committees)
              maintains three teams—<strong>Main Team</strong>, <strong>Youth Team</strong>, and{' '}
              <strong>Mahila Team</strong>—structured as follows:
            </p>

            <div className="table-container" style={{ marginBottom: '20px' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Leadership Position</th>
                    <th>Sanctioned Positions per Team</th>
                    <th>Responsibility Scope</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 700 }}>President / Chairman</td>
                    <td>1 Position</td>
                    <td>Heads the committee at the respective organizational level</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700 }}>Vice Presidents</td>
                    <td>6 Positions</td>
                    <td>Zonal &amp; regional supervision under the President</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700 }}>General Secretaries</td>
                    <td>2 Positions</td>
                    <td>Organizational operations, meetings &amp; official records</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700 }}>Secretaries</td>
                    <td>6 Positions</td>
                    <td>Departmental coordination &amp; member outreach</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700 }}>Treasurer</td>
                    <td>1 Position</td>
                    <td>Financial stewardship &amp; community welfare fund accounting</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700 }}>Executive Members</td>
                    <td>Variable (Default 14 Positions)</td>
                    <td>Dynamically scalable based on local population &amp; representation needs</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Link href="/apply" className="btn btn-primary">
                <UserPlus size={16} /> Apply for Membership
              </Link>
              <Link href="/organization" className="btn btn-outline">
                View Organizational Hierarchy
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
