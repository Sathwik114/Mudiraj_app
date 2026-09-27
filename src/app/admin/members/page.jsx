'use client';

import { useState } from 'react';
import MemberTable from '@/components/MemberTable';
import MemberForm from '@/components/MemberForm';
import { UserPlus, X } from 'lucide-react';

export default function AdminMembersPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary-dark)' }}>
            Member Database Management
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Search, filter, sort, view, and manage community members across Andhra Pradesh.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <UserPlus size={16} /> Register New Member Directly
        </button>
      </div>

      <MemberTable
        key={refreshKey}
        defaultStatus=""
        title="All Community Members & Applications"
        showApplicationActions={true}
      />

      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div
            className="modal-panel"
            style={{ maxWidth: '920px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>
                Direct Member Registration (Admin)
              </h3>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setShowAddModal(false)}
              >
                <X size={15} /> Close
              </button>
            </div>
            <div className="modal-body">
              <MemberForm
                isAdminMode={true}
                onSuccess={() => {
                  setShowAddModal(false);
                  setRefreshKey((k) => k + 1);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
