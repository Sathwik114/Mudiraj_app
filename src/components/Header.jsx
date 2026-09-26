'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, UserPlus } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/membership', label: 'Membership' },
    { href: '/apply', label: 'Apply for Membership' },
    { href: '/organization', label: 'Organization' },
    { href: '/leadership', label: 'Leadership' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <>
      <div className="top-banner">
        <div className="container top-banner-inner">
          <span>
            <strong>Andhra Pradesh Mudiraj Mahasabha</strong> — Unity, Empowerment &amp; Community Welfare
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span>State Jurisdiction: Andhra Pradesh</span>
            <Link
              href="/login"
              style={{
                color: '#fde68a',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <ShieldCheck size={14} /> Admin Login
            </Link>
          </div>
        </div>
      </div>

      <header className="site-header">
        <div className="container header-inner">
          <Link href="/" className="brand-logo">
            <div className="brand-emblem">MC</div>
            <div>
              <div className="brand-title">Mudiraj Community</div>
              <div className="brand-subtitle">ANDHRA PRADESH STATE PORTAL</div>
            </div>
          </Link>

          <nav className="nav-links" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive =
                item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link href="/apply" className="btn btn-accent btn-sm" style={{ marginLeft: '6px' }}>
              <UserPlus size={15} /> Join Now
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
