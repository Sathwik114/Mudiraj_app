'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TeamCard from '@/components/TeamCard';
import { VALID_ORG_LEVELS, VALID_TEAM_TYPES } from '@/lib/validation';

function LeadershipDirectoryContent() {
  const searchParams = useSearchParams();
  const initialTeamType = searchParams.get('teamType') || '';

  const [orgLevelId, setOrgLevelId] = useState('');
  const [teamType, setTeamType] = useState(initialTeamType);
  const [orgUnitId, setOrgUnitId] = useState('');
  const [hierarchy, setHierarchy] = useState({ orgLevels: [], orgUnits: [] });
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPublicLeadership() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (orgLevelId) params.set('orgLevelId', orgLevelId);
        if (teamType) params.set('teamType', teamType);
        if (orgUnitId) params.set('orgUnitId', orgUnitId);

        const res = await fetch(`/api/public/organization?${params.toString()}`);
        const data = await res.json();
        if (res.ok) {
          setHierarchy(data.hierarchy || { orgLevels: [], orgUnits: [] });
          setTeams(data.teams || []);
        }
      } catch (err) {
        console.error('Error loading public leadership:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPublicLeadership();
  }, [orgLevelId, teamType, orgUnitId]);

  return (
    <div className="container">
      <div style={{ marginBottom: '24px' }}>
        <span className="badge badge-info" style={{ marginBottom: '8px' }}>
          Main Team • Youth Team • Mahila Team
        </span>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--primary-dark)' }}>
          Mudiraj Community Leadership Committees (Andhra Pradesh)
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          View the Main Team, Youth Team, and Mahila Team leadership structure across State,
          District, Constitution, Mandal, and Gramam levels.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '24px', background: 'var(--bg-muted)' }}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Organizational Level</label>
            <select
              className="form-control"
              value={orgLevelId}
              onChange={(e) => {
                setOrgLevelId(e.target.value);
                setOrgUnitId('');
              }}
            >
              <option value="">All Levels</option>
              {(hierarchy.orgLevels || []).map((lvl) => (
                <option key={lvl.id} value={lvl.id}>
                  {lvl.name} Level
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Team Category</label>
            <select
              className="form-control"
              value={teamType}
              onChange={(e) => setTeamType(e.target.value)}
            >
              <option value="">All 3 Teams (Main, Youth, Mahila)</option>
              {VALID_TEAM_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Filter by Unit</label>
            <select
              className="form-control"
              value={orgUnitId}
              onChange={(e) => setOrgUnitId(e.target.value)}
              disabled={!orgLevelId}
            >
              <option value="">All Units</option>
              {(hierarchy.orgUnits || [])
                .filter(u => u.orgLevelId === orgLevelId)
                .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          Loading leadership committees...
        </div>
      ) : teams.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          No teams found matching the selected filters.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {teams.slice(0, 18).map((team) => (
            <TeamCard key={team.id} team={team} isAdmin={false} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PublicLeadershipPage() {
  return (
    <div className="page-wrapper">
      <Header />
      <main className="main-content" style={{ padding: '36px 0' }}>
        <Suspense fallback={<div className="container">Loading leadership teams...</div>}>
          <LeadershipDirectoryContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
