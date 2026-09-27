'use client';

import { useState } from 'react';
import MemberTable from '@/components/MemberTable';

export default function AdminApplicationsPage() {
  const [activeTab, setActiveTab] = useState('Pending');

  const tabs = [
    { status: 'Pending', label: 'Pending Review Applications' },
    { status: 'Active', label: 'Approved & Active (ID Generated)' },
    { status: 'Rejected', label: 'Rejected Applications' },
    { status: '', label: 'All Applications' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary-dark)' }}>
          Membership Applications &amp; Approval Queue
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Review incoming public membership applications. Approving an application automatically
          generates a unique permanent Membership ID (<code>MUD-00000001</code>+) and activates the
          member.
        </p>
      </div>

      {/* Status Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
        {tabs.map((tab) => (
          <button
            key={tab.label}
            type="button"
            className={`btn ${activeTab === tab.status ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab(tab.status)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <MemberTable
        key={activeTab}
        defaultStatus={activeTab}
        title={
          activeTab
            ? `${activeTab} Membership Applications`
            : 'All Membership Applications'
        }
        showApplicationActions={true}
      />
    </div>
  );
}
