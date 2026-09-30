'use client';

import { useState, useEffect } from 'react';
import MemberTable from '@/components/MemberTable';
import MemberForm from '@/components/MemberForm';
import { UserPlus, X, Smartphone, Send } from 'lucide-react';
import { formatIndianMobile } from '@/lib/validation';

export default function AdminMembersPage() {
  const [hierarchy, setHierarchy] = useState({
    districts: [],
    constitutions: [],
    mandals: [],
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [registrationNotice, setRegistrationNotice] = useState(null);

  useEffect(() => {
    fetch('/api/admin/organizations')
      .then((r) => r.json())
      .then((d) => {
        if (d.hierarchy) setHierarchy(d.hierarchy);
      });
  }, []);

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

      {registrationNotice && (
        <div
          className="alert alert-success"
          style={{
            marginBottom: '18px',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '10px',
          }}
        >
          <div>{registrationNotice.text}</div>
          {(registrationNotice.smsUri || registrationNotice.whatsappUri) && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              {registrationNotice.smsUri && (
                <a
                  href={registrationNotice.smsUri}
                  className="btn btn-primary btn-sm"
                  style={{ textDecoration: 'none' }}
                >
                  <Smartphone size={14} /> Send SMS ({registrationNotice.formattedMobile})
                </a>
              )}
              {registrationNotice.whatsappUri && (
                <a
                  href={registrationNotice.whatsappUri}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-success btn-sm"
                  style={{ textDecoration: 'none' }}
                >
                  <Send size={14} /> Send via WhatsApp ({registrationNotice.formattedMobile})
                </a>
              )}
              {!registrationNotice.smsSent && (
                <a
                  href="/admin/settings"
                  className="btn btn-outline btn-sm"
                  style={{ textDecoration: 'none', background: '#fff' }}
                >
                  Configure Auto-SMS Gateway (+91)
                </a>
              )}
            </div>
          )}
        </div>
      )}

      <MemberTable
        key={refreshKey}
        hierarchy={hierarchy}
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
                hierarchy={hierarchy}
                isAdminMode={true}
                onSuccess={(createdMember) => {
                  setShowAddModal(false);
                  if (createdMember?.membershipId) {
                    const smsDelivery = createdMember.smsDelivery || {};
                    const formattedMobile = formatIndianMobile(
                      smsDelivery.mobile || createdMember.mobile
                    );
                    setRegistrationNotice({
                      text: smsDelivery.sent
                        ? `Member "${createdMember.fullName}" registered! Membership ID: ${createdMember.membershipId} | Password: ${createdMember.memberPassword}. SMS text message delivered to ${formattedMobile}.`
                        : `Member "${createdMember.fullName}" registered! Membership ID: ${createdMember.membershipId} | Password: ${createdMember.memberPassword}. Click "Send SMS (${formattedMobile})" below or configure SMS Gateway in Settings.`,
                      smsSent: Boolean(smsDelivery.sent),
                      smsUri: smsDelivery.smsUri || null,
                      whatsappUri: smsDelivery.whatsappUri || null,
                      formattedMobile,
                    });
                  } else {
                    setRegistrationNotice({
                      text: `Application ${createdMember?.applicationNo || ''} created for "${createdMember?.fullName || ''}".`,
                    });
                  }
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
