import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MemberForm from '@/components/MemberForm';
import { organizationService } from '@/services/organizationService';

export const dynamic = 'force-dynamic';

export default function ApplyMembershipPage() {
  const hierarchy = organizationService.getHierarchy({ includeInactive: false });

  return (
    <div className="page-wrapper">
      <Header />

      <main className="main-content" style={{ padding: '36px 0' }}>
        <div className="container">
          <div style={{ marginBottom: '24px' }}>
            <span className="badge badge-info" style={{ marginBottom: '8px' }}>
              Public Registration — No Login Required
            </span>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--primary-dark)' }}>
              Apply for Mudiraj Community Membership (Andhra Pradesh)
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Complete the official membership application form below. Fields marked with{' '}
              <span style={{ color: 'var(--danger)', fontWeight: 700 }}>*</span> are mandatory.
            </p>
          </div>

          <MemberForm hierarchy={hierarchy} isAdminMode={false} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
