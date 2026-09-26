'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import OrganizationTree from '@/components/OrganizationTree';
import { Plus, Edit3, Power, Landmark, Building2, MapPin, Home } from 'lucide-react';

export default function AdminOrganizationsPage() {
  const router = useRouter();
  const [hierarchy, setHierarchy] = useState({
    states: [],
    districts: [],
    constitutions: [],
    mandals: [],
    gramams: [],
  });
  const [activeTab, setActiveTab] = useState('District');
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  // Add New Unit Form State
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [selectedConstitutionId, setSelectedConstitutionId] = useState('');
  const [selectedMandalId, setSelectedMandalId] = useState('');

  // Edit Unit Modal State
  const [editingUnit, setEditingUnit] = useState(null);

  const loadHierarchy = useCallback(async () => {
    const res = await fetch('/api/admin/organizations');
    const data = await res.json();
    if (res.ok && data.hierarchy) {
      setHierarchy(data.hierarchy);
      if (!selectedDistrictId && data.hierarchy.districts[0]) {
        setSelectedDistrictId(data.hierarchy.districts[0].id);
      }
    }
  }, [selectedDistrictId]);

  useEffect(() => {
    loadHierarchy();
  }, [loadHierarchy]);

  const filteredConstitutions = hierarchy.constitutions.filter(
    (c) => !selectedDistrictId || c.districtId === selectedDistrictId
  );

  const filteredMandals = hierarchy.mandals.filter(
    (m) => !selectedConstitutionId || m.constitutionId === selectedConstitutionId
  );

  async function handleCreateUnit(e) {
    e.preventDefault();
    setFeedback({ type: '', text: '' });

    const res = await fetch('/api/admin/organizations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        level: activeTab,
        name: newName,
        code: newCode,
        districtId: selectedDistrictId,
        constitutionId: selectedConstitutionId,
        mandalId: selectedMandalId,
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

  async function handleToggleStatus(level, unit) {
    const targetStatus = unit.status === 'Active' ? 'Inactive' : 'Active';
    if (
      !window.confirm(
        `Change status of ${level} "${unit.name}" to ${targetStatus}?\n\n(Organizational records are preserved with Active/Inactive status rather than permanent deletion.)`
      )
    ) {
      return;
    }

    const res = await fetch('/api/admin/organizations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        level,
        id: unit.id,
        status: targetStatus,
      }),
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
        level: editingUnit.level,
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

  const levels = [
    { key: 'State', label: 'State (Andhra Pradesh)', icon: Landmark, count: hierarchy.states.length },
    { key: 'District', label: 'Districts', icon: Building2, count: hierarchy.districts.length },
    { key: 'Constitution', label: 'Constitutions', icon: MapPin, count: hierarchy.constitutions.length },
    { key: 'Mandal', label: 'Mandals', icon: MapPin, count: hierarchy.mandals.length },
    { key: 'Gramam', label: 'Gramam (Future Feature)', icon: Home, count: hierarchy.gramams.length },
  ];

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary-dark)' }}>
          Organization Structure Management
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Manage State → District → Constitution → Mandal → Gramam hierarchy. Every created unit
          automatically initializes its Main Team, Youth Team, and Mahila Team.
        </p>
      </div>

      {feedback.text && (
        <div className={`alert ${feedback.type === 'error' ? 'alert-error' : 'alert-success'}`}>
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Level Selector Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {levels.map((lvl) => {
          const Icon = lvl.icon;
          return (
            <button
              key={lvl.key}
              type="button"
              className={`btn ${activeTab === lvl.key ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab(lvl.key)}
            >
              <Icon size={15} /> {lvl.label} ({lvl.count})
            </button>
          );
        })}
      </div>

      {/* Add & Manage Section */}
      {activeTab === 'State' ? (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h2 className="card-title">Active State Jurisdiction</h2>
            <span className="badge badge-active">Primary State</span>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Currently the system is configured for <strong>Andhra Pradesh</strong>. All Districts,
            Assembly Constitutions, Mandals, and Gramams operate under Andhra Pradesh.
          </p>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>State Name</th>
                  <th>State Code</th>
                  <th>Districts</th>
                  <th>Constitutions</th>
                  <th>Mandals</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Teams</th>
                </tr>
              </thead>
              <tbody>
                {hierarchy.states.map((st) => (
                  <tr key={st.id}>
                    <td style={{ fontWeight: 800 }}>{st.name}</td>
                    <td><code>{st.code}</code></td>
                    <td>{hierarchy.districts.length}</td>
                    <td>{hierarchy.constitutions.length}</td>
                    <td>{hierarchy.mandals.length}</td>
                    <td><span className="badge badge-active">{st.status}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => router.push(`/admin/teams?orgLevel=State&orgId=${st.id}`)}
                      >
                        Manage State Teams
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid-2" style={{ marginBottom: '24px', alignItems: 'start' }}>
          {/* Add Form */}
          <div className="card" style={{ borderTop: '4px solid var(--primary)' }}>
            <div className="card-header">
              <h2 className="card-title">
                Add New {activeTab}
                {activeTab === 'Gramam' && (
                  <span className="badge badge-future" style={{ marginLeft: '8px' }}>
                    Future Feature Ready
                  </span>
                )}
              </h2>
            </div>

            {activeTab === 'Gramam' && (
              <div className="alert alert-info">
                Gramam functionality is pre-built in the database and team architecture so no
                restructuring is required when Gramam-level enrollment opens.
              </div>
            )}

            <form onSubmit={handleCreateUnit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">State</label>
                <input type="text" className="form-control" value="Andhra Pradesh" readOnly />
              </div>

              {['Constitution', 'Mandal', 'Gramam'].includes(activeTab) && (
                <div className="form-group">
                  <label className="form-label">Select District *</label>
                  <select
                    className="form-control"
                    value={selectedDistrictId}
                    onChange={(e) => {
                      setSelectedDistrictId(e.target.value);
                      setSelectedConstitutionId('');
                      setSelectedMandalId('');
                    }}
                    required
                  >
                    <option value="">-- Select District --</option>
                    {hierarchy.districts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {['Mandal', 'Gramam'].includes(activeTab) && (
                <div className="form-group">
                  <label className="form-label">Select Constitution *</label>
                  <select
                    className="form-control"
                    value={selectedConstitutionId}
                    onChange={(e) => {
                      setSelectedConstitutionId(e.target.value);
                      setSelectedMandalId('');
                    }}
                    required
                  >
                    <option value="">-- Select Constitution --</option>
                    {filteredConstitutions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {activeTab === 'Gramam' && (
                <div className="form-group">
                  <label className="form-label">Select Mandal *</label>
                  <select
                    className="form-control"
                    value={selectedMandalId}
                    onChange={(e) => setSelectedMandalId(e.target.value)}
                    required
                  >
                    <option value="">-- Select Mandal --</option>
                    {filteredMandals.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">{activeTab} Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder={`Enter ${activeTab} name`}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{activeTab} Code (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Auto-generated if left blank"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary">
                <Plus size={16} /> Create {activeTab} &amp; Initialize 3 Teams
              </button>
            </form>
          </div>

          {/* List of Units for Current Level */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Existing {activeTab} Records</h2>
            </div>

            <div className="table-container" style={{ maxHeight: '460px', overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{activeTab} Name &amp; Code</th>
                    <th>Parent Hierarchy</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(activeTab === 'District'
                    ? hierarchy.districts
                    : activeTab === 'Constitution'
                    ? hierarchy.constitutions
                    : activeTab === 'Mandal'
                    ? hierarchy.mandals
                    : hierarchy.gramams
                  ).map((unit) => (
                    <tr key={unit.id}>
                      <td>
                        <div style={{ fontWeight: 700 }}>{unit.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Code: {unit.code}
                        </div>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {activeTab === 'District' && 'Andhra Pradesh'}
                        {activeTab === 'Constitution' && `${unit.districtName} District`}
                        {activeTab === 'Mandal' &&
                          `${unit.districtName} › ${unit.constitutionName}`}
                        {activeTab === 'Gramam' &&
                          `${unit.districtName} › ${unit.mandalName}`}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            unit.status === 'Active' ? 'badge-active' : 'badge-inactive'
                          }`}
                        >
                          {unit.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() =>
                              setEditingUnit({
                                level: activeTab,
                                ...unit,
                              })
                            }
                            title="Edit Name / Code"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => handleToggleStatus(activeTab, unit)}
                            title="Activate / Deactivate"
                          >
                            <Power size={13} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() =>
                              router.push(`/admin/teams?orgLevel=${activeTab}&orgId=${unit.id}`)
                            }
                          >
                            Teams
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Full Interactive Organization Tree */}
      <OrganizationTree
        hierarchy={hierarchy}
        onSelectUnit={({ level, unit }) =>
          router.push(`/admin/teams?orgLevel=${level}&orgId=${unit.id}`)
        }
      />

      {/* EDIT ORGANIZATION MODAL */}
      {editingUnit && (
        <div className="modal-backdrop" onClick={() => setEditingUnit(null)}>
          <div className="modal-panel" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '17px', fontWeight: 700 }}>
                Edit {editingUnit.level} — {editingUnit.name}
              </h3>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">{editingUnit.level} Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingUnit.name}
                    onChange={(e) =>
                      setEditingUnit({ ...editingUnit, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Code</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingUnit.code}
                    onChange={(e) =>
                      setEditingUnit({ ...editingUnit, code: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-control"
                    value={editingUnit.status}
                    onChange={(e) =>
                      setEditingUnit({ ...editingUnit, status: e.target.value })
                    }
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setEditingUnit(null)}
                >
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
