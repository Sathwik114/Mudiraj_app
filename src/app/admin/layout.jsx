import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';
import { ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }) {
  const admin = await getAdminSession();
  if (!admin) {
    redirect('/login');
  }

  return (
    <div className="admin-shell">
      <Sidebar admin={admin} />

      <div className="admin-main">
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={20} color="var(--primary)" />
            <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--primary-dark)' }}>
              Mudiraj Community Management System — Andhra Pradesh Admin Console
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
            <span className="badge badge-active">State: Andhra Pradesh</span>
            <span style={{ color: 'var(--text-secondary)' }}>
              Role: <strong>{admin.role}</strong>
            </span>
          </div>
        </header>

        <main className="admin-workspace">{children}</main>
      </div>
    </div>
  );
}
