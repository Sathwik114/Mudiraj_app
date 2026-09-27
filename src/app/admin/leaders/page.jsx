'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  UserPlus,
  Trash2,
  Award,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  VALID_ORG_LEVELS,
  VALID_TEAM_TYPES,
  DEFAULT_TEAM_POSITIONS,
} from '@/lib/validation';

export default function AdminLeadersPage() {
  const [leaders, setLeaders] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  // Filters for Leaders Directory
  const [search, setSearch] = useState('');
  const [orgLevel, setOrgLevel] = useState('');
  const [teamType, setTeamType] = useState('');
  const [positionCode, setPositionCode] = useState('');

  // Leader Assignment Panel State
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [searchedMembers, setSearchedMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [assignLevel, setAssignLevel] = useState('State');
  const [assignTeamId, setAssignTeamId] = useState('');
  const [assignPositionCode, setAssignPositionCode] = useState('PRESIDENT');

  const loadLeadersAndTeams = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (orgLevel) params.set('orgLevel', orgLevel);
      if (teamType) params.set('teamType', teamType);
      if (positionCode) params.set('positionCode', positionCode);

      const leadersRes = await fetch(`/api/admin/leaders?${params.toString()}`);
      const leadersData = await leadersRes.json();
      if (leadersRes.ok) setLeaders(leadersData.leaders || []);

      const teamsRes = await fetch('/api/admin/teams');
      const teamsData = await teamsRes.json();
      if (teamsRes.ok) {
        const allTeams = teamsData.teams || [];
        setTeams(allTeams);
        if (!assignTeamId && allTeams[0]) {
          setAssignTeamId(allTeams[0].id);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [search, orgLevel, teamType, positionCode, assignTeamId]);

  useEffect(() => {
    loadLeadersAndTeams();
  }, [orgLevel, teamType, positionCode]);

  async function handleSearchEligibleMembers(e) {
    e.preventDefault();
    setFeedback({ type: '', text: '' });
    const res = await fetch(
      `/api/admin/members?search=${encodeURIComponent(memberSearchQuery)}&limit=12`
    );
    const data = await res.json();
    if (res.ok) {
      const eligible = (data.items || []).filter(
        (m) => m.membershipId && ['Active', 'Approved'].includes(m.status)
      );
      setSearchedMembers(eligible);
      if (eligible[0]) {
        setSelectedMember(eligible[0]);
      } else {
        setSelectedMember(null);
      }
    }
  }

  const filteredTeamsForAssignment = teams.filter(
    (t) => !assignLevel || t.orgLevel === assignLevel
  );

  async function handleAssignSubmit(e) {
    e.preventDefault();
    setFeedback({ type: '', text: '' });

    if (!selectedMember) {
      setFeedback({
        type: 'error',
        text: 'Please search and select a registered member (by Membership ID, Name, or Mobile Number).',
      });
      return;
    }
    if (!assignTeamId) {
      setFeedback({ type: 'error', text: 'Please select a target Team.' });
      return;
    }

    const res = await fetch('/api/admin/leaders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teamId: assignTeamId,
        memberId: selectedMember.id,
        positionCode: assignPositionCode,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      setFeedback({ type: 'error', text: data.error || 'Failed to assign leader.' });
      return;
    }

    setFeedback({
      type: 'success',
      text: `Assigned ${selectedMember.fullName} (${selectedMember.membershipId}) to ${data.team.orgName} — ${data.team.teamType}.`,
    });
    loadLeadersAndTeams();
  }

  async function handleChangeLeaderPosition(teamMemberId, newPositionCode) {
    setFeedback({ type: '', text: '' });
    const res = await fetch('/api/admin/leaders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamMemberId, newPositionCode }),
    });
    const data = await res.json();
    if (!res.ok) {
      setFeedback({ type: 'error', text: data.error || 'Failed to change position.' });
      return;
    }
    setFeedback({ type: 'success', text: data.message });
    loadLeadersAndTeams();
  }

  async function handleRemoveLeader(leader) {
    if (
      !window.confirm(
        `Remove ${leader.memberName} (${leader.membershipId}) from "${leader.positionTitle}" in ${leader.orgName} (${leader.teamType})?`
      )
    ) {
      return;
    }
    const res = await fetch(
      `/api/admin/leaders?teamMemberId=${encodeURIComponent(leader.id)}`,
      { method: 'DELETE' }
    );
    const data = await res.json();
    if (res.ok) {
      setFeedback({ type: 'success', text: data.message });
      loadLeadersAndTeams();
    } else {
      setFeedback({ type: 'error', text: data.error || 'Failed to remove leader.' });
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary-dark)' }}>
          Leader Assignment &amp; Office Bearers Directory
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Search registered members by Membership ID, Name, or Mobile Number and assign them to
          leadership positions across Main, Youth, and Mahila teams.
        </p>
      </div>

      {feedback.text && (
        <div className={`alert ${feedback.type === 'error' ? 'alert-error' : 'alert-success'}`}>
          {feedback.type === 'error' ? (
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
          ) : (
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Leader Assignment Card */}
      <div className="card" style={{ marginBottom: '24px', borderTop: '4px solid var(--accent)' }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">Assign Registered Member to Leadership Position</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Automatically prevents duplicate conflicting positions within the same team.
            </p>
          </div>
        </div>

        <div className="grid-2" style={{ alignItems: 'start' }}>
          {/* Step 1: Member Search */}
          <div>
            <form onSubmit={handleSearchEligibleMembers} style={{ marginBottom: '12px' }}>
              <label className="form-label">
                Step 1: Search Member (by Membership ID, Name, or Mobile Number)
              </label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter MUD-00000001, Name, or Mobile..."
                  value={memberSearchQuery}
                  onChange={(e) => setMemberSearchQuery(e.target.value)}
                />
                <button type="submit" className="btn btn-primary">
                  <Search size={15} /> Search
                </button>
              </div>
            </form>

            {searchedMembers.length > 0 && (
              <div
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  maxHeight: '210px',
                  overflowY: 'auto',
                }}
              >
                {searchedMembers.map((m) => {
                  const isSel = selectedMember?.id === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMember(m)}
                      style={{
                        padding: '10px 12px',
                        borderBottom: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        background: isSel ? 'var(--primary-light)' : '#fff',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '13px' }}>{m.fullName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          Mobile: {m.mobile} • {m.districtName}
                        </div>
                      </div>
                      <code style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '12px' }}>
                        {m.membershipId}
                      </code>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 2: Select Team & Position */}
          <form onSubmit={handleAssignSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div
              style={{
                padding: '10px 14px',
                background: 'var(--bg-muted)',
                borderRadius: '6px',
                fontSize: '13px',
              }}
            >
              <strong>Selected Member:</strong>{' '}
              {selectedMember ? (
                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                  {selectedMember.fullName} ({selectedMember.membershipId} • {selectedMember.mobile})
                </span>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>
                  Search and click a member on the left
                </span>
              )}
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Organizational Level</label>
                <select
                  className="form-control"
                  value={assignLevel}
                  onChange={(e) => {
                    const lvl = e.target.value;
                    setAssignLevel(lvl);
                    const matching = teams.filter((t) => !lvl || t.orgLevel === lvl);
                    setAssignTeamId(matching[0]?.id || '');
                  }}
                >
                  {VALID_ORG_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl} Level
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Leadership Position</label>
                <select
                  className="form-control"
                  value={assignPositionCode}
                  onChange={(e) => setAssignPositionCode(e.target.value)}
                >
                  {DEFAULT_TEAM_POSITIONS.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Target Organization &amp; Team (Main / Youth / Mahila)</label>
              <select
                className="form-control"
                value={assignTeamId}
                onChange={(e) => setAssignTeamId(e.target.value)}
                required
              >
                {filteredTeamsForAssignment.map((t) => (
                  <option key={t.id} value={t.id}>
                    [{t.orgLevel}] {t.orgName} — {t.teamType} ({t.filledPositionsCount}/{t.totalPositionsCapacity})
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-accent">
              <UserPlus size={16} /> Assign Member to Leadership Position
            </button>
          </form>
        </div>
      </div>

      {/* Assigned Leaders Directory Table */}
      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap' }}>
          <div>
            <h2 className="card-title">Assigned Community Leaders ({leaders.length})</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Displaying Member Name, Membership ID, Position, Team, Organizational Level, and
              Location
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div
          className="form-grid"
          style={{
            background: 'var(--bg-muted)',
            padding: '14px',
            borderRadius: '8px',
            marginBottom: '16px',
          }}
        >
          <div className="form-group">
            <label className="form-label">Search Leader / Membership ID</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Name, MUD-00000001, or Mobile..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={loadLeadersAndTeams}
              >
                <Search size={14} />
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Organizational Level</label>
            <select
              className="form-control"
              value={orgLevel}
              onChange={(e) => setOrgLevel(e.target.value)}
            >
              <option value="">All Levels</option>
              {VALID_ORG_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Team Category &amp; Position</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <select
                className="form-control"
                value={teamType}
                onChange={(e) => setTeamType(e.target.value)}
              >
                <option value="">All Teams</option>
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
                <option value="">All Positions</option>
                {DEFAULT_TEAM_POSITIONS.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Member Name</th>
                <th>Membership ID</th>
                <th>Position</th>
                <th>Team</th>
                <th>Organizational Level</th>
                <th>Location</th>
                <th style={{ textAlign: 'right' }}>Change / Remove</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '28px' }}>
                    Loading leaders directory...
                  </td>
                </tr>
              ) : leaders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '28px', color: 'var(--text-muted)' }}>
                    No leadership assignments match your filter criteria.
                  </td>
                </tr>
              ) : (
                leaders.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{l.memberName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Mobile: {l.mobile}
                      </div>
                    </td>
                    <td>
                      <code style={{ fontWeight: 800, color: 'var(--primary)' }}>
                        {l.membershipId}
                      </code>
                    </td>
                    <td>
                      <span className="badge badge-info">
                        <Award size={12} /> {l.positionTitle}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{l.teamType}</td>
                    <td>
                      <span className="badge badge-active">{l.orgLevel}</span>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <div><strong>{l.orgName}</strong></div>
                      <div>{l.location}</div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                        <select
                          className="form-control"
                          style={{ width: 'auto', padding: '4px 8px', fontSize: '12px' }}
                          value={l.positionCode}
                          onChange={(e) => handleChangeLeaderPosition(l.id, e.target.value)}
                          title="Change Position"
                        >
                          {DEFAULT_TEAM_POSITIONS.map((p) => (
                            <option key={p.code} value={p.code}>
                              {p.title}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleRemoveLeader(l)}
                          title="Remove from Position"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
