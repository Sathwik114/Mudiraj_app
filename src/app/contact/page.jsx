import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function ContactPage() {
  const districtOffices = [
    { district: 'NTR (Vijayawada) — State HQ', address: 'M.G. Road, Benz Circle, Vijayawada - 520010', phone: '+91 866-2478900' },
    { district: 'Visakhapatnam', address: 'MVP Colony, Sector 5, Visakhapatnam - 530017', phone: '+91 891-2554411' },
    { district: 'Guntur', address: 'Arundelpet 4th Line, Guntur - 522002', phone: '+91 863-2233445' },
    { district: 'Kurnool', address: 'Narasimha Rao Peta, Kurnool - 518001', phone: '+91 8518-221199' },
    { district: 'Tirupati', address: 'Kapila Theertham Road, Tirupati - 517501', phone: '+91 877-2288776' },
    { district: 'Anantapuramu', address: 'Kamalanagar Main Road, Anantapuramu - 515001', phone: '+91 8554-244556' },
  ];

  return (
    <div className="page-wrapper">
      <Header />

      <main className="main-content" style={{ padding: '40px 0' }}>
        <div className="container">
          <div className="card" style={{ marginBottom: '24px', borderTop: '4px solid var(--primary)' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '8px' }}>
              Contact Andhra Pradesh Mudiraj Community Helpdesk
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              For assistance with Membership Applications, District/Constitution/Mandal committee
              coordination, or welfare programs, reach out to our State or District offices.
            </p>
          </div>

          <div className="grid-3" style={{ marginBottom: '28px' }}>
            <div className="card">
              <MapPin size={24} color="var(--primary)" style={{ marginBottom: '8px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>State Headquarters</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Andhra Pradesh Mudiraj Bhavan, M.G. Road, Vijayawada, NTR District, AP - 520010
              </p>
            </div>

            <div className="card">
              <Phone size={24} color="var(--accent)" style={{ marginBottom: '8px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Membership Helpline</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Toll-Free Support: 1800-425-MUDIRAJ<br />
                State Office Desk: +91 866-2478900
              </p>
            </div>

            <div className="card">
              <Mail size={24} color="var(--success)" style={{ marginBottom: '8px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Official Email &amp; Hours</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                support@mudirajcommunityap.org<br />
                <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                Mon – Sat: 9:30 AM to 6:00 PM
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Regional District Coordination Centers (Andhra Pradesh)</h2>
            </div>
            <div className="grid-3">
              {districtOffices.map((off) => (
                <div
                  key={off.district}
                  style={{
                    padding: '14px',
                    background: 'var(--bg-body)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>
                    {off.district}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{off.address}</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, marginTop: '6px' }}>{off.phone}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
