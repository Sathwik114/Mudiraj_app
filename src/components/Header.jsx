'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, UserPlus, ChevronDown } from 'lucide-react';
import mudirajLogo from '@/Public/mudiraj_logo.png';

export default function Header() {
  const pathname = usePathname();

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
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid transparent',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.border = '1px solid #fde68a'; e.currentTarget.style.background = 'rgba(253, 230, 138, 0.1)' }}
              onMouseLeave={(e) => { e.currentTarget.style.border = '1px solid transparent'; e.currentTarget.style.background = 'transparent' }}
            >
              <ShieldCheck size={14} /> Admin Login
            </Link>
          </div>
        </div>
      </div>

      <header className="site-header">
        <div className="container header-inner">
          <Link href="/" className="brand-logo">
            <img
              src={mudirajLogo.src || mudirajLogo}
              alt="Mudiraj Community Logo"
              className="brand-emblem"
              style={{ objectFit: 'cover', borderRadius: '50%', width: '48px', height: '48px' }}
            />
            <div>
              <div className="brand-title">Mudiraj Community</div>
              <div className="brand-subtitle">ANDHRA PRADESH STATE PORTAL</div>
            </div>
          </Link>

          <nav className="nav-links" aria-label="Main Navigation">
            <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
              Home
            </Link>
            
            <div className="dropdown">
              <div className={`nav-link ${pathname?.startsWith('/about') || pathname?.startsWith('/contact') ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                About Us <ChevronDown size={14} />
              </div>
              <div className="dropdown-content">
                <Link href="/about">About Organization</Link>
                <Link href="/contact">Contact Us</Link>
              </div>
            </div>

            <div className="dropdown">
              <div className={`nav-link ${pathname?.startsWith('/organization') || pathname?.startsWith('/leadership') ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                Structure <ChevronDown size={14} />
              </div>
              <div className="dropdown-content">
                <Link href="/organization">Organization Tree</Link>
                <Link href="/leadership">Leadership Directory</Link>
              </div>
            </div>
            

            <Link href="/membership" className={`nav-link ${pathname?.startsWith('/membership') ? 'active' : ''}`}>
              Membership Status
            </Link>

            <Link href="/apply" className="btn btn-accent btn-sm" style={{ marginLeft: '6px' }}>
              <UserPlus size={15} /> Join Now
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
