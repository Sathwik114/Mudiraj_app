'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import TeamCard from '@/components/TeamCard';
import { VALID_ORG_LEVELS, VALID_TEAM_TYPES } from '@/lib/validation';

function AdminTeamsContent() {
  const searchParams = useSearchParams();
  const initialLevel = searchParams.get('orgLevel') || 'State';
  const initialOrgId = searchParams.get('orgId') || '';

  const [hierarchy, setHierarchy] = useState({
    states: [],
    districts: [],
    constitutions: [],
    mandals: [],
    gramams: [],
  });
  const [orgLevel, setOrgLevel] = useState(initialLevel);
  const [orgId, setOrgId] = useState(initialOrgId);
  const [teamType, setTeamType] = useState('');
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/organizations')
      .then((r) => r.json())
      .then((d) => {
        if (d.hierarchy) {
          setHierarchy(d.hierarchy);
        }
      });
  }, []);

  const loadTeams = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (orgLevel) params.set('orgLevel', orgLevel);
      if (orgId) params.set('orgId', orgId);
      if (teamType) params.set('teamType', teamType);

      const res = await fetch(`/api/admin/teams?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setTeams(data.teams || []);
      }
    } finally {
      setLoading(false);
    }
  }, [orgLevel, orgId, teamType]);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  const unitsForLevel =
    orgLevel === 'State'
      ? hierarchy.states
      : orgLevel === 'District'
      ? hierarchy.districts
      : orgLevel === 'Constitution'
      ? hierarchy.constitutions
      : orgLevel === 'Mandal'
      ? hierarchy.mandals
      : hierarchy.gramams;

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary-dark)' }}>
          Reusable Team &amp; Committee Management
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Manage <strong>Main Team</strong>, <strong>Youth Team</strong>, and{' '}
          <strong>Mahila Team</strong> across State, District, Constitution, Mandal, and Gramam
          levels. Each team supports President (1), Vice Presidents (6), General Secretaries (2),
          Secretaries (6), Treasurer (1), and Variable Executive Members.
        </p>
      </div>

      {/* Filter Controls */}
      <div className="card" style={{ marginBottom: '22px', background: 'var(--bg-muted)' }}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">1. Select Organizational Level</label>
            <select
              className="form-control"
              value={orgLevel}
              onChange={(e) => {
                setOrgLevel(e.target.value);
                setOrgId('');
              }}
            >
              <option value="">All Levels</option>
              {VALID_ORG_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl} Level {lvl === 'Gramam' ? '(Future Feature)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">2. Select Specific {orgLevel || 'Organization'} Unit</label>
            <select
              className="form-control"
              value={orgId}
              onChange={(e) => setOrgId(e.target.value)}
            >
              <option value="">All {orgLevel || 'Organization'} Units</option>
              {(unitsForLevel || []).map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.code})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">3. Team Category</label>
            <select
              className="form-control"
              value={teamType}
              onChange={(e) => setTeamType(e.target.value)}
            >
              <option value="">All 3 Categories (Main, Youth, Mahila)</option>
              {VALID_TEAM_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          Loading teams...
        </div>
      ) : teams.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          No teams matched your selection.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {teams.slice(0, 15).map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              isAdmin={true}
              onTeamUpdated={() => loadTeams()}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminTeamsPage() {
  return (
    <Suspense fallback={<div>Loading teams...</div>}>
      <AdminTeamsContent />
    </Suspense>
  );
}
