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
            {hierarchy.orgLevels.map((lvl) => {
              const count = hierarchy.orgUnits.filter((u) => u.orgLevelId === lvl.id).length;
              return (
                <div key={lvl.id} className="stat-card">
                  <div>
                    <div className="stat-label">{lvl.name}</div>
                    <div className="stat-value">{count}</div>
                    <div className="stat-subtext">Active Units</div>
                  </div>
                </div>
              );
            })}
          </div>

          <OrganizationTree hierarchy={hierarchy} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
