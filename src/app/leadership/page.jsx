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

  const [orgLevel, setOrgLevel] = useState('State');
  const [teamType, setTeamType] = useState(initialTeamType);
  const [districtId, setDistrictId] = useState('');
  const [hierarchy, setHierarchy] = useState({ districts: [] });
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPublicLeadership() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (orgLevel) params.set('orgLevel', orgLevel);
        if (teamType) params.set('teamType', teamType);
        if (districtId) params.set('districtId', districtId);

        const res = await fetch(`/api/public/organization?${params.toString()}`);
        const data = await res.json();
        if (res.ok) {
          setHierarchy(data.hierarchy || { districts: [] });
          setTeams(data.teams || []);
        }
      } catch (err) {
        console.error('Error loading public leadership:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPublicLeadership();
  }, [orgLevel, teamType, districtId]);

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
              value={orgLevel}
              onChange={(e) => {
                setOrgLevel(e.target.value);
                if (e.target.value === 'State') setDistrictId('');
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
            <label className="form-label">Filter by District</label>
            <select
              className="form-control"
              value={districtId}
              onChange={(e) => setDistrictId(e.target.value)}
              disabled={orgLevel === 'State'}
            >
              <option value="">All Districts</option>
              {(hierarchy.districts || []).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
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
