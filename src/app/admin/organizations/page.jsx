'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit3, Power, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUp, ArrowDown } from 'lucide-react';

export default function AdminOrganizationsPage() {
  const router = useRouter();
  const [hierarchy, setHierarchy] = useState({ orgLevels: [], orgUnits: [] });
  const [activeLevelId, setActiveLevelId] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  // Add Form State
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [selectedParents, setSelectedParents] = useState({});

  // Edit Modal State
  const [editingUnit, setEditingUnit] = useState(null);

  // Data Table State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadHierarchy = useCallback(async () => {
    const res = await fetch('/api/admin/organizations');
    const data = await res.json();
    if (res.ok && data.hierarchy) {
      setHierarchy(data.hierarchy);
      if (!activeLevelId && data.hierarchy.orgLevels.length > 0) {
        setActiveLevelId(data.hierarchy.orgLevels[0].id);
      }
    }
  }, [activeLevelId]);

  useEffect(() => {
    loadHierarchy();
  }, [loadHierarchy]);

  const activeLevel = hierarchy.orgLevels.find((l) => l.id === activeLevelId);

  // Determine which parent dropdowns to show
  const requiredParentLevels = activeLevel
    ? hierarchy.orgLevels
        .filter((l) => l.levelRank < activeLevel.levelRank)
        .sort((a, b) => a.levelRank - b.levelRank)
    : [];

  const handleParentSelect = (levelRank, unitId) => {
    const newParents = { ...selectedParents, [levelRank]: unitId };
    Object.keys(newParents).forEach((key) => {
      if (parseInt(key) > levelRank) delete newParents[key];
    });
    setSelectedParents(newParents);
  };

  async function handleCreateUnit(e) {
    e.preventDefault();
    setFeedback({ type: '', text: '' });

    let parentId = null;
    if (requiredParentLevels.length > 0) {
      const immediateParentLevel = requiredParentLevels[requiredParentLevels.length - 1];
      parentId = selectedParents[immediateParentLevel.levelRank];
      if (!parentId) {
        setFeedback({ type: 'error', text: `Please select a ${immediateParentLevel.name}` });
        return;
      }
    }

    const res = await fetch('/api/admin/organizations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orgLevelId: activeLevelId,
        parentId,
        name: newName,
        code: newCode,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      setFeedback({ type: 'error', text: data.error || 'Failed to add unit.' });
      return;
    }

    setFeedback({ type: 'success', text: data.message });
    setNewName('');
    setNewCode('');
    loadHierarchy();
  }

  async function handleToggleStatus(unit) {
    const targetStatus = unit.status === 'Active' ? 'Inactive' : 'Active';
    if (!window.confirm(`Change status of "${unit.name}" to ${targetStatus}?`)) return;

    const res = await fetch('/api/admin/organizations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: unit.id, status: targetStatus }),
    });
    const data = await res.json();
    if (res.ok) {
      setFeedback({ type: 'success', text: data.message });
      loadHierarchy();
    } else {
      setFeedback({ type: 'error', text: data.error });
    }
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    if (!editingUnit) return;
    const res = await fetch('/api/admin/organizations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editingUnit.id,
        name: editingUnit.name,
        code: editingUnit.code,
        status: editingUnit.status,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setFeedback({ type: 'success', text: data.message });
      setEditingUnit(null);
      loadHierarchy();
    } else {
      setFeedback({ type: 'error', text: data.error });
    }
  }

  // --- Data Table Logic ---
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const currentLevelUnits = useMemo(() => {
    let units = hierarchy.orgUnits.filter((u) => u.orgLevelId === activeLevelId);
    
    // 1. Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      units = units.filter(u => 
        (u.name && u.name.toLowerCase().includes(q)) || 
        (u.code && u.code.toLowerCase().includes(q)) ||
        (u.locationLabel && u.locationLabel.toLowerCase().includes(q))
      );
    }

    // 2. Sort
    units.sort((a, b) => {
      const valA = (a[sortConfig.key] || '').toLowerCase();
      const valB = (b[sortConfig.key] || '').toLowerCase();
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return units;
  }, [hierarchy.orgUnits, activeLevelId, searchQuery, sortConfig]);

  // Pagination calculations
  const totalPages = Math.ceil(currentLevelUnits.length / rowsPerPage);
  const paginatedUnits = currentLevelUnits.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Reset pagination when level or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeLevelId, searchQuery, rowsPerPage]);

  return (
    <div className="animate-fade-in-up" style={{ padding: '16px', maxWidth: '1600px', margin: '0 auto' }}>
      
      {/* Top Header Row (Ultra Compact) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary-dark)', margin: 0, lineHeight: 1.2 }}>Organization & Team Master</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', margin: 0 }}>
            Manage locations & initialize 3 Core Teams automatically.
          </p>
        </div>

        {/* Tabs - Moved to Header Row to save vertical space */}
        <div className="animate-fade-in-up delay-100" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {hierarchy.orgLevels.map((lvl) => {
            const count = hierarchy.orgUnits.filter((u) => u.orgLevelId === lvl.id).length;
            const isActive = activeLevelId === lvl.id;
            return (
              <button
                key={lvl.id}
                onClick={() => {
                  setActiveLevelId(lvl.id);
                  setSelectedParents({});
                  setFeedback({type:'', text:''});
                  setSearchQuery('');
                }}
                className={`btn ${isActive ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontWeight: 600, padding: '4px 12px', fontSize: '12px', borderRadius: '6px', height: '28px' }}
              >
                {lvl.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {feedback.text && (
        <div className={`alert ${feedback.type === 'error' ? 'alert-error' : 'alert-success'} animate-fade-in-up`} style={{ padding: '8px 12px', fontSize: '13px', marginBottom: '16px' }}>
          {feedback.text}
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-start' }}>
        {/* Add Form (Compact) */}
        <div className="card animate-fade-in-up delay-200" style={{ flex: '1 1 260px', maxWidth: '320px', position: 'sticky', top: '16px' }}>
          <div className="card-header" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--primary-dark)' }}>Add {activeLevel?.name}</h2>
          </div>
          <form onSubmit={handleCreateUnit} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {requiredParentLevels.map((parentLvl, index) => {
              let options = hierarchy.orgUnits.filter(u => u.orgLevelId === parentLvl.id);
              if (index > 0) {
                const prevLvlRank = requiredParentLevels[index - 1].levelRank;
                const selectedPrevParentId = selectedParents[prevLvlRank];
                options = options.filter(u => u.parentId === selectedPrevParentId);
              }

              return (
                <div className="form-group" key={parentLvl.id} style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                    Select {parentLvl.name} *
                  </label>
                  <select
                    className="form-control"
                    value={selectedParents[parentLvl.levelRank] || ''}
                    onChange={(e) => handleParentSelect(parentLvl.levelRank, e.target.value)}
                    required
                    style={{ background: '#f8fafc', padding: '6px 10px', fontSize: '12px', height: '32px' }}
                  >
                    <option value="">-- Choose --</option>
                    {options.map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.name}</option>
                    ))}
                  </select>
                </div>
              );
            })}

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{activeLevel?.name} Name *</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="form-control"
                placeholder="Enter Name"
                style={{ background: '#f8fafc', padding: '6px 10px', fontSize: '12px', height: '32px' }}
              />
            </div>
            
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Code (Optional)</label>
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="form-control"
                placeholder="Auto-generated"
                style={{ background: '#f8fafc', padding: '6px 10px', fontSize: '12px', height: '32px' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '6px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', fontSize: '12px', marginTop: '4px', height: '32px' }}>
              <Plus size={14} /> Create & Init
            </button>
          </form>
        </div>

        {/* List Data Table */}
        <div className="card animate-fade-in-up delay-200" style={{ flex: '2 1 500px', minWidth: '0', display: 'flex', flexDirection: 'column' }}>
          {/* Table Header Controls */}
          <div className="card-header" style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)', display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--primary-dark)' }}>Existing {activeLevel?.name} Records</h2>
            
            {/* Search Bar */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '250px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '30px', borderRadius: '16px', background: '#f1f5f9', border: 'none', height: '28px', fontSize: '12px' }}
              />
            </div>
          </div>

          <div className="table-container" style={{ margin: 0, flex: 1, overflowX: 'auto', overflowY: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead style={{ background: '#f8fafc', position: 'sticky', top: 0, zIndex: 10 }}>
                <tr>
                  <th onClick={() => handleSort('name')} style={{ padding: '8px 12px', fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Name & Code {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? <ArrowUp size={10}/> : <ArrowDown size={10}/>) : ''}</div>
                  </th>
                  <th onClick={() => handleSort('locationLabel')} style={{ padding: '8px 12px', fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Parent Path {sortConfig.key === 'locationLabel' ? (sortConfig.direction === 'asc' ? <ArrowUp size={10}/> : <ArrowDown size={10}/>) : ''}</div>
                  </th>
                  <th onClick={() => handleSort('status')} style={{ padding: '8px 12px', fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Status {sortConfig.key === 'status' ? (sortConfig.direction === 'asc' ? <ArrowUp size={10}/> : <ArrowDown size={10}/>) : ''}</div>
                  </th>
                  <th style={{ textAlign: 'right', padding: '8px 12px', fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700, borderBottom: '1px solid var(--border-color)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUnits.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <Search size={20} style={{ opacity: 0.5 }} />
                        <span>No records found.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedUnits.map((unit) => (
                    <tr key={unit.id} style={{ transition: 'background-color 0.2s', borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '13px' }}>{unit.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{unit.code}</div>
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', background: 'var(--bg-muted)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block' }} title={unit.locationLabel}>
                          {unit.locationLabel || '-'}
                        </div>
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <span className={`badge ${unit.status === 'Active' ? 'badge-active' : 'badge-inactive'}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                          {unit.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', padding: '8px 12px' }}>
                        <div style={{ display: 'inline-flex', gap: '4px' }}>
                          <button onClick={() => setEditingUnit(unit)} className="btn btn-outline btn-sm" title="Edit" style={{ padding: '2px 6px', minHeight: '24px', height: '24px' }}>
                            <Edit3 size={12} />
                          </button>
                          <button onClick={() => handleToggleStatus(unit)} className="btn btn-outline btn-sm" style={{ color: unit.status === 'Active' ? 'var(--danger)' : 'var(--success)', padding: '2px 6px', minHeight: '24px', height: '24px' }} title="Toggle Status">
                            <Power size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {currentLevelUnits.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-surface)', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                <span>Rows:</span>
                <select 
                  value={rowsPerPage} 
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  className="form-control"
                  style={{ padding: '2px 6px', height: '24px', fontSize: '11px', width: 'auto', minHeight: '24px' }}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {((currentPage - 1) * rowsPerPage) + 1}-{Math.min(currentPage * rowsPerPage, currentLevelUnits.length)} of {currentLevelUnits.length}
              </div>
              
              <div style={{ display: 'flex', gap: '2px' }}>
                <button 
                  className="btn btn-outline btn-sm" 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(1)}
                  style={{ padding: '2px', opacity: currentPage === 1 ? 0.5 : 1, minHeight: '24px', height: '24px', width: '24px' }}
                >
                  <ChevronsLeft size={14} />
                </button>
                <button 
                  className="btn btn-outline btn-sm" 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(p => p - 1)}
                  style={{ padding: '2px', opacity: currentPage === 1 ? 0.5 : 1, minHeight: '24px', height: '24px', width: '24px' }}
                >
                  <ChevronLeft size={14} />
                </button>
                <button 
                  className="btn btn-outline btn-sm" 
                  disabled={currentPage === totalPages || totalPages === 0} 
                  onClick={() => setCurrentPage(p => p + 1)}
                  style={{ padding: '2px', opacity: currentPage === totalPages || totalPages === 0 ? 0.5 : 1, minHeight: '24px', height: '24px', width: '24px' }}
                >
                  <ChevronRight size={14} />
                </button>
                <button 
                  className="btn btn-outline btn-sm" 
                  disabled={currentPage === totalPages || totalPages === 0} 
                  onClick={() => setCurrentPage(totalPages)}
                  style={{ padding: '2px', opacity: currentPage === totalPages || totalPages === 0 ? 0.5 : 1, minHeight: '24px', height: '24px', width: '24px' }}
                >
                  <ChevronsRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingUnit && (
        <div className="modal-backdrop" onClick={() => setEditingUnit(null)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-panel animate-fade-in-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', width: '90%', background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Edit {activeLevel?.name}</h3>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="modal-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Name</label>
                  <input
                    type="text"
                    required
                    value={editingUnit.name}
                    onChange={(e) => setEditingUnit({ ...editingUnit, name: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Code</label>
                  <input
                    type="text"
                    value={editingUnit.code}
                    onChange={(e) => setEditingUnit({ ...editingUnit, code: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Status</label>
                  <select
                    value={editingUnit.status}
                    onChange={(e) => setEditingUnit({ ...editingUnit, status: e.target.value })}
                    className="form-control"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer" style={{ padding: '16px 20px', borderTop: '1px solid var(--border-color)', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setEditingUnit(null)} className="btn btn-outline" style={{ background: 'white' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
