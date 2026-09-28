'use client';

import { useState } from 'react';
import {
  UsersRound,
  UserPlus,
  Trash2,
  SlidersHorizontal,
  Award,
  Search,
  MapPin,
} from 'lucide-react';

/**
 * Reusable TeamCard Component (`components/TeamCard.js`)
 * ------------------------------------------------------
 * Works across all organizational levels (State, District, Constitution, Mandal, Gramam)
 * and all 3 team categories (Main Team, Youth Team, Mahila Team).
 *
 * Displays:
 * - Default ~30 Leadership Position breakdown:
 *   President / Chairman (1), Vice Presidents (6), General Secretaries (2),
 *   Secretaries (6), Treasurer (1), Executive Members (Variable - adjustable by Admin)
 * - Current assigned leaders with Membership ID, Name, Position, and Actions
 */
export default function TeamCard({
  team,
  isAdmin = false,
  onTeamUpdated = null,
}) {
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [capacityModalOpen, setCapacityModalOpen] = useState(false);
  const [execLimit, setExecLimit] = useState(team.executiveMemberLimit || 14);

  // Member search for assignment
  const [memberQuery, setMemberQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedPositionCode, setSelectedPositionCode] = useState('PRESIDENT');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [previewPhoto, setPreviewPhoto] = useState(null);

  const positionDefinitions = team.positionDefinitions || [];
  const leaders = team.leaders || [];

  async function handleSearchMembers(e) {
    e.preventDefault();
    setSearching(true);
    setActionError('');
    try {
      const res = await fetch(
        `/api/admin/members?search=${encodeURIComponent(memberQuery)}&limit=10`
      );
      const data = await res.json();
      if (res.ok) {
        const eligible = (data.items || []).filter(
          (m) => m.membershipId && ['Active', 'Approved'].includes(m.status)
        );
        setSearchResults(eligible);
        if (eligible.length > 0) {
          setSelectedMemberId(eligible[0].id);
        }
      }
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSearching(false);
    }
  }

  async function handleAssignLeader(e) {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');
    if (!selectedMemberId) {
      setActionError('Please search and select an approved member first.');
      return;
    }

    const res = await fetch('/api/admin/leaders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teamId: team.id,
        memberId: selectedMemberId,
        positionCode: selectedPositionCode,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setActionError(data.error || 'Failed to assign leader.');
      return;
    }

    setActionSuccess(data.message);
    setAssignModalOpen(false);
    if (onTeamUpdated) onTeamUpdated(data.team);
  }

  async function handleChangePosition(teamMemberId, newPositionCode) {
    setActionError('');
    const res = await fetch('/api/admin/leaders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamMemberId, newPositionCode }),
    });
    const data = await res.json();
    if (!res.ok) {
      window.alert(data.error || 'Could not change position.');
      return;
    }
    if (onTeamUpdated) onTeamUpdated(data.team);
  }

  async function handleRemoveLeader(leader) {
    if (
      !window.confirm(
        `Remove ${leader.memberName} (${leader.membershipId}) from the position of "${leader.positionTitle}" in ${team.orgName} - ${team.teamType}?`
      )
    ) {
      return;
    }

    const res = await fetch(
      `/api/admin/leaders?teamMemberId=${encodeURIComponent(leader.id)}`,
      { method: 'DELETE' }
    );
    const data = await res.json();
    if (res.ok && onTeamUpdated) {
      onTeamUpdated(data.team);
    } else if (!res.ok) {
      window.alert(data.error || 'Failed to remove leader.');
    }
  }

  async function handleUpdateCapacity(e) {
    e.preventDefault();
    setActionError('');
    const res = await fetch('/api/admin/teams', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teamId: team.id,
        executiveMemberLimit: Number(execLimit),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setActionError(data.error || 'Failed to update Executive Member slots.');
      return;
    }
    setCapacityModalOpen(false);
    if (onTeamUpdated) onTeamUpdated(data.team);
  }

  const headerColorMap = {
    'Main Team': 'var(--primary)',
    'Youth Team': '#0369a1',
    'Mahila Team': '#9d174d',
  };

  return (
    <div
      className="card"
      style={{
        borderTop: `4px solid ${headerColorMap[team.teamType] || 'var(--primary)'}`,
      }}
    >
      <div className="card-header" style={{ flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span
              className="badge"
              style={{
                background: headerColorMap[team.teamType] || 'var(--primary)',
                color: '#fff',
              }}
            >
              {team.teamType}
            </span>
            <span className="badge badge-info">{team.orgLevel} Level</span>
            {team.orgLevel === 'Gramam' && (
              <span className="badge badge-future">Future Feature Ready</span>
            )}
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginTop: '6px' }}>
            {team.orgName} — {team.teamType}
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Jurisdiction: {team.locationLabel}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div
            style={{
              background: 'var(--bg-muted)',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            Filled: {team.filledPositionsCount} / {team.totalPositionsCapacity} Positions
          </div>

          {isAdmin && (
            <>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setExecLimit(team.executiveMemberLimit || 14);
                  setActionError('');
                  setCapacityModalOpen(true);
                }}
                title="Configure Variable Executive Member Positions"
              >
                <SlidersHorizontal size={14} /> Executive Slots ({team.executiveMemberLimit || 14})
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setActionError('');
                  setAssignModalOpen(true);
                }}
              >
                <UserPlus size={14} /> Assign Leader
              </button>
            </>
          )}
        </div>
      </div>

      {/* Position Structure Summary Pills (Compact) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          gap: '6px',
          marginBottom: '12px',
        }}
      >
        {positionDefinitions.map((pos) => {
          const filled = leaders.filter((l) => l.positionCode === pos.code).length;
          return (
            <div
              key={pos.code}
              style={{
                padding: '4px 8px',
                background: filled > 0 ? 'var(--primary-light)' : 'var(--bg-muted)',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                fontSize: '11px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pos.title}</span>
              <span
                style={{
                  fontWeight: 800,
                  marginLeft: '4px',
                  color: filled >= pos.maxCount ? 'var(--success)' : 'var(--primary)',
                }}
              >
                {filled}/{pos.maxCount}
              </span>
            </div>
          );
        })}
      </div>

      {/* Assigned Leaders Table */}
      {leaders.length === 0 ? (
        <div
          style={{
            padding: '16px',
            textAlign: 'center',
            background: 'var(--bg-muted)',
            borderRadius: '6px',
            fontSize: '12px',
            color: 'var(--text-muted)',
          }}
        >
          <UsersRound size={18} style={{ marginBottom: '4px', opacity: 0.6 }} />
          <div>No leadership positions assigned in this {team.teamType} yet.</div>
        </div>
      ) : (
        <div className="table-container" style={{ margin: '0 -24px -24px -24px', borderTop: '1px solid var(--border-color)', borderRadius: '0 0 12px 12px' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead style={{ background: 'var(--bg-muted)' }}>
              <tr>
                <th style={{ padding: '8px 14px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>Position</th>
                <th style={{ padding: '8px 14px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>Leader Name</th>
                <th style={{ padding: '8px 14px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>ID</th>
                <th style={{ padding: '8px 14px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>Photo</th>
                <th style={{ padding: '8px 14px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>Location</th>
                {isAdmin && <th style={{ textAlign: 'right', padding: '8px 14px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>Manage</th>}
              </tr>
            </thead>
            <tbody>
              {leaders.map((leader, index) => {
                const photoSrc = leader.memberPhotoUrl || leader.photoUrl;
                // Determine rank color based on position code
                const posCode = (leader.positionCode || '').toLowerCase();
                let badgeColor = 'var(--info)';
                let badgeBg = 'var(--info-bg)';
                if (posCode.includes('pres')) { badgeColor = '#b45309'; badgeBg = '#fef3c7'; } // Gold/Amber
                else if (posCode.includes('gen')) { badgeColor = '#0f766e'; badgeBg = '#ccfbf1'; } // Teal
                else if (posCode.includes('vice')) { badgeColor = '#4338ca'; badgeBg = '#e0e7ff'; } // Indigo
                else if (posCode.includes('sec')) { badgeColor = '#0369a1'; badgeBg = '#e0f2fe'; } // Sky Blue
                else if (posCode.includes('treas')) { badgeColor = '#15803d'; badgeBg = '#dcfce7'; } // Green

                return (
                  <tr key={leader.id} style={{ transition: 'background-color 0.2s', cursor: 'default' }}>
                    <td style={{ verticalAlign: 'middle', padding: '10px 14px' }}>
                      <span className="badge" style={{ color: badgeColor, backgroundColor: badgeBg, padding: '4px 8px', fontSize: '12px', border: `1px solid ${badgeColor}33` }}>
                        <Award size={12} style={{ marginRight: '4px' }} /> {leader.positionTitle}
                      </span>
                    </td>
                    <td style={{ verticalAlign: 'middle', padding: '10px 14px' }}>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>{leader.memberName}</div>
                    </td>
                    <td style={{ verticalAlign: 'middle', padding: '10px 14px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--bg-muted)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '2px 6px' }}>
                        <code style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '12px' }}>
                          {leader.membershipId}
                        </code>
                      </div>
                    </td>
                    <td style={{ verticalAlign: 'middle', padding: '10px 14px' }}>
                      {photoSrc ? (
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }} onClick={() => setPreviewPhoto({ src: photoSrc, name: leader.memberName, membershipId: leader.membershipId, positionTitle: leader.positionTitle })}>
                          <img
                            src={photoSrc}
                            alt={leader.memberName}
                            title="Click to view full image"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                        </div>
                      ) : (
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-muted)', border: '1px dashed var(--border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                          <UsersRound size={16} />
                        </div>
                      )}
                    </td>
                    <td style={{ verticalAlign: 'middle', padding: '10px 14px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {isAdmin && leader.memberMobile && <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{leader.memberMobile}</span>}
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} /> {leader.memberMandalName || team.orgName}
                        </span>
                      </div>
                    </td>
                  {isAdmin && (
                    <td style={{ textAlign: 'right', verticalAlign: 'middle', padding: '16px 14px' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: 'var(--bg-muted)',
                          padding: '6px',
                          borderRadius: '8px'
                        }}
                      >
                        <select
                          className="form-control"
                          style={{ width: 'auto', padding: '6px 10px', fontSize: '12px', background: '#fff' }}
                          value={leader.positionCode}
                          onChange={(e) => handleChangePosition(leader.id, e.target.value)}
                          title="Change Position"
                        >
                          {positionDefinitions.map((p) => (
                            <option key={p.code} value={p.code}>
                              {p.title}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          style={{ padding: '6px 10px' }}
                          onClick={() => handleRemoveLeader(leader)}
                          title="Remove from Position"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ASSIGN LEADER MODAL */}
      {assignModalOpen && (
        <div className="modal-backdrop" onClick={() => setAssignModalOpen(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800 }}>
                  Assign Leader — {team.orgName} ({team.teamType})
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Level: {team.orgLevel} • Location: {team.locationLabel}
                </p>
              </div>
            </div>

            <div className="modal-body">
              {actionError && <div className="alert alert-error">{actionError}</div>}

              <form onSubmit={handleSearchMembers} style={{ marginBottom: '18px' }}>
                <label className="form-label">
                  Step 1: Search Registered Member (by Membership ID, Name, or Mobile)
                </label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. MUD-00000001 or Chandu or 9848..."
                    value={memberQuery}
                    onChange={(e) => setMemberQuery(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary" disabled={searching}>
                    <Search size={15} /> {searching ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </form>

              <form onSubmit={handleAssignLeader}>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Step 2: Select Approved Member *</label>
                  <select
                    className="form-control"
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    required
                  >
                    <option value="">-- Select Member from Search Results --</option>
                    {searchResults.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.membershipId} — {m.fullName} ({m.mobile} • {m.districtName})
                      </option>
                    ))}
                  </select>
                  <span className="form-hint">
                    Click &quot;Search&quot; above (even with empty text) to list approved members.
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Step 3: Select Leadership Position *</label>
                  <select
                    className="form-control"
                    value={selectedPositionCode}
                    onChange={(e) => setSelectedPositionCode(e.target.value)}
                  >
                    {positionDefinitions.map((p) => {
                      const count = leaders.filter((l) => l.positionCode === p.code).length;
                      return (
                        <option
                          key={p.code}
                          value={p.code}
                          disabled={count >= p.maxCount}
                        >
                          {p.title} ({count}/{p.maxCount} filled)
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="modal-footer" style={{ marginTop: '20px', padding: '12px 0 0', background: 'transparent' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setAssignModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Assign to Position
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* VARIABLE EXECUTIVE MEMBER CAPACITY MODAL */}
      {capacityModalOpen && (
        <div className="modal-backdrop" onClick={() => setCapacityModalOpen(false)}>
          <div className="modal-panel" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '17px', fontWeight: 700 }}>
                Configure Executive Member Positions
              </h3>
            </div>
            <form onSubmit={handleUpdateCapacity}>
              <div className="modal-body">
                {actionError && <div className="alert alert-error">{actionError}</div>}
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                  Fixed office-bearer positions equal <strong>16</strong> (1 President, 6 Vice Presidents,
                  2 General Secretaries, 6 Secretaries, 1 Treasurer). You can dynamically adjust the number
                  of <strong>Executive Member</strong> positions based on local population requirements.
                </p>
                <div className="form-group">
                  <label className="form-label">Executive Member Positions Limit</label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    className="form-control"
                    value={execLimit}
                    onChange={(e) => setExecLimit(e.target.value)}
                    required
                  />
                  <span className="form-hint">
                    Total Team Size will be: <strong>{16 + Number(execLimit || 0)}</strong> positions
                    (Default: 14 Executive Members = 30 Total).
                  </span>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setCapacityModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Executive Slots
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PHOTO LIGHTBOX POPUP (Click anywhere to close) */}
      {previewPhoto && (
        <div
          className="modal-backdrop"
          onClick={() => setPreviewPhoto(null)}
          style={{
            zIndex: 200,
            cursor: 'pointer',
            background: 'rgba(15, 23, 42, 0.82)',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              padding: '14px',
              borderRadius: '14px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <img
              src={previewPhoto.src}
              alt={previewPhoto.name}
              style={{
                maxWidth: '420px',
                width: '100%',
                maxHeight: '72vh',
                objectFit: 'contain',
                borderRadius: '10px',
                display: 'block',
              }}
            />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--primary-dark)' }}>
                {previewPhoto.name}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {previewPhoto.membershipId}
                {previewPhoto.positionTitle ? ` • ${previewPhoto.positionTitle}` : ''}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
