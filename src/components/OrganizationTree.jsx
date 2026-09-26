'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, MapPin, Building2, Landmark, Home } from 'lucide-react';

/**
 * Reusable Organization Tree Explorer (`components/OrganizationTree.js`)
 * Displays:
 * State (Andhra Pradesh)
 *  └── District
 *       └── Constitution
 *            └── Mandal
 *                 └── Gramam (Future Feature)
 */
export default function OrganizationTree({ hierarchy, onSelectUnit = null }) {
  const states = hierarchy?.states || [];
  const districts = hierarchy?.districts || [];
  const constitutions = hierarchy?.constitutions || [];
  const mandals = hierarchy?.mandals || [];
  const gramams = hierarchy?.gramams || [];

  const [expandedDistricts, setExpandedDistricts] = useState({
    [districts[0]?.id]: true,
    [districts[1]?.id]: true,
  });
  const [expandedConstitutions, setExpandedConstitutions] = useState({
    [constitutions[0]?.id]: true,
    [constitutions[2]?.id]: true,
  });
  const [expandedMandals, setExpandedMandals] = useState({});

  function toggleDistrict(id) {
    setExpandedDistricts((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function toggleConstitution(id) {
    setExpandedConstitutions((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function toggleMandal(id) {
    setExpandedMandals((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">Organizational Hierarchy Tree — Andhra Pradesh</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            State → District → Constitution → Mandal → Gramam (with Main, Youth &amp; Mahila Teams at every level)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              const allD = {};
              districts.forEach((d) => { allD[d.id] = true; });
              const allC = {};
              constitutions.forEach((c) => { allC[c.id] = true; });
              setExpandedDistricts(allD);
              setExpandedConstitutions(allC);
            }}
          >
            Expand All
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              setExpandedDistricts({});
              setExpandedConstitutions({});
              setExpandedMandals({});
            }}
          >
            Collapse All
          </button>
        </div>
      </div>

      {states.map((state) => (
        <div key={state.id} style={{ paddingLeft: '4px' }}>
          {/* State Node */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: 'var(--primary-dark)',
              color: '#ffffff',
              borderRadius: '8px',
              marginBottom: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Landmark size={18} color="#fbbf24" />
              <span style={{ fontWeight: 700, fontSize: '15px' }}>
                STATE: {state.name} ({state.code})
              </span>
              <span className="badge badge-active">Active</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
              <span>Main / Youth / Mahila Teams Active</span>
              {onSelectUnit && (
                <button
                  type="button"
                  className="btn btn-accent btn-sm"
                  onClick={() => onSelectUnit({ level: 'State', unit: state })}
                >
                  View State Teams
                </button>
              )}
            </div>
          </div>

          {/* District Nodes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '18px' }}>
            {districts
              .filter((d) => d.stateId === state.id)
              .map((dist) => {
                const distConstitutions = constitutions.filter((c) => c.districtId === dist.id);
                const isDistOpen = Boolean(expandedDistricts[dist.id]);

                return (
                  <div
                    key={dist.id}
                    style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: 'var(--bg-muted)',
                        cursor: 'pointer',
                      }}
                      onClick={() => toggleDistrict(dist.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isDistOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        <Building2 size={16} color="var(--primary)" />
                        <span style={{ fontWeight: 700, fontSize: '14px' }}>
                          {dist.name} District
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          ({dist.code})
                        </span>
                        <span
                          className={`badge ${
                            dist.status === 'Active' ? 'badge-active' : 'badge-inactive'
                          }`}
                        >
                          {dist.status}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {distConstitutions.length} Constitutions
                        </span>
                        {onSelectUnit && (
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectUnit({ level: 'District', unit: dist });
                            }}
                          >
                            Teams
                          </button>
                        )}
                      </div>
                    </div>

                    {isDistOpen && (
                      <div style={{ padding: '10px 14px 10px 28px', background: '#ffffff' }}>
                        {distConstitutions.length === 0 ? (
                          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            No Constitutions added under this District yet.
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {distConstitutions.map((cons) => {
                              const consMandals = mandals.filter(
                                (m) => m.constitutionId === cons.id
                              );
                              const isConsOpen = Boolean(expandedConstitutions[cons.id]);

                              return (
                                <div
                                  key={cons.id}
                                  style={{
                                    borderLeft: '3px solid var(--primary)',
                                    paddingLeft: '12px',
                                  }}
                                >
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      padding: '6px 8px',
                                      background: '#f8fafc',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                    }}
                                    onClick={() => toggleConstitution(cons.id)}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      {isConsOpen ? (
                                        <ChevronDown size={15} />
                                      ) : (
                                        <ChevronRight size={15} />
                                      )}
                                      <MapPin size={15} color="var(--accent)" />
                                      <span style={{ fontWeight: 600, fontSize: '14px' }}>
                                        {cons.name} Constitution
                                      </span>
                                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                        ({cons.code})
                                      </span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                        {consMandals.length} Mandals
                                      </span>
                                      {onSelectUnit && (
                                        <button
                                          type="button"
                                          className="btn btn-outline btn-sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onSelectUnit({ level: 'Constitution', unit: cons });
                                          }}
                                        >
                                          Teams
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {isConsOpen && (
                                    <div
                                      style={{
                                        paddingLeft: '22px',
                                        marginTop: '6px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '6px',
                                      }}
                                    >
                                      {consMandals.map((mnd) => {
                                        const mndGramams = gramams.filter(
                                          (g) => g.mandalId === mnd.id
                                        );
                                        const isMndOpen = Boolean(expandedMandals[mnd.id]);

                                        return (
                                          <div
                                            key={mnd.id}
                                            style={{
                                              border: '1px solid var(--border-color)',
                                              borderRadius: '6px',
                                              padding: '8px 12px',
                                            }}
                                          >
                                            <div
                                              style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                cursor: 'pointer',
                                              }}
                                              onClick={() => toggleMandal(mnd.id)}
                                            >
                                              <div
                                                style={{
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  gap: '8px',
                                                }}
                                              >
                                                {isMndOpen ? (
                                                  <ChevronDown size={14} />
                                                ) : (
                                                  <ChevronRight size={14} />
                                                )}
                                                <span style={{ fontWeight: 600, fontSize: '13px' }}>
                                                  {mnd.name}
                                                </span>
                                                <span
                                                  style={{
                                                    fontSize: '11px',
                                                    color: 'var(--text-muted)',
                                                  }}
                                                >
                                                  ({mnd.code})
                                                </span>
                                              </div>

                                              <div
                                                style={{
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  gap: '8px',
                                                }}
                                              >
                                                <span className="badge badge-future">
                                                  Gramam Level Ready
                                                </span>
                                                {onSelectUnit && (
                                                  <button
                                                    type="button"
                                                    className="btn btn-outline btn-sm"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      onSelectUnit({ level: 'Mandal', unit: mnd });
                                                    }}
                                                  >
                                                    Teams
                                                  </button>
                                                )}
                                              </div>
                                            </div>

                                            {isMndOpen && (
                                              <div
                                                style={{
                                                  marginTop: '8px',
                                                  paddingTop: '8px',
                                                  borderTop: '1px dashed var(--border-color)',
                                                  paddingLeft: '18px',
                                                  fontSize: '12px',
                                                }}
                                              >
                                                <div
                                                  style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    color: 'var(--text-secondary)',
                                                  }}
                                                >
                                                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Home size={13} />
                                                    <strong>Gramam Hierarchy:</strong>{' '}
                                                    {mndGramams.length > 0
                                                      ? mndGramams.map((g) => g.name).join(', ')
                                                      : 'Configured in Database Schema'}
                                                  </span>
                                                  <span className="badge badge-future">
                                                    Future Feature (Architecture Ready)
                                                  </span>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
