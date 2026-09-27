'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit3, Power, Landmark, Building2, MapPin, Home } from 'lucide-react';

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
    // Clear selections for downstream dropdowns
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

  const currentLevelUnits = hierarchy.orgUnits.filter((u) => u.orgLevelId === activeLevelId);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Organization / Team Master</h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage dynamic geographic locations. Every created unit automatically initializes its 3 Core Teams (Main, Youth, Ladies).
        </p>
      </div>

      {feedback.text && (
        <div className={`p-4 mb-6 rounded-md text-sm ${feedback.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
          {feedback.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {hierarchy.orgLevels.map((lvl) => {
          const count = hierarchy.orgUnits.filter((u) => u.orgLevelId === lvl.id).length;
          return (
            <button
              key={lvl.id}
              onClick={() => {
                setActiveLevelId(lvl.id);
                setSelectedParents({});
                setFeedback({type:'', text:''});
              }}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeLevelId === lvl.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {lvl.name} ({count})
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Form */}
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
            <h2 className="font-semibold text-gray-800">Add New {activeLevel?.name}</h2>
          </div>
          <form onSubmit={handleCreateUnit} className="p-5 flex flex-col gap-4">
            
            {/* Dynamic Cascading Dropdowns */}
            {requiredParentLevels.map((parentLvl, index) => {
              // The options for this dropdown depend on the selection in the *previous* dropdown
              let options = hierarchy.orgUnits.filter(u => u.orgLevelId === parentLvl.id);
              if (index > 0) {
                const prevLvlRank = requiredParentLevels[index - 1].levelRank;
                const selectedPrevParentId = selectedParents[prevLvlRank];
                options = options.filter(u => u.parentId === selectedPrevParentId);
              }

              return (
                <div key={parentLvl.id} className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">
                    Select {parentLvl.name} *
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedParents[parentLvl.levelRank] || ''}
                    onChange={(e) => handleParentSelect(parentLvl.levelRank, e.target.value)}
                    required
                  >
                    <option value="">-- Choose {parentLvl.name} --</option>
                    {options.map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.name}</option>
                    ))}
                  </select>
                </div>
              );
            })}

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">{activeLevel?.name} Name *</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={`Enter ${activeLevel?.name} Name`}
              />
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Code (Optional)</label>
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Auto-generated if empty"
              />
            </div>

            <button type="submit" className="mt-2 w-full bg-blue-600 text-white font-medium py-2 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2">
              <Plus size={18} /> Create & Init Teams
            </button>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
            <h2 className="font-semibold text-gray-800">Existing {activeLevel?.name} Records</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name & Code</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Parent Path</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {currentLevelUnits.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No records found.</td>
                  </tr>
                ) : (
                  currentLevelUnits.map((unit) => (
                    <tr key={unit.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-gray-900">{unit.name}</div>
                        <div className="text-xs text-gray-500">{unit.code}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-600 max-w-[200px] truncate" title={unit.locationLabel}>
                          {unit.locationLabel || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${unit.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {unit.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setEditingUnit(unit)} className="text-gray-500 hover:text-blue-600 border border-gray-300 rounded p-1">
                            <Edit3 size={14} />
                          </button>
                          <button onClick={() => handleToggleStatus(unit)} className="text-gray-500 hover:text-red-600 border border-gray-300 rounded p-1">
                            <Power size={14} />
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

      {/* Edit Modal */}
      {editingUnit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="font-bold text-lg">Edit {activeLevel?.name}</h3>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="px-6 py-4 flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={editingUnit.name}
                    onChange={(e) => setEditingUnit({ ...editingUnit, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                  <input
                    type="text"
                    value={editingUnit.code}
                    onChange={(e) => setEditingUnit({ ...editingUnit, code: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={editingUnit.status}
                    onChange={(e) => setEditingUnit({ ...editingUnit, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 rounded-b-lg">
                <button type="button" onClick={() => setEditingUnit(null)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 font-medium text-sm">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm">
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
