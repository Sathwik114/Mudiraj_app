import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="grid-4" style={{ marginBottom: '32px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div className="brand-emblem" style={{ width: '36px', height: '36px', fontSize: '14px' }}>
                MC
              </div>
              <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '16px' }}>
                Mudiraj Community AP
              </div>
            </div>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6 }}>
              Official Community Membership &amp; Organizational Management Portal for Andhra Pradesh.
              Connecting State, District, Constitution, Mandal, and Gramam committees.
            </p>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '14px', marginBottom: '12px', fontWeight: 700 }}>
              Public Links
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <li><Link href="/about">About Mudiraj Community</Link></li>
              <li><Link href="/membership">Check Membership Status</Link></li>
              <li><Link href="/apply">Apply for Membership</Link></li>
              <li><Link href="/organization">Organizational Structure</Link></li>
              <li><Link href="/leadership">State &amp; District Leadership</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '14px', marginBottom: '12px', fontWeight: 700 }}>
              Leadership Wings
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <li><Link href="/leadership?teamType=Main+Team">Main Team Committee</Link></li>
              <li><Link href="/leadership?teamType=Youth+Team">Youth Wing Committee</Link></li>
              <li><Link href="/leadership?teamType=Mahila+Team">Mahila Wing Committee</Link></li>
              <li><Link href="/contact">Helpdesk &amp; District Offices</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '14px', marginBottom: '12px', fontWeight: 700 }}>
              State Head Office
            </h4>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6 }}>
              Andhra Pradesh Mudiraj Bhavan,<br />
              M.G. Road, Vijayawada,<br />
              NTR District, Andhra Pradesh - 520010<br />
              Helpline: +91 866-2478900
            </p>
            <div style={{ marginTop: '12px' }}>
              <Link href="/login" style={{ fontSize: '12px', color: '#fde68a', fontWeight: 600 }}>
                Administrator Portal Login →
              </Link>
            </div>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '18px',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '12px',
            color: '#94a3b8',
          }}
        >
          <span>
            © {new Date().getFullYear()} Mudiraj Community Membership Management System (Andhra Pradesh). All rights reserved.
          </span>
          <span>Designed for 20+ Lakh Member Scalability | Windows &amp; Cross-Browser Ready</span>
        </div>
      </div>
    </footer>
  );
}
