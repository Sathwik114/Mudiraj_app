'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, MapPin, Building2, Landmark, Home, Layers } from 'lucide-react';

/**
 * Reusable Organization Tree Explorer
 * Recursively renders the dynamic organizational hierarchy.
 */
export default function OrganizationTree({ hierarchy, onSelectUnit = null }) {
  const { orgLevels, orgUnits } = hierarchy;
  const [expandedNodes, setExpandedNodes] = useState({});

  function toggleNode(id) {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function expandAll() {
    const all = {};
    orgUnits.forEach((u) => {
      all[u.id] = true;
    });
    setExpandedNodes(all);
  }

  function collapseAll() {
    setExpandedNodes({});
  }

  // Get icons based on level rank (fallback to Layers)
  const getIcon = (levelRank) => {
    switch (levelRank) {
      case 1: return <Landmark size={18} color="#fbbf24" />;
      case 2: return <Building2 size={16} color="var(--primary)" />;
      case 3: return <MapPin size={15} color="var(--accent)" />;
      case 4: return <Home size={14} color="#64748b" />;
      default: return <Layers size={14} color="#94a3b8" />;
    }
  };

  const renderRecursive = (parentId = null, currentLevelRank = 1) => {
    const currentLevel = orgLevels.find(l => l.levelRank === currentLevelRank);
    if (!currentLevel) return null;

    const unitsAtLevel = orgUnits.filter(u => u.parentId === parentId && u.orgLevelId === currentLevel.id);
    
    if (unitsAtLevel.length === 0) {
      if (currentLevelRank === 1) return null; // Root missing
      return (
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '4px 12px' }}>
          No {currentLevel.name}s added under this unit yet.
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: parentId ? '16px' : '0' }}>
        {unitsAtLevel.map((unit) => {
          const isOpen = Boolean(expandedNodes[unit.id]);
          const hasChildren = orgUnits.some(u => u.parentId === unit.id);
          const nextLevel = orgLevels.find(l => l.levelRank === currentLevelRank + 1);

          return (
            <div
              key={unit.id}
              style={{
                border: currentLevelRank === 1 ? 'none' : '1px solid var(--border-color)',
                borderLeft: currentLevelRank > 1 ? `3px solid var(--primary)` : 'none',
                borderRadius: '8px',
                overflow: 'hidden',
                background: currentLevelRank === 1 ? 'var(--primary-dark)' : '#ffffff',
                color: currentLevelRank === 1 ? '#ffffff' : 'inherit',
                marginBottom: currentLevelRank === 1 ? '12px' : '0'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: currentLevelRank === 1 ? '12px 16px' : '8px 12px',
                  background: currentLevelRank === 1 ? 'transparent' : (isOpen ? '#f8fafc' : '#ffffff'),
                  cursor: hasChildren ? 'pointer' : 'default',
                }}
                onClick={() => hasChildren && toggleNode(unit.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {hasChildren && (
                    <span style={{ color: currentLevelRank === 1 ? '#fff' : 'inherit' }}>
                      {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </span>
                  )}
                  {!hasChildren && <span style={{ width: '16px' }} />}
                  
                  {getIcon(currentLevelRank)}
                  
                  <span style={{ fontWeight: currentLevelRank <= 2 ? 700 : 600, fontSize: currentLevelRank === 1 ? '15px' : '14px' }}>
                    {unit.name} {currentLevelRank > 1 && currentLevel.name}
                  </span>
                  <span style={{ fontSize: '12px', color: currentLevelRank === 1 ? '#e2e8f0' : 'var(--text-muted)' }}>
                    ({unit.code})
                  </span>
                  {currentLevelRank === 1 && <span className="badge badge-active">Active</span>}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {hasChildren && nextLevel && (
                    <span style={{ fontSize: '12px', color: currentLevelRank === 1 ? '#cbd5e1' : 'var(--text-secondary)' }}>
                      {unit.childrenCount} {nextLevel.name}s
                    </span>
                  )}
                  {onSelectUnit && (
                    <button
                      type="button"
                      className={`btn btn-sm ${currentLevelRank === 1 ? 'btn-accent' : 'btn-outline'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectUnit({ level: currentLevel.name, unit });
                      }}
                    >
                      Teams
                    </button>
                  )}
                </div>
              </div>

              {isOpen && hasChildren && (
                <div style={{ padding: '8px', background: '#ffffff' }}>
                  {renderRecursive(unit.id, currentLevelRank + 1)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">Organizational Hierarchy Tree</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {orgLevels.map(l => l.name).join(' → ')} (with Main, Youth &amp; Mahila Teams at every level)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className="btn btn-outline btn-sm" onClick={expandAll}>
            Expand All
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={collapseAll}>
            Collapse All
          </button>
        </div>
      </div>

      <div style={{ padding: '4px' }}>
        {renderRecursive(null, 1)}
      </div>
    </div>
  );
}
