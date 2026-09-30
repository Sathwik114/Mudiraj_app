'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronDown, MapPin, Building2, Landmark, Home, Layers, Search, X } from 'lucide-react';

/**
 * Reusable Organization Tree Explorer
 * Recursively renders the dynamic organizational hierarchy with Search and Links.
 */
export default function OrganizationTree({ hierarchy }) {
  const { orgLevels, orgUnits } = hierarchy;
  const [expandedNodes, setExpandedNodes] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

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

  // Handle Search Filtering
  const filteredUnitIds = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase();
    const matched = new Set();
    const toExpand = new Set();

    orgUnits.forEach(u => {
      if (u.name.toLowerCase().includes(query) || (u.code && u.code.toLowerCase().includes(query))) {
        matched.add(u.id);
        // Expand parents
        let parent = orgUnits.find(p => p.id === u.parentId);
        while (parent) {
          toExpand.add(parent.id);
          matched.add(parent.id);
          parent = orgUnits.find(p => p.id === parent.parentId);
        }
      }
    });

    setExpandedNodes(prev => ({ ...prev, ...Object.fromEntries(Array.from(toExpand).map(id => [id, true])) }));
    return matched;
  }, [searchQuery, orgUnits]);

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

    let unitsAtLevel = orgUnits.filter(u => u.parentId === parentId && u.orgLevelId === currentLevel.id);
    
    // Apply search filter if active
    if (filteredUnitIds) {
      unitsAtLevel = unitsAtLevel.filter(u => filteredUnitIds.has(u.id));
    }

    if (unitsAtLevel.length === 0) {
      if (currentLevelRank === 1) return null; // Root missing
      if (filteredUnitIds && parentId) return null; // Hide empty children during search
      return (
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '4px 12px' }}>
          No {currentLevel.name}s added under this unit yet.
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: parentId ? '20px' : '0' }}>
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
                marginBottom: currentLevelRank === 1 ? '16px' : '0',
                boxShadow: currentLevelRank === 1 ? 'var(--shadow-md)' : 'var(--shadow-sm)'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: currentLevelRank === 1 ? '16px 20px' : '10px 14px',
                  background: currentLevelRank === 1 ? 'transparent' : (isOpen ? '#f8fafc' : '#ffffff'),
                  cursor: hasChildren ? 'pointer' : 'default',
                  transition: 'background 0.2s'
                }}
                onClick={() => hasChildren && toggleNode(unit.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {hasChildren && (
                    <span style={{ color: currentLevelRank === 1 ? '#fff' : 'var(--primary)' }}>
                      {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </span>
                  )}
                  {!hasChildren && <span style={{ width: '18px' }} />}
                  
                  {getIcon(currentLevelRank)}
                  
                  <span style={{ fontWeight: currentLevelRank <= 2 ? 700 : 600, fontSize: currentLevelRank === 1 ? '16px' : '14px' }}>
                    {unit.name} {currentLevelRank > 1 && currentLevel.name}
                  </span>
                  <span style={{ fontSize: '13px', color: currentLevelRank === 1 ? '#e2e8f0' : 'var(--text-muted)' }}>
                    ({unit.code})
                  </span>
                  {currentLevelRank === 1 && <span className="badge badge-active" style={{ marginLeft: '8px' }}>State HQ</span>}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {hasChildren && nextLevel && (
                    <span style={{ fontSize: '12px', fontWeight: 600, color: currentLevelRank === 1 ? '#cbd5e1' : 'var(--text-secondary)' }}>
                      {unit.childrenCount} {nextLevel.name}s
                    </span>
                  )}
                  <Link
                    href={`/leadership?orgLevelId=${currentLevel.id}&orgUnitId=${unit.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className={`btn btn-sm ${currentLevelRank === 1 ? 'btn-accent' : 'btn-outline'}`}
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                  >
                    View Teams
                  </Link>
                </div>
              </div>

              {isOpen && hasChildren && (
                <div style={{ padding: '12px 12px 16px 12px', background: '#ffffff', borderTop: currentLevelRank === 1 ? 'none' : '1px solid var(--border-color)' }}>
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
    <div className="card animate-fade-in-up delay-200" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="card-header" style={{ padding: '24px', margin: 0, borderBottom: '1px solid var(--border-color)', background: 'var(--bg-muted)' }}>
        <div style={{ flex: 1 }}>
          <h3 className="card-title" style={{ fontSize: '20px' }}>Organization Explorer</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '6px' }}>
            {orgLevels.map(l => l.name).join(' → ')}
          </p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={expandAll}>Expand All</button>
            <button type="button" className="btn btn-outline btn-sm" onClick={collapseAll}>Collapse All</button>
          </div>
          
          <div style={{ position: 'relative', width: '250px' }}>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search Districts, Mandals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '32px', borderRadius: '20px' }}
            />
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '10px', top: '10px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <X size={16} color="var(--text-muted)" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: '24px' }}>
        {renderRecursive(null, 1)}
      </div>
    </div>
  );
}
