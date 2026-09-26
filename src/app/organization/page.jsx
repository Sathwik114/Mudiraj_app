import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OrganizationTree from '@/components/OrganizationTree';
import { organizationService } from '@/services/organizationService';

export const dynamic = 'force-dynamic';

export default function PublicOrganizationPage() {
  const hierarchy = organizationService.getHierarchy({ includeInactive: false });

  return (
    <div className="page-wrapper">
      <Header />

      <main className="main-content" style={{ padding: '36px 0' }}>
        <div className="container">
          <div style={{ marginBottom: '24px' }}>
            <span className="badge badge-info" style={{ marginBottom: '8px' }}>
              5-Tier Organizational Structure
            </span>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--primary-dark)' }}>
              Andhra Pradesh Mudiraj Community Organizational Hierarchy
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Explore our active State, District, Assembly Constitution, Mandal, and Gramam
              organizational units across Andhra Pradesh.
            </p>
          </div>

          <div className="grid-5" style={{ marginBottom: '24px' }}>
            <div className="stat-card">
              <div>
                <div className="stat-label">State</div>
                <div className="stat-value">1</div>
                <div className="stat-subtext">Andhra Pradesh</div>
              </div>
            </div>
            <div className="stat-card">
              <div>
                <div className="stat-label">Districts</div>
                <div className="stat-value">{hierarchy.districts.length}</div>
                <div className="stat-subtext">Active District Units</div>
              </div>
            </div>
            <div className="stat-card">
              <div>
                <div className="stat-label">Constitutions</div>
                <div className="stat-value">{hierarchy.constitutions.length}</div>
                <div className="stat-subtext">Assembly Constituencies</div>
              </div>
            </div>
            <div className="stat-card">
              <div>
                <div className="stat-label">Mandals</div>
                <div className="stat-value">{hierarchy.mandals.length}</div>
                <div className="stat-subtext">Mandal Committees</div>
              </div>
            </div>
            <div className="stat-card">
              <div>
                <div className="stat-label">Gramams</div>
                <div className="stat-value">{hierarchy.gramams.length}</div>
                <div className="stat-subtext">
                  <span className="badge badge-future">Future Feature</span>
                </div>
              </div>
            </div>
          </div>

          <OrganizationTree hierarchy={hierarchy} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
