'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { ShieldCheck, Menu, X } from 'lucide-react';

export default function AdminShell({ admin, children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="admin-shell">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-overlay" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      <Sidebar admin={admin} isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <div className="admin-main">
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open Menu"
            >
              <Menu size={20} />
            </button>
            <ShieldCheck size={20} color="var(--primary)" className="hide-on-mobile" />
            <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--primary-dark)' }} className="topbar-title">
              Mudiraj Community Management System <span className="hide-on-mobile">— Andhra Pradesh Admin Console</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
            <span className="badge badge-active hide-on-mobile">State: Andhra Pradesh</span>
          </div>
        </header>

        <main className="admin-workspace">{children}</main>
      </div>
    </div>
  );
}
