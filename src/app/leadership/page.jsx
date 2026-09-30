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
  const initialOrgLevelId = searchParams.get('orgLevelId') || '';
  const initialOrgUnitId = searchParams.get('orgUnitId') || '';

  const [orgLevelId, setOrgLevelId] = useState(initialOrgLevelId);
  const [teamType, setTeamType] = useState(initialTeamType);
  const [orgUnitId, setOrgUnitId] = useState(initialOrgUnitId);
  const [hierarchy, setHierarchy] = useState({ orgLevels: [], orgUnits: [] });
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Load hierarchy once
  useEffect(() => {
    async function fetchHierarchy() {
      try {
        const res = await fetch(`/api/public/organization?`);
        const data = await res.json();
        if (res.ok) setHierarchy(data.hierarchy || { orgLevels: [], orgUnits: [] });
      } catch (e) {
        console.error(e);
      }
    }
    fetchHierarchy();
  }, []);

  // Fetch teams when filters change
  useEffect(() => {
    async function loadPublicLeadership() {
      setLoading(true);
      setHasSearched(true);
      try {
        const params = new URLSearchParams();
        if (orgLevelId) params.set('orgLevelId', orgLevelId);
        if (teamType) params.set('teamType', teamType);
        if (orgUnitId) params.set('orgUnitId', orgUnitId);

        const res = await fetch(`/api/public/organization?${params.toString()}`);
        const data = await res.json();
        if (res.ok) {
          // Only show teams that have at least one leader assigned
          const teamsWithData = (data.teams || []).filter(t => t.leaders && t.leaders.length > 0);
          setTeams(teamsWithData);
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
      <div className="animate-fade-in-up" style={{ marginBottom: '20px' }}>
        <span className="badge badge-info" style={{ marginBottom: '6px', fontSize: '11px', padding: '2px 8px' }}>
          Leadership Directory
        </span>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary-dark)', lineHeight: 1.2 }}>
          Mudiraj Community Leadership Committees
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '800px' }}>
          Select an organizational level or unit to view its corresponding Main, Youth, and Mahila teams.
        </p>
      </div>

      {/* Compact Filter Bar */}
      <div className="card animate-fade-in-up delay-100" style={{ marginBottom: '20px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
            Filters
          </h2>
          {(orgLevelId || teamType || orgUnitId) && (
            <button 
              onClick={() => { setOrgLevelId(''); setTeamType(''); setOrgUnitId(''); setHasSearched(false); setTeams([]); }}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px' }}
            >
              Clear Filters
            </button>
          )}
        </div>
        
        <div className="form-grid" style={{ gap: '12px' }}>
          <div className="form-group" style={{ gap: '2px' }}>
            <label className="form-label" style={{ fontSize: '11px', color: 'var(--text-main)' }}>Level</label>
            <select
              className="form-control"
              value={orgLevelId}
              onChange={(e) => {
                const newLevelId = e.target.value;
                setOrgLevelId(newLevelId);
                
                // Smart Defaults
                if (newLevelId) {
                  const selectedLvl = hierarchy.orgLevels.find(l => l.id === newLevelId);
                  if (selectedLvl && selectedLvl.name === 'State') {
                    // Auto-select Andhra Pradesh (the only state unit)
                    const stateUnit = hierarchy.orgUnits.find(u => u.orgLevelId === newLevelId);
                    if (stateUnit) setOrgUnitId(stateUnit.id);
                    // Default to Main Team to immediately show the top leadership
                    setTeamType('Main Team');
                  } else {
                    setOrgUnitId('');
                  }
                } else {
                  setOrgUnitId('');
                }
              }}
              style={{ padding: '6px 10px', fontSize: '13px', background: '#f8fafc', borderColor: 'var(--border-strong)' }}
            >
              <option value="">Select Level...</option>
              {(hierarchy.orgLevels || []).map((lvl) => (
                <option key={lvl.id} value={lvl.id}>{lvl.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ gap: '2px' }}>
            <label className="form-label" style={{ fontSize: '11px', color: 'var(--text-main)' }}>Specific Unit</label>
            <select
              className="form-control"
              value={orgUnitId}
              onChange={(e) => setOrgUnitId(e.target.value)}
              disabled={!orgLevelId}
              style={{ 
                padding: '6px 10px', fontSize: '13px',
                background: !orgLevelId ? 'var(--bg-muted)' : '#f8fafc', 
                borderColor: 'var(--border-strong)',
                opacity: !orgLevelId ? 0.6 : 1
              }}
            >
              <option value="">{orgLevelId ? 'All Units in Level' : 'Select a Level first'}</option>
              {(hierarchy.orgUnits || [])
                .filter(u => u.orgLevelId === orgLevelId)
                .map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ gap: '2px' }}>
            <label className="form-label" style={{ fontSize: '11px', color: 'var(--text-main)' }}>Wing / Category</label>
            <select
              className="form-control"
              value={teamType}
              onChange={(e) => setTeamType(e.target.value)}
              style={{ padding: '6px 10px', fontSize: '13px', background: '#f8fafc', borderColor: 'var(--border-strong)' }}
            >
              <option value="">All (Main, Youth, Mahila)</option>
              {VALID_TEAM_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {hasSearched && !loading && (
        <div className="animate-fade-in-up delay-200" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', background: 'var(--primary-light)', padding: '10px 16px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--primary-dark)' }}>
            Showing {teams.length} team{teams.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {loading ? (
        <div className="card animate-fade-in-up delay-200" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ display: 'inline-block', width: '24px', height: '24px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <div style={{ marginTop: '12px', fontSize: '14px', color: 'var(--text-muted)' }}>Loading committees...</div>
        </div>
      ) : teams.length === 0 ? (
        <div className="card animate-fade-in-up delay-200" style={{ textAlign: 'center', padding: '40px' }}>
          No teams found matching the selected filters.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {teams.map((team, index) => (
            <div key={team.id} className="animate-fade-in-up" style={{ animationDelay: `${(index + 2) * 100}ms` }}>
              <TeamCard team={team} isAdmin={false} />
            </div>
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
