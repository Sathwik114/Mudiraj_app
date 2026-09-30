'use client';

import MemberForm from '@/components/MemberForm';
import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  Eye,
  Edit3,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Award,
  RefreshCw,
  MessageSquare,
  Smartphone,
  Send,
} from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

import {
  VALID_MEMBERSHIP_STATUSES,
  VALID_TEAM_TYPES,
  DEFAULT_TEAM_POSITIONS,
  formatIndianMobile,
} from '@/lib/validation';

export default function MemberTable({
  hierarchy,
  defaultStatus = '',
  title = 'Community Members Directory',
  showApplicationActions = false,
}) {
  const districts = hierarchy?.districts || [];
  const allConstitutions = hierarchy?.constitutions || [];
  const allMandals = hierarchy?.mandals || [];

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Server-side query filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(defaultStatus);
  const [districtId, setDistrictId] = useState('');
  const [constitutionId, setConstitutionId] = useState('');
  const [mandalId, setMandalId] = useState('');
  const [teamType, setTeamType] = useState('');
  const [positionCode, setPositionCode] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modals
  const [selectedMember, setSelectedMember] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [rejectModalMember, setRejectModalMember] = useState(null);
  const [rejectRemarks, setRejectRemarks] = useState('');

  const availableConstitutions = districtId
    ? allConstitutions.filter((c) => c.districtId === districtId)
    : allConstitutions;

  const availableMandals = constitutionId
    ? allMandals.filter((m) => m.constitutionId === constitutionId)
    : districtId
    ? allMandals.filter((m) => m.districtId === districtId)
    : allMandals;

  const fetchMembers = useCallback(
    async (targetPage = pagination.page) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(targetPage),
          limit: String(pagination.limit),
          search,
          status,
          districtId,
          constitutionId,
          mandalId,
          teamType,
          positionCode,
          sortBy,
          sortOrder,
        });

        const res = await fetch(`/api/admin/members?${params.toString()}`);
        const data = await res.json();
        if (res.ok) {
          setItems(data.items || []);
          setPagination(
            data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 }
          );
        }
      } catch (err) {
        console.error('Failed to load members:', err);
      } finally {
        setLoading(false);
      }
    },
    [
      pagination.page,
      pagination.limit,
      search,
      status,
      districtId,
      constitutionId,
      mandalId,
      teamType,
      positionCode,
      sortBy,
      sortOrder,
    ]
  );

  useEffect(() => {
    fetchMembers(1);
  }, [
    status,
    districtId,
    constitutionId,
    mandalId,
    teamType,
    positionCode,
    sortBy,
    sortOrder,
  ]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    fetchMembers(1);
  }

  async function handleApprove(member) {
    const mobileFormatted = formatIndianMobile(member.mobile);
    if (
      !window.confirm(
        `Approve membership application for "${member.fullName}" (${member.applicationNo})?\n\nThis will generate a permanent unique Membership ID (MUD-XXXXXXXX) and Password (first 3 letters of last name + first 3 digits of mobile), save them in the database, and send an SMS to ${mobileFormatted}.`
      )
    ) {
      return;
    }

    setFeedback({ type: '', text: '' });
    const res = await fetch('/api/admin/members', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'APPROVE',
        memberId: member.id,
        targetStatus: 'Active',
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setFeedback({
        type: 'success',
        text: data.message,
        smsSent: data.smsSent,
        smsReason: data.smsReason,
        smsUri: data.smsUri,
        whatsappUri: data.whatsappUri,
        formattedMobile: data.formattedMobile || mobileFormatted,
      });
      fetchMembers(pagination.page);
    } else {
      setFeedback({ type: 'error', text: data.error || 'Approval failed.' });
    }
  }

  async function handleResendSms(member) {
    const mobileFormatted = formatIndianMobile(member.mobile);
    setFeedback({ type: '', text: '' });
    const res = await fetch('/api/admin/members', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'RESEND_SMS',
        memberId: member.id,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setFeedback({
        type: 'success',
        text: data.message,
        smsSent: data.smsSent,
        smsReason: data.smsReason,
        smsUri: data.smsUri,
        whatsappUri: data.whatsappUri,
        formattedMobile: data.formattedMobile || mobileFormatted,
      });
      if (!data.smsSent && data.smsUri) {
        window.location.href = data.smsUri;
      }
    } else {
      setFeedback({ type: 'error', text: data.error || 'Failed to send SMS.' });
    }
  }

  async function handleConfirmReject(e) {
    e.preventDefault();
    if (!rejectModalMember) return;

    const res = await fetch('/api/admin/members', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'REJECT',
        memberId: rejectModalMember.id,
        remarks: rejectRemarks,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setFeedback({
        type: 'warning',
        text: `Application ${rejectModalMember.applicationNo} for ${rejectModalMember.fullName} rejected.`,
      });
      setRejectModalMember(null);
      setRejectRemarks('');
      fetchMembers(pagination.page);
    } else {
      setFeedback({ type: 'error', text: data.error || 'Rejection failed.' });
    }
  }

  async function handleRevoke(member) {
    if (!window.confirm(`Revoke rejection for ${member.fullName}? This will move the application back to Pending.`)) {
      return;
    }
    const res = await fetch('/api/admin/members', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'REVOKE', memberId: member.id }),
    });
    const data = await res.json();
    if (res.ok) {
      setFeedback({ type: 'success', text: `Rejection revoked for ${member.fullName}.` });
      fetchMembers(pagination.page);
    } else {
      setFeedback({ type: 'error', text: data.error || 'Revoke failed.' });
    }
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    if (!editingMember) return;

    const res = await fetch('/api/admin/members', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        memberId: editingMember.id,
        updates: editingMember,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setFeedback({ type: 'success', text: data.message });
      setEditingMember(null);
      fetchMembers(pagination.page);
    } else {
      setFeedback({ type: 'error', text: data.error || 'Update failed.' });
    }
  }

  async function handleDelete(member) {
    if (!window.confirm(`Are you sure you want to PERMANENTLY delete member ${member.fullName} (${member.membershipId || member.applicationNo})? This action cannot be undone.`)) {
      return;
    }
    const res = await fetch(`/api/admin/members?id=${member.id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (res.ok) {
      setFeedback({ type: 'success', text: data.message });
      fetchMembers(pagination.page);
    } else {
      setFeedback({ type: 'error', text: data.error || 'Delete failed.' });
    }
  }

  function renderStatusBadge(st) {
    const map = {
      Active: 'badge-active',
      Approved: 'badge-approved',
      Pending: 'badge-pending',
      Rejected: 'badge-rejected',
      Inactive: 'badge-inactive',
    };
    return <span className={`badge ${map[st] || 'badge-info'}`}>{st}</span>;
  }

  return (
    <div className="card">
      <div className="card-header" style={{ flexWrap: 'wrap' }}>
        <div>
          <h2 className="card-title">{title}</h2>
        </div>

        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => fetchMembers(pagination.page)}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {feedback.text && (
        <div
          className={`alert ${
            feedback.type === 'error'
              ? 'alert-error'
              : feedback.type === 'warning'
              ? 'alert-warning'
              : 'alert-success'
          }`}
          style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}
        >
          <div>{feedback.text}</div>
          {(feedback.smsUri || feedback.whatsappUri) && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              {feedback.smsUri && (
                <a
                  href={feedback.smsUri}
                  className="btn btn-primary btn-sm"
                  style={{ textDecoration: 'none' }}
                >
                  <Smartphone size={14} /> Send SMS ({feedback.formattedMobile})
                </a>
              )}
              {feedback.whatsappUri && (
                <a
                  href={feedback.whatsappUri}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-success btn-sm"
                  style={{ textDecoration: 'none' }}
                >
                  <Send size={14} /> Send via WhatsApp ({feedback.formattedMobile})
                </a>
              )}
              {!feedback.smsSent && (
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

      {/* Search & Multi-Attribute Filter Bar */}
      <form
        onSubmit={handleSearchSubmit}
        style={{
          background: 'var(--bg-muted)',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '18px',
          border: '1px solid var(--border-color)',
        }}
      >
        <div className="form-grid" style={{ marginBottom: '12px' }}>
          <div className="form-group">
            <label className="form-label">Search (Membership ID / Name / Mobile)</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. MUD-00000001, Name, or 9848..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary btn-sm">
                <Search size={15} /> <span className="hide-mobile">Search</span>
              </button>
              <button type="button" className="btn btn-outline btn-sm mobile-only-flex" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
                <Filter size={15} /> Filters
              </button>
            </div>
          </div>

          {/* Advanced Filters Wrapper */}
          <div className={`advanced-filters-wrapper ${showAdvancedFilters ? '' : 'hide-mobile-grid'}`}>
            <div className="form-group">
              <label className="form-label">Membership Status</label>
            <select
              className="form-control"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              {VALID_MEMBERSHIP_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">District</label>
            <select
              className="form-control"
              value={districtId}
              onChange={(e) => {
                setDistrictId(e.target.value);
                setConstitutionId('');
                setMandalId('');
              }}
            >
              <option value="">All Districts (Andhra Pradesh)</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Constitution</label>
            <select
              className="form-control"
              value={constitutionId}
              onChange={(e) => {
                setConstitutionId(e.target.value);
                setMandalId('');
              }}
            >
              <option value="">All Constitutions</option>
              {availableConstitutions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Mandal</label>
            <select
              className="form-control"
              value={mandalId}
              onChange={(e) => setMandalId(e.target.value)}
            >
              <option value="">All Mandals</option>
              {availableMandals.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Team &amp; Leadership Filter</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <select
                className="form-control"
                value={teamType}
                onChange={(e) => setTeamType(e.target.value)}
              >
                <option value="">Any Team</option>
                {VALID_TEAM_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <select
                className="form-control"
                value={positionCode}
                onChange={(e) => setPositionCode(e.target.value)}
              >
                <option value="">Any Position</option>
                {DEFAULT_TEAM_POSITIONS.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          </div> {/* End Advanced Filters Wrapper */}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            paddingTop: '8px',
            borderTop: '1px solid var(--border-color)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', flexWrap: 'wrap' }}>
            <Filter size={14} color="var(--text-secondary)" />
            <span>Sort By:</span>
            <select
              className="form-control"
              style={{ width: 'auto', padding: '4px 8px', fontSize: '13px' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="createdAt">Application Date</option>
              <option value="membershipId">Membership ID</option>
              <option value="fullName">Member Name</option>
              <option value="status">Status</option>
            </select>
            <select
              className="form-control"
              style={{ width: 'auto', padding: '4px 8px', fontSize: '13px' }}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="desc">Newest / Descending</option>
              <option value="asc">Oldest / Ascending</option>
            </select>
          </div>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              setSearch('');
              setStatus(defaultStatus);
              setDistrictId('');
              setConstitutionId('');
              setMandalId('');
              setTeamType('');
              setPositionCode('');
              fetchMembers(1);
            }}
          >
            Reset All Filters
          </button>
        </div>
      </form>

      {/* Data Table */}
      <div className="table-container">
        <table className="data-table" style={{ minWidth: "1000px" }}>
          <thead>
            <tr>
              <th>Membership ID / App No</th>
              <th>Member Name &amp; Parentage</th>
              <th>Mobile &amp; Gender</th>
              <th>District / Constitution / Mandal</th>
              <th>Leadership Role</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  Loading member records from server...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No members or applications found matching your search criteria.
                </td>
              </tr>
            ) : (
              items.map((member) => (
                <tr key={member.id}>
                  <td data-label="Membership ID / App No">
                    {member.membershipId ? (
                      <>
                        <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '14px' }}>
                          {member.membershipId}
                        </div>
                        {(member.memberPassword || member.password) && (
                          <div style={{ fontSize: '11px', color: 'var(--accent-hover)', fontWeight: 700 }}>
                            Pass: <code>{member.memberPassword || member.password}</code>
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{ fontSize: '12px', color: 'var(--warning)', fontWeight: 700 }}>
                        ID Pending Approval
                      </div>
                    )}
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      App: {member.applicationNo}
                    </div>
                  </td>

                  <td data-label="Member Name & Parentage">
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                      {member.fullName}
                    </div>
                    {member.occupation && (
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Occupation: {member.occupation}
                      </div>
                    )}
                    {member.fatherName && (
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        S/D/o: {member.fatherName}
                      </div>
                    )}
                  </td>

                  <td data-label="Mobile & Gender">
                    <div style={{ fontWeight: 600 }}>{formatIndianMobile(member.mobile)}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {member.gender}{member.bloodGroup && member.bloodGroup !== 'Unknown' ? ` • ${member.bloodGroup}` : ''}{member.dob ? ` • DOB: ${member.dob}` : ''}
                    </div>
                  </td>

                  <td data-label="District / Constitution / Mandal">
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{member.districtName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {member.constitutionName} › {member.mandalName}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Gramam: {member.gramamName} ({member.pincode})
                    </div>
                  </td>

                  <td data-label="Leadership Role">
                    {member.leadershipPositions && member.leadershipPositions.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {member.leadershipPositions.map((lp) => (
                          <span
                            key={lp.teamMemberId}
                            className="badge badge-info"
                            style={{ fontSize: '11px' }}
                          >
                            <Award size={11} /> {lp.positionTitle} ({lp.orgLevel} - {lp.teamType})
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        General Member
                      </span>
                    )}
                  </td>

                  <td data-label="Status">{renderStatusBadge(member.status)}</td>

                  <td data-label="Actions" style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end' }}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="btn btn-outline btn-sm" style={{ padding: '4px 8px' }}>
                          <MoreHorizontal size={16} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white" style={{ minWidth: '185px', zIndex: 50 }}>
                        {(member.status === 'Pending' || showApplicationActions) && member.status !== 'Active' && (
                          <DropdownMenuItem onClick={() => handleApprove(member)} style={{ color: 'var(--success)', cursor: 'pointer' }}>
                            <CheckCircle size={14} style={{ marginRight: '8px' }} /> Approve
                          </DropdownMenuItem>
                        )}
                        {member.membershipId && (
                          <DropdownMenuItem onClick={() => handleResendSms(member)} style={{ color: 'var(--primary)', cursor: 'pointer' }}>
                            <MessageSquare size={14} style={{ marginRight: '8px' }} /> Send SMS (+91)
                          </DropdownMenuItem>
                        )}
                        {member.status === 'Pending' && (
                          <DropdownMenuItem onClick={() => { setRejectModalMember(member); setRejectRemarks(''); }} style={{ color: 'var(--danger)', cursor: 'pointer' }}>
                            <XCircle size={14} style={{ marginRight: '8px' }} /> Reject
                          </DropdownMenuItem>
                        )}
                        {member.status === 'Rejected' && showApplicationActions && (
                          <DropdownMenuItem onClick={() => handleRevoke(member)} style={{ color: 'var(--warning)', cursor: 'pointer' }}>
                            <RefreshCw size={14} style={{ marginRight: '8px' }} /> Revoke
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => setSelectedMember(member)} style={{ cursor: 'pointer' }}>
                          <Eye size={14} style={{ marginRight: '8px' }} /> View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditingMember({ ...member })} style={{ cursor: 'pointer' }}>
                          <Edit3 size={14} style={{ marginRight: '8px' }} /> Edit Member
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(member)} style={{ color: 'var(--danger)', cursor: 'pointer' }}>
                          <XCircle size={14} style={{ marginRight: '8px' }} /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Server-side Pagination Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '18px',
          paddingTop: '14px',
          borderTop: '1px solid var(--border-color)',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> • Total
          Records: <strong>{pagination.total}</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={!pagination.hasPrevPage}
            onClick={() => fetchMembers(pagination.page - 1)}
          >
            <ChevronLeft size={15} /> Previous
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={!pagination.hasNextPage}
            onClick={() => fetchMembers(pagination.page + 1)}
          >
            Next <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* VIEW MEMBER DETAILS MODAL */}
      {selectedMember && (
        <div className="modal-backdrop" onClick={() => setSelectedMember(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>
                  Member Profile &amp; Verification Record
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Database ID: {selectedMember.id} • Application No: {selectedMember.applicationNo}
                </span>
              </div>
              {renderStatusBadge(selectedMember.status)}
            </div>

            <div className="modal-body">
              {/* Digital Membership Card Banner */}
              <div
                style={{
                  background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
                  color: '#fff',
                  padding: '18px',
                  borderRadius: '10px',
                  marginBottom: '20px',
                  borderBottom: '4px solid var(--accent)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '14px',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: '#fde68a', fontWeight: 700, letterSpacing: '0.5px' }}>
                    ANDHRA PRADESH MUDIRAJ COMMUNITY
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '4px' }}>
                    {selectedMember.fullName}
                  </div>
                  <div style={{ fontSize: '13px', color: '#dbeafe', marginTop: '2px' }}>
                    {selectedMember.gramamName}, {selectedMember.mandalName}, {selectedMember.districtName}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#cbd5e1' }}>MEMBERSHIP ID</div>
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: 800,
                      background: 'rgba(255,255,255,0.15)',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      marginTop: '4px',
                    }}
                  >
                    {selectedMember.membershipId || 'PENDING APPROVAL'}
                  </div>
                  {(selectedMember.memberPassword || selectedMember.password) && (
                    <div style={{ fontSize: '12px', color: '#fde68a', marginTop: '6px', fontWeight: 700 }}>
                      Password: <code>{selectedMember.memberPassword || selectedMember.password}</code>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid-2" style={{ gap: '14px', fontSize: '13px' }}>
                <div>
                  <strong>Father Name:</strong> {selectedMember.fatherName || '—'}
                </div>
                <div>
                  <strong>Mother Name:</strong> {selectedMember.motherName || '—'}
                </div>
                <div>
                  <strong>Date of Birth / Gender:</strong> {selectedMember.dob || '—'} ({selectedMember.gender})
                </div>
                <div>
                  <strong>Blood Group:</strong> {selectedMember.bloodGroup || '—'}
                </div>
                <div>
                  <strong>Occupation:</strong> {selectedMember.occupation || '—'}
                </div>
                <div>
                  <strong>Primary Mobile:</strong> {selectedMember.mobile}
                </div>
                <div>
                  <strong>Alternate Mobile:</strong> {selectedMember.alternateMobile || '—'}
                </div>
                <div>
                  <strong>Email:</strong> {selectedMember.email || '—'}
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <strong>Residential Address:</strong> H.No {selectedMember.houseNo},{' '}
                  {selectedMember.street}, {selectedMember.gramamName}, {selectedMember.mandalName},{' '}
                  {selectedMember.constitutionName} Constitution, {selectedMember.districtName} District,{' '}
                  {selectedMember.stateName} - {selectedMember.pincode}
                </div>
                <div>
                  <strong>Government ID Type:</strong> {selectedMember.idType}
                </div>
                <div>
                  <strong>Government ID Number (Admin View):</strong>{' '}
                  <code style={{ fontWeight: 700 }}>{selectedMember.idNumber}</code>
                </div>
                <div>
                  <strong>Application Date:</strong>{' '}
                  {selectedMember.applicationDate
                    ? new Date(selectedMember.applicationDate).toLocaleString()
                    : '—'}
                </div>
                <div>
                  <strong>Approval Date:</strong>{' '}
                  {selectedMember.approvalDate
                    ? new Date(selectedMember.approvalDate).toLocaleString()
                    : 'Not Yet Approved'}
                </div>
                <div>
                  <strong>Sponsored By (Membership ID):</strong>{' '}
                  {selectedMember.sponsorId ? (
                    <span className="badge badge-info">{selectedMember.sponsorId}</span>
                  ) : (
                    '—'
                  )}
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <strong>Remarks:</strong> {selectedMember.remarks || '—'}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {selectedMember.status === 'Pending' && (
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => {
                    const target = selectedMember;
                    setSelectedMember(null);
                    handleApprove(target);
                  }}
                >
                  <CheckCircle size={15} /> Approve &amp; Generate ID
                </button>
              )}
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setSelectedMember(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT APPLICATION MODAL */}
      {rejectModalMember && (
        <div className="modal-backdrop" onClick={() => setRejectModalMember(null)}>
          <div className="modal-panel" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--danger)' }}>
                Reject Membership Application
              </h3>
            </div>
            <form onSubmit={handleConfirmReject}>
              <div className="modal-body">
                <p style={{ fontSize: '14px', marginBottom: '12px' }}>
                  You are rejecting application <strong>{rejectModalMember.applicationNo}</strong> for{' '}
                  <strong>{rejectModalMember.fullName}</strong>.
                </p>
                <div className="form-group">
                  <label className="form-label">Rejection Remarks / Reason *</label>
                  <textarea
                    rows={3}
                    className="form-control"
                    placeholder="Provide clear reason for rejection..."
                    value={rejectRemarks}
                    onChange={(e) => setRejectRemarks(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setRejectModalMember(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger">
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MEMBER MODAL */}
      {editingMember && (
        <div className="modal-backdrop" onClick={() => setEditingMember(null)}>
          <div className="modal-panel" style={{ maxWidth: '920px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>
                Edit Member — {editingMember.fullName} ({editingMember.membershipId || 'Pending'})
              </h3>
              <button className="btn btn-outline btn-sm" onClick={() => setEditingMember(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ padding: '0px' }}>
              <MemberForm
                hierarchy={hierarchy}
                isAdminMode={true}
                isEditMode={true}
                initialData={editingMember}
                onSuccess={() => {
                  setFeedback({ type: 'success', text: 'Member updated successfully!' });
                  setEditingMember(null);
                  fetchMembers(pagination.page);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}