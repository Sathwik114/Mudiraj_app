'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileCheck2,
  Network,
  UsersRound,
  Award,
  BarChart3,
  Settings,
  LogOut,
  Globe,
} from 'lucide-react';

export default function Sidebar({ admin }) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/admin/members', label: 'Members', icon: Users },
    { href: '/admin/applications', label: 'Membership Applications', icon: FileCheck2 },
    { href: '/admin/organizations', label: 'Organizations', icon: Network },
    { href: '/admin/teams', label: 'Teams', icon: UsersRound },
    { href: '/admin/leaders', label: 'Leaders', icon: Award },
    { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="brand-emblem" style={{ width: '38px', height: '38px', fontSize: '15px' }}>
              MC
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#ffffff' }}>
                Mudiraj Admin
              </div>
              <div style={{ fontSize: '11px', color: '#fbbf24', fontWeight: 600 }}>
                ANDHRA PRADESH STATE
              </div>
            </div>
          </div>
        </div>
        {admin && (
          <div
            style={{
              marginTop: '12px',
              padding: '8px 10px',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#cbd5e1',
            }}
          >
            Signed in as: <strong style={{ color: '#fff' }}>{admin.fullName || admin.username}</strong>
          </div>
        )}
      </div>

      <nav className="admin-nav" aria-label="Admin Navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Prominent Logout Button directly after Settings */}
        <button
          type="button"
          onClick={handleLogout}
          className="admin-nav-item"
          style={{
            width: '100%',
            background: 'rgba(239, 68, 68, 0.18)',
            border: '1px solid rgba(248, 113, 113, 0.4)',
            cursor: 'pointer',
            color: '#fecaca',
            textAlign: 'left',
            fontFamily: 'inherit',
            marginTop: '8px',
          }}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>

        <Link
          href="/"
          className="admin-nav-item"
          style={{ marginTop: '6px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}
        >
          <Globe size={18} />
          <span>Public Website</span>
        </Link>
      </nav>
    </aside>
  );
}
